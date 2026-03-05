// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { messages, context, geminiApiKey } = await req.json();
    const GEMINI_API_KEY = geminiApiKey || Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured in secrets or env');
    }

    console.log('Course chat request for context:', context);

    const systemPrompt = `You are a strict, focused learning assistant for an online course platform. You are currently helping a student with the course "${context.course}" ${context.lesson ? `and they are specifically on the lesson "${context.lesson}"` : ''}.

CRITICAL RULE: You MUST ONLY answer questions that are directly related to the material covered in the course "${context.course}". If the user asks a question about ANY topic outside the scope of this specific course, you MUST refuse to answer and gently remind them that you can only help with topics related to "${context.course}".

${context.lessonContent ? `\nFor context, here is the text of the lesson they are currently reading:\n"""\n${context.lessonContent}\n"""\n` : ''}

Your role:
- Answer questions ONLY about the course material clearly and concisely.
- Explain concepts in simple terms with examples.
- Help students understand difficult topics.
- Encourage learning and provide helpful tips.
- Use markdown formatting for better readability (bold, bullet points, etc.).
- NEVER answer questions outside the scope of "${context.course}".`;

    // Map OpenAI-style messages to Gemini-style contents
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${GEMINI_API_KEY}&alt=sse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: contents,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    // Return the stream directly
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Error in course-chat:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
