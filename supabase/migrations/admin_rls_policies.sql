-- Admin Role RLS Policies
-- Run this in the Supabase SQL Editor to update your RLS policies

-- Function to check if user is an admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
  DECLARE
    is_admin BOOLEAN;
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    ) INTO is_admin;
    RETURN is_admin;
  END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Buildings table policies
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Buildings are viewable by authenticated users" ON public.buildings;
CREATE POLICY "Buildings are viewable by authenticated users" 
  ON public.buildings FOR SELECT 
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Buildings are insertable by admins" ON public.buildings;
CREATE POLICY "Buildings are insertable by admins" 
  ON public.buildings FOR INSERT 
  WITH CHECK (auth.is_admin());

DROP POLICY IF EXISTS "Buildings are updatable by admins" ON public.buildings;
CREATE POLICY "Buildings are updatable by admins" 
  ON public.buildings FOR UPDATE 
  USING (auth.is_admin());

DROP POLICY IF EXISTS "Buildings are deletable by admins" ON public.buildings;
CREATE POLICY "Buildings are deletable by admins" 
  ON public.buildings FOR DELETE 
  USING (auth.is_admin());

-- Residents table policies
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Residents are viewable by authenticated users" ON public.residents;
CREATE POLICY "Residents are viewable by authenticated users" 
  ON public.residents FOR SELECT 
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Residents are insertable by admins" ON public.residents;
CREATE POLICY "Residents are insertable by admins" 
  ON public.residents FOR INSERT 
  WITH CHECK (auth.is_admin());

DROP POLICY IF EXISTS "Residents are updatable by admins" ON public.residents;
CREATE POLICY "Residents are updatable by admins" 
  ON public.residents FOR UPDATE 
  USING (auth.is_admin());

DROP POLICY IF EXISTS "Residents are deletable by admins" ON public.residents;
CREATE POLICY "Residents are deletable by admins" 
  ON public.residents FOR DELETE 
  USING (auth.is_admin());

-- Import logs table policies
ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Import logs are viewable by authenticated users" ON public.import_logs;
CREATE POLICY "Import logs are viewable by authenticated users" 
  ON public.import_logs FOR SELECT 
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Import logs are insertable by admins" ON public.import_logs;
CREATE POLICY "Import logs are insertable by admins" 
  ON public.import_logs FOR INSERT 
  WITH CHECK (auth.is_admin());

DROP POLICY IF EXISTS "Import logs are updatable by admins" ON public.import_logs;
CREATE POLICY "Import logs are updatable by admins" 
  ON public.import_logs FOR UPDATE 
  USING (auth.is_admin());

-- Verifications table policies
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Verifications are viewable by authenticated users" ON public.verifications;
CREATE POLICY "Verifications are viewable by authenticated users" 
  ON public.verifications FOR SELECT 
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Verifications are insertable by anyone" ON public.verifications;
CREATE POLICY "Verifications are insertable by anyone" 
  ON public.verifications FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Verifications are updatable by admins" ON public.verifications;
CREATE POLICY "Verifications are updatable by admins" 
  ON public.verifications FOR UPDATE 
  USING (auth.is_admin());

-- Profiles policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (auth.is_admin());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" 
  ON public.profiles FOR UPDATE 
  USING (auth.is_admin()); 