/** #29: validação somente em Postgres local descartável; fixtures sempre em rollback. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { Client } = require('pg');
const connectionString = process.env.CASCA_TEST_DATABASE_URL;
if (!connectionString) throw new Error('Defina CASCA_TEST_DATABASE_URL de teste local.');
const target = new URL(connectionString);
if (!['localhost','127.0.0.1','[::1]'].includes(target.hostname) || !target.pathname.endsWith('_test')) throw new Error('Apenas loopback e banco terminado em _test.');
const db = new Client({connectionString});
async function denied(sql, args, code='23514') {
  await db.query('SAVEPOINT invalid_input');
  try { await assert.rejects(db.query(sql,args), e=>e.code===code); }
  finally { await db.query('ROLLBACK TO SAVEPOINT invalid_input'); }
}
async function asUser(user) {
  await db.query('RESET ROLE');
  await db.query("SELECT set_config('request.jwt.claim.sub',$1,true)",[user]);
  await db.query('SET LOCAL ROLE authenticated');
}
async function main() {
 await db.connect();
 try {
  await db.query('BEGIN');
  const legacyAccount=randomUUID();
  await db.query("INSERT INTO public.accounts(id,name) VALUES ($1,'Legado anterior à032')",[legacyAccount]);
  const {rows:[legacyStudent]}=await db.query("INSERT INTO public.students(account_id,kind,full_name,current_belt_id,current_degree,status,birth_date,academy_start_date) SELECT $1,'adult','JJ anterior à032',id,2,'active','2000-01-01','2024-02-03' FROM public.belts WHERE slug='blue' RETURNING id",[legacyAccount]);
  await db.query("INSERT INTO public.student_graduations(student_id,resulting_belt_id,resulting_degree,graduated_at,weight_kg) SELECT id,current_belt_id,current_degree,'2025-04-05T12:00:00Z',81.2 FROM public.students WHERE id=$1",[legacyStudent.id]);
  const {rows:[legacyPlan]}=await db.query("INSERT INTO public.plans(account_id,kind,name,price_cents) VALUES ($1,'adult','Preço anterior',19876) RETURNING id",[legacyAccount]);
  await db.query("INSERT INTO public.student_plans(student_id,plan_id,due_day,started_at,custom_price_cents) VALUES ($1,$2,12,'2025-04-01',18765)",[legacyStudent.id,legacyPlan.id]);
  await db.query("INSERT INTO public.payments(student_id,reference_month,amount_cents,status,paid_at) VALUES ($1,'2025-04-01',18765,'paid','2025-04-12T12:00:00Z')",[legacyStudent.id]);
  await db.query(`INSERT INTO public.generated_documents(account_id,student_id,type,status,payload_json,pdf_path) VALUES ($1,$2,'certificate','ready','{"title":"Emitido antes de032","belt":"Azul"}','test/previous.pdf')`,[legacyAccount,legacyStudent.id]);
  const tables=['accounts','belts','students','student_graduations','plans','student_plans','payments','generated_documents'];
  async function snapshot() {
    const result={};
    for (const table of tables) {
      const expression=table==='students' ? "to_jsonb(t) - 'weight_kg'" : 'to_jsonb(t)';
      result[table]=(await db.query(`SELECT ${expression} AS value FROM public.${table} t ORDER BY id`)).rows;
    }
    return result;
  }
  const before=await snapshot();
  if (process.argv.includes('--apply-migration')) {
   const sql=fs.readFileSync(path.join(__dirname,'../db/migrations/032_boxing_students_without_graduation.sql'),'utf8').replace(/^BEGIN;\s*$/m,'').replace(/^COMMIT;\s*$/m,'');
   await db.query(sql); await db.query(sql);
   assert.deepEqual(await snapshot(),before,"032 deve preservar dados anteriores em todas as tabelas operacionais");
  }
  const [a,b,ua,ub,us,legacy] = Array.from({length:6},()=>randomUUID());
  await db.query('INSERT INTO auth.users(id) SELECT unnest($1::uuid[])',[[ua,ub,us]]);
  await db.query("INSERT INTO public.accounts(id,name,modality) VALUES ($1,'Boxe validação A','boxing'),($2,'Boxe validação B','boxing'),($3,'JJ preservado','jiu_jitsu')",[a,b,legacy]);
  await db.query("INSERT INTO public.profiles(user_id,account_id,display_name,role) VALUES ($1,$2,'Professor teste A','professor'),($3,$4,'Professor teste B','professor'),($5,$2,'Aluno teste','student')",[ua,a,ub,b,us]);
  const {rows:[belt]}=await db.query("SELECT id FROM public.belts WHERE slug='blue'");
  assert.ok(belt,'Fixture precisa de faixa azul existente');
  const {rows:[jj]}=await db.query("INSERT INTO public.students(account_id,kind,full_name,current_belt_id,current_degree,status,birth_date,academy_start_date) VALUES ($1,'adult','JJ preservado',$2,2,'active','2000-01-01','2024-02-03') RETURNING id,current_belt_id,current_degree",[legacy,belt.id]);
  await denied("INSERT INTO public.students(account_id,kind,full_name,status) VALUES ($1,'adult','JJ inválido','active')",[legacy]);
  const {rows:[plan]}=await db.query("INSERT INTO public.plans(account_id,kind,name,price_cents) VALUES ($1,'adult','Adulto personalizado',19876) RETURNING id",[a]);
  const {rows:[kids]}=await db.query("INSERT INTO public.plans(account_id,kind,name,price_cents) VALUES ($1,'kids_1','Kids',10000) RETURNING id",[a]);
  await asUser(ua);
  const {rows:[student]}=await db.query(`INSERT INTO public.students(account_id,kind,full_name,current_belt_id,current_degree,status,birth_date,academy_start_date,user_id)
    VALUES ($1,'adult','Aluna Boxe',NULL,NULL,'active',((now() AT TIME ZONE 'America/Sao_Paulo')::date - interval '18 years')::date,'2026-10-22',$2) RETURNING id,current_belt_id,current_degree`,[a,us]);
  assert.equal(student.current_belt_id,null); assert.equal(student.current_degree,null);
  await denied("UPDATE public.students SET birth_date=((now() AT TIME ZONE 'America/Sao_Paulo')::date - interval '18 years' + interval '1 day')::date WHERE id=$1",[student.id]);
  await denied("UPDATE public.students SET kind='kids' WHERE id=$1",[student.id]);
  await denied("UPDATE public.students SET birth_date=NULL WHERE id=$1",[student.id]);
  await denied("UPDATE public.students SET current_degree=0 WHERE id=$1",[student.id]);
  await denied("UPDATE public.students SET current_belt_id=$2,current_degree=0 WHERE id=$1",[student.id,belt.id]);
  await denied("INSERT INTO public.student_graduations(student_id,resulting_belt_id,resulting_degree,graduated_at) VALUES ($1,$2,0,now())",[student.id,belt.id]);
  await db.query("UPDATE public.students SET full_name='Aluna Boxe editada',weight_kg=72.5 WHERE id=$1",[student.id]);
  const {rows:[link]}=await db.query("INSERT INTO public.student_plans(student_id,plan_id,due_day,started_at,custom_price_cents) VALUES ($1,$2,12,'2026-10-01',18765) RETURNING id",[student.id,plan.id]);
  await denied("INSERT INTO public.student_plans(student_id,plan_id,due_day,started_at) VALUES ($1,$2,12,'2026-10-01')",[student.id,plan.id],'23505');
  await db.query("UPDATE public.student_plans SET ended_at='2026-10-22' WHERE id=$1",[link.id]);
  await denied("INSERT INTO public.student_plans(student_id,plan_id,due_day,started_at) VALUES ($1,$2,12,'2026-10-22')",[student.id,kids.id]);
  await db.query("INSERT INTO public.student_plans(student_id,plan_id,due_day,started_at,custom_price_cents) VALUES ($1,$2,20,'2026-10-22',18765)",[student.id,plan.id]);
  const {rows:wallet}=await db.query(`SELECT s.full_name,s.current_belt_id,s.current_degree,s.weight_kg,sp.due_day,coalesce(sp.custom_price_cents,p.price_cents) price FROM public.students s JOIN public.student_plans sp ON sp.student_id=s.id AND sp.ended_at IS NULL JOIN public.plans p ON p.id=sp.plan_id WHERE s.id=$1 AND s.status='active' AND s.archived_at IS NULL AND s.removed_at IS NULL AND NOT s.is_exempt`,[student.id]);
  assert.deepEqual(wallet,[{full_name:'Aluna Boxe editada',current_belt_id:null,current_degree:null,weight_kg:'72.5',due_day:20,price:'18765'}]);
  await db.query("INSERT INTO public.payments(student_id,reference_month,amount_cents,status,paid_at) VALUES ($1,'2026-10-01',18765,'paid',now())",[student.id]);
  await db.query("INSERT INTO public.payments(student_id,reference_month,amount_cents,status) VALUES ($1,'2026-11-01',0,'scholarship')",[student.id]);
  assert.equal((await db.query("SELECT status FROM public.payments WHERE student_id=$1 AND reference_month='2026-11-01'",[student.id])).rows[0].status,'scholarship');
  await db.query("UPDATE public.students SET is_exempt=true WHERE id=$1",[student.id]);
  assert.equal((await db.query('SELECT is_exempt FROM public.students WHERE id=$1',[student.id])).rows[0].is_exempt,true);
  await db.query("UPDATE public.students SET is_exempt=false,status='paused' WHERE id=$1",[student.id]);
  assert.equal((await db.query("SELECT count(*)::int n FROM public.students WHERE id=$1 AND status='active' AND NOT is_exempt",[student.id])).rows[0].n,0);
  assert.equal((await db.query('SELECT count(*)::int n FROM public.student_plans WHERE student_id=$1',[student.id])).rows[0].n,2);
  await asUser(ub);
  assert.equal((await db.query('SELECT id FROM public.students WHERE id=$1',[student.id])).rowCount,0);
  assert.equal((await db.query("UPDATE public.students SET full_name='Indevido' WHERE id=$1 RETURNING id",[student.id])).rowCount,0);
  assert.equal((await db.query('SELECT id FROM public.student_plans WHERE student_id=$1',[student.id])).rowCount,0);
  assert.equal((await db.query('SELECT id FROM public.payments WHERE student_id=$1',[student.id])).rowCount,0);
  await denied("INSERT INTO public.student_graduations(student_id,resulting_belt_id,resulting_degree,graduated_at) VALUES ($1,$2,0,now())",[student.id,belt.id],'42501');
  await asUser(us);
  await denied('UPDATE public.students SET weight_kg=90 WHERE id=$1',[student.id],'42501');
  await db.query('RESET ROLE');
  assert.deepEqual((await db.query('SELECT id,current_belt_id,current_degree FROM public.students WHERE id=$1',[jj.id])).rows[0],jj);
  assert.equal((await db.query('SELECT count(*)::int n FROM public.student_graduations WHERE student_id=$1',[student.id])).rows[0].n,0);
  console.log('PASS: Boxe sem graduação;18 hoje/amanhã SP;edições/peso;graduação forjada recusada;plano Adulto único/histórico/preço/vencimento/Isento;carteira/pagamento;RLS entre tenants reais e aluno;JJ preservado. Fixtures rollback.');
 } finally {await db.query('ROLLBACK');await db.end();}
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
