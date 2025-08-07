'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return profile
}
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
export async function updateNotificationSettings(data: any) {
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update(data).eq('id', (await supabase.auth.getUser()).data.user?.id!)

  if (error) {
    console.error('Error updating notification settings:', error)
    throw new Error('Error updating notification settings')
  }

  revalidatePath('/dashboard/settings')
}

export async function updatePassword(data: any) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser(data)

  if (error) {
    console.error('Error updating password:', error)
    throw new Error('Error updating password')
  }

  revalidatePath('/dashboard/settings')
}

export async function updateProfile(data: any) {
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update(data).eq('id', (await supabase.auth.getUser()).data.user?.id!)

  if (error) {
    console.error('Error updating profile:', error)
    throw new Error('Error updating profile')
  }

  revalidatePath('/dashboard/settings')
}