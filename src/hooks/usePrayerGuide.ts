import { useState, useEffect, useCallback } from 'react';
import { PrayerGuide, PrayerProgress, PrayerHistory, PrayerGuidePDF, UserRole } from '@/types';

const STORAGE_KEYS = {
  GUIDES: 'prayer_guides',
  PROGRESS: 'prayer_progress',
  HISTORY: 'prayer_history',
  CURRENT_USER: 'current_user',
};

interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
}

// Mock current user - em produção virá do auth
const DEFAULT_USER: CurrentUser = {
  id: 'user-1',
  name: 'Admin',
  role: 'admin',
};

export function usePrayerGuide() {
  const [guides, setGuides] = useState<PrayerGuide[]>([]);
  const [progress, setProgress] = useState<PrayerProgress[]>([]);
  const [history, setHistory] = useState<PrayerHistory[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(DEFAULT_USER);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const storedGuides = localStorage.getItem(STORAGE_KEYS.GUIDES);
        const storedProgress = localStorage.getItem(STORAGE_KEYS.PROGRESS);
        const storedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
        const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

        if (storedGuides) setGuides(JSON.parse(storedGuides));
        if (storedProgress) setProgress(JSON.parse(storedProgress));
        if (storedHistory) setHistory(JSON.parse(storedHistory));
        if (storedUser) setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Salvar guias
  const saveGuides = useCallback((newGuides: PrayerGuide[]) => {
    localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(newGuides));
    setGuides(newGuides);
  }, []);

  // Salvar progresso
  const saveProgress = useCallback((newProgress: PrayerProgress[]) => {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(newProgress));
    setProgress(newProgress);
  }, []);

  // Salvar histórico
  const saveHistory = useCallback((newHistory: PrayerHistory[]) => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(newHistory));
    setHistory(newHistory);
  }, []);

  // Adicionar ao histórico
  const addToHistory = useCallback((
    guideId: string,
    guideTitle: string,
    action: PrayerHistory['action'],
    notes?: string
  ) => {
    const newEntry: PrayerHistory = {
      id: Date.now().toString(),
      guideId,
      guideTitle,
      memberId: currentUser.id,
      memberName: currentUser.name,
      action,
      date: new Date().toISOString(),
      notes,
    };
    const updatedHistory = [newEntry, ...history];
    saveHistory(updatedHistory);
  }, [currentUser, history, saveHistory]);

  // Criar guia
  const createGuide = useCallback((data: Omit<PrayerGuide, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    const newGuide: PrayerGuide = {
      ...data,
      id: Date.now().toString(),
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedGuides = [...guides, newGuide];
    saveGuides(updatedGuides);
    addToHistory(newGuide.id, newGuide.title, 'created');
    return newGuide;
  }, [guides, currentUser, saveGuides, addToHistory]);

  // Atualizar guia
  const updateGuide = useCallback((id: string, data: Partial<PrayerGuide>) => {
    const updatedGuides = guides.map(g => 
      g.id === id 
        ? { ...g, ...data, updatedAt: new Date().toISOString() } 
        : g
    );
    saveGuides(updatedGuides);
  }, [guides, saveGuides]);

  // Deletar guia
  const deleteGuide = useCallback((id: string) => {
    const updatedGuides = guides.filter(g => g.id !== id);
    saveGuides(updatedGuides);
    // Remover progresso relacionado
    const updatedProgress = progress.filter(p => p.guideId !== id);
    saveProgress(updatedProgress);
  }, [guides, progress, saveGuides, saveProgress]);

  // Upload PDF
  const uploadPDF = useCallback((guideId: string, file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const pdf: PrayerGuidePDF = {
          id: Date.now().toString(),
          name: file.name,
          data: reader.result as string,
          uploadedAt: new Date().toISOString(),
        };
        const guide = guides.find(g => g.id === guideId);
        if (guide) {
          updateGuide(guideId, { pdfFile: pdf });
          addToHistory(guideId, guide.title, 'uploaded_pdf', file.name);
        }
        resolve();
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, [guides, updateGuide, addToHistory]);

  // Download PDF
  const downloadPDF = useCallback((guide: PrayerGuide) => {
    if (!guide.pdfFile) return;
    
    const link = document.createElement('a');
    link.href = guide.pdfFile.data;
    link.download = guide.pdfFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addToHistory(guide.id, guide.title, 'downloaded_pdf');
  }, [addToHistory]);

  // Marcar oração como concluída
  const markAsCompleted = useCallback((guideId: string, notes?: string) => {
    const guide = guides.find(g => g.id === guideId);
    if (!guide) return;

    const existingProgress = progress.find(
      p => p.guideId === guideId && 
           p.memberId === currentUser.id &&
           new Date(p.completedDate).toDateString() === new Date().toDateString()
    );

    if (existingProgress) return; // Já completou hoje

    const newProgress: PrayerProgress = {
      id: Date.now().toString(),
      guideId,
      memberId: currentUser.id,
      memberName: currentUser.name,
      completedDate: new Date().toISOString(),
      notes,
    };

    const updatedProgress = [...progress, newProgress];
    saveProgress(updatedProgress);
    addToHistory(guideId, guide.title, 'completed', notes);
  }, [guides, progress, currentUser, saveProgress, addToHistory]);

  // Verificar se completou hoje
  const hasCompletedToday = useCallback((guideId: string) => {
    return progress.some(
      p => p.guideId === guideId && 
           p.memberId === currentUser.id &&
           new Date(p.completedDate).toDateString() === new Date().toDateString()
    );
  }, [progress, currentUser]);

  // Obter progresso de um guia
  const getGuideProgress = useCallback((guideId: string) => {
    return progress.filter(p => p.guideId === guideId);
  }, [progress]);

  // Obter histórico de um guia
  const getGuideHistory = useCallback((guideId: string) => {
    return history.filter(h => h.guideId === guideId);
  }, [history]);

  // Verificar permissões
  const canManageGuides = useCallback(() => {
    return ['admin', 'pastor', 'leader'].includes(currentUser.role);
  }, [currentUser]);

  const canViewTithes = useCallback(() => {
    return ['admin', 'pastor'].includes(currentUser.role);
  }, [currentUser]);

  // Mudar usuário (para teste)
  const switchUser = useCallback((user: CurrentUser) => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    setCurrentUser(user);
  }, []);

  // Estatísticas
  const getStats = useCallback(() => {
    const totalGuides = guides.length;
    const activeGuides = guides.filter(g => g.isActive).length;
    const totalCompletions = progress.length;
    const myCompletions = progress.filter(p => p.memberId === currentUser.id).length;

    return {
      totalGuides,
      activeGuides,
      totalCompletions,
      myCompletions,
    };
  }, [guides, progress, currentUser]);

  return {
    guides,
    progress,
    history,
    currentUser,
    isLoading,
    createGuide,
    updateGuide,
    deleteGuide,
    uploadPDF,
    downloadPDF,
    markAsCompleted,
    hasCompletedToday,
    getGuideProgress,
    getGuideHistory,
    canManageGuides,
    canViewTithes,
    switchUser,
    getStats,
  };
}
