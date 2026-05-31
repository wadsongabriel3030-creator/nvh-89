import { Member, Tag, PLCGroup, DashboardStats } from '@/types';

// Mock data foi resetado. Os dados agora vêm do banco de dados (Supabase).
// /listado-lideres não foi resetado — está populado no Supabase.

export const defaultTags: Tag[] = [];

export const mockMembers: Member[] = [];

export const mockPLCGroups: PLCGroup[] = [];

export const mockDashboardStats: DashboardStats = {
  totalMembers: 0,
  activeMembers: 0,
  visitors: 0,
  newConversions: 0,
  baptismsThisMonth: 0,
  averageAttendance: 0,
  plcGroups: 0,
  birthdaysThisWeek: 0,
};

export const attendanceData: { month: string; culto: number; oracao: number; plc: number }[] = [];

export const memberGrowthData: { month: string; membros: number; visitantes: number }[] = [];
