import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { avatarForDb, fileToPngDataUrl } from '@/lib/profileStorage';

export interface ProfileData {
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
  church: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
}

const DEFAULT_PROFILE: ProfileData = {
  name: 'Apóstol Silvio',
  role: 'Administrador',
  email: 'silvio@nuevoshechos.com',
  phone: '+502 5202-3805',
  avatar:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
  church: {
    name: 'Nuevos Hechos',
    phone: '+502 5202-3805',
    email: 'contacto@nuevoshechos.com',
    address: 'Guatemala, Guatemala',
  },
};

const STORAGE_KEY = 'nh-profile';

type ProfileExtras = Pick<ProfileData, 'role' | 'church'>;

interface ProfileContextValue {
  profile: ProfileData;
  updateProfile: (patch: Partial<ProfileData>) => void;
  updateChurch: (patch: Partial<ProfileData['church']>) => void;
  setAvatar: (url: string) => void;
  uploadAvatar: (file: File) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

function extrasKey(userId: string) {
  return `profile-extras:${userId}`;
}

function readLocalProfile(): ProfileData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<ProfileData>;
    if (parsed.avatar?.startsWith('data:')) {
      parsed.avatar = DEFAULT_PROFILE.avatar;
    }
    return { ...DEFAULT_PROFILE, ...parsed, church: { ...DEFAULT_PROFILE.church, ...parsed.church } };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function writeLocalProfile(profile: ProfileData) {
  try {
    const toStore = {
      ...profile,
      avatar: profile.avatar.startsWith('data:') ? DEFAULT_PROFILE.avatar : profile.avatar,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // ignore quota errors
  }
}

function mapDbToProfile(
  row: {
    display_name: string | null;
    email: string | null;
    phone: string | null;
    avatar_url: string | null;
  } | null,
  extras: ProfileExtras | null,
  user: User | null
): ProfileData {
  const base = readLocalProfile();

  if (row) {
    base.name = row.display_name ?? base.name;
    base.email = row.email ?? base.email;
    base.phone = row.phone ?? base.phone;
    if (row.avatar_url) base.avatar = row.avatar_url;
  } else if (user) {
    base.name =
      (user.user_metadata?.display_name as string | undefined) ??
      user.email?.split('@')[0] ??
      base.name;
    base.email = user.email ?? base.email;
  }

  if (extras?.role) base.role = extras.role;
  if (extras?.church) base.church = { ...base.church, ...extras.church };

  return base;
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileData>(readLocalProfile);
  const hydratedRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    let active = true;
    hydratedRef.current = false;

    if (!user) {
      setProfile(readLocalProfile());
      hydratedRef.current = true;
      userIdRef.current = null;
      return;
    }

    userIdRef.current = user.id;

    (async () => {
      const [{ data: row, error: profileError }, { data: extrasRow, error: extrasError }] =
        await Promise.all([
          supabase
            .from('profiles')
            .select('display_name, email, phone, avatar_url')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('app_storage')
            .select('value')
            .eq('key', extrasKey(user.id))
            .maybeSingle(),
        ]);

      if (!active) return;

      if (profileError) console.error('Error loading profile:', profileError.message);
      if (extrasError) console.error('Error loading profile extras:', extrasError.message);

      const extras = (extrasRow?.value as ProfileExtras | null) ?? null;
      setProfile(mapDbToProfile(row, extras, user));
      hydratedRef.current = true;
    })();

    return () => {
      active = false;
    };
  }, [user, authLoading]);

  useEffect(() => {
    writeLocalProfile(profile);
    const userId = userIdRef.current;
    if (!hydratedRef.current || !userId) return;

    const avatarUrl = avatarForDb(profile.avatar);
    const extras: ProfileExtras = { role: profile.role, church: profile.church };

    (async () => {
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          user_id: userId,
          display_name: profile.name,
          email: profile.email,
          phone: profile.phone,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
      if (profileError) console.error('Error saving profile:', profileError.message);

      const { error: extrasError } = await supabase.from('app_storage').upsert(
        {
          key: extrasKey(userId),
          value: extras as never,
          category: 'profile',
          created_by: userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );
      if (extrasError) console.error('Error saving profile extras:', extrasError.message);
    })();
  }, [profile]);

  const updateProfile = (patch: Partial<ProfileData>) =>
    setProfile((p) => ({ ...p, ...patch }));

  const updateChurch = (patch: Partial<ProfileData['church']>) =>
    setProfile((p) => ({ ...p, church: { ...p.church, ...patch } }));

  const setAvatar = (url: string) => setProfile((p) => ({ ...p, avatar: url }));

  const uploadAvatar = async (file: File) => {
    if (!user) throw new Error('Debe iniciar sesión para cambiar la foto de perfil');

    const pngDataUrl = await fileToPngDataUrl(file);

    const { error } = await supabase.from('profiles').upsert(
      {
        user_id: user.id,
        avatar_url: pngDataUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
    if (error) throw error;

    setProfile((p) => ({ ...p, avatar: pngDataUrl }));
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, updateChurch, setAvatar, uploadAvatar }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
