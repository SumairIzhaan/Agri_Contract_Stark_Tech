-- Enable the storage extension if not already enabled
-- create extension if not exists "storage";

-- 1. Create 'profiles' bucket
insert into storage.buckets (id, name, public)
values ('profiles', 'profiles', true)
on conflict (id) do nothing;

-- 2. Create 'crops' bucket
insert into storage.buckets (id, name, public)
values ('crops', 'crops', true)
on conflict (id) do nothing;

-- 3. Set up security policies for 'profiles'
-- Allow public read access
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'profiles' );

-- Allow authenticated users to upload their own profile image
create policy "User Upload"
  on storage.objects for insert
  with check ( bucket_id = 'profiles' and auth.role() = 'authenticated' );

-- Allow users to update their own image
create policy "User Update"
  on storage.objects for update
  using ( bucket_id = 'profiles' and auth.role() = 'authenticated' );

-- 4. Set up security policies for 'crops'
-- Allow public read access
create policy "Public Access Crops"
  on storage.objects for select
  using ( bucket_id = 'crops' );

-- Allow farmers to upload crop images
create policy "Farmer Upload Crops"
  on storage.objects for insert
  with check ( bucket_id = 'crops' and auth.role() = 'authenticated' );
