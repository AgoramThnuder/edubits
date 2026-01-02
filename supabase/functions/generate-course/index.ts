// =====================================================
// GENERATE COURSE EDGE FUNCTION
// =====================================================
// This function creates AI-generated courses based on a user's topic.
// It uses the Lovable AI Gateway to generate course content and saves
// everything to the database (course, modules, lessons).
// =====================================================

// Import Deno's HTTP server for handling requests
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// Import Supabase client for database operations
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// =====================================================
// CORS HEADERS
// =====================================================
// These headers allow the frontend to call this function from any origin.
// Required for browser-based requests to work properly.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// =====================================================
// MAIN REQUEST HANDLER
// =====================================================
// This is the entry point for all incoming HTTP requests.
serve(async (req) => {
  // -------------------------------------------------
  // HANDLE CORS PREFLIGHT REQUEST
  // -------------------------------------------------
  // Browsers send an OPTIONS request before the actual request
  // to check if the server allows cross-origin requests.
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // -------------------------------------------------
    // STEP 1: PARSE REQUEST BODY
    // -------------------------------------------------
    // Extract the topic (e.g., "C++ Programming") and difficulty level
    // (beginner, intermediate, advanced) from the request.
    const { topic, difficulty } = await req.json();
    
    // Get the Lovable AI API key from environment variables
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // -------------------------------------------------
    // STEP 2: AUTHENTICATE USER
    // -------------------------------------------------
    // Get the authorization header to verify the user's identity.
    // This ensures only logged-in users can create courses.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create a Supabase client with the user's credentials
    // This allows us to perform database operations as the user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Generating course for topic:', topic, 'difficulty:', difficulty);

    // -------------------------------------------------
    // STEP 3: PREPARE AI PROMPTS
    // -------------------------------------------------
    // The system prompt tells the AI how to format its response.
    // It specifies the JSON structure we expect for the course.
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

    // The user prompt requests the specific topic and difficulty
    const userPrompt = `Create a ${difficulty} level mini-course SPECIFICALLY about: "${topic}". 

IMPORTANT: Every module and lesson must be about ${topic} and nothing else. The title must include "${topic}".

Respond with ONLY valid JSON.`;

    // -------------------------------------------------
    // STEP 4: CALL AI GATEWAY
    // -------------------------------------------------
    // Send the prompts to Lovable AI Gateway to generate course content.
    // We use the gemini-2.5-flash model for fast, quality responses.
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
        response_format: { type: 'json_object' }, // Request JSON format
      }),
    });

    // -------------------------------------------------
    // STEP 5: HANDLE AI ERRORS
    // -------------------------------------------------
    // Check for rate limits (429) or payment issues (402)
    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      // Rate limit exceeded - user is making too many requests
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      // Payment required - AI credits are exhausted
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    // -------------------------------------------------
    // STEP 6: PARSE AI RESPONSE
    // -------------------------------------------------
    // Extract the generated content from the AI response
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
      
      // Remove markdown code block wrapper if present (```json ... ```)
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
      }
      
      // Parse the cleaned JSON string
      courseData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', generatedContent.substring(0, 500));
      throw new Error('Failed to parse course structure');
    }

    // -------------------------------------------------
    // STEP 7: CREATE OR GET CATEGORY
    // -------------------------------------------------
    // Categories help organize courses (e.g., "Programming", "Design").
    // We use the first word of the topic as a simple category name.
    let categoryId = null;
    const categoryName = topic.split(' ')[0]; // e.g., "C++" from "C++ Programming"
    
    // Check if this category already exists
    const { data: existingCategory } = await supabaseClient
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single();

    if (existingCategory) {
      // Use existing category
      categoryId = existingCategory.id;
    } else {
      // Create a new category
      const { data: newCategory, error: catError } = await supabaseClient
        .from('categories')
        .insert({ name: categoryName, color: '#6366f1' })
        .select('id')
        .single();
      
      if (newCategory) {
        categoryId = newCategory.id;
      }
      // Note: If category creation fails, we continue with categoryId = null
    }

    // -------------------------------------------------
    // STEP 8: SAVE COURSE TO DATABASE
    // -------------------------------------------------
    // Insert the main course record with title, description, etc.
    const { data: course, error: courseError } = await supabaseClient
      .from('courses')
      .insert({
        title: courseData.title,
        description: courseData.description,
        duration_hours: courseData.duration_hours || 1,
        // Calculate total lessons from modules if not provided
        total_lessons: courseData.total_lessons || courseData.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 5,
        category_id: categoryId,
        created_by: user.id, // Link to the user who created it
        image_url: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop`
      })
      .select()
      .single();

    if (courseError) {
      console.error('Failed to save course:', courseError);
      throw new Error('Failed to save course');
    }

    // -------------------------------------------------
    // STEP 9: AUTO-ENROLL USER
    // -------------------------------------------------
    // Automatically enroll the creator in their own course
    // so they can start learning immediately.
    await supabaseClient
      .from('user_enrollments')
      .insert({
        user_id: user.id,
        course_id: course.id,
        progress: 0,           // 0% progress initially
        completed_lessons: 0   // No lessons completed yet
      });

    // -------------------------------------------------
    // STEP 10: SAVE MODULES AND LESSONS
    // -------------------------------------------------
    // Loop through each module from the AI-generated content
    // and save it to the database along with its lessons.
    console.log('Saving modules and lessons to database...');
    
    for (let mIndex = 0; mIndex < courseData.modules.length; mIndex++) {
      const moduleData = courseData.modules[mIndex];
      
      // Insert the module
      const { data: insertedModule, error: moduleError } = await supabaseClient
        .from('modules')
        .insert({
          course_id: course.id,           // Link to parent course
          title: moduleData.title,
          order_index: mIndex             // Order for display (0, 1, 2...)
        })
        .select()
        .single();

      if (moduleError) {
        console.error('Failed to save module:', moduleError);
        continue; // Skip to next module if this one fails
      }

      // Insert all lessons for this module
      if (insertedModule && moduleData.lessons) {
        for (let lIndex = 0; lIndex < moduleData.lessons.length; lIndex++) {
          const lessonData = moduleData.lessons[lIndex];
          
          const { error: lessonError } = await supabaseClient
            .from('lessons')
            .insert({
              module_id: insertedModule.id,        // Link to parent module
              title: lessonData.title,
              content: lessonData.content || '',    // The actual lesson text
              duration_minutes: lessonData.duration_minutes || 5,
              order_index: lIndex                   // Order for display
            });

          if (lessonError) {
            console.error('Failed to save lesson:', lessonError);
          }
        }
      }
    }

    console.log('Course created successfully with modules and lessons:', course.id);

    // -------------------------------------------------
    // STEP 11: RETURN SUCCESS RESPONSE
    // -------------------------------------------------
    // Send back the created course data to the frontend
    return new Response(JSON.stringify({ 
      success: true, 
      course
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // -------------------------------------------------
    // ERROR HANDLING
    // -------------------------------------------------
    // Log the error and return a 500 status with error message
    console.error('Error in generate-course:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
