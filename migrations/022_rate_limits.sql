-- =============================================================================
-- 022 · Rate limiting (database-backed, no external service)
-- =============================================================================
-- A fixed-window counter table + a SECURITY DEFINER function. The app calls
-- check_rate_limit(key, max, window_seconds) before sensitive actions
-- (login, signup, booking). Returns true = allowed, false = over the limit.
--
-- DB-backed on purpose: no Upstash/Redis account, no extra env vars. Login
-- and booking are low-frequency, so a tiny upsert per attempt is fine.
-- =============================================================================

create table if not exists public.rate_limits (
  key text primary key,
  count int not null default 0,
  window_start timestamptz not null default now()
);

alter table public.rate_limits enable row level security;
-- No policies — the table is only ever touched by the SECURITY DEFINER
-- function below, never directly by app users.

create or replace function public.check_rate_limit(
  p_key text,
  p_max int,
  p_window_seconds int
) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_count int;
  v_start timestamptz;
begin
  select count, window_start into v_count, v_start
    from public.rate_limits
    where key = p_key
    for update;

  -- First hit for this key.
  if not found then
    insert into public.rate_limits (key, count, window_start)
      values (p_key, 1, now());
    return true;
  end if;

  -- Window expired → start a fresh window.
  if v_start < now() - make_interval(secs => p_window_seconds) then
    update public.rate_limits
      set count = 1, window_start = now()
      where key = p_key;
    return true;
  end if;

  -- Inside the window, already at the limit → block.
  if v_count >= p_max then
    return false;
  end if;

  -- Inside the window, still under the limit → count it.
  update public.rate_limits set count = v_count + 1 where key = p_key;
  return true;
end;
$$;

grant execute on function public.check_rate_limit(text, int, int)
  to anon, authenticated;
