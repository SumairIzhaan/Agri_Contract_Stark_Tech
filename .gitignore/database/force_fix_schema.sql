-- WARNING: This will delete existing crop data!
-- We need to do this because the table structure might be mismatched.

-- 1. Drop the existing table
DROP TABLE IF EXISTS public.crops CASCADE;

-- 2. Recreate the table with the correct schema
CREATE TABLE public.crops (
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

-- 3. Re-enable RLS
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;

-- 4. Re-apply Policies
-- (We use DROP POLICY IF EXISTS just in case, though dropping table drops policies attached to it)

CREATE POLICY "Public Read Access"
ON public.crops FOR SELECT
USING (true);

CREATE POLICY "Farmers Can Insert"
ON public.crops FOR INSERT
WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Authenticated Update Access"
ON public.crops FOR UPDATE
USING (auth.role() = 'authenticated');
