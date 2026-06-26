-- =============================================================================
-- Migration 034: Security hardening from the 2026-06-27 checkup
-- =============================================================================
-- Two findings from `supabase get_advisors`:
--
--   1. WARN — function_search_path_mutable on public.set_updated_at
--      The function had no `SET search_path` clause, so it inherits whatever
--      search_path the caller has. Not exploitable in practice (the function
--      only does `new.updated_at = now()`), but pinning the path is the
--      lint's recommended fix and costs nothing.
--
--   2. WARN — public_bucket_allows_listing on the `avatars` bucket
--      A leftover `avatars: public read` SELECT policy on storage.objects
--      let anon clients enumerate every avatar file in the bucket. Public
--      buckets serve files via getPublicUrl() without needing an RLS
--      SELECT policy — the bucket's own public flag handles that path.
--      Dropping the policy stops the LIST exposure without breaking the
--      <img src="https://…/avatars/<user>/avatar.jpeg"> reads that every
--      page already relies on.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

drop policy if exists "avatars: public read" on storage.objects;
