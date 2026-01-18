-- Enable Realtime for the notifications table
-- This is critical for the 'postgres_changes' subscription to work in the frontend.

begin;
  -- Try to add the table to the publication. 
  -- If the publication doesn't exist (unlikely in Supabase), this might fail, but standard Supabase has 'supabase_realtime'.
  alter publication supabase_realtime add table notifications;
commit;
