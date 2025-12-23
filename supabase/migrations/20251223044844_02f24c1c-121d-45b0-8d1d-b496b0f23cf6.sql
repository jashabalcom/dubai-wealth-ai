-- Add video progress tracking columns to lesson_progress
ALTER TABLE public.lesson_progress 
ADD COLUMN IF NOT EXISTS watch_progress_percent INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_position_seconds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS video_duration_seconds INTEGER,
ADD COLUMN IF NOT EXISTS last_watched_at TIMESTAMP WITH TIME ZONE;