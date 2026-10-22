/** #30: apenas Postgres descartável local, sem fixtures persistidas. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { Client } = require('pg');
const connectionString = process.env.CASCA_TEST_DATABASE_URL;
if (!connectionString) throw new Error('Defina CASCA_TEST_DATABASE_URL local.');
const target = new URL(connectionString);
if (!['localhost','127.0.0.1','[::1]'].includes(target.hostname) || !target.pathname.endsWith('_test')) throw new Error('Apenas loopback e banco _test.');
const db = new Client({connectionString});
async function denied(sql,args,code='23514') { await db.query('SAVEPOINT invalid'); try { await assert.rejects(db.query(sql,args),e=>e.code===code); } finally { await db.query('ROLLBACK TO SAVEPOINT invalid'); } }
async function asUser(uid) { await db.query('RESET ROLE'); await db.query("SELECT set_config('request.jwt.claim.sub',$1,true)",[uid]); await db.query('SET LOCAL ROLE authenticated'); }
async function main() {
 await db.connect();
 try {
  await db.query('BEGIN');
  const [a,b,u,v,us,jjAccount,boxAccount] = Array.from({length:7},()=>randomUUID());
  await db.query("INSERT INTO public.accounts(id,name,modality) VALUES ($1,'Judô A','judo'),($2,'Judô B','judo'),($3,'JJ preservado','jiu_jitsu'),($4,'Boxe preservado','boxing')",[a,b,jjAccount,boxAccount]);
  const {rows:[jj]}=await db.query("INSERT INTO public.students(account_id,kind,full_name,current_belt_id,current_degree,status,birth_date,academy_start_date) SELECT $1,'adult','Legado JJ',id,2,'active','2000-01-01','2024-02-03' FROM public.belts WHERE slug='blue' RETURNING id",[jjAccount]);
  const {rows:[box]}=await db.query("INSERT INTO public.students(account_id,kind,full_name,current_belt_id,current_degree,status,birth_date,academy_start_date,weight_kg) VALUES ($1,'adult','Legado Boxe',NULL,NULL,'active','2000-01-01','2024-02-03',72.5) RETURNING id",[boxAccount]);
  const tables=['accounts','belts','students','student_graduations','plans','student_plans','payments','generated_documents'];
  async function snapshot() { const out={}; for(const table of tables) out[table]=(await db.query(`SELECT to_jsonb(t) - 'graduation_reference_id' - 'current_rank_code' - 'current_rank_date' value FROM public.${table} t ORDER BY id`)).rows; return out; }
  const before=await snapshot();
  if(process.argv.includes('--apply-migration')) {
   const sql=fs.readFileSync(path.join(__dirname,'../db/migrations/033_judo_referenced_ranks.sql'),'utf8').replace(/^BEGIN;\s*$/m,'').replace(/^COMMIT;\s*$/m,'');
   await db.query(sql); await db.query(sql);
   assert.deepEqual(await snapshot(),before,'Migração não reescreve dados existentes');
  }
  const catalog=(await db.query("SELECT code FROM public.graduation_ranks WHERE reference_id='cbj-2023' ORDER BY ordinal")).rows.map(r=>r.code);
  assert.deepEqual(catalog,['beginner','kyu-11','kyu-10','kyu-9','kyu-8','kyu-7','kyu-6','kyu-5','kyu-4','kyu-3','kyu-2','kyu-1','dan-1','dan-2','dan-3','dan-4','dan-5','dan-6','dan-7','dan-8','dan-9','dan-10']);
  await db.query('INSERT INTO auth.users(id) SELECT unnest($1::uuid[])',[[u,v,us]]);
  await db.query("INSERT INTO public.profiles(user_id,account_id,display_name,role) VALUES ($1,$2,'Professor A','professor'),($3,$4,'Professor B','professor'),($5,$2,'Aluno','student')",[u,a,v,b,us]);
  const {rows:[plan]}=await db.query("INSERT INTO public.plans(account_id,kind,name,price_cents) VALUES ($1,'adult','Judô personalizado',19876) RETURNING id",[a]);
  const {rows:[kids]}=await db.query("INSERT INTO public.plans(account_id,kind,name,price_cents) VALUES ($1,'kids_1','Kids',10000) RETURNING id",[a]);
  await db.query("INSERT INTO public.graduation_references(id,modality,title,source_url,consulted_at,limitation) VALUES ('cbmtt-19-khan','muay_thai','Fixture esporte estrangeiro','test','2026-10-22','Somente prova rollback') ON CONFLICT DO NOTHING");
  await db.query("INSERT INTO public.graduation_ranks(reference_id,code,ordinal,label) VALUES ('cbmtt-19-khan','khan-1',0,'Fixture') ON CONFLICT DO NOTHING");
  await asUser(u);
  const {rows:[s]}=await db.query(`INSERT INTO public.students(account_id,kind,full_name,current_belt_id,current_degree,status,birth_date,academy_start_date,graduation_reference_id,current_rank_code,current_rank_date,user_id)
    VALUES ($1,'adult','Judoca dan superior',NULL,NULL,'active',((now() AT TIME ZONE 'America/Sao_Paulo')::date - interval '18 years')::date,'2026-10-22','cbj-2023','dan-10',NULL,$2) RETURNING id,current_rank_date,current_rank_code,current_degree`,[a,us]);
  assert.equal(s.current_rank_date,null); assert.equal(s.current_degree,null);
  assert.equal((await db.query('SELECT count(*)::int n FROM public.student_graduations WHERE student_id=$1',[s.id])).rows[0].n,0);
  await denied("UPDATE public.students SET birth_date=((now() AT TIME ZONE 'America/Sao_Paulo')::date - interval '18 years' + interval '1 day')::date WHERE id=$1",[s.id]);
  await denied("UPDATE public.students SET kind='kids' WHERE id=$1",[s.id]);
  await denied("UPDATE public.students SET current_rank_code=NULL WHERE id=$1",[s.id]);
  await denied("UPDATE public.students SET graduation_reference_id='cbmtt-19-khan',current_rank_code='khan-1' WHERE id=$1",[s.id]);
  await denied("UPDATE public.students SET current_rank_code='dan-11' WHERE id=$1",[s.id]);
  await denied("UPDATE public.students SET current_degree=0 WHERE id=$1",[s.id]);
  await denied("UPDATE public.students SET current_rank_date=((now() AT TIME ZONE 'America/Sao_Paulo')::date+1) WHERE id=$1",[s.id]);
  await denied("INSERT INTO public.student_graduations(student_id,resulting_belt_id,resulting_degree,graduated_at) SELECT $1,id,0,now() FROM public.belts WHERE slug='blue'",[s.id]);
  await db.query("UPDATE public.students SET full_name='Judoca editada',current_rank_code='kyu-11',current_rank_date='2025-04-05',weight_kg=73.2 WHERE id=$1",[s.id]);
  await db.query("UPDATE public.students SET current_rank_code='beginner',current_rank_date=NULL WHERE id=$1",[s.id]);
  assert.equal((await db.query('SELECT current_rank_date FROM public.students WHERE id=$1',[s.id])).rows[0].current_rank_date,null);
  await db.query("INSERT INTO public.student_plans(student_id,plan_id,due_day,started_at,custom_price_cents) VALUES ($1,$2,12,'2026-10-22',18765)",[s.id,plan.id]);
  await denied("INSERT INTO public.student_plans(student_id,plan_id,due_day,started_at) VALUES ($1,$2,12,'2026-10-22')",[s.id,plan.id],'23505');
  await db.query("UPDATE public.student_plans SET ended_at='2026-10-22' WHERE student_id=$1",[s.id]);
  await denied("INSERT INTO public.student_plans(student_id,plan_id,due_day,started_at) VALUES ($1,$2,12,'2026-10-22')",[s.id,kids.id]);
  await db.query("INSERT INTO public.student_plans(student_id,plan_id,due_day,started_at,custom_price_cents) VALUES ($1,$2,20,'2026-10-22',18765)",[s.id,plan.id]);
  await db.query("UPDATE public.students SET is_exempt=true WHERE id=$1",[s.id]);
  assert.equal((await db.query('SELECT role FROM public.profiles WHERE user_id=$1',[us])).rows[0].role,'student');
  await denied("UPDATE public.graduation_ranks SET label='Inventado' WHERE reference_id='cbj-2023'",[],'42501');
  await denied("INSERT INTO public.graduation_ranks(reference_id,code,ordinal,label) VALUES ('cbj-2023','forged',99,'Inventado')",[],'42501');
  await denied("DELETE FROM public.graduation_ranks WHERE reference_id='cbj-2023'",[],'42501');
  await denied("UPDATE public.graduation_references SET title='Inventado' WHERE id='cbj-2023'",[],'42501');
  await denied("INSERT INTO public.graduation_references(id,modality,title,source_url,consulted_at,limitation) VALUES ('forged','judo','Inventado','none','2026-10-22','none')",[],'42501');
  await denied("DELETE FROM public.graduation_references WHERE id='cbj-2023'",[],'42501');
  await asUser(v);
  assert.equal((await db.query('SELECT id FROM public.students WHERE id=$1',[s.id])).rowCount,0);
  assert.equal((await db.query("UPDATE public.students SET current_rank_code='dan-10' WHERE id=$1 RETURNING id",[s.id])).rowCount,0);
  await asUser(us);
  await denied("UPDATE public.students SET current_rank_code='dan-10' WHERE id=$1",[s.id],'42501');
  await db.query('RESET ROLE');
  assert.equal((await db.query('SELECT current_degree FROM public.students WHERE id=$1',[jj.id])).rows[0].current_degree,2);
  assert.equal((await db.query('SELECT current_belt_id FROM public.students WHERE id=$1',[box.id])).rows[0].current_belt_id,null);
  await denied("UPDATE public.students SET current_degree=0 WHERE id=$1",[box.id]);
  await denied("UPDATE public.students SET graduation_reference_id='cbj-2023',current_rank_code='beginner' WHERE id=$1",[box.id]);
  await denied("UPDATE public.students SET graduation_reference_id='cbj-2023',current_rank_code='beginner' WHERE id=$1",[jj.id]);
  console.log('PASS: catálogo CBJ22; cadastro/edição iniciante/kyū/dan10; data null/real/futura;18hoje/amanhã; referência estrangeira/JJ recusada; Adulto único/preço/Isento; RLS tenants reais/self; papéis preservados; JJ/Boxe e dados anteriores intactos; migração reaplicável. Rollback.');
 } finally { await db.query('ROLLBACK'); await db.end(); }
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
