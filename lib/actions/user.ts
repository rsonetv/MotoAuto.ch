'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getUsers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
      id,
      full_name,
      role,
      is_verified,
      users:auth_users (
        email,
        created_at
      )
    `
    )

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  // The type from supabase is a bit complex, so we can simplify it here.
  // Also, the join is one-to-one, so we can flatten the structure.
  return data.map((profile) => ({
    ...profile,
    // @ts-ignore
    email: profile.users.email,
    // @ts-ignore
    created_at: profile.users.created_at,
    // @ts-ignore
    ...(!Array.isArray(profile.users) && { users: undefined }),
  }))
}

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user role:', error)
    throw new Error('Error updating user role')
  }

  revalidatePath('/admin/users')
}

export async function suspendUser(userId: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { status: 'suspended' },
  })

  if (error) {
    console.error('Error suspending user:', error)
    throw new Error('Error suspending user')
  }

  revalidatePath('/admin/users')
}

export async function verifyUserKyc(userId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_verified: true })
    .eq('id', userId)

  if (error) {
    console.error('Error verifying user KYC:', error)
    throw new Error('Error verifying user KYC')
  }

  revalidatePath('/admin/users')
}