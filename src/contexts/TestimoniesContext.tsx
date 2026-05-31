import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Testimony } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface TestimoniesContextType {
  testimonies: Testimony[];
  loading: boolean;
  addTestimony: (t: Omit<Testimony, 'id' | 'createdAt'> & Partial<Pick<Testimony, 'id' | 'createdAt'>>) => Promise<void>;
  updateTestimony: (id: string, data: Partial<Testimony>) => Promise<void>;
  deleteTestimony: (id: string) => Promise<void>;
}

const TestimoniesContext = createContext<TestimoniesContextType | undefined>(undefined);

function fromRow(row: any): Testimony {
  return {
    id: row.id,
    authorId: row.author_id ?? '',
    authorName: row.author_name,
    title: row.title,
    content: row.content,
    date: row.testimony_date,
    status: row.status,
    visibility: row.visibility,
    approvedBy: row.approved_by ?? undefined,
    approvedAt: row.approved_at ?? undefined,
    createdAt: row.created_at,
  };
}

function toRow(data: Partial<Testimony>) {
  const row: Record<string, any> = {};
  if (data.authorId !== undefined) row.author_id = data.authorId || null;
  if (data.authorName !== undefined) row.author_name = data.authorName;
  if (data.title !== undefined) row.title = data.title;
  if (data.content !== undefined) row.content = data.content;
  if (data.date !== undefined) row.testimony_date = data.date;
  if (data.status !== undefined) row.status = data.status;
  if (data.visibility !== undefined) row.visibility = data.visibility;
  if (data.approvedBy !== undefined) row.approved_by = data.approvedBy || null;
  if (data.approvedAt !== undefined) row.approved_at = data.approvedAt || null;
  return row;
}

export function TestimoniesProvider({ children }: { children: ReactNode }) {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('testimonies')
        .select('*')
        .order('created_at', { ascending: false });
      setTestimonies((data ?? []).map(fromRow));
      setLoading(false);
    })();
  }, []);

  const addTestimony: TestimoniesContextType['addTestimony'] = async (t) => {
    const { data, error } = await supabase
      .from('testimonies')
      .insert(toRow(t) as any)
      .select('*')
      .single();
    if (error || !data) return;
    setTestimonies((prev) => [fromRow(data), ...prev]);
  };

  const updateTestimony = async (id: string, data: Partial<Testimony>) => {
    const { data: updated, error } = await supabase
      .from('testimonies')
      .update(toRow(data) as any)
      .eq('id', id)
      .select('*')
      .single();
    if (error || !updated) return;
    setTestimonies((prev) => prev.map((t) => (t.id === id ? fromRow(updated) : t)));
  };

  const deleteTestimony = async (id: string) => {
    const { error } = await supabase.from('testimonies').delete().eq('id', id);
    if (error) return;
    setTestimonies((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <TestimoniesContext.Provider value={{ testimonies, loading, addTestimony, updateTestimony, deleteTestimony }}>
      {children}
    </TestimoniesContext.Provider>
  );
}

export function useTestimonies() {
  const ctx = useContext(TestimoniesContext);
  if (!ctx) throw new Error('useTestimonies must be used within TestimoniesProvider');
  return ctx;
}
