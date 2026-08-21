/**
 * Chat system using dedicated chat_messages table.
 * Uses two separate queries for sent/received to avoid .or() syntax issues.
 */
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  sender_name: string;
  message: string;
  read_at: string | null;
  created_at: string;
}

/** Fetch all messages between two users — two separate queries merged */
export async function fetchMessages(
  myId: string,
  otherId: string,
): Promise<ChatMessage[]> {
  const [sentRes, receivedRes] = await Promise.all([
    // Messages I sent to them
    supabase
      .from('chat_messages')
      .select('*')
      .eq('sender_id', myId)
      .eq('recipient_id', otherId)
      .order('created_at', { ascending: true })
      .limit(200),
    // Messages they sent to me
    supabase
      .from('chat_messages')
      .select('*')
      .eq('sender_id', otherId)
      .eq('recipient_id', myId)
      .order('created_at', { ascending: true })
      .limit(200),
  ]);

  if (sentRes.error) console.error('chat fetch sent error:', sentRes.error.message);
  if (receivedRes.error) console.error('chat fetch received error:', receivedRes.error.message);

  const sent     = (sentRes.data     ?? []) as ChatMessage[];
  const received = (receivedRes.data ?? []) as ChatMessage[];

  return [...sent, ...received].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

/** Send a message */
export async function sendMessage(
  senderId: string,
  recipientId: string,
  senderName: string,
  text: string,
): Promise<void> {
  const { error } = await supabase.from('chat_messages').insert({
    sender_id: senderId,
    recipient_id: recipientId,
    sender_name: senderName,
    message: text,
  });
  if (error) {
    console.error('chat send error:', error.message);
    throw new Error(error.message);
  }
}

/** Mark messages from otherId → myId as read */
export async function markConversationRead(myId: string, otherId: string): Promise<void> {
  await supabase
    .from('chat_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', myId)
    .eq('sender_id', otherId)
    .is('read_at', null);
}

/** Fetch all users with an account (created via Cuentas de usuario).
 *  Uses the chat_list_users() RPC which:
 *  - Only returns users that have a role in user_roles (real accounts)
 *  - Works for any authenticated user regardless of their role (admin, leader, server)
 *  - Excludes the calling user automatically
 */
export async function fetchAllUsers(): Promise<{
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
}[]> {
  const { data, error } = await supabase.rpc('chat_list_users');

  if (error) {
    console.error('fetchAllUsers (chat_list_users) error:', error.message);
    // Fallback: try profiles table directly (will only work for admin/pastor due to RLS)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, display_name, email, avatar_url')
      .order('display_name');
    if (profileError) console.error('fetchAllUsers fallback error:', profileError.message);
    return profileData ?? [];
  }

  return data ?? [];
}
