-- Check if buildings table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'buildings') THEN
    -- Create buildings table
    CREATE TABLE public.buildings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      address TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  END IF;
END
$$;

-- Add is_admin function if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_proc WHERE proname = 'is_admin') THEN
    CREATE FUNCTION is_admin()
    RETURNS BOOLEAN AS $$
      DECLARE
        is_admin BOOLEAN;
      BEGIN
        SELECT (role = 'admin') INTO is_admin FROM public.profiles WHERE id = auth.uid();
        RETURN COALESCE(is_admin, false);
      END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  END IF;
END
$$;

-- Reset RLS policies
DROP POLICY IF EXISTS "Anyone can view buildings" ON public.buildings;
DROP POLICY IF EXISTS "Admins can create buildings" ON public.buildings;
DROP POLICY IF EXISTS "Admins can update buildings" ON public.buildings;
DROP POLICY IF EXISTS "Admins can delete buildings" ON public.buildings;

-- Create RLS policies
CREATE POLICY "Anyone can view buildings" 
  ON public.buildings FOR SELECT 
  USING (true);

CREATE POLICY "Admins can create buildings" 
  ON public.buildings FOR INSERT 
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update buildings" 
  ON public.buildings FOR UPDATE 
  USING (is_admin());

CREATE POLICY "Admins can delete buildings" 
  ON public.buildings FOR DELETE 
  USING (is_admin());

-- Enable RLS
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;

-- Allow service role to bypass RLS
ALTER TABLE public.buildings FORCE ROW LEVEL SECURITY; 