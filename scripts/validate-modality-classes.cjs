/** #34: somente Postgres local descartável; operações públicas/RLS, sempre ROLLBACK. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { Client } = require('pg');
const connectionString = process.env.CASCA_TEST_DATABASE_URL;
if (!connectionString) throw new Error('Defina CASCA_TEST_DATABASE_URL local.');
const target = new URL(connectionString);
if (!['localhost', '127.0.0.1', '[::1]'].includes(target.hostname) || !target.pathname.endsWith('_test')) throw new Error('Apenas loopback e banco _test.');
const db = new Client({ connectionString });
async function asUser(uid) {
  await db.query('RESET ROLE');
  await db.query("SELECT set_config('request.jwt.claim.sub',$1,true)", [uid]);
  await db.query('SET LOCAL ROLE authenticated');
}
async function denied(sql, args, code = '23514') {
  await db.query('SAVEPOINT invalid');
  try { await assert.rejects(db.query(sql, args), e => e.code === code); }
  finally { await db.query('ROLLBACK TO SAVEPOINT invalid'); }
}
async function main() {
  await db.connect();
  try {
    await db.query('BEGIN');
    if (process.argv.includes('--apply-migration')) {
      const sql = fs.readFileSync(path.join(__dirname, '../db/migrations/037_modality_classes_portal.sql'), 'utf8').replace(/^BEGIN;\s*$/m, '').replace(/^COMMIT;\s*$/m, '');
      await db.query(sql); await db.query(sql);
    }
    const fixtures = [];
    for (const modality of ['jiu_jitsu', 'boxing', 'judo', 'muay_thai']) {
      await db.query('RESET ROLE');
      const [account, user, self, peer] = Array.from({ length: 4 }, () => randomUUID());
      await db.query("INSERT INTO public.accounts(id,name,modality) VALUES ($1,'Academia de validação',$2)", [account, modality]);
      await db.query('INSERT INTO auth.users(id) SELECT unnest($1::uuid[])', [[user,self,peer]]);
      const { rows: profiles } = await db.query("INSERT INTO public.profiles(user_id,account_id,display_name,role) VALUES ($1,$4,'Professor','professor'),($2,$4,'Aluno próprio','student'),($3,$4,'Colega','student') RETURNING id,user_id", [user,self,peer,account]);
      const professor = profiles.find(p => p.user_id === user);
      const selfProfile = profiles.find(p => p.user_id === self);
      const reference = modality === 'judo' ? 'cbj-2023' : modality === 'muay_thai' ? 'cbmtt-19-khan' : null;
      const code = modality === 'judo' ? 'dan-10' : modality === 'muay_thai' ? 'khan-19' : null;
      const { rows: students } = await db.query(`INSERT INTO public.students(account_id,full_name,kind,status,birth_date,academy_start_date,user_id,current_belt_id,current_degree,graduation_reference_id,current_rank_code,current_rank_date)
        SELECT $1,n,'adult','active','2000-01-01','2026-01-01',u,
          CASE WHEN $2='jiu_jitsu' THEN (SELECT id FROM public.belts WHERE slug='blue') END,
          CASE WHEN $2='jiu_jitsu' THEN 2 END,$3,$4,NULL
        FROM (VALUES ('Ficha própria',$5::uuid),('Outra ficha',$6::uuid)) AS x(n,u) RETURNING id,user_id`, [account,modality,reference,code,self,peer]);
      await asUser(user);
      const { rows: [classRow] } = await db.query("INSERT INTO public.classes(account_id,name,kind,modality,instructor_profile_id) VALUES ($1,'Noite','adult',$2,$3) RETURNING id,modality,kind", [account,modality,professor.id]);
      assert.equal(classRow.modality, modality); assert.equal(classRow.kind, 'adult');
      const { rows: [session] } = await db.query(`INSERT INTO public.class_sessions(account_id,class_id,session_date,start_time,end_time)
        SELECT $1,$2,t::date,t::time,(t+interval '30 minutes')::time
        FROM (SELECT date_trunc('hour',now() AT TIME ZONE 'America/Sao_Paulo')+interval '2 hours' t) x RETURNING id`, [account,classRow.id]);
      await db.query("INSERT INTO public.class_recurring_schedules(account_id,class_id,day_of_week,start_time,end_time) VALUES ($1,$2,1,'19:00','20:00')", [account,classRow.id]);
      for (const student of students) await db.query('INSERT INTO public.student_class_enrollments(account_id,class_id,student_id) VALUES ($1,$2,$3)', [account,classRow.id,student.id]);
      const own = students.find(s => s.user_id === self);
      const other = students.find(s => s.user_id === peer);
      fixtures.push({ account,user,self,peer,professor,selfProfile,classRow,session,own,other,modality });
      if (modality !== 'jiu_jitsu') {
        await denied("UPDATE public.classes SET kind='kids' WHERE id=$1", [classRow.id]);
        await denied("UPDATE public.classes SET modality='jiu_jitsu' WHERE id=$1", [classRow.id]);
      }
      await denied('UPDATE public.classes SET instructor_profile_id=$1 WHERE id=$2', [selfProfile.id,classRow.id]);
      await asUser(self);
      assert.equal((await db.query('SELECT id FROM public.students WHERE id=$1', [other.id])).rowCount, 0);
      const ownFields = (await db.query('SELECT current_belt_id,current_degree,current_rank_code,current_rank_date FROM public.students WHERE id=$1', [own.id])).rows[0];
      assert.equal(ownFields.current_rank_date, null); assert.equal(ownFields.current_rank_code, code);
      assert.equal(ownFields.current_degree, modality === 'jiu_jitsu' ? 2 : null);
      await db.query('INSERT INTO public.check_ins(account_id,class_session_id,student_id) VALUES ($1,$2,$3)', [account,session.id,own.id]);
      assert.equal((await db.query('SELECT id FROM public.attendances')).rowCount, 0, 'Check-in não vira presença');
      await denied('INSERT INTO public.check_ins(account_id,class_session_id,student_id) VALUES ($1,$2,$3)', [account,session.id,other.id], '42501');
      await denied("INSERT INTO public.attendances(account_id,class_session_id,student_id,recorded_by,origin) VALUES ($1,$2,$3,$4,'checkin_student')", [account,session.id,own.id,professor.id], '42501');
      await denied("INSERT INTO public.classes(account_id,name,kind,instructor_profile_id) VALUES ($1,'Forjada','adult',$2)", [account,professor.id], '42501');
      await denied('INSERT INTO public.student_class_enrollments(account_id,class_id,student_id) VALUES ($1,$2,$3)', [account,classRow.id,own.id], '42501');
      await asUser(user);
      await db.query("INSERT INTO public.attendances(account_id,class_session_id,student_id,recorded_by,origin) VALUES ($1,$2,$3,$4,'manual_instructor'),($1,$2,$5,$4,'checkin_student')", [account,session.id,other.id,professor.id,own.id]);
      assert.deepEqual((await db.query('SELECT origin FROM public.attendances WHERE class_session_id=$1 ORDER BY origin', [session.id])).rows.map(r => r.origin).sort(), ['checkin_student','manual_instructor']);
      await asUser(self);
      assert.equal((await db.query('SELECT id FROM public.class_sessions WHERE id=$1', [session.id])).rowCount, 1);
      assert.equal((await db.query('SELECT id FROM public.attendances')).rowCount, 1);
      assert.equal((await db.query('SELECT id FROM public.attendances WHERE student_id=$1', [other.id])).rowCount, 0);
      assert.equal((await db.query('SELECT id FROM public.check_ins')).rowCount, 1);
      assert.equal((await db.query("UPDATE public.classes SET name='Forjada' WHERE id=$1 RETURNING id", [classRow.id])).rowCount, 0);
      assert.equal((await db.query('DELETE FROM public.attendances WHERE student_id=$1 RETURNING id', [own.id])).rowCount, 0);
    }
    const [a,b] = fixtures;
    await asUser(a.user);
    for (const table of ['classes','class_sessions','student_class_enrollments','check_ins','attendances']) {
      assert.equal((await db.query(`SELECT id FROM public.${table} WHERE account_id=$1`, [b.account])).rowCount, 0);
    }
    await denied("INSERT INTO public.class_recurring_schedules(account_id,class_id,day_of_week,start_time,end_time) VALUES ($1,$2,2,'19:00','20:00')", [a.account,b.classRow.id]);
    await denied("INSERT INTO public.class_sessions(account_id,class_id,session_date,start_time,end_time) VALUES ($1,$2,'2026-10-23','19:00','20:00')", [a.account,b.classRow.id]);
    await denied('INSERT INTO public.student_class_enrollments(account_id,class_id,student_id) VALUES ($1,$2,$3)', [a.account,a.classRow.id,b.own.id]);
    await denied('INSERT INTO public.check_ins(account_id,class_session_id,student_id) VALUES ($1,$2,$3)', [a.account,b.session.id,a.own.id]);
    await denied("INSERT INTO public.attendances(account_id,class_session_id,student_id,recorded_by,origin) VALUES ($1,$2,$3,$4,'manual_instructor')", [a.account,b.session.id,a.own.id,a.professor.id]);
    await denied('UPDATE public.classes SET instructor_profile_id=$1 WHERE id=$2', [b.professor.id,a.classRow.id]);
    // Preservar JJ kids/baby: fichas kids podem frequentar turma Baby no contrato legado.
    await db.query('RESET ROLE');
    const { rows: [kid] } = await db.query(`INSERT INTO public.students(account_id,full_name,kind,status,birth_date,academy_start_date,current_belt_id,current_degree)
      SELECT $1,'JJ Baby','kids','active','2022-01-01','2026-01-01',id,0 FROM public.belts WHERE kind='kids' ORDER BY ordinal LIMIT 1 RETURNING id`, [a.account]);
    await asUser(a.user);
    for (const kind of ['kids','baby']) {
      const { rows: [legacyClass] } = await db.query("INSERT INTO public.classes(account_id,name,kind,instructor_profile_id) VALUES ($1,'JJ legado',$2,$3) RETURNING id,modality", [a.account,kind,a.professor.id]);
      assert.equal(legacyClass.modality, 'jiu_jitsu');
      await db.query('INSERT INTO public.student_class_enrollments(account_id,class_id,student_id) VALUES ($1,$2,$3)', [a.account,legacyClass.id,kid.id]);
    }
    await db.query('DELETE FROM public.attendances WHERE class_session_id=$1 AND student_id=$2', [a.session.id,a.own.id]);
    assert.equal((await db.query('SELECT id FROM public.check_ins WHERE class_session_id=$1 AND student_id=$2', [a.session.id,a.own.id])).rowCount, 1, 'Remover presença conserva check-in');
    console.log('PASS: quatro esportes; turma/aula/vínculo/check-in/presença manual e conversão separados; remoção conserva check-in; ficha/presença próprias; papéis e tenants reais; referências estrangeiras recusadas; JJ kids/Baby preservados. Rollback.');
  } finally { await db.query('ROLLBACK'); await db.end(); }
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
