import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { notifyMemberProgressUpdated } from '@/lib/memberProgressEvents';
import { toast } from 'sonner';

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
      try {
        const { data, error } = await supabase
          .from('app_storage')
          .select('value')
          .eq('key', key)
          .maybeSingle();
        if (!active) return;
        if (error) {
          console.error(`[useDbStorage] Error loading key "${key}":`, error.message);
        }
        if (!error && data && data.value !== null && data.value !== undefined) {
          setValueState(data.value as T);
        }
      } catch (err) {
        console.error(`[useDbStorage] Exception loading key "${key}":`, err);
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
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id ?? null;

        // Try upsert first
        const { error } = await supabase.from('app_storage').upsert(
          {
            key,
            value: next as never,
            category,
            created_by: userId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );

        if (error) {
          console.error(`[useDbStorage] Error persisting key "${key}":`, error.message, error.details, error.hint);

          // If upsert failed, try delete + insert (handles some RLS edge cases)
          await supabase.from('app_storage').delete().eq('key', key);
          const { error: insertError } = await supabase.from('app_storage').insert({
            key,
            value: next as never,
            category,
            created_by: userId,
            updated_at: new Date().toISOString(),
          });
          if (insertError) {
            console.error(`[useDbStorage] Fallback insert also failed for key "${key}":`, insertError.message);
            toast.error('Error al guardar datos. Verifique su conexión.');
          }
        }

        notifyMemberProgressUpdated();
      } catch (err) {
        console.error(`[useDbStorage] Exception persisting key "${key}":`, err);
        toast.error('Error al guardar datos. Verifique su conexión.');
      }
    },
    [key, category]
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValueState((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        // Persiste em background
        void persist(resolved);
        return resolved;
      });
    },
    [persist]
  );

  return { value, setValue, loading };
}
