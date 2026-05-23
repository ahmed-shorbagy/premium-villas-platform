-- Create a bucket for property images if it doesn't exist
insert into storage.buckets (id, name, public)
values ('properties', 'properties', true)
on conflict (id) do nothing;

-- Create a bucket for banner images if it doesn't exist
insert into storage.buckets (id, name, public)
values ('banners', 'banners', true)
on conflict (id) do nothing;

-- Storage policies for properties bucket
create policy "Property images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'properties' );

create policy "Anyone can upload property images"
  on storage.objects for insert
  with check ( bucket_id = 'properties' );

create policy "Authenticated users can update property images"
  on storage.objects for update
  using ( bucket_id = 'properties' and auth.role() = 'authenticated' );

create policy "Authenticated users can delete property images"
  on storage.objects for delete
  using ( bucket_id = 'properties' and auth.role() = 'authenticated' );

-- Storage policies for banners bucket
create policy "Banner images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'banners' );

create policy "Authenticated users can upload banner images"
  on storage.objects for insert
  with check ( bucket_id = 'banners' and auth.role() = 'authenticated' );

create policy "Authenticated users can update banner images"
  on storage.objects for update
  using ( bucket_id = 'banners' and auth.role() = 'authenticated' );

create policy "Authenticated users can delete banner images"
  on storage.objects for delete
  using ( bucket_id = 'banners' and auth.role() = 'authenticated' );

-- Create banners table
-- We use "check (true)" to allow create if not exists style checks in some sql engines, 
-- but here we just drop if it exists to be safe and clean since it's a new feature.
DROP TABLE IF EXISTS public.banners;

create table public.banners (
  id uuid default gen_random_uuid() primary key,
  title text,
  description text,
  image_url text not null,
  link text,
  is_active boolean default true,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.banners enable row level security;

-- Policies
create policy "Public banners are viewable by everyone"
  on public.banners for select
  using ( is_active = true );

create policy "Admins can do everything with banners"
  on public.banners for all
  using ( auth.uid() in (
    select user_id from public.user_roles where role = 'admin'
  ) );

-- =====================================================
-- LISTING REQUESTS TABLE
-- =====================================================
-- This table stores user-submitted property listings that need admin approval

DROP TABLE IF EXISTS public.listing_requests;

create table public.listing_requests (
  id uuid default gen_random_uuid() primary key,
  -- Property Details
  title text not null,
  description text,
  type text not null,
  listing_type text not null check (listing_type in ('sale', 'rent')),
  price numeric not null,
  location text not null,
  area text not null,
  area_size numeric not null,
  bedrooms integer default 0,
  bathrooms integer default 1,
  features text[],
  images text[],
  -- User Contact Info
  contact_name text not null,
  contact_phone text not null,
  contact_email text,
  contact_location text,
  -- Status
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  admin_notes text,
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.listing_requests enable row level security;

-- Policies for listing_requests
-- Anyone can submit a listing request (insert)
create policy "Anyone can submit listing requests"
  on public.listing_requests for insert
  with check (true);

-- Only admins can view all listing requests
create policy "Admins can view all listing requests"
  on public.listing_requests for select
  using ( auth.uid() in (
    select user_id from public.user_roles where role = 'admin'
  ) );

-- Only admins can update listing requests
create policy "Admins can update listing requests"
  on public.listing_requests for update
  using ( auth.uid() in (
    select user_id from public.user_roles where role = 'admin'
  ) );

-- Only admins can delete listing requests
create policy "Admins can delete listing requests"
  on public.listing_requests for delete
  using ( auth.uid() in (
    select user_id from public.user_roles where role = 'admin'
  ) );
