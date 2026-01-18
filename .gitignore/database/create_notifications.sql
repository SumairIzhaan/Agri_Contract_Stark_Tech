-- 1. Create the 'notifications' table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL, -- The recipient (Farmer)
    type TEXT NOT NULL, -- e.g., 'ORDER_ACCEPTED'
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb, -- Extra data like buyer details, crop id
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Read Access" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Any authenticated user can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

-- 4. Create Policies

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

-- Policy: ANY authenticated user can insert notifications (Critical for Buyers sending to Farmers)
-- We allow insertion if the user is authenticated. We do NOT restrict it to 'user_id = auth.uid()'
-- because the 'user_id' column represents the RECIPIENT, not the sender.
CREATE POLICY "Any authenticated user can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Policy: Users can update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);
