# Sal Da Vinci Fan Community

Independent fan-community starter project with a black-and-gold responsive design, Italian/English UI, application intake, protected Supabase admin dashboard, and Netlify Functions.

## Important implementation boundaries

- This is an independent fan community and makes no claim of official affiliation or endorsement.
- The admin dashboard uses real Supabase Auth and database queries. There is no public administrator sign-up.
- Public applications are submitted through a Netlify Function using the service-role key only on the server.
- Applicants have no database read policy and cannot view other applications or administrator records.
- Optional photos are sent directly as an email attachment through Resend when consent is checked. The function does not write photo files to disk or public storage. Email providers may retain delivered mail under their own retention policies.
- Never collect full gift-card PINs or redeemable codes. Gift-card redemption requires a legitimate provider API and server-side verification. The current payment section deliberately shows that provider verification is not yet configured; it does not simulate successful payment or run a misleading one-minute fake verification.
- The dashboard currently displays application payment state as not configured. Payment webhook integration is a separate required step before payment statuses can be trusted.

## 1. Supabase setup

1. Create/open your existing Supabase project.
2. Since you already created an `applications` table earlier, run `supabase/migration-existing-project.sql` first. Then review `supabase/schema.sql` and run its admin/payment table and RLS setup statements. Do not drop your existing table.
3. In Authentication > Providers, keep Email enabled. Disable public sign-ups in Authentication settings.
4. Create the administrator user yourself in Authentication > Users with `mypersonalytip@gmail.com` and a strong password. Confirm the email if your project requires it.
5. Copy that user's UUID and run the final `insert into public.admin_users...` statement in the SQL file with the real UUID.
6. In Project Settings > API, copy the project URL and publishable/anon key. Never put the service-role key in frontend code.

## 2. Netlify environment variables

Deploy the project to Netlify, then set these in Site configuration > Environment variables:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- `ADMIN_EMAIL=mypersonalytip@gmail.com`
- `RESEND_API_KEY`
- `MAIL_FROM` (a sender address on a domain verified with Resend)

The browser configuration is injected by `assets/config.js`. Edit that file with your Supabase project URL and publishable/anon key before deployment. Those two values are public by design; the service-role key is not.

For local development, copy `.env.example` to `.env` and use `netlify dev`.

## 3. Email and photo handling

Set up Resend, verify the sender domain, and configure `RESEND_API_KEY` and `MAIL_FROM`. The photo is passed in memory to the function and attached to the email. No photo storage bucket or public URL is created. The function does not intentionally persist a temporary image file. Email delivery failure is reported; check the application reference in Supabase before asking the applicant to resubmit to avoid duplicates.

## 4. Payment provider

The current build intentionally leaves all payment methods unavailable/pending. Do not ask applicants to enter gift-card redemption codes or PINs. To enable a legitimate gift-card payment workflow, choose a provider that offers a documented merchant redemption/verification API, complete its merchant onboarding, then implement a server-side verification function and signed webhook. Only that verified server event may set `payments.status='successful'`. A one-minute waiting animation must not be treated as proof of payment.

PayPal, card, and bank transfer remain unavailable until their respective provider integrations and webhooks are implemented and tested.

## 5. Run and deploy

```bash
npm install
npm run dev
```

Netlify CLI runs the site and serverless functions locally. For production, connect the repository to Netlify or deploy the project directory. Build command: `npm run build`; publish directory: `.`.

## 6. Testing checklist before launch

- [ ] Confirm the administrator can sign in and reset password.
- [ ] Confirm a non-admin Auth user is denied dashboard access.
- [ ] Confirm public users cannot select/read `applications`, `payments`, or `admin_users`.
- [ ] Submit an application and verify it appears in Supabase.
- [ ] Test invalid fields, oversized files, unsupported file types, and missing photo consent.
- [ ] Verify photo email arrives and no image is written to Supabase Storage or public hosting.
- [ ] Test email provider failure handling.
- [ ] Test admin approve/reject and filters.
- [ ] Add and test payment provider webhook signature verification before accepting payments.
- [ ] Configure production domain, HTTPS, privacy notice, retention policy, and email sender authentication.

## Configuration note

This starter cannot be fully connected or end-to-end tested without access to your Supabase project, verified email sender, and a chosen payment provider. Do not publish as a live application until all checklist items are completed.
