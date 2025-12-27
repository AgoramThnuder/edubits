-- Create table to track lesson completions
CREATE TABLE public.lesson_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own completions"
ON public.lesson_completions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions"
ON public.lesson_completions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own completions"
ON public.lesson_completions FOR DELETE
USING (auth.uid() = user_id);

-- Add last_lesson_id to user_enrollments to track where user stopped
ALTER TABLE public.user_enrollments 
ADD COLUMN last_lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL;