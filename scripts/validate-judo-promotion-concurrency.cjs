/** Corrida real da RPC #32/#33. Requer 035/036 instalada apenas no banco descartável local. */
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { Client } = require('pg');
const connectionString = process.env.CASCA_TEST_DATABASE_URL;
if (!connectionString) throw new Error('Defina CASCA_TEST_DATABASE_URL local.');
const target = new URL(connectionString);
if (!['localhost','127.0.0.1','[::1]'].includes(target.hostname) || !target.pathname.endsWith('_test')) throw new Error('Apenas loopback e banco _test.');
const admin=new Client({connectionString}), a=new Client({connectionString}), b=new Client({connectionString});
const [account,user,student]=Array.from({length:3},()=>randomUUID());
const muay=process.argv.includes('--muay-thai');
const modality=muay?'muay_thai':'judo', reference=muay?'cbmtt-19-khan':'cbj-2023';
const from=muay?'khan-16':'beginner',to=muay?'khan-17':'kyu-11';
async function userTransaction(db) { await db.query('BEGIN'); await db.query("SELECT set_config('request.jwt.claim.sub',$1,true)",[user]); await db.query('SET LOCAL ROLE authenticated'); }
async function main() {
 await Promise.all([admin.connect(),a.connect(),b.connect()]);
 let pending;
 try {
  await admin.query("INSERT INTO public.accounts(id,name,modality) VALUES ($1,'Concorrência promoções',$2)",[account,modality]);
  await admin.query('INSERT INTO auth.users(id) VALUES ($1)',[user]);
  await admin.query("INSERT INTO public.profiles(user_id,account_id,display_name,role) VALUES ($1,$2,'Professor corrida','professor')",[user,account]);
  await admin.query("INSERT INTO public.students(id,account_id,status,kind,full_name,birth_date,academy_start_date,current_belt_id,current_degree,graduation_reference_id,current_rank_code,current_rank_date) VALUES ($1,$2,'active','adult','Corrida promoções','2000-01-01','2026-01-01',NULL,NULL,$3,$4,NULL)",[student,account,reference,from]);
  await userTransaction(a); await userTransaction(b);
  const sql='SELECT public.promote_referenced_student($1,$2,$3,\'2026-01-01\',NULL)';
  await a.query(sql,[student,reference,to]);
  pending=b.query(sql,[student,reference,to]).then(()=>({ok:true}),error=>({ok:false,error}));
  let blocked=false;
  for(let i=0;i<100;i++) {
    const {rows:[r]}=await admin.query('SELECT $1::int = ANY(pg_blocking_pids($2::int)) AS blocked',[a.processID,b.processID]);
    if(r.blocked) {blocked=true;break;}
    await new Promise(resolve=>setTimeout(resolve,10));
  }
  assert.equal(blocked,true,'Segunda promoção aguarda o lock da primeira');
  await a.query('COMMIT');
  const result=await pending;
  assert.equal(result.ok,false); assert.equal(result.error.code,'23514');
  await b.query('ROLLBACK');
  const {rows:[r]}=await admin.query('SELECT current_rank_code,(SELECT count(*)::int FROM public.student_rank_promotions WHERE student_id=$1) n FROM public.students WHERE id=$1',[student]);
  assert.equal(r.current_rank_code,to); assert.equal(r.n,1);
  console.log('PASS: duas conexões reais; segunda RPC bloqueada pelo lock da ficha, reavalia após commit e recusa no-op; exatamente um evento e estado coerente. Fixtures removidas.');
 } finally {
  await Promise.all([a.query('ROLLBACK'),b.query('ROLLBACK')]);
  if(pending) await pending;
  await admin.query('DELETE FROM public.student_rank_promotions WHERE student_id=$1',[student]);
  await admin.query('DELETE FROM public.students WHERE id=$1',[student]);
  await admin.query('DELETE FROM public.profiles WHERE user_id=$1',[user]);
  await admin.query('DELETE FROM auth.users WHERE id=$1',[user]);
  await admin.query('DELETE FROM public.accounts WHERE id=$1',[account]);
  await Promise.all([admin.end(),a.end(),b.end()]);
 }
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
