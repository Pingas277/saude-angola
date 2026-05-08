-- =============================================================================
-- 011 · Enable Supabase Realtime on consultations
-- =============================================================================
-- The patient waiting room and the doctor queue currently poll every 5s via
-- router.refresh(). Adding consultations to the supabase_realtime publication
-- lets browser clients subscribe to row-level changes and react instantly
-- (doctor claims → patient flips into video, patient cancels → row leaves
-- doctor pool, new patient submits triage → row appears in pool).
-- RLS still applies to every event broadcast, so each client only sees rows
-- they could have read otherwise.
-- =============================================================================

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'consultations'
  ) then
    alter publication supabase_realtime add table public.consultations;
  end if;
end $$;
