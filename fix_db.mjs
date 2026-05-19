import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
  console.log('Fetching 2026-2027 year...')
  let { data: year } = await supabase
    .from('academic_years')
    .select('id, year_name, status')
    .eq('year_name', '2026-2027')
    .single()

  if (year && year.status !== 'Active') {
    console.log('Updating year to Active...')
    const { data: updated } = await supabase
      .from('academic_years')
      .update({ status: 'Active' })
      .eq('id', year.id)
      .select()
      .single()
    year = updated
  } else if (!year) {
    const { data: inserted } = await supabase
      .from('academic_years')
      .insert([{ year_name: '2026-2027', status: 'Active' }])
      .select()
      .single()
    year = inserted
  }

  console.log('Active year is:', year.year_name, year.id)

  console.log('Fetching all students...')
  const { data: students } = await supabase.from('students').select('*')
  
  console.log('Fetching all academic records for the active year...')
  const { data: records } = await supabase
    .from('student_academic_records')
    .select('student_id')
    .eq('academic_year_id', year.id)
    
  const existingRecordStudentIds = new Set(records?.map(r => r.student_id) || [])
  
  const missingStudents = students.filter(s => !existingRecordStudentIds.has(s.id))
  
  if (missingStudents.length === 0) {
    console.log('All students are already in the active year!')
    return
  }
  
  console.log(`Found ${missingStudents.length} missing students. Backfilling...`)
  
  const payload = missingStudents.map(s => ({
    student_id: s.id,
    academic_year_id: year.id,
    class_name: s.class,
    join_date: s.join_date || new Date().toISOString(),
    payment_plan: s.payment_plan || 'Monthly',
    monthly_fee: s.monthly_fee || 0,
    full_year_fee: s.total_year_fee || 0,
    student_status: 'Active'
  }))
  
  const { error } = await supabase.from('student_academic_records').insert(payload)
  if (error) {
    console.error('Error backfilling:', error)
  } else {
    console.log('Successfully backfilled students!')
  }
}

run()
