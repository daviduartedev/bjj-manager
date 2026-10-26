/** #32: operação pública PostgreSQL em banco descartável loopback, sempre rollback. */
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
async function asUser(uid) { await db.query('RESET ROLE'); await db.query("SELECT set_config('request.jwt.claim.sub',$1,true)",[uid]); await db.query('SET LOCAL ROLE authenticated'); }
async function denied(sql,args,code) { await db.query('SAVEPOINT invalid'); try { await assert.rejects(db.query(sql,args),e=>e.code===code); } finally { await db.query('ROLLBACK TO SAVEPOINT invalid'); } }
const promote = 'SELECT public.promote_referenced_student($1,$2,$3,$4,$5)';
async function main() {
 await db.connect();
 try {
  await db.query('BEGIN');
  const tables=['accounts','students','student_graduations','plans','student_plans','payments','generated_documents'];
  async function snapshot() { const out={}; for(const table of tables) out[table]=(await db.query(`SELECT to_jsonb(t) value FROM public.${table} t ORDER BY id`)).rows; return out; }
  const before=await snapshot();
  if(process.argv.includes('--apply-migration')) {
   const sql=fs.readFileSync(path.join(__dirname,'../db/migrations/035_judo_promotions.sql'),'utf8').replace(/^BEGIN;\s*$/m,'').replace(/^COMMIT;\s*$/m,'');
   await db.query(sql); await db.query(sql);
   assert.deepEqual(await snapshot(),before,'Migração não reescreve dados existentes');
  }
  const [a,b,u,v,us,missing]=Array.from({length:6},()=>randomUUID());
  await db.query("INSERT INTO public.accounts(id,name,modality) VALUES ($1,'Judô A','judo'),($2,'Judô B','judo')",[a,b]);
  await db.query('INSERT INTO auth.users(id) SELECT unnest($1::uuid[])',[[u,v,us,missing]]);
  await db.query("INSERT INTO public.profiles(user_id,account_id,display_name,role) VALUES ($1,$2,'Professor A','professor'),($3,$4,'Professor B','professor'),($5,$2,'Aluno','student')",[u,a,v,b,us]);
  const {rows:[s]}=await db.query("INSERT INTO public.students(account_id,status,kind,full_name,birth_date,academy_start_date,current_belt_id,current_degree,graduation_reference_id,current_rank_code,current_rank_date,user_id) VALUES ($1,'active','adult','Judoca','2000-01-01','2024-01-01',NULL,NULL,'cbj-2023','beginner',NULL,$2) RETURNING id",[a,us]);
  await asUser(u);
  await denied('INSERT INTO public.student_rank_promotions(student_id) VALUES ($1)',[s.id],'42501');
  await db.query(promote,[s.id,'cbj-2023','kyu-11','2026-01-01',null]);
  let row=(await db.query('SELECT * FROM public.student_rank_promotions WHERE student_id=$1',[s.id])).rows[0];
  assert.equal(row.from_rank_code,'beginner'); assert.equal(row.from_rank_date,null); assert.equal(row.was_skip,false);
  assert.equal((await db.query('SELECT current_rank_code FROM public.students WHERE id=$1',[s.id])).rows[0].current_rank_code,'kyu-11');
  await denied(promote,[s.id,'cbj-2023','kyu-11','2026-01-02',null],'23514');
  await denied(promote,[s.id,'cbj-2023','beginner','2026-01-02','motivo'],'23514');
  await denied(promote,[s.id,'cbmtt-19-khan','khan-1','2026-01-02','motivo'],'23514');
  await denied(promote,[s.id,'cbj-2023','dan-11','2026-01-02','motivo'],'23514');
  await denied(promote,[s.id,'cbj-2023','kyu-10','2999-01-01',null],'23514');
  await denied(promote,[s.id,'cbj-2023','kyu-10','2025-01-01',null],'23514');
  await denied(promote,[s.id,'cbj-2023','kyu-8','2026-01-02','  '],'23514');
  await denied(promote,[s.id,'cbj-2023','kyu-8','2026-01-02','\n\t\u00a0'],'23514');
  await db.query(promote,[s.id,'cbj-2023','kyu-8','2026-01-02','Graduação concedida antes da transferência']);
  row=(await db.query("SELECT * FROM public.student_rank_promotions WHERE student_id=$1 AND to_rank_code='kyu-8'",[s.id])).rows[0];
  assert.equal(row.was_skip,true); assert.equal(row.reason,'Graduação concedida antes da transferência'); assert.deepEqual(row.guidance_exceptions,[]);
  await asUser(v);
  await denied(promote,[s.id,'cbj-2023','kyu-7','2026-01-03',null],'42501');
  assert.equal((await db.query('SELECT id FROM public.student_rank_promotions WHERE student_id=$1',[s.id])).rowCount,0);
  for (const uid of [us,missing]) { await asUser(uid); await denied(promote,[s.id,'cbj-2023','kyu-7','2026-01-03',null],'42501'); }
  await asUser(us);
  assert.equal((await db.query('SELECT id FROM public.student_rank_promotions WHERE student_id=$1',[s.id])).rowCount,2);
  await db.query('RESET ROLE'); await db.query('SET LOCAL ROLE anon');
  await denied(promote,[s.id,'cbj-2023','kyu-7','2026-01-03',null],'42501');
  await asUser(us);
  await denied("UPDATE public.student_rank_promotions SET reason='forged' WHERE student_id=$1",[s.id],'42501');
  await denied('DELETE FROM public.student_rank_promotions WHERE student_id=$1',[s.id],'42501');
  await asUser(u); await db.query('RESET ROLE');
  await db.query("UPDATE public.students SET current_rank_code='dan-1',current_rank_date='2026-01-01',birth_date='2008-01-01' WHERE id=$1",[s.id]);
  await asUser(u);
  await denied(promote,[s.id,'cbj-2023','dan-2','2026-01-03',null],'23514');
  await db.query(promote,[s.id,'cbj-2023','dan-2','2026-01-03','Categoria especial, graduação já concedida']);
  row=(await db.query("SELECT * FROM public.student_rank_promotions WHERE student_id=$1 AND to_rank_code='dan-2'",[s.id])).rows[0];
  assert.deepEqual(row.guidance_exceptions,['age','waiting']); assert.equal(row.was_skip,false);
  await db.query('RESET ROLE');
  const {rows:[unknown]}=await db.query("INSERT INTO public.students(account_id,status,kind,full_name,birth_date,academy_start_date,current_belt_id,current_degree,graduation_reference_id,current_rank_code,current_rank_date) VALUES ($1,'active','adult','Data anterior desconhecida','2000-01-01','2024-01-01',NULL,NULL,'cbj-2023','kyu-1',NULL) RETURNING id",[a]);
  await asUser(u);
  await db.query(promote,[unknown.id,'cbj-2023','dan-1','2026-01-03',null]);
  row=(await db.query('SELECT * FROM public.student_rank_promotions WHERE student_id=$1',[unknown.id])).rows[0];
  assert.equal(row.from_rank_date,null); assert.deepEqual(row.guidance_exceptions,[]); assert.match(row.guidance_basis,/Carência indeterminável/);
  await db.query('RESET ROLE');
  const {rows:[historical]}=await db.query("INSERT INTO public.students(account_id,status,kind,full_name,birth_date,academy_start_date,current_belt_id,current_degree,graduation_reference_id,current_rank_code,current_rank_date) VALUES ($1,'active','adult','Graduação histórica','2000-01-01','2024-01-01',NULL,NULL,'cbj-2023','beginner',NULL) RETURNING id",[a]);
  await asUser(u);
  await denied(promote,[historical.id,'cbj-2023','kyu-11','2002-01-01',null],'23514');
  await db.query(promote,[historical.id,'cbj-2023','kyu-11','2002-01-01','Registro histórico concedido, exceção informada']);
  row=(await db.query('SELECT * FROM public.student_rank_promotions WHERE student_id=$1',[historical.id])).rows[0];
  assert.deepEqual(row.guidance_exceptions,['age']); assert.match(row.guidance_basis,/3 meses/);
  await asUser(us);
  assert.equal((await db.query('SELECT id FROM public.student_rank_promotions WHERE student_id=$1',[unknown.id])).rowCount,0);
  await asUser(u);
  await db.query('RESET ROLE');
  await db.query("CREATE FUNCTION pg_temp.fail_promotion() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'forced failure'; END $$");
  await db.query('CREATE TRIGGER proof_failure BEFORE INSERT ON public.student_rank_promotions FOR EACH ROW EXECUTE FUNCTION pg_temp.fail_promotion()');
  await asUser(u);
  await denied(promote,[s.id,'cbj-2023','dan-3','2026-01-04','Justificativa'],'P0001');
  assert.equal((await db.query('SELECT current_rank_code FROM public.students WHERE id=$1',[s.id])).rows[0].current_rank_code,'dan-2');
  assert.equal((await db.query('SELECT count(*)::int n FROM public.student_rank_promotions WHERE student_id=$1',[s.id])).rows[0].n,3);
  console.log('PASS: avanço atômico/data anterior NULL; salto Casca; repetição/regresso/estrangeiro/futuro/retrodata recusados; exceções CBJ justificadas; professor/tenant/self/missing; eventos imutáveis; falha de evento não altera ficha. Rollback.');
 } finally { await db.query('ROLLBACK'); await db.end(); }
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
