/**
 * Notification system using app_storage table
 * Key pattern: notifications:{userId}
 */
import { supabase } from '@/integrations/supabase/client';

export interface AppNotification {
  id: string;
  type: 'seguimiento';
  message: string;
  memberId: string;
  memberName: string;
  from: string;
  createdAt: string;
  read: boolean;
  link: string;
}

function storageKey(userId: string) {
  return `notifications:${userId}`;
}

/** Fetch notifications for a user */
export async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  const { data } = await supabase
    .from('app_storage')
    .select('value')
    .eq('key', storageKey(userId))
    .maybeSingle();

  if (!data?.value) return [];
  return (data.value as AppNotification[]).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** Save a notification for a target user */
export async function sendNotification(
  targetUserId: string,
  notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'>
) {
  const key = storageKey(targetUserId);

  // Get existing notifications
  const { data: existing } = await supabase
    .from('app_storage')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  const current: AppNotification[] = (existing?.value as AppNotification[]) ?? [];

  const newNotif: AppNotification = {
    ...notification,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    read: false,
    createdAt: new Date().toISOString(),
  };

  const updated = [newNotif, ...current].slice(0, 50); // max 50

  await supabase.from('app_storage').upsert(
    {
      key,
      value: updated as never,
      category: 'notifications',
      created_by: targetUserId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' }
  );
}

/** Mark all as read for a user */
export async function markAllRead(userId: string, notifications: AppNotification[]) {
  const updated = notifications.map(n => ({ ...n, read: true }));
  await supabase.from('app_storage').upsert(
    {
      key: storageKey(userId),
      value: updated as never,
      category: 'notifications',
      created_by: userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' }
  );
  return updated;
}

/** Mark one notification as read */
export async function markOneRead(userId: string, notifications: AppNotification[], notifId: string) {
  const updated = notifications.map(n => n.id === notifId ? { ...n, read: true } : n);
  await supabase.from('app_storage').upsert(
    {
      key: storageKey(userId),
      value: updated as never,
      category: 'notifications',
      created_by: userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' }
  );
  return updated;
}
