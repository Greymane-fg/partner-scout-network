create type public.app_role as enum ('admin','member');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  partner_id text unique not null,
  full_name text not null default '',
  headline text,
  bio text,
  avatar_url text,
  location text,
  approved boolean not null default false,
  added_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.agent_skills (
  agent_id uuid references public.profiles(id) on delete cascade not null,
  skill_id uuid references public.skills(id) on delete cascade not null,
  for_ecom boolean not null default false,
  for_exec boolean not null default false,
  primary key (agent_id, skill_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  result text,
  url text,
  for_ecom boolean not null default false,
  for_exec boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.contact_methods (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.profiles(id) on delete cascade not null,
  platform text not null,
  label text,
  value text not null,
  is_primary_ecom boolean not null default false,
  is_primary_exec boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index contact_methods_one_primary_ecom on public.contact_methods (agent_id) where is_primary_ecom;
create unique index contact_methods_one_primary_exec on public.contact_methods (agent_id) where is_primary_exec;

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.profiles(id) on delete cascade not null,
  author_name text not null,
  rating int not null check (rating >= 1 and rating <= 5),
  content text not null,
  source_view text not null default 'ecom' check (source_view in ('ecom','exec')),
  created_at timestamptz not null default now()
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  slug text unique not null,
  excerpt text,
  body text not null default '',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT SELECT ON public.skills TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.skills TO authenticated;
GRANT ALL ON public.skills TO service_role;
GRANT SELECT ON public.agent_skills TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.agent_skills TO authenticated;
GRANT ALL ON public.agent_skills TO service_role;
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
GRANT SELECT ON public.contact_methods TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.contact_methods TO authenticated;
GRANT ALL ON public.contact_methods TO service_role;
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, DELETE ON public.reviews TO authenticated;
GRANT INSERT ON public.reviews TO anon;
GRANT ALL ON public.reviews TO service_role;
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

create or replace function public.assert_admin_cap()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_count int;
begin
  if new.role = 'admin' then
    select count(*) into admin_count from public.user_roles where role = 'admin';
    if admin_count >= 10 then
      raise exception 'Admin limit reached: there can only be 10 admins at any given time';
    end if;
  end if;
  return new;
end
$$;

create trigger admin_cap_trigger
before insert or update on public.user_roles
for each row execute function public.assert_admin_cap();

create policy "Users can view own role"
on public.user_roles for select to authenticated
using (user_id = auth.uid());

create policy "Admins can view all roles"
on public.user_roles for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can assign roles"
on public.user_roles for insert to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can revoke roles"
on public.user_roles for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Anyone can view approved agents"
on public.profiles for select to anon, authenticated
using (approved = true);

create policy "Owners can view own profile"
on public.profiles for select to authenticated
using (id = auth.uid());

create policy "Admins can view all profiles"
on public.profiles for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Users can create own profile on signup"
on public.profiles for insert to authenticated
with check (id = auth.uid());

create policy "Agents can add other agents"
on public.profiles for insert to authenticated
with check (added_by = auth.uid() and id <> auth.uid());

create policy "Owners can update own profile"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Admins can update any profile"
on public.profiles for update to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can remove agents"
on public.profiles for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Anyone can view skills"
on public.skills for select to anon, authenticated
using (true);

create policy "Agents can upload skills"
on public.skills for insert to authenticated
with check (created_by = auth.uid());

create policy "Creators can update skills"
on public.skills for update to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

create policy "Creators can delete skills"
on public.skills for delete to authenticated
using (created_by = auth.uid());

create policy "Admins can update skills"
on public.skills for update to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete skills"
on public.skills for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Anyone can view agent skills"
on public.agent_skills for select to anon, authenticated
using (true);

create policy "Agents can add own skills"
on public.agent_skills for insert to authenticated
with check (agent_id = auth.uid());

create policy "Agents can update own skills"
on public.agent_skills for update to authenticated
using (agent_id = auth.uid())
with check (agent_id = auth.uid());

create policy "Agents can delete own skills"
on public.agent_skills for delete to authenticated
using (agent_id = auth.uid());

create policy "Anyone can view projects"
on public.projects for select to anon, authenticated
using (true);

create policy "Agents can add own projects"
on public.projects for insert to authenticated
with check (agent_id = auth.uid());

create policy "Agents can update own projects"
on public.projects for update to authenticated
using (agent_id = auth.uid())
with check (agent_id = auth.uid());

create policy "Agents can delete own projects"
on public.projects for delete to authenticated
using (agent_id = auth.uid());

create policy "Admins can remove any project"
on public.projects for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Anyone can view contact methods"
on public.contact_methods for select to anon, authenticated
using (true);

create policy "Agents can add own contact methods"
on public.contact_methods for insert to authenticated
with check (agent_id = auth.uid());

create policy "Agents can update own contact methods"
on public.contact_methods for update to authenticated
using (agent_id = auth.uid())
with check (agent_id = auth.uid());

create policy "Agents can delete own contact methods"
on public.contact_methods for delete to authenticated
using (agent_id = auth.uid());

create policy "Anyone can view reviews"
on public.reviews for select to anon, authenticated
using (true);

create policy "Anyone can leave a review"
on public.reviews for insert to anon, authenticated
with check (true);

create policy "Page owner can delete own reviews"
on public.reviews for delete to authenticated
using (agent_id = auth.uid());

create policy "Admins can delete any review"
on public.reviews for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Anyone can view published posts"
on public.blog_posts for select to anon, authenticated
using (published = true);

create policy "Authors can view own drafts"
on public.blog_posts for select to authenticated
using (agent_id = auth.uid());

create policy "Agents can write own posts"
on public.blog_posts for insert to authenticated
with check (agent_id = auth.uid());

create policy "Authors can update own posts"
on public.blog_posts for update to authenticated
using (agent_id = auth.uid())
with check (agent_id = auth.uid());

create policy "Authors can delete own posts"
on public.blog_posts for delete to authenticated
using (agent_id = auth.uid());

create policy "Admins can update any post"
on public.blog_posts for update to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete any post"
on public.blog_posts for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create trigger blog_posts_updated_at before update on public.blog_posts
for each row execute function public.set_updated_at();

do $$
declare
  admin_id uuid;
  a1 uuid; a2 uuid; a3 uuid; a4 uuid;
  s1 uuid; s2 uuid; s3 uuid; s4 uuid; s5 uuid; s6 uuid; s7 uuid; s8 uuid;
  s9 uuid; s10 uuid; s11 uuid; s12 uuid;
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change, email_change_token_new
  ) values (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
    'admin@partnerhub.app', crypt('PartnerHub2026!', gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}', '{}',
    now(), now(), '', '', '', ''
  ) returning id into admin_id;

  insert into public.profiles (id, partner_id, full_name, headline, bio, approved, location)
  values (admin_id, 'PH-ADM', 'Evan Christopher', 'Founding Admin', 'Running the Partner Hub network.', true, 'Remote');

  insert into public.user_roles (user_id, role) values (admin_id, 'admin');

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change, email_change_token_new
  ) values
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'maya.ops@partnerhub.demo', crypt(md5(random()::text || clock_timestamp()::text), gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '') returning id into a1;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change, email_change_token_new
  ) values
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'jonas.growth@partnerhub.demo', crypt(md5(random()::text || clock_timestamp()::text), gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '') returning id into a2;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change, email_change_token_new
  ) values
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'priya.strategy@partnerhub.demo', crypt(md5(random()::text || clock_timestamp()::text), gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '') returning id into a3;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change, email_change_token_new
  ) values
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'leo.finance@partnerhub.demo', crypt(md5(random()::text || clock_timestamp()::text), gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '') returning id into a4;

  insert into public.profiles (id, partner_id, full_name, headline, bio, avatar_url, location, approved, added_by) values
    (a1, 'PH-1001', 'Maya Ortiz', 'Ecommerce Operations Partner', 'I run backend operations for 7- and 8-figure DTC brands: 3PL onboarding, inventory forecasting, and CS systems that scale past 10k orders a month.', 'https://i.pravatar.cc/300?img=47', 'Austin, TX', true, admin_id),
    (a2, 'PH-1002', 'Jonas Weber', 'Growth & Paid Media Partner', 'Performance marketer focused on Meta and Google Ads for ecommerce. I have managed north of $12M in ad spend with a bias toward profitable CAC.', 'https://i.pravatar.cc/300?img=12', 'Berlin, DE', true, admin_id),
    (a3, 'PH-1003', 'Priya Nair', 'Strategy & Operations Executive Partner', 'Ex-McKinsey strategist supporting leadership teams on go-to-market, org design, and operating-model transformation.', 'https://i.pravatar.cc/300?img=32', 'Singapore', true, admin_id),
    (a4, 'PH-1004', 'Leo Fontaine', 'Corporate Finance Partner', 'Fractional CFO for mid-market companies: financial modeling, M&A support, fundraising, and board-ready reporting.', 'https://i.pravatar.cc/300?img=68', 'Toronto, CA', true, admin_id);

  insert into public.skills (name, created_by) values
    ('Shopify', admin_id), ('Amazon PPC', admin_id), ('Meta Ads', admin_id), ('Google Ads', admin_id),
    ('Email Marketing', admin_id), ('SEO', admin_id), ('Conversion Rate Optimization', admin_id),
    ('Supply Chain', admin_id), ('Copywriting', admin_id), ('Financial Modeling', admin_id),
    ('M&A Advisory', admin_id), ('Business Strategy', admin_id), ('Organizational Design', admin_id),
    ('Data Analytics', admin_id), ('Fundraising', admin_id), ('Talent Operations', admin_id);

  select id into s1 from public.skills where name = 'Shopify';
  select id into s2 from public.skills where name = 'Amazon PPC';
  select id into s3 from public.skills where name = 'Meta Ads';
  select id into s4 from public.skills where name = 'Google Ads';
  select id into s5 from public.skills where name = 'Email Marketing';
  select id into s6 from public.skills where name = 'SEO';
  select id into s7 from public.skills where name = 'Conversion Rate Optimization';
  select id into s8 from public.skills where name = 'Supply Chain';
  select id into s9 from public.skills where name = 'Copywriting';
  select id into s10 from public.skills where name = 'Financial Modeling';
  select id into s11 from public.skills where name = 'M&A Advisory';
  select id into s12 from public.skills where name = 'Business Strategy';

  insert into public.agent_skills (agent_id, skill_id, for_ecom, for_exec) values
    (a1, s1, true, false), (a1, s8, true, false), (a1, s5, true, false),
    (a2, s3, true, false), (a2, s4, true, false), (a2, s6, true, false),
    (a3, s12, false, true), (a3, s7, true, false), (a3, s9, false, true),
    (a4, s10, false, true), (a4, s11, false, true);

  insert into public.projects (agent_id, title, description, result, for_ecom, for_exec) values
    (a1, '3PL migration for apparel brand', 'Moved a $20M apparel brand from self-fulfillment to a dual-coast 3PL with SLA reporting.', 'Ship time cut from 4 days to 1.2 days', true, false),
    (a1, 'Inventory forecasting system', 'Built a rolling 26-week forecast that reduced stockouts during Q4.', 'Stockouts down 63% year over year', true, false),
    (a2, 'Meta Ads rebuild for DTC skincare', 'Rebuilt account structure, creative testing pipeline, and retargeting for a skincare brand.', 'Blended ROAS up from 1.9 to 3.4', true, false),
    (a2, 'Google Shopping feed overhaul', 'Cleaned feed, tiered bidding, and brand/non-brand split for a home goods store.', 'CPA down 38% in 90 days', true, false),
    (a3, 'Operating model redesign', 'Led a 9-month operating-model redesign for a regional services group.', 'Decision cycle time cut by 40%', false, true),
    (a4, 'Buy-side diligence', 'Ran financial diligence and working-capital modeling for a $30M acquisition.', 'Deal closed with repriced terms', false, true);

  insert into public.contact_methods (agent_id, platform, label, value, is_primary_ecom, is_primary_exec) values
    (a1, 'email', 'Email', 'maya@partnerhub.app', true, false),
    (a1, 'whatsapp', 'WhatsApp', '15125550101', false, false),
    (a1, 'linkedin', 'LinkedIn', 'https://www.linkedin.com/in/demo-maya', false, false),
    (a2, 'email', 'Email', 'jonas@partnerhub.app', true, false),
    (a2, 'telegram', 'Telegram', 'https://t.me/demo-jonas', false, false),
    (a2, 'upwork', 'Upwork', 'https://www.upwork.com/demo-jonas', false, false),
    (a3, 'email', 'Email', 'priya@partnerhub.app', false, true),
    (a3, 'linkedin', 'LinkedIn', 'https://www.linkedin.com/in/demo-priya', false, false),
    (a4, 'email', 'Email', 'leo@partnerhub.app', false, true),
    (a4, 'website', 'Website', 'https://leofontaine.demo', false, false);

  insert into public.reviews (agent_id, author_name, rating, content, source_view) values
    (a1, 'Dana K.', 5, 'Maya rebuilt our fulfillment stack in six weeks. Q4 went out on time for the first time ever.', 'ecom'),
    (a1, 'Marcus T.', 5, 'Best ops partner we have worked with. Communicates like a COO, not a contractor.', 'ecom'),
    (a2, 'Sofia R.', 4, 'Jonas took our Meta account from breakeven to genuinely profitable. Straight shooter.', 'ecom'),
    (a3, 'Exec Search Committee', 5, 'Priya gave our board a clear operating plan and then helped us run it.', 'exec'),
    (a4, 'G. Hassim', 5, 'Rigorous, fast, and honest about risk. Exactly what you want on buy-side.', 'exec');

  insert into public.blog_posts (agent_id, title, slug, excerpt, body, published) values
    (a2, 'Why your ROAS target is lying to you', 'why-your-roas-target-is-lying-to-you', 'Platform-reported ROAS and blended profitability diverge the moment you scale. Here is how to read both.', 'Platform-reported ROAS is an attribution story, not a bank statement. When you scale spend, the two numbers diverge, and brands that optimize to the platform number usually watch margin fall off a cliff.

Start with blended CAC: total spend over total new-customer revenue, from your finance system, not the ad platform. Then layer incrementality tests — geo holdouts or a simple pre/post around creative refreshes — to sanity-check what the platforms claim.

Finally, set account structure so creative testing is cheap: broad targeting, few structural constraints, and a weekly kill-or-scale ritual. Structure follows strategy, not the other way around.', true),
    (a3, 'The executive playbook for hiring specialists', 'the-executive-playbook-for-hiring-specialists', 'Most leadership teams hire generalists when they need a spike. A framework for scoping, vetting, and onboarding partners.', 'Leadership teams routinely solve a sharp problem with a broad hire. The result is a senior salary attached to a junior outcome.

Instead, scope the spike: write down the one decision or capability that is blocking the quarter, and hire against that. Vet with work samples, not interviews — a paid two-week pilot beats four rounds of conversation.

Onboard partners like employees: give them the operating context, a named decision-maker, and a review cadence. Partners deliver best inside your system, not beside it.', true),
    (a1, 'Fulfillment SLAs your 3PL will actually hit', 'fulfillment-slas-your-3pl-will-actually-hit', 'Vague SLAs are why fulfillment disappointments feel random. Make them measurable.', 'Most brands sign a 3PL agreement with SLAs like ships in 24-48 hours and then act surprised when peak season slips. A workable SLA is measured from order export to carrier scan, with a weekly scorecard and named escalation contacts on both sides.

Pressure-test the SLA before you need it: send a synthetic spike of orders in September. The response you get then is the response you will get in November.', true);
end $$;