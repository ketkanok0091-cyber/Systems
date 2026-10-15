# งานระบบ Music Arms (musicarms-ops)

เว็บบันทึกงานรายวัน ใช้คนเดียว (อีเมล ketkanok0091@gmail.com) หน้าเว็บเป็นไฟล์ static ไม่ต้อง build
ข้อมูลเก็บที่ Supabase ล็อกอินด้วยลิงก์ทางอีเมล (ไม่มีรหัสผ่าน)

## ขั้นตอน (ประมาณ 15 นาที)

### 1) Supabase (ฐานข้อมูล)
1. สมัคร/เข้า https://supabase.com แล้วกด New project (ตั้งชื่อ musicarms-ops เลือก region Singapore)
2. เมนู SQL Editor → วางไฟล์ `supabase/schema.sql` → Run
3. วางไฟล์ `supabase/seed.sql` → Run (นำเข้างาน 23 เรื่องของวันที่ 14/10/69)
4. Authentication → URL Configuration → ใส่ Site URL เป็นลิงก์ Vercel ของคุณ เช่น `https://musicarms-ops.vercel.app` (ทำหลังข้อ 3 ก็ได้)
5. (แนะนำ) Authentication → Sign In / Providers → Email: ปิด "Allow new users to sign up" หลังจากเข้าระบบครั้งแรกสำเร็จแล้ว เพื่อไม่ให้คนอื่นสมัครได้ (แม้สมัครได้ก็อ่านข้อมูลไม่ได้ เพราะมี policy ล็อกอีเมลไว้)
6. Project Settings → API: คัดลอก Project URL และ anon public key

### 2) ตั้งค่าแอป
แก้ไฟล์ `config.js` ใส่ URL และ anon key จากข้อ 1.6 (anon key เป็นคีย์สาธารณะ ใส่ในเว็บได้ ความปลอดภัยอยู่ที่ policy ในฐานข้อมูล)

### 3) Vercel (ลิงก์)
1. สร้าง repo ใน GitHub แล้วอัปโหลดไฟล์ทั้งโฟลเดอร์นี้ (หรือใช้ Vercel CLI: `vercel --prod` ในโฟลเดอร์นี้)
2. https://vercel.com → Add New → Project → เลือก repo → Framework Preset: Other → Deploy
3. ตั้งชื่อโปรเจกต์ `musicarms-ops` จะได้ลิงก์ `musicarms-ops.vercel.app` (ถ้าชื่อถูกใช้แล้ว Vercel จะเสนอชื่ออื่น)
4. กลับไป Supabase ใส่ Site URL ให้ตรงกับลิงก์จริง (ข้อ 1.4)

### 4) เข้าใช้งาน
เปิดลิงก์ → ใส่อีเมล ketkanok0091@gmail.com → กดลิงก์ในอีเมล → เข้าใช้ได้

## เปลี่ยนอีเมลที่เข้าได้
แก้ในไฟล์ `supabase/schema.sql` (policy "owner only") แล้วรันใหม่ หรือแก้ policy ใน Supabase → Authentication → Policies

## ไฟล์
- `index.html` หน้าเว็บทั้งหมด · `shim.js` ตัวเชื่อม Supabase · `config.js` ค่าตั้งค่า
- `supabase/schema.sql` สร้างตาราง docs + สิทธิ์ · `supabase/seed.sql` ข้อมูลเริ่มต้น

## หมายเหตุ
- ฟังก์ชัน: เพิ่ม/แก้/ลบงาน, บันทึกรายวัน, ค้นหา, ส่งออก CSV, บันทึกเป็นรูป PNG
- ถ้าเข้าแล้วไม่ขึ้นข้อมูล: ตรวจว่ารัน seed.sql แล้ว และล็อกอินด้วยอีเมลเดียวกับใน schema.sql
