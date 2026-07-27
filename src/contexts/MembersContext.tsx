import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Member, Tag } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';


interface MembersContextType {
  members: Member[];
  loading: boolean;
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  addMember: (member: Member) => Promise<void>;
  updateMember: (id: string, data: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  addTagToMember: (memberId: string, tag: Tag) => Promise<void>;
  removeTagFromMember: (memberId: string, tagId: string) => Promise<void>;
  getMemberById: (id: string) => Member | undefined;
  getMembroPLCTag: () => Tag | undefined;
}

const MembersContext = createContext<MembersContextType | undefined>(undefined);

function tagFromRow(row: any): Tag {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    color: row.color,
    description: row.description ?? undefined,
    level: row.level ?? undefined,
    area: row.area ?? undefined,
  };
}

function memberFromRow(row: any, tags: Tag[] = []): Member {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email ?? undefined,
    phone: row.phone ?? '',
    birthDate: row.birth_date ?? undefined,
    conversionDate: row.conversion_date ?? undefined,
    baptismDate: row.baptism_date ?? undefined,
    status: row.status,
    role: row.role,
    tags,
    plcGroupId: row.plc_group_id ?? undefined,
    photoUrl: row.photo_url ?? undefined,
    address: row.address ?? undefined,
    notes: row.notes ?? undefined,
    petitions: row.petitions ?? undefined,
    etapa: row.etapa ?? undefined,
    sexo: row.sexo ?? undefined,
    zona: row.address ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function memberToRow(data: Partial<Member>) {
  const row: Record<string, any> = {};
  if (data.firstName !== undefined) row.first_name = data.firstName;
  if (data.lastName !== undefined) row.last_name = data.lastName;
  if (data.email !== undefined) row.email = data.email || null;
  if (data.phone !== undefined) row.phone = data.phone;
  if (data.birthDate !== undefined) row.birth_date = data.birthDate || null;
  if (data.conversionDate !== undefined) row.conversion_date = data.conversionDate || null;
  if (data.baptismDate !== undefined) row.baptism_date = data.baptismDate || null;
  if (data.status !== undefined) row.status = data.status;
  if (data.role !== undefined) row.role = data.role;
  if (data.plcGroupId !== undefined) row.plc_group_id = data.plcGroupId || null;
  if (data.photoUrl !== undefined) row.photo_url = data.photoUrl || null;
  if (data.address !== undefined) row.address = data.address || null;
  if (data.notes !== undefined) row.notes = data.notes || null;
  if (data.petitions !== undefined) row.petitions = data.petitions || null;
  if (data.etapa !== undefined) row.etapa = data.etapa || null;
  if (data.sexo !== undefined) row.sexo = data.sexo || null;
  if (data.zona !== undefined) row.address = data.zona || null;
  return row;
}

export function MembersProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMembers = async () => {
    setLoading(true);
    const [{ data: memberRows }, { data: tagRows }, { data: linkRows }] = await Promise.all([
      supabase.from('members').select('*').order('created_at', { ascending: false }),
      supabase.from('tags').select('*'),
      supabase.from('member_tags').select('*'),
    ]);

    const tagsById = new Map<string, Tag>();
    (tagRows ?? []).forEach((t) => tagsById.set(t.id, tagFromRow(t)));

    const tagsByMember = new Map<string, Tag[]>();
    (linkRows ?? []).forEach((l: any) => {
      const tag = tagsById.get(l.tag_id);
      if (!tag) return;
      const arr = tagsByMember.get(l.member_id) ?? [];
      arr.push(tag);
      tagsByMember.set(l.member_id, arr);
    });

    setMembers((memberRows ?? []).map((m) => memberFromRow(m, tagsByMember.get(m.id) ?? [])));
    setLoading(false);
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const getMembroPLCTag = () =>
    members.flatMap((m) => m.tags).find((t) => /miembro plc|membro plc/i.test(t.name));

  const addMember = async (member: Member) => {
    const { data, error } = await supabase
      .from('members')
      .insert(memberToRow(member) as any)
      .select('*')
      .single();
    if (error || !data) {
      toast({ title: 'Error al guardar miembro', description: error?.message ?? 'Error desconocido', variant: 'destructive' });
      return;
    }
    setMembers((prev) => [memberFromRow(data, member.tags ?? []), ...prev]);
    toast({ title: '¡Miembro agregado!', description: `${data.first_name} ${data.last_name} fue guardado.` });
  };

  const updateMember = async (id: string, data: Partial<Member>) => {
    const { data: updated, error } = await supabase
      .from('members')
      .update(memberToRow(data) as any)
      .eq('id', id)
      .select('*')
      .single();
    if (error || !updated) {
      toast({ title: 'Error al actualizar', description: error?.message ?? 'Error desconocido', variant: 'destructive' });
      return;
    }
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? memberFromRow(updated, m.tags) : m))
    );
  };

  const deleteMember = async (id: string) => {
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error al eliminar', description: error.message, variant: 'destructive' });
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };


  const addTagToMember = async (memberId: string, tag: Tag) => {
    const { error } = await supabase
      .from('member_tags')
      .insert({ member_id: memberId, tag_id: tag.id });
    if (error) return;
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId && !m.tags.some((t) => t.id === tag.id)) {
          return { ...m, tags: [...m.tags, tag] };
        }
        return m;
      })
    );
  };

  const removeTagFromMember = async (memberId: string, tagId: string) => {
    const { error } = await supabase
      .from('member_tags')
      .delete()
      .eq('member_id', memberId)
      .eq('tag_id', tagId);
    if (error) return;
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId ? { ...m, tags: m.tags.filter((t) => t.id !== tagId) } : m
      )
    );
  };

  const getMemberById = (id: string) => members.find((m) => m.id === id);

  return (
    <MembersContext.Provider
      value={{
        members,
        loading,
        setMembers,
        addMember,
        updateMember,
        deleteMember,
        addTagToMember,
        removeTagFromMember,
        getMemberById,
        getMembroPLCTag,
      }}
    >
      {children}
    </MembersContext.Provider>
  );
}

export function useMembers() {
  const context = useContext(MembersContext);
  if (context === undefined) {
    throw new Error('useMembers must be used within a MembersProvider');
  }
  return context;
}
