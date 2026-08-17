-- =============================================================
-- İngilizce Platform — İlk şema (Stage 2)
-- Tablolar: flashcards, materials, daily_stats, quiz_results
-- Her tabloda user_id + Row Level Security (auth.uid() = user_id)
-- Supabase SQL Editor'de bu dosyanın tamamını çalıştırın.
-- =============================================================

-- -------------------------------------------------------------
-- 1) flashcards — kelime kartları + SM-2 aralıklı tekrar alanları
-- -------------------------------------------------------------
create table if not exists public.flashcards (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  word             text not null,
  meaning          text not null,
  example_sentence text,
  note             text,
  tag              text,
  -- SM-2 alanları
  interval         integer not null default 0,          -- gün cinsinden mevcut aralık
  ease_factor      numeric(4, 2) not null default 2.5,  -- kolaylık katsayısı (alt sınır 1.3)
  next_review_date date not null default current_date,  -- bir sonraki tekrar tarihi (yerel gün)
  created_at       timestamptz not null default now()
);

-- Sık kullanılan sorgular için indeksler
create index if not exists flashcards_user_idx
  on public.flashcards (user_id);
create index if not exists flashcards_due_idx
  on public.flashcards (user_id, next_review_date);

-- -------------------------------------------------------------
-- 2) materials — okuma/dinleme materyalleri ve notlar
-- -------------------------------------------------------------
create table if not exists public.materials (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text not null,
  url        text,
  notes      text,
  status     text not null default 'reading'
             check (status in ('reading', 'completed')),
  created_at timestamptz not null default now()
);

create index if not exists materials_user_idx
  on public.materials (user_id);

-- -------------------------------------------------------------
-- 3) daily_stats — günlük ilerleme (kullanıcı + tarih benzersiz)
-- -------------------------------------------------------------
create table if not exists public.daily_stats (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  date             date not null,                 -- kullanıcının YEREL tarihi (YYYY-MM-DD)
  cards_reviewed   integer not null default 0,
  new_words_added  integer not null default 0,
  quizzes_completed integer not null default 0,
  created_at       timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists daily_stats_user_date_idx
  on public.daily_stats (user_id, date);

-- -------------------------------------------------------------
-- 4) quiz_results — quiz cevap kayıtları
-- -------------------------------------------------------------
create table if not exists public.quiz_results (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  flashcard_id uuid references public.flashcards (id) on delete cascade,
  correct      boolean not null,
  created_at   timestamptz not null default now()
);

create index if not exists quiz_results_user_idx
  on public.quiz_results (user_id);

-- =============================================================
-- Row Level Security — her tablo için etkinleştir
-- =============================================================
alter table public.flashcards   enable row level security;
alter table public.materials    enable row level security;
alter table public.daily_stats  enable row level security;
alter table public.quiz_results enable row level security;

-- -------------------------------------------------------------
-- Politikalar: kullanıcı yalnızca kendi satırlarını görebilir/yazabilir
-- SELECT/UPDATE/DELETE  -> using (auth.uid() = user_id)
-- INSERT                -> with check (auth.uid() = user_id)
-- -------------------------------------------------------------

-- flashcards
create policy "flashcards_select_own" on public.flashcards
  for select using (auth.uid() = user_id);
create policy "flashcards_insert_own" on public.flashcards
  for insert with check (auth.uid() = user_id);
create policy "flashcards_update_own" on public.flashcards
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "flashcards_delete_own" on public.flashcards
  for delete using (auth.uid() = user_id);

-- materials
create policy "materials_select_own" on public.materials
  for select using (auth.uid() = user_id);
create policy "materials_insert_own" on public.materials
  for insert with check (auth.uid() = user_id);
create policy "materials_update_own" on public.materials
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "materials_delete_own" on public.materials
  for delete using (auth.uid() = user_id);

-- daily_stats
create policy "daily_stats_select_own" on public.daily_stats
  for select using (auth.uid() = user_id);
create policy "daily_stats_insert_own" on public.daily_stats
  for insert with check (auth.uid() = user_id);
create policy "daily_stats_update_own" on public.daily_stats
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily_stats_delete_own" on public.daily_stats
  for delete using (auth.uid() = user_id);

-- quiz_results
create policy "quiz_results_select_own" on public.quiz_results
  for select using (auth.uid() = user_id);
create policy "quiz_results_insert_own" on public.quiz_results
  for insert with check (auth.uid() = user_id);
create policy "quiz_results_update_own" on public.quiz_results
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "quiz_results_delete_own" on public.quiz_results
  for delete using (auth.uid() = user_id);
