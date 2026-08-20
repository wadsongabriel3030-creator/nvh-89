import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Mic, ChevronLeft, Search, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { fetchAllUsers, fetchMessages, sendMessage, markConversationRead, type ChatMessage } from '@/lib/chat';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface ChatUser {
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

function getInitials(name: string | null | undefined, email: string | null | undefined) {
  const n = name || email || '?';
  return n.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

function getAvatarColor(id: string) {
  const colors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-rose-500 to-pink-500',
    'from-amber-500 to-orange-500',
    'from-indigo-500 to-blue-600',
  ];
  return colors[id.charCodeAt(0) % colors.length];
}

function dayLabel(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return 'Hoy';
  if (isYesterday(d)) return 'Ayer';
  return format(d, 'd MMM yyyy', { locale: es });
}

function groupByDay(messages: ChatMessage[]) {
  const groups: { day: string; messages: ChatMessage[] }[] = [];
  for (const msg of messages) {
    const day = dayLabel(msg.created_at);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.messages.push(msg);
    else groups.push({ day, messages: [msg] });
  }
  return groups;
}

export function FloatingChat() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const realtimeRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Load users list
  useEffect(() => {
    if (!open || !user?.id) return;
    setLoadingUsers(true);
    fetchAllUsers()
      .then(data => setUsers(data.filter(u => u.user_id !== user.id)))
      .finally(() => setLoadingUsers(false));
  }, [open, user?.id]);

  // Load messages for current conversation
  const loadMessages = useCallback(async () => {
    if (!user?.id || !selectedUser) return;
    const msgs = await fetchMessages(user.id, selectedUser.user_id);
    setMessages(msgs);
    setChatError(null);
  }, [user?.id, selectedUser]);

  // Subscribe to realtime + poll as fallback
  useEffect(() => {
    if (!selectedUser || !user?.id) {
      setMessages([]);
      return;
    }

    // Initial load
    loadMessages();
    markConversationRead(user.id, selectedUser.user_id).catch(() => {});

    // Realtime subscription — listen for new messages sent TO me
    const channel = supabase
      .channel(`chat-${user.id}-${selectedUser.user_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          // Only process messages relevant to this conversation
          const isMyConv =
            (msg.sender_id === user.id && msg.recipient_id === selectedUser.user_id) ||
            (msg.sender_id === selectedUser.user_id && msg.recipient_id === user.id);
          if (isMyConv) {
            setMessages(prev => {
              // Avoid duplicates
              if (prev.find(m => m.id === msg.id)) return prev;
              return [...prev, msg].sort(
                (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              );
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Chat realtime connected');
        }
        if (status === 'CHANNEL_ERROR') {
          console.warn('⚠️ Chat realtime error — falling back to polling');
        }
      });

    realtimeRef.current = channel;

    // Polling fallback every 5s
    const pollId = setInterval(loadMessages, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollId);
    };
  }, [selectedUser, user?.id, loadMessages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !user?.id || !selectedUser || sending) return;
    const msgText = text.trim();
    setText('');
    setSending(true);
    setChatError(null);
    try {
      await sendMessage(user.id, selectedUser.user_id, profile.name, msgText);
      // Reload to confirm the message was saved
      await loadMessages();
    } catch (e: any) {
      const errorMsg = e?.message ?? 'Error al enviar mensaje';
      console.error('Send error:', errorMsg);
      setChatError(errorMsg);
      setText(msgText); // restore text
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const filteredUsers = users.filter(u =>
    (u.display_name ?? u.email ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const grouped = groupByDay(messages);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`
          fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl
          flex items-center justify-center transition-all duration-300
          bg-gradient-to-br from-violet-600 to-indigo-600
          hover:scale-110 hover:shadow-violet-500/40
          ${open ? 'rotate-90' : ''}
        `}
        title="Mensajes"
      >
        {open
          ? <X className="w-6 h-6 text-white" />
          : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[720px] max-w-[calc(100vw-3rem)] h-[480px] rounded-2xl shadow-2xl overflow-hidden flex animate-scale-in"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e40af 100%)',
            boxShadow: '0 25px 60px rgba(99,102,241,0.35)',
          }}
        >
          {/* ── LEFT: User list ── */}
          <div className="w-64 flex flex-col border-r border-white/10 flex-shrink-0">
            <div className="px-4 pt-4 pb-3">
              <h2 className="text-white font-bold text-lg mb-3">Messages</h2>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                <input
                  placeholder="Buscar..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/10 text-white text-xs placeholder:text-white/40 border-0 outline-none focus:bg-white/15 transition-colors"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingUsers ? (
                <p className="text-white/40 text-xs text-center py-8">Cargando usuarios...</p>
              ) : filteredUsers.length === 0 ? (
                <p className="text-white/40 text-xs text-center py-8 px-4">
                  {users.length === 0 ? 'No hay usuarios disponibles' : 'Sin resultados'}
                </p>
              ) : (
                filteredUsers.map(u => {
                  const isActive = selectedUser?.user_id === u.user_id;
                  const name = u.display_name ?? u.email ?? 'Usuario';
                  return (
                    <button
                      key={u.user_id}
                      onClick={() => setSelectedUser(u)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 ${
                        isActive
                          ? 'bg-white/20 border-l-2 border-violet-300'
                          : 'hover:bg-white/10 border-l-2 border-transparent'
                      }`}
                    >
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-white/20" />
                      ) : (
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(u.user_id)} flex items-center justify-center shrink-0 text-white text-xs font-bold ring-2 ring-white/20`}>
                          {getInitials(u.display_name, u.email)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{name}</p>
                        <p className="text-white/50 text-xs truncate">{u.email}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="px-4 py-3 border-t border-white/10">
              <button className="flex items-center gap-2 text-white/60 text-xs hover:text-white transition-colors">
                <UserPlus className="w-4 h-4" />
                Add Contact
              </button>
            </div>
          </div>

          {/* ── RIGHT: Conversation ── */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedUser ? (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/5">
                  <button onClick={() => setSelectedUser(null)} className="text-white/60 hover:text-white">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20" />
                  ) : (
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(selectedUser.user_id)} flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/20`}>
                      {getInitials(selectedUser.display_name, selectedUser.email)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                      {selectedUser.display_name ?? selectedUser.email}
                    </p>
                    <p className="text-white/50 text-xs truncate">{selectedUser.email}</p>
                  </div>
                </div>

                {/* Error banner */}
                {chatError && (
                  <div className="mx-3 mt-2 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center gap-2 text-xs text-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{chatError}</span>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                  {grouped.length === 0 && (
                    <p className="text-white/30 text-xs text-center pt-10">Inicia la conversación 👋</p>
                  )}
                  {grouped.map(group => (
                    <div key={group.day}>
                      <div className="flex items-center gap-2 my-3">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-white/40 text-xs">{group.day}</span>
                        <div className="flex-1 h-px bg-white/10" />
                      </div>
                      <div className="space-y-2">
                        {group.messages.map(msg => {
                          const isMe = msg.sender_id === user?.id;
                          return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              {!isMe && (
                                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getAvatarColor(msg.sender_id)} flex items-center justify-center text-white text-[9px] font-bold mr-2 mt-1 shrink-0`}>
                                  {msg.sender_name?.[0]?.toUpperCase() ?? '?'}
                                </div>
                              )}
                              <div
                                className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-sm leading-snug ${
                                  isMe
                                    ? 'bg-violet-500/80 text-white rounded-br-sm'
                                    : 'bg-white/15 text-white rounded-bl-sm'
                                }`}
                              >
                                {!isMe && (
                                  <p className="text-[10px] text-white/60 mb-0.5 font-medium">{msg.sender_name}</p>
                                )}
                                <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                <p className={`text-[10px] mt-1 ${isMe ? 'text-violet-200/70 text-right' : 'text-white/40'}`}>
                                  {format(new Date(msg.created_at), 'HH:mm')}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="flex items-center gap-2 px-4 py-3 border-t border-white/10 bg-white/5">
                  <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Escribe un mensaje..."
                    disabled={sending}
                    className="flex-1 bg-white/10 text-white text-sm rounded-xl px-4 py-2 placeholder:text-white/40 outline-none border-0 focus:bg-white/15 transition-colors disabled:opacity-50"
                  />
                  <button className="text-white/50 hover:text-white transition-colors p-1.5">
                    <Mic className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!text.trim() || sending}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white text-sm font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    {sending ? '...' : 'Send'}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-white/40" />
                </div>
                <p className="text-white font-semibold text-lg mb-1">Tus Mensajes</p>
                <p className="text-white/50 text-sm">Selecciona un usuario para iniciar una conversación</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
