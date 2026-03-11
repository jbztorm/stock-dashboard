// Supabase 客户端 - 延迟初始化
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;
let _adminClient: SupabaseClient | null = null;

function createRealClient() {
  const { createClient } = require('@supabase/supabase-js');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseAnonKey);
}

function createAdminClient() {
  const { createClient } = require('@supabase/supabase-js');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
  return createClient(supabaseUrl, serviceKey);
}

// 演示模式的 mock
const mockClient: any = {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => ({ select: () => Promise.resolve({ data: [{}], error: null }) }),
    update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
    delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
    upsert: () => Promise.resolve({ data: null, error: null }),
  }),
};

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (url.startsWith('https://') && key.length > 10) {
      _client = createRealClient();
    } else {
      console.log('[Supabase] Running in demo mode - no database configured');
      _client = mockClient as any;
    }
  }
  return _client!;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (url.startsWith('https://') && key.length > 10) {
      _adminClient = createAdminClient();
    } else {
      _adminClient = mockClient as any;
    }
  }
  return _adminClient!;
}

export const supabase: any = new Proxy({}, {
  get(_, prop: string) {
    return (...args: any[]) => (getSupabase() as any)[prop](...args);
  }
});

export const supabaseAdmin: any = new Proxy({}, {
  get(_, prop: string) {
    return (...args: any[]) => (getSupabaseAdmin() as any)[prop](...args);
  }
});

export const isDemoMode = !(
  process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') &&
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length ?? 0) > 10
);
