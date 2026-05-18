import { createClient } from '@/utils/supabase/client'

/**
 * Fetches the currently active academic year.
 * Returns null if the academic_years table doesn't exist yet (graceful fallback).
 */
export async function getActiveAcademicYear() {
  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from('academic_years')
      .select('*')
      .eq('status', 'Active')
      .limit(1)
      .single()
    
    if (error) return null
    return data
  } catch {
    return null
  }
}

/**
 * Fetches all academic years ordered by creation date.
 * Returns empty array if the table doesn't exist.
 */
export async function getAllAcademicYears() {
  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from('academic_years')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) return []
    return data || []
  } catch {
    return []
  }
}

/**
 * Fetches students for a specific academic year, joined with their profile data.
 * Falls back to returning all students from the students table directly if the
 * student_academic_records table doesn't exist.
 */
export async function getStudentsForYear(academicYearId: string | null, filters?: { class?: string; status?: string }) {
  const supabase = createClient()
  
  if (!academicYearId) {
    // Fallback: no academic year system yet, return all students
    let query = supabase.from('students').select('*').order('name')
    if (filters?.class) query = query.eq('class', filters.class)
    const { data } = await query
    return data || []
  }

  try {
    let query = supabase
      .from('student_academic_records')
      .select('*, students(*), academic_years(year_name)')
      .eq('academic_year_id', academicYearId)
    
    if (filters?.class) query = query.eq('class_name', filters.class)
    if (filters?.status) query = query.eq('student_status', filters.status)
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      // Fallback to old students table
      let fallbackQuery = supabase.from('students').select('*').order('name')
      if (filters?.class) fallbackQuery = fallbackQuery.eq('class', filters.class)
      const { data: fallbackData } = await fallbackQuery
      return fallbackData || []
    }

    // Merge student profile data with academic record data for backward compatibility
    return (data || []).map(record => ({
      ...record.students,
      // Override with academic-year-specific values
      class: record.class_name,
      payment_plan: record.payment_plan,
      monthly_fee: record.monthly_fee,
      total_year_fee: record.full_year_fee,
      join_date: record.join_date,
      // Keep archive-specific fields
      student_status: record.student_status,
      academic_year_id: record.academic_year_id,
      academic_record_id: record.id,
      batch_name: record.batch_name,
      year_name: record.academic_years?.year_name
    }))
  } catch {
    let fallbackQuery = supabase.from('students').select('*').order('name')
    if (filters?.class) fallbackQuery = fallbackQuery.eq('class', filters.class)
    const { data } = await fallbackQuery
    return data || []
  }
}

/**
 * Creates a student with an academic record for the active year.
 * Falls back to just inserting into students table if academic_years doesn't exist.
 */
export async function createStudentWithRecord(
  studentData: Record<string, any>,
  academicYearId: string | null
) {
  const supabase = createClient()
  
  // Always insert the student profile first
  const { data: student, error: studentError } = await supabase
    .from('students')
    .insert([studentData])
    .select()
    .single()
  
  if (studentError) return { error: studentError }
  
  // If we have an academic year, also create an academic record
  if (academicYearId && student) {
    await supabase.from('student_academic_records').insert([{
      student_id: student.id,
      academic_year_id: academicYearId,
      class_name: studentData.class,
      join_date: studentData.join_date,
      payment_plan: studentData.payment_plan || 'Monthly',
      monthly_fee: studentData.monthly_fee || 0,
      full_year_fee: studentData.total_year_fee || 0,
      student_status: 'Active'
    }])
  }
  
  return { data: student, error: null }
}

/**
 * Promotes selected students to a new class in a new academic year.
 */
export async function promoteStudents(
  studentIds: string[],
  targetAcademicYearId: string,
  targetClassName: string,
  options?: { payment_plan?: string; monthly_fee?: number; full_year_fee?: number }
) {
  const supabase = createClient()
  
  const records = studentIds.map(studentId => ({
    student_id: studentId,
    academic_year_id: targetAcademicYearId,
    class_name: targetClassName,
    join_date: new Date().toISOString().split('T')[0],
    payment_plan: options?.payment_plan || 'Monthly',
    monthly_fee: options?.monthly_fee || 0,
    full_year_fee: options?.full_year_fee || 0,
    student_status: 'Active' as const
  }))

  const { error } = await supabase
    .from('student_academic_records')
    .upsert(records, { onConflict: 'student_id,academic_year_id' })

  // Also update the main students table with the new class
  if (!error) {
    for (const id of studentIds) {
      await supabase.from('students').update({ class: targetClassName }).eq('id', id)
    }
  }

  return { error }
}

/**
 * Archives an academic year: sets its status to 'Archived' and marks all
 * student_academic_records for that year as 'Archived'.
 */
export async function archiveAcademicYear(yearId: string) {
  const supabase = createClient()
  
  const { error: yearError } = await supabase
    .from('academic_years')
    .update({ status: 'Archived' })
    .eq('id', yearId)

  if (yearError) return { error: yearError }

  const { error: recordsError } = await supabase
    .from('student_academic_records')
    .update({ student_status: 'Archived' })
    .eq('academic_year_id', yearId)
    .eq('student_status', 'Active')

  return { error: recordsError }
}
