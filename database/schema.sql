
-- -------------------------------------------------
-- Supabase tables for CalSnap
-- -------------------------------------------------

create table if not exists public."Users" (
  id uuid primary key references auth.users(id),
  email text,
  name text,
  age int,
  height numeric,
  weight numeric,
  created_at timestamp default now()
);

create table if not exists public."FoodEntries" (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  food_name text,
  calories numeric,
  protein numeric,
  carbs numeric,
  fat numeric,
  health_score int,
  health_advice text,
  image_url text,
  created_at timestamp default now()
);

create table if not exists public."UserGoals" (
  user_id uuid primary key references auth.users(id),
  calorie_goal numeric,
  protein_goal numeric,
  carb_goal numeric,
  fat_goal numeric
);

create table if not exists public."Subscriptions" (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  plan text,
  status text,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamp default now()
);
