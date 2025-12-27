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

    const systemPrompt = `You are an expert educational content creator and instructional designer. Your task is to create comprehensive, engaging courses that rival professional online learning platforms.

CRITICAL: The course MUST be about the EXACT topic specified. Do NOT generate content about any other subject.

You MUST respond with ONLY valid JSON (no markdown, no code blocks, no extra text). Use this exact structure:
{
  "title": "Course title - must include the topic name",
  "description": "Compelling course description that highlights what learners will achieve (3-4 sentences)",
  "duration_hours": number,
  "total_lessons": number,
  "modules": [
    {
      "title": "Module title - descriptive and engaging",
      "lessons": [
        {
          "title": "Lesson title - clear and action-oriented",
          "content": "Comprehensive lesson content (see detailed requirements below)",
          "duration_minutes": number
        }
      ]
    }
  ]
}

LESSON CONTENT REQUIREMENTS (VERY IMPORTANT):
Each lesson content MUST include ALL of the following sections, written in plain text with clear section headers:

1. INTRODUCTION (2-3 sentences)
   - Hook the learner with why this topic matters
   - State the learning objective clearly

2. CORE CONCEPTS (400-600 words)
   - Explain the main ideas thoroughly
   - Break down complex concepts into digestible parts
   - Use analogies and real-world connections
   - Define key terminology

3. PRACTICAL EXAMPLES (200-300 words)
   - Provide 2-3 concrete, real-world examples
   - Show how the concept applies in different scenarios
   - Include step-by-step walkthroughs where applicable

4. VISUAL DESCRIPTION (100-150 words)
   - Describe a diagram, chart, or infographic that would illustrate the concept
   - Write it as: "Imagine a diagram showing..." or "Picture a flowchart that..."
   - This helps learners visualize the concept

5. KEY TAKEAWAYS (3-5 bullet points as plain text)
   - Summarize the most important points
   - Format as: "Key Takeaway 1: ...", "Key Takeaway 2: ..."

6. PRACTICE EXERCISE (100-150 words)
   - Include a hands-on activity or reflection question
   - Make it actionable and relevant

7. PRO TIP (1-2 sentences)
   - Share an expert insight or common mistake to avoid

Total lesson content should be 800-1200 words per lesson.

DIFFICULTY GUIDELINES:
- BEGINNER: 3-4 modules, 3 lessons each
  - Use simple language and lots of analogies
  - More examples, slower pace
  - Focus on foundational concepts

- INTERMEDIATE: 4-5 modules, 3-4 lessons each
  - Assume basic knowledge
  - Include more nuanced concepts
  - Add challenging practice exercises

- ADVANCED: 5-6 modules, 4-5 lessons each
  - Use technical terminology
  - Cover edge cases and advanced techniques
  - Include complex, multi-step examples

FORMATTING RULES:
- Use plain text only, NO markdown syntax
- Use section headers like "INTRODUCTION:", "CORE CONCEPTS:", etc.
- For lists, use "1.", "2.", "3." or "- " prefix
- Keep paragraphs well-organized with clear spacing
- ALL content must be specifically about the requested topic`;

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

    // Calculate total lessons
    const totalLessons = courseData.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0;

    // Insert course into database
    const { data: course, error: courseError } = await supabaseClient
      .from('courses')
      .insert({
        title: courseData.title,
        description: courseData.description,
        duration_hours: courseData.duration_hours || 1,
        total_lessons: totalLessons,
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

    console.log('Course created:', course.id);

    // Insert modules and lessons
    for (let moduleIndex = 0; moduleIndex < courseData.modules.length; moduleIndex++) {
      const moduleData = courseData.modules[moduleIndex];
      
      const { data: module, error: moduleError } = await supabaseClient
        .from('modules')
        .insert({
          course_id: course.id,
          title: moduleData.title,
          order_index: moduleIndex
        })
        .select()
        .single();

      if (moduleError) {
        console.error('Failed to save module:', moduleError);
        continue;
      }

      console.log('Module created:', module.id);

      // Insert lessons for this module
      for (let lessonIndex = 0; lessonIndex < moduleData.lessons.length; lessonIndex++) {
        const lessonData = moduleData.lessons[lessonIndex];
        
        const { error: lessonError } = await supabaseClient
          .from('lessons')
          .insert({
            module_id: module.id,
            title: lessonData.title,
            content: lessonData.content,
            duration_minutes: lessonData.duration_minutes || 5,
            order_index: lessonIndex
          });

        if (lessonError) {
          console.error('Failed to save lesson:', lessonError);
        }
      }
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

    console.log('Course created successfully with modules and lessons:', course.id);

    return new Response(JSON.stringify({ 
      success: true, 
      course,
      modules: courseData.modules 
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
