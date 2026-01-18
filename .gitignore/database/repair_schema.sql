-- 1. Create the 'crops' table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.crops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    farmer_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    price NUMERIC NOT NULL,
    harvest_date DATE,
    location TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'pending',
    buyer_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies for 'crops' table

-- Policy: Allow everyone to view crops (Public Read)
CREATE POLICY "Public Read Access"
ON public.crops FOR SELECT
USING (true);

-- Policy: Allow authenticated users (farmers) to insert their own crops
CREATE POLICY "Farmers Can Insert"
ON public.crops FOR INSERT
WITH CHECK (auth.uid() = farmer_id);

-- Policy: Allow farmers to update their own crops (or buyers to update status)
-- For simplicity in development, we allow any authenticated user to update for now,
-- typically you'd want stricter logic (e.g., only farmer can update details, buyer can only update status).
CREATE POLICY "Authenticated Update Access"
ON public.crops FOR UPDATE
USING (auth.role() = 'authenticated');

-- 4. Storage Bucket Configuration for 'crops'

-- Create the bucket if it doesn't exist (this usually needs to be done in UI, but SQL can do it if extension is enabled)
INSERT INTO storage.buckets (id, name, public)
VALUES ('crops', 'crops', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies

-- Policy: Public Read Access for images
CREATE POLICY "Public Image Read"
ON storage.objects FOR SELECT
USING ( bucket_id = 'crops' );

-- Policy: Authenticated Upload (Allow farmers to upload images)
CREATE POLICY "Authenticated Image Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'crops' AND auth.role() = 'authenticated' );

-- Policy: Allow users to update/delete their own images (Optional but good)
CREATE POLICY "User Image Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'crops' AND auth.uid() = owner );
