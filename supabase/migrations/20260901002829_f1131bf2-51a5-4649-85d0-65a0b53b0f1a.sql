CREATE TABLE public.sibudi_state (
  id text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sibudi_state TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sibudi_state TO authenticated;
GRANT ALL ON public.sibudi_state TO service_role;

ALTER TABLE public.sibudi_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sibudi_state readable by everyone" ON public.sibudi_state FOR SELECT USING (true);
CREATE POLICY "sibudi_state insertable by everyone" ON public.sibudi_state FOR INSERT WITH CHECK (true);
CREATE POLICY "sibudi_state updatable by everyone" ON public.sibudi_state FOR UPDATE USING (true) WITH CHECK (true);

INSERT INTO public.sibudi_state (id, data) VALUES ('main', '{}'::jsonb);