import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Tag, TagCategory } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface TagsContextType {
  tags: Tag[];
  loading: boolean;
  addTag: (tag: Omit<Tag, 'id'>) => Promise<Tag | undefined>;
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  getTagsByCategory: () => Record<TagCategory, Tag[]>;
}

const TagsContext = createContext<TagsContextType | undefined>(undefined);

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

function tagToRow(data: Partial<Tag>) {
  const row: Record<string, any> = {};
  if (data.name !== undefined) row.name = data.name;
  if (data.category !== undefined) row.category = data.category;
  if (data.color !== undefined) row.color = data.color;
  if (data.description !== undefined) row.description = data.description || null;
  if (data.level !== undefined) row.level = data.level || null;
  if (data.area !== undefined) row.area = data.area || null;
  return row;
}

export function TagsProvider({ children }: { children: ReactNode }) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('tags').select('*').order('created_at', { ascending: true });
      setTags((data ?? []).map(tagFromRow));
      setLoading(false);
    })();
  }, []);

  const addTag = async (tag: Omit<Tag, 'id'>) => {
    const { data, error } = await supabase
      .from('tags')
      .insert(tagToRow(tag) as any)
      .select('*')
      .single();
    if (error || !data) return undefined;
    const newTag = tagFromRow(data);
    setTags((prev) => [...prev, newTag]);
    return newTag;
  };

  const updateTag = async (id: string, updates: Partial<Tag>) => {
    const { data, error } = await supabase
      .from('tags')
      .update(tagToRow(updates) as any)
      .eq('id', id)
      .select('*')
      .single();
    if (error || !data) return;
    setTags((prev) => prev.map((t) => (t.id === id ? tagFromRow(data) : t)));
  };

  const deleteTag = async (id: string) => {
    const { error } = await supabase.from('tags').delete().eq('id', id);
    if (error) return;
    setTags((prev) => prev.filter((t) => t.id !== id));
  };

  const getTagsByCategory = () => {
    return tags.reduce((acc, tag) => {
      if (!acc[tag.category]) acc[tag.category] = [];
      acc[tag.category].push(tag);
      return acc;
    }, {} as Record<TagCategory, Tag[]>);
  };

  return (
    <TagsContext.Provider value={{ tags, loading, addTag, updateTag, deleteTag, getTagsByCategory }}>
      {children}
    </TagsContext.Provider>
  );
}

export function useTags() {
  const context = useContext(TagsContext);
  if (context === undefined) {
    throw new Error('useTags must be used within a TagsProvider');
  }
  return context;
}
