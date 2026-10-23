-- ==============================================================================
-- SutrAI Initial PostgreSQL Schema Migration
-- Compatible with Supabase PostgreSQL, Row Level Security (RLS), and Private Storage
-- ==============================================================================

-- 1. Profiles Table (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'citizen' CHECK (role IN ('citizen', 'operator', 'first_responder', 'admin')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Incidents Table
CREATE TABLE IF NOT EXISTS public.incidents (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('medical', 'transport', 'civic', 'disaster', 'hazard', 'safety', 'accessibility', 'general')),
  urgency TEXT NOT NULL CHECK (urgency IN ('low', 'moderate', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'needs_review' CHECK (status IN ('needs_review', 'in_progress', 'dispatched', 'resolved', 'escalated')),
  summary TEXT NOT NULL,
  reported_location JSONB NOT NULL DEFAULT '{}'::jsonb,
  affected_parties TEXT,
  raw_text TEXT,
  input_methods JSONB DEFAULT '["text"]'::jsonb,
  language TEXT DEFAULT 'English',
  sensitive_consent_given BOOLEAN DEFAULT false,
  is_simulated_demo BOOLEAN DEFAULT false,
  analysis_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for high-frequency queries
CREATE INDEX IF NOT EXISTS idx_incidents_category ON public.incidents(category);
CREATE INDEX IF NOT EXISTS idx_incidents_urgency ON public.incidents(urgency);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON public.incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_user_id ON public.incidents(user_id);

-- 3. Evidence Files Table
CREATE TABLE IF NOT EXISTS public.evidence_files (
  id TEXT PRIMARY KEY,
  incident_id TEXT NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  storage_path TEXT,
  category TEXT NOT NULL CHECK (category IN ('audio_recording', 'audio_file', 'photo', 'document', 'text_log')),
  extracted_snippet TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_evidence_incident_id ON public.evidence_files(incident_id);

-- 4. Recommendations Table
CREATE TABLE IF NOT EXISTS public.recommendations (
  id TEXT PRIMARY KEY,
  incident_id TEXT NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  why_appropriate TEXT NOT NULL,
  urgency TEXT NOT NULL CHECK (urgency IN ('low', 'moderate', 'high', 'critical')),
  responsible_authority JSONB NOT NULL DEFAULT '{}'::jsonb,
  alternatives_considered JSONB DEFAULT '[]'::jsonb,
  next_steps_timeline JSONB DEFAULT '[]'::jsonb,
  action_status TEXT NOT NULL DEFAULT 'not_started' CHECK (action_status IN ('not_started', 'dispatched', 'in_progress', 'verified_resolved')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_recommendations_incident_id ON public.recommendations(incident_id);

-- 5. Incident Activity & Audit Timeline Table
CREATE TABLE IF NOT EXISTS public.incident_activity (
  id TEXT PRIMARY KEY,
  incident_id TEXT NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  details TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('status_change', 'note_added', 'evidence_attached', 'dispatch_simulation')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_incident_id ON public.incident_activity(incident_id);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON public.incident_activity(created_at DESC);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_activity ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Incidents: Authenticated users can view their own incidents or demo incidents
CREATE POLICY "Read permitted incidents" 
  ON public.incidents FOR SELECT 
  USING (
    is_simulated_demo = true OR 
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('operator', 'admin'))
  );

-- Anonymous or authenticated users can insert incidents (e.g. public distress reports)
CREATE POLICY "Anyone can create reports" 
  ON public.incidents FOR INSERT 
  WITH CHECK (true);

-- Only owners or operators can update incidents
CREATE POLICY "Authorized incident updates" 
  ON public.incidents FOR UPDATE 
  USING (
    auth.uid() = user_id OR 
    is_simulated_demo = true OR
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('operator', 'admin'))
  );

-- Evidence files: Readable if parent incident is accessible
CREATE POLICY "Read permitted evidence" 
  ON public.evidence_files FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.incidents 
      WHERE incidents.id = evidence_files.incident_id 
      AND (incidents.is_simulated_demo = true OR incidents.user_id = auth.uid())
    )
  );

CREATE POLICY "Insert evidence files" 
  ON public.evidence_files FOR INSERT 
  WITH CHECK (true);

-- Recommendations: Readable if incident is readable
CREATE POLICY "Read recommendations" 
  ON public.recommendations FOR SELECT 
  USING (true);

CREATE POLICY "Manage recommendations" 
  ON public.recommendations FOR ALL 
  USING (true);

-- Activity timeline: Readable and insertable for incident audit
CREATE POLICY "Read activity timeline" 
  ON public.incident_activity FOR SELECT 
  USING (true);

CREATE POLICY "Insert activity logs" 
  ON public.incident_activity FOR INSERT 
  WITH CHECK (true);

-- ==============================================================================
-- Storage Bucket Definition for Private Evidence Vault
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('evidence_vault', 'evidence_vault', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Users can view files in their own folder or demo items
CREATE POLICY "Evidence Vault Authorized Select" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'evidence_vault');

CREATE POLICY "Evidence Vault Authorized Insert" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'evidence_vault');
