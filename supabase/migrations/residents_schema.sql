-- Check if residents table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'residents') THEN
    -- Create residents table
    CREATE TABLE public.residents (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      room_number TEXT NOT NULL,
      building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
      email TEXT,
      discord_username TEXT,
      minecraft_username TEXT,
      is_active BOOLEAN DEFAULT true,
      move_in_date DATE DEFAULT CURRENT_DATE,
      move_out_date DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  ELSE
    -- Ensure columns exist with correct names
    BEGIN
      -- Rename full_name to name if it exists
      IF EXISTS (SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = 'residents' AND column_name = 'full_name') 
         AND NOT EXISTS (SELECT FROM information_schema.columns 
                        WHERE table_schema = 'public' AND table_name = 'residents' AND column_name = 'name') THEN
        ALTER TABLE public.residents RENAME COLUMN full_name TO name;
      END IF;
      
      -- Add name column if it doesn't exist (and full_name doesn't exist either)
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'residents' AND column_name = 'name')
         AND NOT EXISTS (SELECT FROM information_schema.columns 
                        WHERE table_schema = 'public' AND table_name = 'residents' AND column_name = 'full_name') THEN
        ALTER TABLE public.residents ADD COLUMN name TEXT NOT NULL DEFAULT 'Unknown';
      END IF;
      
      -- Ensure other required columns exist
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'residents' AND column_name = 'is_active') THEN
        ALTER TABLE public.residents ADD COLUMN is_active BOOLEAN DEFAULT true;
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'residents' AND column_name = 'room_number') THEN
        ALTER TABLE public.residents ADD COLUMN room_number TEXT NOT NULL DEFAULT '0';
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'residents' AND column_name = 'building_id') THEN
        ALTER TABLE public.residents ADD COLUMN building_id UUID;
      END IF;
    END;
  END IF;
END
$$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS residents_building_room_idx ON public.residents(building_id, room_number);
CREATE INDEX IF NOT EXISTS residents_name_idx ON public.residents(name);
CREATE INDEX IF NOT EXISTS residents_active_idx ON public.residents(is_active);

-- Add RLS policies
DROP POLICY IF EXISTS "Everyone can view residents" ON public.residents;
CREATE POLICY "Everyone can view residents" 
  ON public.residents FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Admins can insert residents" ON public.residents;
CREATE POLICY "Admins can insert residents" 
  ON public.residents FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins can update residents" ON public.residents;
CREATE POLICY "Admins can update residents" 
  ON public.residents FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins can delete residents" ON public.residents;
CREATE POLICY "Admins can delete residents" 
  ON public.residents FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));

-- Enable RLS
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY; 