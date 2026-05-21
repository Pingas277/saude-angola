# Saúde Angola

Plataforma digital de saúde para Angola — telemedicina (B2C) e gestão clínica (B2B).

Built with **Next.js 15** (App Router), **TypeScript**, **Tailwind v4**, and **Supabase** (Postgres + Auth via `@supabase/ssr`).

## Roles

- `patient` — telemedicina, receitas, faturas, histórico clínico (`/painel`)
- `doctor` — agenda, consultas, receitas, telemedicina (`/medico`)
- `nurse` — _planeado_
- `receptionist` — fila do dia, marcações, walk-ins (`/recepcao`)
- `admin` — equipa da clínica, faturação, perfil (`/clinica`)

## Local development

```bash
# 1. Install deps
npm install

# 2. Copy env file and fill in your Supabase project details
cp .env.example .env.local
# edit .env.local — set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, DATABASE_URL

# 3. Run migrations
npm run migrate

# 4. Start the dev server
npm run dev
# → http://localhost:3000
```

## Test accounts (after running the seed scripts)

| Role | Email | Password |
|---|---|---|
| Paciente | `saudeangola.qa.1778185789210@gmail.com` | `SaudeAngola2026!` |
| Médico | `medico.silva@gmail.com` | `LARANJA2005` |
| Recepção | `recepcao.demo@lunga.ao` | `LARANJA2005` |
| Admin | `admin.demo@lunga.ao` | `LARANJA2005` |

## Database migrations

Numbered SQL files in `migrations/` are applied in order via `npm run migrate`. The runner (`migrations/run.js`) tracks applied migrations in a `_migrations` table and skips already-applied ones.

```bash
npm run migrate
```

To create a doctor / admin from an existing user:

```bash
node scripts/promote-to-doctor.js user@example.com
node scripts/promote-to-admin.js user@example.com
```

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import into Vercel: https://vercel.com/new
3. Set environment variables in **Project → Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY` (optional, enables Claude triage)
   - `DATABASE_URL` (production only — used for the `migrate` script run from your laptop, not by the app at runtime)
4. In Supabase: **Authentication → URL Configuration**, add the Vercel domain to **Site URL** and to the redirect allow-list.
5. (Recommended) **Project → Settings → Functions → Region** → set to `fra1` (Frankfurt) for lower latency from Angola.

The `next.config.ts` already includes the PDF font files via `outputFileTracingIncludes` so they ship with the serverless functions.

Migrations don't run automatically on deploy. Run them locally against the production `DATABASE_URL` before pushing the schema-dependent code.

## Project structure

```
app/
  (auth)/            # /entrar, /registar
  _brand/            # AngolanAccent, Logo
  api/
    fatura/[id]/pdf/ # invoice PDF
    receita/[id]/pdf/# prescription PDF
  clinica/           # admin (B2B)
  medico/            # doctor
  painel/            # patient (B2C)
  recepcao/          # front desk
lib/
  fonts/             # Roboto TTFs bundled for PDF generation
  pdf-fonts.ts       # shared font loader
  supabase/          # SSR + browser clients
  triage.ts          # AI triage (Claude + heuristic fallback)
migrations/          # numbered .sql files, run.js applies them
public/
  brand/             # logos (drop your PNGs here)
  hero/              # landing hero images
scripts/             # promote-to-{doctor,admin} helpers
```

## Tech notes

- **Auth** via `@supabase/ssr` — middleware refreshes the session on every request.
- **RLS** is enabled from migration 001 on every table; admin / clinic-staff scopes are added in 003 (doctors), 004, 009 (admin), 012 (receptionist).
- **PDFs** rendered with `pdf-lib` + `@pdf-lib/fontkit` and Roboto so any Unicode glyph (✂ → ⚠ ✓) works.
- **Telemedicine** uses `meet.jit.si` rooms (no API key needed for testing). Realtime updates via Supabase Realtime — see `app/medico/telemedicina/RealtimeRefresh.tsx` and the patient sala component.
- **Triage** prefers Claude Haiku 4.5 when `ANTHROPIC_API_KEY` is set, otherwise falls back to a keyword heuristic — same input/output shape so callers don't change.

## License

Proprietary — Saúde Angola.
