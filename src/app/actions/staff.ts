'use server'

import { createClient } from '@supabase/supabase-js'

export async function addStaffAction(formData: { name: string, email: string, password: string }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // Create an admin client with the service role key
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // 1. Create the Auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
      user_metadata: { name: formData.name, role: 'staff' }
    })

    if (authError) throw authError

    // 2. Add/Update the users table
    const { error: dbError } = await supabaseAdmin.from('users').upsert({
      id: authData.user.id,
      name: formData.name,
      email: formData.email,
      role: formData.email === 'smtcpalani2017@gmail.com' ? 'admin' : 'staff'
    }, { onConflict: 'email' })

    if (dbError) throw dbError

    return { success: true }
  } catch (error: any) {
    console.error('Error adding staff:', error)
    return { success: false, error: error.message }
  }
}

export async function updateStaffAction(userId: string, formData: { name: string, email: string, password?: string }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    // 1. Update Auth User
    const updateData: any = {
      email: formData.email,
      user_metadata: { name: formData.name }
    }
    if (formData.password) updateData.password = formData.password

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, updateData)
    if (authError) throw authError

    // 2. Update DB User table
    const { error: dbError } = await supabaseAdmin.from('users').update({
      name: formData.name,
      email: formData.email
    }).eq('id', userId)

    if (dbError) throw dbError

    return { success: true }
  } catch (error: any) {
    console.error('Error updating staff:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteStaffAction(userId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    // 1. Delete Auth User (This is critical for cleaning up credentials)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (authError) {
      console.warn('Auth user deletion warning (e.g. seeded user):', authError.message)
    }

    // 2. Delete from DB Users table
    const { error: dbError } = await supabaseAdmin.from('users').delete().eq('id', userId)
    if (dbError) throw dbError

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting staff:', error)
    let friendlyError = error.message || 'Error deleting staff.'
    if (
      friendlyError.includes('violates foreign key constraint') && 
      (friendlyError.includes('classes_staff_id_fkey') || friendlyError.includes('classes'))
    ) {
      friendlyError = 'Cannot remove this staff member because they are currently assigned as a teacher to one or more classes. Please reassign their classes first.'
    }
    return { success: false, error: friendlyError }
  }
}
