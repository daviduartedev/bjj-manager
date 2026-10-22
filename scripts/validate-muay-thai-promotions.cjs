/** #33: RPC pública em banco descartável loopback, sempre em transação/rollback. */
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
  const tables=['accounts','students','student_graduations','student_rank_promotions','plans','student_plans','payments','generated_documents'];
  async function snapshot() { const out={}; for(const table of tables) out[table]=(await db.query(`SELECT to_jsonb(t) value FROM public.${table} t ORDER BY id`)).rows; return out; }
  const before=await snapshot();
  if(process.argv.includes('--apply-migration')) {
   const sql=fs.readFileSync(path.join(__dirname,'../db/migrations/036_muay_thai_promotions.sql'),'utf8').replace(/^BEGIN;\s*$/m,'').replace(/^COMMIT;\s*$/m,'');
   await db.query(sql); await db.query(sql);
   assert.deepEqual(await snapshot(),before,'Migração não reescreve dados existentes');
  }
  const [a,b,u,v,us,missing]=Array.from({length:6},()=>randomUUID());
  await db.query("INSERT INTO public.accounts(id,name,modality) VALUES ($1,'Muay A','muay_thai'),($2,'Muay B','muay_thai')",[a,b]);
  await db.query('INSERT INTO auth.users(id) SELECT unnest($1::uuid[])',[[u,v,us,missing]]);
  await db.query("INSERT INTO public.profiles(user_id,account_id,display_name,role) VALUES ($1,$2,'Professor A','professor'),($3,$4,'Professor B','professor'),($5,$2,'Aluno honraria','student')",[u,a,v,b,us]);
  const {rows:[s]}=await db.query("INSERT INTO public.students(account_id,status,kind,full_name,birth_date,academy_start_date,current_belt_id,current_degree,graduation_reference_id,current_rank_code,current_rank_date,user_id) VALUES ($1,'active','adult','Muay dourado','2000-01-01','2024-01-01',NULL,NULL,'cbmtt-19-khan','khan-16',NULL,$2) RETURNING id",[a,us]);
  await asUser(u);
  await denied('INSERT INTO public.student_rank_promotions(student_id) VALUES ($1)',[s.id],'42501');
  for (const rank of ['khan-17','khan-18','khan-19']) await db.query(promote,[s.id,'cbmtt-19-khan',rank,'2026-01-01',null]);
  let rows=(await db.query('SELECT *,granted_on::text granted_day,from_rank_date::text prior_day FROM public.student_rank_promotions WHERE student_id=$1 ORDER BY event_order',[s.id])).rows;
  assert.deepEqual(rows.map(r=>[r.from_rank_code,r.to_rank_code,r.prior_day,r.granted_day,r.was_skip]),[
   ['khan-16','khan-17',null,'2026-01-01',false],['khan-17','khan-18','2026-01-01','2026-01-01',false],['khan-18','khan-19','2026-01-01','2026-01-01',false]
  ]);
  for(const row of rows) { assert.deepEqual(row.guidance_exceptions,[]); assert.match(row.guidance_basis,/CBMTT/); assert.match(row.guidance_basis,/idades ou carências/); assert.doesNotMatch(row.guidance_basis,/CBJ|interstício|idade mínima/); }
  const current=(await db.query('SELECT current_rank_code,current_rank_date::text rank_day,current_belt_id,current_degree FROM public.students WHERE id=$1',[s.id])).rows[0];
  assert.deepEqual(current,{current_rank_code:'khan-19',rank_day:'2026-01-01',current_belt_id:null,current_degree:null});
  for(const rank of ['khan-19','khan-18','khan-20']) await denied(promote,[s.id,'cbmtt-19-khan',rank,'2026-01-01','motivo'],'23514');
  await denied(promote,[s.id,'cbj-2023','dan-1','2026-01-01','motivo'],'23514');
  await db.query('RESET ROLE');
  const {rows:[jump]}=await db.query("INSERT INTO public.students(account_id,status,kind,full_name,birth_date,academy_start_date,current_belt_id,current_degree,graduation_reference_id,current_rank_code,current_rank_date) VALUES ($1,'active','adult','Salto Muay','2000-01-01','2024-01-01',NULL,NULL,'cbmtt-19-khan','khan-15',NULL) RETURNING id",[a]);
  await asUser(u);
  for (const reason of [null,'  ','\n\t\u00a0\ufeff','\u2007','\u202f']) await denied(promote,[jump.id,'cbmtt-19-khan','khan-19','2026-01-02',reason],'23514');
  await denied(promote,[jump.id,'cbmtt-19-khan','khan-16','2999-01-01',null],'23514');
  await denied(promote,[jump.id,'cbmtt-19-khan','khan-16','1999-01-01',null],'23514');
  await db.query(promote,[jump.id,'cbmtt-19-khan','khan-18','2026-01-02','  Graduação concedida antes da transferência  ']);
  let row=(await db.query('SELECT * FROM public.student_rank_promotions WHERE student_id=$1',[jump.id])).rows[0];
  assert.equal(row.from_rank_code,'khan-15'); assert.equal(row.from_rank_date,null); assert.equal(row.was_skip,true); assert.equal(row.reason,'Graduação concedida antes da transferência');
  await denied(promote,[jump.id,'cbmtt-19-khan','khan-19','2026-01-01',null],'23514');
  await asUser(v);
  await denied(promote,[jump.id,'cbmtt-19-khan','khan-19','2026-01-03',null],'42501');
  assert.equal((await db.query('SELECT id FROM public.student_rank_promotions WHERE student_id=$1',[s.id])).rowCount,0);
  for(const uid of [us,missing]) { await asUser(uid); await denied(promote,[jump.id,'cbmtt-19-khan','khan-19','2026-01-03',null],'42501'); }
  await asUser(us);
  assert.equal((await db.query('SELECT id FROM public.student_rank_promotions WHERE student_id=$1',[s.id])).rowCount,3);
  assert.equal((await db.query('SELECT id FROM public.student_rank_promotions WHERE student_id=$1',[jump.id])).rowCount,0);
  assert.equal((await db.query('SELECT role FROM public.profiles WHERE user_id=$1',[us])).rows[0].role,'student');
  await denied("UPDATE public.student_rank_promotions SET reason='forged' WHERE student_id=$1",[s.id],'42501');
  await denied('DELETE FROM public.student_rank_promotions WHERE student_id=$1',[s.id],'42501');
  await db.query('RESET ROLE'); await db.query('SET LOCAL ROLE anon');
  await denied(promote,[jump.id,'cbmtt-19-khan','khan-19','2026-01-03',null],'42501');
  await db.query('RESET ROLE');
  // O enum recusa título esportivo como papel; usuário sem perfil já falhou na RPC.
  await denied("UPDATE public.profiles SET role='mestre' WHERE user_id=$1",[us],'22P02');
  await db.query('RESET ROLE');
  await db.query("CREATE FUNCTION pg_temp.fail_muay_promotion() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'forced failure'; END $$");
  await db.query('CREATE TRIGGER proof_muay_failure BEFORE INSERT ON public.student_rank_promotions FOR EACH ROW EXECUTE FUNCTION pg_temp.fail_muay_promotion()');
  await asUser(u);
  await denied(promote,[jump.id,'cbmtt-19-khan','khan-19','2026-01-03',null],'P0001');
  row=(await db.query('SELECT current_rank_code,current_rank_date::text rank_day FROM public.students WHERE id=$1',[jump.id])).rows[0];
  assert.deepEqual(row,{current_rank_code:'khan-18',rank_day:'2026-01-02'});
  assert.equal((await db.query('SELECT count(*)::int n FROM public.student_rank_promotions WHERE student_id=$1',[jump.id])).rows[0].n,1);
  console.log('PASS: 16→17→18→19 dourados; origem NULL/data real; salto/motivo; erros sem escrita; tenant/professor/self/papel inválido/anon; append-only; sem regras CBJ; falha de evento reverte ficha. Rollback.');
 } finally { await db.query('ROLLBACK'); await db.end(); }
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
