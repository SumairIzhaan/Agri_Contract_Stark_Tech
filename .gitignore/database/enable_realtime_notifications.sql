-- Enable Realtime for the notifications table
-- This allows real-time subscriptions to work properly

-- First, ensure the table has a replica identity (required for realtime)
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Enable realtime for the notifications table
-- This must be run in the Supabase SQL Editor or via the Dashboard
-- Navigate to: Database > Replication > Enable for 'notifications' table

-- Note: You can also enable this via Supabase Dashboard:
-- 1. Go to Database > Replication
-- 2. Find 'notifications' table
-- 3. Toggle the switch to enable Realtime

-- Verify the table is ready for realtime
SELECT schemaname, tablename 
FROM pg_tables 
WHERE tablename = 'notifications';
