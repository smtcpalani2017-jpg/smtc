import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

export function createClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith('http')) {
    // Return a dummy client that won't crash but shows errors
    const dummyResponse = { data: null, error: { message: 'Supabase not configured' } }
    const chainable: any = () => chainable
    Object.assign(chainable, {
      select: () => chainable, eq: () => chainable, neq: () => chainable,
      gte: () => chainable, lte: () => chainable, single: () => Promise.resolve(dummyResponse),
      insert: () => Promise.resolve(dummyResponse), update: () => Promise.resolve(dummyResponse),
      delete: () => chainable, order: () => chainable, limit: () => chainable,
      then: (resolve: any) => resolve(dummyResponse),
    })

    return {
      from: () => chainable,
      auth: {
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Please set up Supabase keys in .env.local' } }),
        signOut: async () => ({ error: null }),
        admin: null,
      },
      channel: () => ({
        on: function() { return this },
        subscribe: () => ({ unsubscribe: () => {} }),
      }),
      removeChannel: () => {},
    } as any
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
