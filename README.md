# TaskBoard — Next Play Games Assessment

A polished Kanban-style task board built with React, TypeScript, and Supabase.

## Features

- Drag-and-drop tasks across columns (To Do, In Progress, In Review, Done)
- Anonymous guest sessions — each user sees only their own tasks
- Row Level Security enforced at the database level
- Task detail panel with inline editing, priority, due date
- Task comments
- Due date indicators (overdue/soon badges)
- Search and priority filtering
- Board stats (total, completed, overdue)
- Real-time updates via Supabase Realtime

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Drag-and-drop:** @dnd-kit
- **Backend/DB:** Supabase (PostgreSQL + anonymous auth + RLS + Realtime)
- **Hosting:** Vercel

## Local Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/matingathani/kanban-taskboard.git
   cd kanban-taskboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the env example and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```

## Database Schema

```sql
CREATE TABLE tasks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  status      text NOT NULL DEFAULT 'todo'
                CHECK (status IN ('todo','in_progress','in_review','done')),
  priority    text NOT NULL DEFAULT 'normal'
                CHECK (priority IN ('low','normal','high')),
  due_date    date,
  position    integer NOT NULL DEFAULT 0,
  user_id     uuid NOT NULL REFERENCES auth.users(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id    uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  content    text NOT NULL,
  user_id    uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
```

RLS policies ensure each user can only read/write their own data.
