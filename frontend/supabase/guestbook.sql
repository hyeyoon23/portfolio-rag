-- 방명록 테이블. Supabase 대시보드 > SQL Editor에서 한 번 실행하세요.

create table if not exists public.guestbook (
  id bigint generated always as identity primary key,
  name text not null check (char_length(btrim(name)) between 1 and 20),
  message text not null check (char_length(btrim(message)) between 1 and 300),
  created_at timestamptz not null default now()
);

create index if not exists guestbook_created_at_idx
  on public.guestbook (created_at desc);

-- RLS: 누구나 읽기·쓰기만 가능. 수정·삭제 정책은 없어서 방문자는 고치거나 지울 수 없음
-- (삭제는 대시보드의 Table Editor에서 직접)
alter table public.guestbook enable row level security;

drop policy if exists "guestbook_select" on public.guestbook;
create policy "guestbook_select" on public.guestbook
  for select to anon, authenticated
  using (true);

drop policy if exists "guestbook_insert" on public.guestbook;
create policy "guestbook_insert" on public.guestbook
  for insert to anon, authenticated
  with check (true);

-- 방문자는 name, message만 넣을 수 있음 (id, created_at 조작 방지)
revoke all on public.guestbook from anon, authenticated;
grant select on public.guestbook to anon, authenticated;
grant insert (name, message) on public.guestbook to anon, authenticated;

-- 도배 방지: 최근 1분 동안 전체 10개가 넘으면 저장 거부
create or replace function public.guestbook_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (
    select count(*) from public.guestbook
    where created_at > now() - interval '1 minute'
  ) >= 10 then
    raise exception 'guestbook rate limit exceeded';
  end if;
  return new;
end;
$$;

drop trigger if exists guestbook_rate_limit on public.guestbook;
create trigger guestbook_rate_limit
  before insert on public.guestbook
  for each row execute function public.guestbook_rate_limit();
