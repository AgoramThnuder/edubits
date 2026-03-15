-- Create quiz_completions table to track user final quiz scores
create table if not exists quiz_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id uuid not null references quizzes(id) on delete cascade,
  score integer not null default 0,
  total_questions integer not null default 0,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id, quiz_id)
);

-- Enable RLS
alter table quiz_completions enable row level security;

-- Users can only see and insert their own completions
create policy "Users can view their own quiz completions"
  on quiz_completions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own quiz completions"
  on quiz_completions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own quiz completions"
  on quiz_completions for update
  using (auth.uid() = user_id);
