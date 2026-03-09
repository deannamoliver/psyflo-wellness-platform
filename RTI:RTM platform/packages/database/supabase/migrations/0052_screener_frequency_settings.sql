-- Create screener frequency settings table
-- Allows admins to configure re-administration frequency per screener type
-- Frequency options: monthly, quarterly, annually

CREATE TYPE public.screener_frequency AS ENUM ('monthly', 'quarterly', 'annually');

CREATE TABLE public.screener_frequency_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  screener_type public.screener_type NOT NULL UNIQUE,
  frequency public.screener_frequency NOT NULL DEFAULT 'quarterly',
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  deleted_at timestamp with time zone
);

-- Insert default settings for all screener types
INSERT INTO public.screener_frequency_settings (screener_type, frequency) VALUES
  ('sel', 'quarterly'),
  ('phq_a', 'quarterly'),
  ('phq_9', 'quarterly'),
  ('gad_child', 'quarterly'),
  ('gad_7', 'quarterly');

-- Add admin policy
ALTER TABLE public.screener_frequency_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin can manage all screener frequency settings"
  ON public.screener_frequency_settings
  FOR ALL
  TO supabase_auth_admin
  USING (true);
