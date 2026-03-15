-- Track per-lesson MCQ and module quiz completions
create table if not exists lesson_quiz_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null,
  course_id uuid not null references courses(id) on delete cascade,
  quiz_type text not null check (quiz_type in ('mcq', 'module_quiz')),
  completed_at timestamptz not null default now(),
  unique(user_id, lesson_id, quiz_type)
);

alter table lesson_quiz_completions enable row level security;

create policy "Users can view their own lesson quiz completions"
  on lesson_quiz_completions for select using (auth.uid() = user_id);

create policy "Users can insert their own lesson quiz completions"
  on lesson_quiz_completions for insert with check (auth.uid() = user_id);

create policy "Users can update their own lesson quiz completions"
  on lesson_quiz_completions for update using (auth.uid() = user_id);
