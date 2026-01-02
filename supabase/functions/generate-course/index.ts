import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, difficulty } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Generating course for topic:', topic, 'difficulty:', difficulty);

    const systemPrompt = `You are an expert educational content creator. Your task is to create a course ONLY about the specific topic provided by the user.

CRITICAL: The course MUST be about the EXACT topic specified. Do NOT generate content about any other subject.

You MUST respond with ONLY valid JSON (no markdown, no code blocks, no extra text). Use this exact structure:
{
  "title": "Course title - must include the topic name",
  "description": "Brief course description about the specific topic (2-3 sentences)",
  "duration_hours": number,
  "total_lessons": number,
  "modules": [
    {
      "title": "Module title - related to the topic",
      "lessons": [
        {
          "title": "Lesson title - specific to the topic",
          "content": "Detailed lesson content about the topic. Use plain text only.",
          "duration_minutes": number
        }
      ]
    }
  ]
}

Guidelines:
- For beginner: 3 modules, 2-3 lessons each, simple explanations
- For intermediate: 4 modules, 3-4 lessons each, more depth
- For advanced: 5 modules, 4-5 lessons each, complex topics
- Each lesson content should be 150-300 words of plain text
- ALL content must be specifically about the requested topic
- DO NOT use markdown, code blocks, or special characters in content`;

    const userPrompt = `Create a ${difficulty} level mini-course SPECIFICALLY about: "${topic}". 

IMPORTANT: Every module and lesson must be about ${topic} and nothing else. The title must include "${topic}".

Respond with ONLY valid JSON.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const generatedContent = aiData.choices?.[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('No content generated');
    }

    console.log('AI response received, parsing...');

    // Parse the JSON from AI response
    let courseData;
    try {
      // Clean the response - remove any markdown code blocks if present
      let jsonStr = generatedContent.trim();
      
      // Remove markdown code block wrapper if present
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
      }
      
      courseData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', generatedContent.substring(0, 500));
      throw new Error('Failed to parse course structure');
    }

    // Create or get category
    let categoryId = null;
    const categoryName = topic.split(' ')[0]; // Simple category from first word
    
    const { data: existingCategory } = await supabaseClient
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single();

    if (existingCategory) {
      categoryId = existingCategory.id;
    } else {
      const { data: newCategory, error: catError } = await supabaseClient
        .from('categories')
        .insert({ name: categoryName, color: '#6366f1' })
        .select('id')
        .single();
      
      if (newCategory) {
        categoryId = newCategory.id;
      }
    }

    // Insert course into database
    const { data: course, error: courseError } = await supabaseClient
      .from('courses')
      .insert({
        title: courseData.title,
        description: courseData.description,
        duration_hours: courseData.duration_hours || 1,
        total_lessons: courseData.total_lessons || courseData.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 5,
        category_id: categoryId,
        created_by: user.id,
        image_url: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop`
      })
      .select()
      .single();

    if (courseError) {
      console.error('Failed to save course:', courseError);
      throw new Error('Failed to save course');
    }

    // Auto-enroll user in the course
    await supabaseClient
      .from('user_enrollments')
      .insert({
        user_id: user.id,
        course_id: course.id,
        progress: 0,
        completed_lessons: 0
      });

    // Insert modules and lessons into database
    console.log('Saving modules and lessons to database...');
    
    for (let mIndex = 0; mIndex < courseData.modules.length; mIndex++) {
      const moduleData = courseData.modules[mIndex];
      
      const { data: insertedModule, error: moduleError } = await supabaseClient
        .from('modules')
        .insert({
          course_id: course.id,
          title: moduleData.title,
          order_index: mIndex
        })
        .select()
        .single();

      if (moduleError) {
        console.error('Failed to save module:', moduleError);
        continue;
      }

      if (insertedModule && moduleData.lessons) {
        for (let lIndex = 0; lIndex < moduleData.lessons.length; lIndex++) {
          const lessonData = moduleData.lessons[lIndex];
          
          const { error: lessonError } = await supabaseClient
            .from('lessons')
            .insert({
              module_id: insertedModule.id,
              title: lessonData.title,
              content: lessonData.content || '',
              duration_minutes: lessonData.duration_minutes || 5,
              order_index: lIndex
            });

          if (lessonError) {
            console.error('Failed to save lesson:', lessonError);
          }
        }
      }
    }

    console.log('Course created successfully with modules and lessons:', course.id);

    return new Response(JSON.stringify({ 
      success: true, 
      course
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-course:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
