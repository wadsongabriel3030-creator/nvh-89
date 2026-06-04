import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { notifyMemberProgressUpdated } from '@/lib/memberProgressEvents';

/**
 * Hook que substitui o uso de localStorage por persistência no banco (tabela app_storage).
 * Guarda qualquer valor JSON associado a uma `key` única.
 *
 * Uso:
 *   const { value, setValue, loading } = useDbStorage<MyType[]>('minha-chave', []);
 *   setValue(novoArray); // salva automaticamente no banco
 */
export function useDbStorage<T>(key: string, defaultValue: T, category = 'general') {
  const [value, setValueState] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_storage')
        .select('value')
        .eq('key', key)
        .maybeSingle();
      if (!active) return;
      if (!error && data && data.value !== null && data.value !== undefined) {
        setValueState(data.value as T);
      }
      loadedRef.current = true;
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [key]);

  const persist = useCallback(
    async (next: T) => {
      const { data: userData } = await supabase.auth.getUser();
      await supabase.from('app_storage').upsert(
        {
          key,
          value: next as never,
          category,
          created_by: userData.user?.id ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );
      notifyMemberProgressUpdated();
    },
    [key, category]
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValueState((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        // Persiste em background (fire-and-forget)
        void persist(resolved);
        return resolved;
      });
    },
    [persist]
  );

  return { value, setValue, loading };
}
