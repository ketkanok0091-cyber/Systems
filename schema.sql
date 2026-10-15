-- รันใน Supabase > SQL Editor (ครั้งเดียว)
create table if not exists public.docs (
  collection text not null,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  primary key (collection, id)
);

alter table public.docs enable row level security;

-- เฉพาะอีเมลนี้เท่านั้นที่อ่าน/เขียนได้ (ถ้าเปลี่ยนอีเมล แก้ตรงนี้)
create policy "owner only" on public.docs
  for all to authenticated
  using ((auth.jwt() ->> 'email') = 'ketkanok0091@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'ketkanok0091@gmail.com');

-- ให้หน้าเว็บอัปเดตสดเมื่อข้อมูลเปลี่ยน
alter publication supabase_realtime add table public.docs;
