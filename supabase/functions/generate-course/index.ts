// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, difficulty, geminiApiKey } = await req.json();
    const GEMINI_API_KEY = geminiApiKey || Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured in secrets or env');
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

    // Create an admin client to bypass RLS for inserting generated modules and lessons
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Generating course for topic:', topic, 'difficulty:', difficulty);

    // Fetch user's existing courses and their modules to see what they already learned
    const { data: existingCourses } = await supabaseAdmin
      .from('courses')
      .select(`
        title, 
        description,
        modules (
          title
        )
      `)
      .eq('created_by', user.id)
      .ilike('title', `%${topic}%`);

    const hasPriorCourse = existingCourses && existingCourses.length > 0;
    
    // Duplicate & Chaining Logic
    let isChainingSameDifficulty = false;
    let chainCount = 0;

    if (hasPriorCourse) {
      // Find courses with the exact SAME topic AND difficulty in the title
      const sameDifficultyCourses = existingCourses.filter((c: any) => 
        c.title.toLowerCase().includes(topic.toLowerCase()) && 
        c.title.toLowerCase().includes(difficulty.toLowerCase())
      );

      if (sameDifficultyCourses.length > 0) {
        if (difficulty.toLowerCase() === 'beginner') {
          // Block identical beginner courses outright
          throw new Error(`You already have a Beginner course on ${topic}! Please generate an Intermediate course to continue learning.`);
        } else {
          // Allow infinite chaining for Intermediate/Advanced
          isChainingSameDifficulty = true;
          chainCount = sameDifficultyCourses.length + 1;
        }
      }
    }

    let previousCourseContext = "";
    if (hasPriorCourse) {
      const priorCoursesDetails = existingCourses.map((c: any) => {
        const moduleTitles = c.modules?.map((m: any) => m.title).join(", ") || "No modules found";
        return `- Course Title: ${c.title}\n  Modules Already Covered in this course: ${moduleTitles}`;
      }).join('\n\n');


      previousCourseContext = `
CRITICAL CONTINUATION RULE:
The user has already completed the following prior courses on this topic:
${priorCoursesDetails}

${isChainingSameDifficulty 
  ? `IMPORTANT: The user is generating ANOTHER "${difficulty}" level course. You MUST act as "Part ${chainCount}" of this difficulty! DO NOT repeat the exact subjects from the "Modules Already Covered" above. You must dive into completely NEW concepts at the ${difficulty} tier.`
  : `You MUST start this new "${difficulty}" course explicitly from where those previous courses left off. Do NOT repeat the basics or any of the exact subjects from the "Modules Already Covered". This course MUST act as a seamless, direct continuation.`
}`;
    }

    const systemPrompt = `You are an expert educational content creator with a strong Computer Science background. Your task is to create a dynamic course ONLY about the specific topic provided by the user, including a final MCQ quiz.

CRITICAL: The course MUST be about the EXACT topic specified. Do NOT generate content about any other subject.

You MUST respond with valid JSON following strictly the provided JSON schema.

Content Generation Rules:
1. Topic Type: Identify whether the topic is a "Programming Language/Software" or a "Theoretical Concept".
2. Subject Pacing (Programming Languages):
   - FOR ALL NEW COURSES (Beginner, Intermediate, Advanced): Module 1 MUST be exclusively the History & Background of the language. Module 2 MUST always start the absolute basics of programming syntax.
   - EXCEPTION (Continuations): If the user is generating a course and prior courses are provided in the context below, DO NOT generate a History or Basics module (unless explicitly chaining a sequence). You must completely skip them and instantly pick up where the previous course left off.
3. Subject Pacing (Theoretical Concepts): Structure modules logically based on theoretical progression without forcing a history module unless specifically relevant.
4. Depth & Scaling (CRITICAL): You must generate lessons and modules based on the requested difficulty (${difficulty}):
   - Beginner: Generate approximately 3 modules (History, Basics, and Simple Applications).
   - Intermediate: Generate 5 to 6 modules (History, Basics, and extending into Intermediate Applications).
   - Advanced: Generate up to a maximum of 8 modules (History, Basics, and extending deep into Advanced Applications).
5. Content Quality: Lesson content should be highly detailed text (at least 150-300 words).
6. Course Continuity Suggestion:
   - If the requested difficulty is Beginner, the final module/lesson MUST explicitly suggest to the user to "Click the Generate Intermediate Course button" next to continue learning.
   - If the requested difficulty is Intermediate, the final module/lesson MUST explicitly suggest to the user to "Click the Generate Advanced Course button" next.
7. Generate exactly 5 questions for the final course quiz covering the provided material across all modules.
8. DO NOT use markdown formatting inside the "theory" string. Format the "code" text appropriately for the language.
9. CRITICAL CODE REQUIREMENT: For programming/technical courses, EVERY lesson that teaches a practical concept MUST include a specific code example in the "code" field. Do not leave it null unless it's purely historical/theoretical.
10. MODULE QUIZZES: At the end of EVERY single module, you MUST generate exactly 1 'module_quiz' testing the user exclusively on the material covered in that specific module. Do not skip this!

${previousCourseContext}`;

    const userPrompt = `Create a ${difficulty} level mini-course SPECIFICALLY about: "${topic}". 

IMPORTANT: Every module and lesson must be strictly about ${topic}. Ensure you follow the Content Generation Rules, specifically regarding History modules for programming languages and continuation logic if applicable.

Respond with ONLY valid JSON.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [{
          role: 'user',
          parts: [{ text: userPrompt }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              title: { type: "string", description: "Course title - must include the topic name" },
              description: { type: "string", description: "Brief course description about the specific topic (2-3 sentences)" },
              duration_hours: { type: "number" },
              total_lessons: { type: "number" },
              modules: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Module title - related to the topic" },
                    module_quiz: {
                      type: "object",
                      description: "A quiz at the end of the module testing the knowledge from this module's lessons",
                      properties: {
                        question: { type: "string", description: "The multiple-choice question" },
                        options: {
                          type: "array",
                          items: { type: "string" },
                          description: "Exactly 4 options"
                        },
                        correct_option_index: { type: "number", description: "Index of the correct option (0-3)" },
                        explanation: { type: "string", description: "Detailed explanation of why the correct option is correct and why others might be wrong" }
                      },
                      required: ["question", "options", "correct_option_index", "explanation"]
                    },
                    lessons: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string", description: "Lesson title - specific to the topic" },
                          content: {
                            type: "object",
                            properties: {
                              theory: { type: "string", description: "Detailed lesson theory explaining the concept. Plain text." },
                              code: { type: "string", description: "A relevant, specific coding example illustrating the lesson. This MUST NOT BE EMPTY for programming/technical topics." },
                              mcq: {
                                type: "object",
                                properties: {
                                  question: { type: "string", description: "A simple multiple-choice question testing the knowledge from this lesson" },
                                  options: {
                                    type: "array",
                                    items: { type: "string" },
                                    description: "Exactly 4 options"
                                  },
                                  correct_option_index: { type: "number", description: "Index of the correct option (0-3)" }
                                },
                                required: ["question", "options", "correct_option_index"]
                              }
                            },
                            required: ["theory", "code", "mcq"]
                          },
                          duration_minutes: { type: "number" }
                        },
                        required: ["title", "content", "duration_minutes"]
                      }
                    }
                  },
                  required: ["title", "lessons", "module_quiz"]
                }
              },
              quiz: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string", description: "A clear multiple-choice question testing knowledge from the course" },
                    options: {
                      type: "array",
                      items: { type: "string" },
                      description: "Exactly 4 options"
                    },
                    correct_option_index: { type: "number" }
                  },
                  required: ["question", "options", "correct_option_index"]
                }
              }
            },
            required: ["title", "description", "duration_hours", "total_lessons", "modules", "quiz"]
          }
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const aiData = await response.json();
    const generatedContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

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

    const { data: existingCategory } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single();

    if (existingCategory) {
      categoryId = existingCategory.id;
    } else {
      const { data: newCategory, error: catError } = await supabaseAdmin
        .from('categories')
        .insert({ name: categoryName, color: '#6366f1' })
        .select('id')
        .single();

      if (newCategory) {
        categoryId = newCategory.id;
      }
    }

    // Insert course into database
    let finalTitle = courseData.title;
    if (isChainingSameDifficulty) {
      // e.g. "Advanced Python (Part 2)"
      finalTitle = `${finalTitle.replace(/\(Part \d+\)/gi, '').trim()} (Part ${chainCount})`;
    }

    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .insert({
        title: finalTitle,
        description: courseData.description,
        duration_hours: courseData.duration_hours || 1,
        total_lessons: courseData.total_lessons || courseData.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0) + (m.module_quiz ? 1 : 0), 0) || 5,
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
    await supabaseAdmin
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

      const { data: insertedModule, error: moduleError } = await supabaseAdmin
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

          const { error: lessonError } = await supabaseAdmin
            .from('lessons')
            .insert({
              module_id: insertedModule.id,
              title: lessonData.title,
              content: typeof lessonData.content === 'object' ? JSON.stringify(lessonData.content) : (lessonData.content || ''),
              duration_minutes: lessonData.duration_minutes || 5,
              order_index: lIndex
            });

          if (lessonError) {
            console.error('Failed to save lesson:', lessonError);
          }
        }

        if (moduleData.module_quiz) {
          const { error: quizError } = await supabaseAdmin
            .from('lessons')
            .insert({
              module_id: insertedModule.id,
              title: "Module Quiz",
              content: JSON.stringify({
                is_module_quiz: true,
                quiz: moduleData.module_quiz
              }),
              duration_minutes: 5, // typical duration for a short quiz
              order_index: moduleData.lessons.length
            });

          if (quizError) {
            console.error('Failed to save module quiz lesson:', quizError);
          }
        }
      }
    }

    console.log('Saving quiz to database...');
    if (courseData.quiz && courseData.quiz.length > 0) {
      const { data: insertedQuiz, error: quizError } = await supabaseAdmin
        .from('quizzes')
        .insert({
          course_id: course.id,
          title: `Final Quiz: ${courseData.title}`
        })
        .select()
        .single();

      if (quizError) {
        console.error('Failed to save quiz:', quizError);
      } else if (insertedQuiz) {
        for (let qIndex = 0; qIndex < courseData.quiz.length; qIndex++) {
          const qData = courseData.quiz[qIndex];
          const { error: questionError } = await supabaseAdmin
            .from('quiz_questions')
            .insert({
              quiz_id: insertedQuiz.id,
              question: qData.question,
              options: qData.options,
              correct_option_index: qData.correct_option_index,
              order_index: qIndex
            });

          if (questionError) {
            console.error('Failed to save quiz question:', questionError);
          }
        }
      }
    }

    console.log('Course created successfully with modules, lessons, and quiz:', course.id);

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
