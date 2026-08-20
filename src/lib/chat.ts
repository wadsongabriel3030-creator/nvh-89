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

/** Fetch all system users — falls back to leaders_list if profiles empty */
export async function fetchAllUsers(): Promise<{
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
}[]> {
  const { data: profileData, error } = await supabase
    .from('profiles')
    .select('user_id, display_name, email, avatar_url')
    .order('display_name');

  if (error) console.error('fetchAllUsers error:', error.message);

  // If profiles table is empty or returns nothing, try leaders_list as fallback
  if (!profileData || profileData.length === 0) {
    const { data: leaders } = await supabase
      .from('leaders_list')
      .select('id, name, email')
      .order('name');

    return (leaders ?? []).map(l => ({
      user_id: l.id,
      display_name: l.name,
      email: l.email,
      avatar_url: null,
    }));
  }

  return profileData;
}
