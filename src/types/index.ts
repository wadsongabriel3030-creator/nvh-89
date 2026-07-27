export type UserRole = 'admin' | 'pastor' | 'leader' | 'server' | 'member';

export type MemberStatus = 'active' | 'inactive' | 'visitor';

export type TagCategory = 
  | 'discipleship' 
  | 'nuevos_comienzos' 
  | 'server' 
  | 'plc'
  | 'custom';

export type DiscipleshipLevel = 'beginner' | 'intermediate' | 'advanced';

export type ServerArea = 
  | 'worship' 
  | 'media' 
  | 'reception' 
  | 'children' 
  | 'youth' 
  | 'cleaning' 
  | 'security'
  | 'other';

export interface Tag {
  id: string;
  name: string;
  category: TagCategory;
  color: string;
  description?: string;
  level?: DiscipleshipLevel;
  area?: ServerArea;
}

export type MemberEtapa = 'Adulto' | 'Joven Adulto' | 'Joven' | 'Niño';
export type MemberSexo = 'Hombre' | 'Mujer';

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  birthDate?: string;
  conversionDate?: string;
  baptismDate?: string;
  status: MemberStatus;
  role: UserRole;
  tags: Tag[];
  plcGroupId?: string;
  photoUrl?: string;
  address?: string;
  notes?: string;
  petitions?: string;
  etapa?: MemberEtapa;
  sexo?: MemberSexo;
  zona?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PLCGroup {
  id: string;
  name: string;
  leaderId: string;
  members: string[];
  meetingDay: string;
  meetingTime: string;
  location: string;
  isActive: boolean;
}

export interface Attendance {
  id: string;
  memberId: string;
  eventType: 'sunday_service' | 'prayer_6h' | 'prayer_13h' | 'prayer_18h' | 'plc' | 'discipleship' | 'nuevos_comienzos';
  date: string;
  present: boolean;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  encargado?: string;
  type: string;
  attendees: string[];
  isRecurring: boolean;
  recurrenceType?: 'fixed' | 'temporal';
  recurrenceDay?: string; // e.g. 'monday', 'friday'
  recurrenceFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  visitors: number;
  newConversions: number;
  baptismsThisMonth: number;
  averageAttendance: number;
  plcGroups: number;
  birthdaysThisWeek: number;
}

// Nuevos Comienzos
export interface NuevosComienzosParticipant {
  id: string;
  memberId: string;
  startDate: string;
  completionDate?: string;
  status: 'in_progress' | 'completed' | 'dropped';
  notes?: string;
}

// Membresia
export interface MembresiaRecord {
  id: string;
  memberId: string;
  requestDate: string;
  approvalDate?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

// Creencias Basicas
export interface CreenciasBasicasParticipant {
  id: string;
  memberId: string;
  startDate: string;
  completionDate?: string;
  status: 'in_progress' | 'completed' | 'dropped';
  notes?: string;
}

// Batismos
export interface BatismoRecord {
  id: string;
  memberId: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  location?: string;
  notes?: string;
}

// =================== NOVAS PÁGINAS ===================

// Guia de Oração
export interface PrayerGuide {
  id: string;
  title: string;
  description: string;
  verses: string[];
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate?: string;
  isActive: boolean;
  pdfFile?: PrayerGuidePDF;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrayerGuidePDF {
  id: string;
  name: string;
  data: string; // base64
  uploadedAt: string;
}

export interface PrayerProgress {
  id: string;
  guideId: string;
  memberId: string;
  memberName: string;
  completedDate: string;
  notes?: string;
}

export interface PrayerHistory {
  id: string;
  guideId: string;
  guideTitle: string;
  memberId: string;
  memberName: string;
  action: 'created' | 'completed' | 'downloaded_pdf' | 'uploaded_pdf';
  date: string;
  notes?: string;
}

// Calendário de Atividades
export type ActivityType = 'culto' | 'evento' | 'jejum' | 'oracao' | 'treinamento' | 'reuniao';

export interface CalendarActivity {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime?: string;
  type: ActivityType;
  ministryId?: string;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  notifyBefore?: number; // minutes
  color?: string;
}

// Eventos Complementar
export interface EventParticipant {
  id: string;
  eventId: string;
  memberId: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  checkedIn: boolean;
  checkedInAt?: string;
  qrCode?: string;
}

// Dízimos (Acesso Restrito)
export interface Tithe {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  paymentMethod: 'cash' | 'transfer' | 'pix' | 'card';
  reference?: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

// Base de Dados Geral
export interface GlobalStats {
  totalMembers: number;
  totalBaptisms: number;
  totalEvents: number;
  totalPLCs: number;
  totalTithes: number;
  averageAttendance: number;
  growthRate: number;
}

// Recordatórios / Lembretes
export interface Reminder {
  id: string;
  title: string;
  description?: string;
  type: 'event' | 'culto' | 'reuniao' | 'birthday' | 'custom';
  targetDate: string;
  notifyAt: string;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  isActive: boolean;
  createdAt: string;
}

// Testemunhos
export interface Testimony {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  visibility: 'public' | 'internal';
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

// Comentários por Serviço ou PLC
export interface ServiceComment {
  id: string;
  type: 'culto' | 'plc';
  referenceId: string;
  referenceName: string;
  authorId: string;
  authorName: string;
  content: string;
  date: string;
  isHighlighted: boolean;
  createdAt: string;
}

// Curso de Membresia
export interface MembershipCourse {
  id: string;
  title: string;
  description: string;
  modules: CourseModule[];
  isActive: boolean;
  createdAt: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string;
  content: string;
  order: number;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
}

export interface CourseProgress {
  id: string;
  courseId: string;
  memberId: string;
  completedLessons: string[];
  startedAt: string;
  completedAt?: string;
  certificateUrl?: string;
}

// Crenças Básicas (Conteúdo Educacional)
export interface Doctrine {
  id: string;
  title: string;
  content: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface DoctrineProgress {
  id: string;
  doctrineId: string;
  memberId: string;
  readAt: string;
  completed: boolean;
}

// Academia (Treinamentos Internos)
export interface TrainingCourse {
  id: string;
  title: string;
  description: string;
  targetAudience: 'leaders' | 'volunteers' | 'all';
  duration: string;
  modules: TrainingModule[];
  isActive: boolean;
  createdAt: string;
}

export interface TrainingModule {
  id: string;
  courseId: string;
  title: string;
  content: string;
  order: number;
}

export interface TrainingProgress {
  id: string;
  courseId: string;
  memberId: string;
  completedModules: string[];
  startedAt: string;
  completedAt?: string;
}

// Processo de Discipulado (PDF)
export interface DiscipleshipDocument {
  id: string;
  title: string;
  description: string;
  pdfUrl: string;
  stage: number;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface DiscipleshipTracking {
  id: string;
  documentId: string;
  memberId: string;
  leaderId: string;
  startedAt: string;
  completedAt?: string;
  notes?: string;
}

// Guia de Leitura Bíblica
export interface BibleReadingPlan {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  readings: BibleReading[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface BibleReading {
  id: string;
  planId: string;
  day: number;
  passage: string;
  book: string;
  chapter: string;
  verses?: string;
}

export interface ReadingProgress {
  id: string;
  planId: string;
  readingId: string;
  memberId: string;
  completedAt: string;
}
