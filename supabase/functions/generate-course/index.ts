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
        const diffLower = difficulty.toLowerCase();
        if (diffLower === 'beginner' || diffLower === 'intermediate') {
          // Block duplicate beginner and intermediate courses
          const nextLevel = diffLower === 'beginner' ? 'Intermediate' : 'Advanced';
          throw new Error(`You already have a ${difficulty} course on ${topic}! Please generate an ${nextLevel} course to continue learning.`);
        } else {
          // Allow infinite chaining only for Advanced
          isChainingSameDifficulty = true;
          chainCount = sameDifficultyCourses.length + 1;
        }
      }
    }

    let previousCourseContext = "";
    if (hasPriorCourse) {
      // Provide all module titles so the AI knows exactly what has already been covered
      const priorCourseSummaries = existingCourses.map((c: any) => {
        const allModuleTitles: string[] = c.modules?.map((m: any) => m.title) ?? [];
        const difficulty = c.title.toLowerCase().includes('beginner')
          ? 'Beginner'
          : c.title.toLowerCase().includes('intermediate')
          ? 'Intermediate'
          : 'Advanced';
        return `[${difficulty} Course] Covered Modules: ${allModuleTitles.join(', ')}`;
      }).join('\n');

      previousCourseContext = `
CRITICAL: The user has ALREADY completed the following courses. You MUST NOT teach these topics again.
${priorCourseSummaries}

${isChainingSameDifficulty
  ? `CHAIN: Generate Part ${chainCount} of ${difficulty}. You MUST invent completely NEW modules.`
  : `CONTINUATION: Build strictly on the above. DO NOT repeat the basics.`
}`.trim();
    }

    const systemPrompt = `You are a world-class educational content creator and curriculum designer. Your goal is to produce deeply engaging, accurate, and pedagogically sound courses.

CRITICAL: Generate a course ONLY about the exact topic the user specifies. Never drift to related or adjacent topics.

RESPONSE FORMAT: You MUST respond with valid JSON only, matching the schema provided. No markdown, no explanation outside JSON.

--- CONTENT QUALITY RULES ---
1. Expert-Level Theory: Theory text must be exceptionally high-quality, comprehensive, and engaging (300-500 words per lesson). Write like a senior engineer or domain expert mentoring a junior. Use markdown formatting extensively (bolding key terms, using bulleted lists, and structured paragraphs).
2. Deep Explanations: Never just state facts. Always explain the "Why" and "How". Use vivid, real-world analogies to break down complex concepts. Avoid all vague, fluffy, or repetitive filler sentences.
3. Production-Ready Code: Every lesson teaching a practical/technical concept MUST have a robust, working code example in the "code" field. The code must include detailed inline comments explaining the logic, use modern best practices, and represent realistic use-cases rather than trivial "foo/bar" examples. For purely historical/introductory lessons, set "code" to null.
4. Rigorous Assessment: MCQ questions must test deep conceptual understanding and application, not mere memorization. All incorrect options (distractors) must be highly plausible misconceptions. Module quiz questions must be entirely distinct from lesson MCQs and challenge the student's mastery of the entire module.

--- PACING AND STRUCTURE RULES ---
1. FRESH COURSES (no prior course context provided): Regardless of difficulty level (Beginner, Intermediate, or Advanced), Module 1 MUST always exist and MUST follow this exact structure:
   * Module 1 title: "Introduction & Overview" (or "History & Background" for programming languages)
   * Module 1, Lesson 1 title: "Course Overview" — This MUST be a pure introduction lesson with NO code example (set code to null). It must explain: what the topic is, why it matters, what the student will learn across all modules in this course, and what prior knowledge is assumed. Minimum 200 words.
   * Module 1, Lesson 2 onwards: Begin the actual foundational content (history, background, or core concepts depending on topic type).
2. CONTINUATION COURSES (prior course context IS provided in the context block below): DO NOT add an Introduction or History module. Skip directly to new topics that pick up where the previous course ended.
3. Subject Pacing (Theoretical Concepts): For non-programming topics, Module 1 Lesson 1 must still be a "Course Overview" introduction lesson (code: null) explaining the full scope of the course. After that, structure modules by conceptual complexity.
4. Depth & Scaling (CRITICAL): Module count is FIXED by difficulty. Module 1 is always the Introduction module described in rule 1 above. The remaining modules cover the actual course content:
   - Beginner: EXACTLY 3 modules total. Module 1 = Introduction & Overview. Module 2 = Core Fundamentals. Module 3 = Simple Applications & Practice.
   - Intermediate: EXACTLY 4 to 5 modules total. Module 1 = Introduction & Overview (fresh course) OR first new topic (continuation). Remaining modules = progressively deeper intermediate concepts.
   - Advanced: EXACTLY 6 to 7 modules total. Module 1 = Introduction & Overview (fresh course) OR first advanced topic (continuation). Remaining modules = advanced techniques, real-world patterns, and expert-level content.

--- QUIZ RULES ---
Generate exactly 5 final course quiz questions covering material from all modules.
Generate exactly 3 module quiz questions per module covering only that module's content.

${previousCourseContext}`;

    const pacingRule = hasPriorCourse
      ? `CRITICAL CONTINUATION: You MUST skip history, basics, and ANY topics already covered in prior courses. Generate 100% NEW ${difficulty} material.`
      : `CRITICAL PACING RULE: Since this is a fresh course on a new topic, Module 1 MUST be a pure Introduction/History module with NO code examples (set "code" to null). Do not skip the introduction, even for advanced courses.`;

    const userPrompt = `Create a ${difficulty} level course SPECIFICALLY about: "${topic}".

This is a ${hasPriorCourse ? 'CONTINUATION course — skip intro/history, pick up from where prior courses ended' : 'FRESH course — Module 1 Lesson 1 MUST be a Course Overview introduction with no code'}.

Every module and lesson must be strictly about ${topic}. Follow all Content Generation Rules exactly, especially the Module 1 Course Overview rule for fresh courses.

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
              title: { type: "string" },
              description: { type: "string" },
              duration_hours: { type: "number" },
              total_lessons: { type: "number" },
              modules: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    module_quiz: {
                      type: "array",
                      minItems: 3,
                      maxItems: 3,
                      items: {
                        type: "object",
                        properties: {
                          question: { type: "string" },
                          options: { type: "array", items: { type: "string" } },
                          correct_option_index: { type: "number" },
                          explanation: { type: "string" }
                        },
                        required: ["question", "options", "correct_option_index", "explanation"]
                      }
                    },
                    lessons: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          content: {
                            type: "object",
                            properties: {
                              theory: { type: "string" },
                              code: { type: "string", nullable: true },
                              mcq: {
                                type: "object",
                                properties: {
                                  question: { type: "string" },
                                  options: { type: "array", items: { type: "string" } },
                                  correct_option_index: { type: "number" }
                                },
                                required: ["question", "options", "correct_option_index"]
                              }
                            },
                            required: ["theory", "mcq"]
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
                    question: { type: "string" },
                    options: { type: "array", items: { type: "string" } },
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

        if (moduleData.module_quiz && Array.isArray(moduleData.module_quiz) && moduleData.module_quiz.length > 0) {
          // Store the array of 3 module quiz questions as a JSON lesson
          const { error: quizError } = await supabaseAdmin
            .from('lessons')
            .insert({
              module_id: insertedModule.id,
              title: "Module Quiz",
              content: JSON.stringify({
                is_module_quiz: true,
                quiz: moduleData.module_quiz  // now an array of 3 questions
              }),
              duration_minutes: 5,
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
