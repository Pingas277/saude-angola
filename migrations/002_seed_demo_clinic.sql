-- =============================================================================
-- 002 · Seed: demo clinic in Luanda for development / smoke tests
-- =============================================================================

insert into public.clinics (id, name, address, province, phone, email, subscription_plan, is_active)
values (
  '11111111-1111-1111-1111-111111111111',
  'Clínica Saúde Angola — Luanda',
  'Avenida 4 de Fevereiro, Luanda',
  'Luanda',
  '+244 222 000 000',
  'contacto@lunga.ao',
  'standard',
  true
)
on conflict (id) do nothing;
