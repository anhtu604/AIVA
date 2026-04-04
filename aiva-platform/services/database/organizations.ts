'use server';

import { createClient } from '@supabase/supabase-js';

// Lazy-init để tránh crash khi build (env vars chưa sẵn sàng)
let _supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
    if (!_supabase) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        _supabase = createClient(url, key);
    }
    return _supabase;
}

export async function getOrganizations() {
    const { data, error } = await getSupabase()
        .from('organizations')
        .select('id, name, level')
        .in('level', ['OPC', 'CSYT', 'CBO'])
        .order('name');
    
    if (error) {
        console.error("Error fetching organizations:", error);
        return [];
    }

    return data || [];
}
