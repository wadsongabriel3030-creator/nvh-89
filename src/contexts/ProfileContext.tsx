import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
const DB_KEY = 'admin-profile';

interface ProfileContextValue {
  profile: ProfileData;
  updateProfile: (patch: Partial<ProfileData>) => void;
  updateChurch: (patch: Partial<ProfileData['church']>) => void;
  setAvatar: (dataUrl: string) => void;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
    } catch {}
    return DEFAULT_PROFILE;
  });
  const hydratedRef = useRef(false);

  // Hydrate from Supabase on mount (source of truth across devices/restarts)
  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('app_storage')
        .select('value')
        .eq('key', DB_KEY)
        .maybeSingle();
      if (!active) return;
      if (!error && data?.value) {
        setProfile((prev) => ({ ...prev, ...(data.value as Partial<ProfileData>) }));
      }
      hydratedRef.current = true;
    })();
    return () => {
      active = false;
    };
  }, []);

  // Persist locally (fast) + to Supabase (durable) on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {}
    if (!hydratedRef.current) return;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      await supabase.from('app_storage').upsert(
        {
          key: DB_KEY,
          value: profile as never,
          category: 'profile',
          created_by: userData.user?.id ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );
    })();
  }, [profile]);

  const updateProfile = (patch: Partial<ProfileData>) =>
    setProfile((p) => ({ ...p, ...patch }));

  const updateChurch = (patch: Partial<ProfileData['church']>) =>
    setProfile((p) => ({ ...p, church: { ...p.church, ...patch } }));

  const setAvatar = (dataUrl: string) =>
    setProfile((p) => ({ ...p, avatar: dataUrl }));

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, updateChurch, setAvatar }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
