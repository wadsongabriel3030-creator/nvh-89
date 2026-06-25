export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_storage: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      baptisms: {
        Row: {
          completed_date: string | null
          created_at: string
          full_name: string
          id: string
          location: string | null
          member_id: string | null
          notes: string | null
          scheduled_date: string | null
          status: Database["public"]["Enums"]["baptism_status"]
          updated_at: string
        }
        Insert: {
          completed_date?: string | null
          created_at?: string
          full_name: string
          id?: string
          location?: string | null
          member_id?: string | null
          notes?: string | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["baptism_status"]
          updated_at?: string
        }
        Update: {
          completed_date?: string | null
          created_at?: string
          full_name?: string
          id?: string
          location?: string | null
          member_id?: string | null
          notes?: string | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["baptism_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "baptisms_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_activities: {
        Row: {
          activity_date: string
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string | null
          id: string
          is_recurring: boolean
          ministry_id: string | null
          notify_before: number | null
          recurrence_pattern: string | null
          start_time: string | null
          title: string
          type: string | null
          updated_at: string
        }
        Insert: {
          activity_date: string
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          is_recurring?: boolean
          ministry_id?: string | null
          notify_before?: number | null
          recurrence_pattern?: string | null
          start_time?: string | null
          title: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          activity_date?: string
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          is_recurring?: boolean
          ministry_id?: string | null
          notify_before?: number | null
          recurrence_pattern?: string | null
          start_time?: string | null
          title?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      class_reports: {
        Row: {
          area: string
          attendee_ids: string[]
          attendee_names: string[]
          created_at: string
          created_by: string | null
          extra: Json | null
          id: string
          leader_name: string | null
          leccion: string | null
          report_date: string | null
          updated_at: string
        }
        Insert: {
          area: string
          attendee_ids?: string[]
          attendee_names?: string[]
          created_at?: string
          created_by?: string | null
          extra?: Json | null
          id?: string
          leader_name?: string | null
          leccion?: string | null
          report_date?: string | null
          updated_at?: string
        }
        Update: {
          area?: string
          attendee_ids?: string[]
          attendee_names?: string[]
          created_at?: string
          created_by?: string | null
          extra?: Json | null
          id?: string
          leader_name?: string | null
          leccion?: string | null
          report_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      creencias_students: {
        Row: {
          completion_date: string | null
          created_at: string
          full_name: string
          id: string
          member_id: string | null
          notes: string | null
          start_date: string
          status: Database["public"]["Enums"]["course_status"]
          updated_at: string
        }
        Insert: {
          completion_date?: string | null
          created_at?: string
          full_name: string
          id?: string
          member_id?: string | null
          notes?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["course_status"]
          updated_at?: string
        }
        Update: {
          completion_date?: string | null
          created_at?: string
          full_name?: string
          id?: string
          member_id?: string | null
          notes?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["course_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creencias_students_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      discipuladores: {
        Row: {
          id: string
          member_id: string
          assigned_at: string
          assigned_by: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          member_id: string
          assigned_at?: string
          assigned_by?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          assigned_at?: string
          assigned_by?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discipuladores_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: true
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      discipulador_discipulos: {
        Row: {
          id: string
          discipulador_id: string
          discipulo_member_id: string
          assigned_at: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          discipulador_id: string
          discipulo_member_id: string
          assigned_at?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          discipulador_id?: string
          discipulo_member_id?: string
          assigned_at?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discipulador_discipulos_discipulador_id_fkey"
            columns: ["discipulador_id"]
            isOneToOne: false
            referencedRelation: "discipuladores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discipulador_discipulos_discipulo_member_id_fkey"
            columns: ["discipulo_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      discipulo_progreso: {
        Row: {
          id: string
          discipulo_member_id: string
          step_key: string
          completed: boolean
          completed_at: string | null
          notes: string | null
          marked_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          discipulo_member_id: string
          step_key: string
          completed?: boolean
          completed_at?: string | null
          notes?: string | null
          marked_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          discipulo_member_id?: string
          step_key?: string
          completed?: boolean
          completed_at?: string | null
          notes?: string | null
          marked_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discipulo_progreso_discipulo_member_id_fkey"
            columns: ["discipulo_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      discipleship_students: {
        Row: {
          completion_date: string | null
          created_at: string
          full_name: string
          id: string
          level: Database["public"]["Enums"]["discipleship_level"]
          member_id: string | null
          notes: string | null
          start_date: string
          status: Database["public"]["Enums"]["course_status"]
          updated_at: string
        }
        Insert: {
          completion_date?: string | null
          created_at?: string
          full_name: string
          id?: string
          level?: Database["public"]["Enums"]["discipleship_level"]
          member_id?: string | null
          notes?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["course_status"]
          updated_at?: string
        }
        Update: {
          completion_date?: string | null
          created_at?: string
          full_name?: string
          id?: string
          level?: Database["public"]["Enums"]["discipleship_level"]
          member_id?: string | null
          notes?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["course_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discipleship_students_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendees: {
        Row: {
          created_at: string
          event_id: string
          member_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          member_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          member_id?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          checked_in: boolean
          checked_in_at: string | null
          created_at: string
          email: string | null
          event_id: string
          extra: Json | null
          full_name: string | null
          id: string
          member_id: string | null
          phone: string | null
          qr_code: string | null
          status: string
        }
        Insert: {
          checked_in?: boolean
          checked_in_at?: string | null
          created_at?: string
          email?: string | null
          event_id: string
          extra?: Json | null
          full_name?: string | null
          id?: string
          member_id?: string | null
          phone?: string | null
          qr_code?: string | null
          status?: string
        }
        Update: {
          checked_in?: boolean
          checked_in_at?: string | null
          created_at?: string
          email?: string | null
          event_id?: string
          extra?: Json | null
          full_name?: string | null
          id?: string
          member_id?: string | null
          phone?: string | null
          qr_code?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          encargado: string | null
          end_time: string | null
          event_date: string
          id: string
          is_recurring: boolean
          location: string | null
          recurrence_day: string | null
          recurrence_frequency: string | null
          recurrence_type: string | null
          start_time: string | null
          title: string
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          encargado?: string | null
          end_time?: string | null
          event_date: string
          id?: string
          is_recurring?: boolean
          location?: string | null
          recurrence_day?: string | null
          recurrence_frequency?: string | null
          recurrence_type?: string | null
          start_time?: string | null
          title: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          encargado?: string | null
          end_time?: string | null
          event_date?: string
          id?: string
          is_recurring?: boolean
          location?: string | null
          recurrence_day?: string | null
          recurrence_frequency?: string | null
          recurrence_type?: string | null
          start_time?: string | null
          title?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      leaders_list: {
        Row: {
          category: Database["public"]["Enums"]["leader_category"]
          created_at: string
          id: string
          name: string
          phone: string | null
          position: number
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["leader_category"]
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          position: number
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["leader_category"]
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      member_tags: {
        Row: {
          created_at: string
          member_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          member_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          member_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_tags_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          address: string | null
          baptism_date: string | null
          birth_date: string | null
          conversion_date: string | null
          created_at: string
          created_by: string | null
          email: string | null
          etapa: string | null
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          photo_url: string | null
          plc_group_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          sexo: string | null
          status: Database["public"]["Enums"]["member_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          baptism_date?: string | null
          birth_date?: string | null
          conversion_date?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          etapa?: string | null
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          plc_group_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          sexo?: string | null
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          baptism_date?: string | null
          birth_date?: string | null
          conversion_date?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          etapa?: string | null
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          plc_group_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          sexo?: string | null
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
        }
        Relationships: []
      }
      membresia_students: {
        Row: {
          completion_date: string | null
          created_at: string
          full_name: string
          id: string
          member_id: string | null
          notes: string | null
          start_date: string
          status: Database["public"]["Enums"]["course_status"]
          updated_at: string
        }
        Insert: {
          completion_date?: string | null
          created_at?: string
          full_name: string
          id?: string
          member_id?: string | null
          notes?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["course_status"]
          updated_at?: string
        }
        Update: {
          completion_date?: string | null
          created_at?: string
          full_name?: string
          id?: string
          member_id?: string | null
          notes?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["course_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "membresia_students_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      nuevos_comienzos_participants: {
        Row: {
          completion_date: string | null
          created_at: string
          full_name: string
          id: string
          member_id: string | null
          notes: string | null
          start_date: string
          status: Database["public"]["Enums"]["course_status"]
          updated_at: string
        }
        Insert: {
          completion_date?: string | null
          created_at?: string
          full_name: string
          id?: string
          member_id?: string | null
          notes?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["course_status"]
          updated_at?: string
        }
        Update: {
          completion_date?: string | null
          created_at?: string
          full_name?: string
          id?: string
          member_id?: string | null
          notes?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["course_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nuevos_comienzos_participants_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      plc_groups: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          leader_id: string | null
          location: string | null
          meeting_day: string | null
          meeting_time: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          leader_id?: string | null
          location?: string | null
          meeting_day?: string | null
          meeting_time?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          leader_id?: string | null
          location?: string | null
          meeting_day?: string | null
          meeting_time?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plc_groups_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      plc_members: {
        Row: {
          joined_at: string
          member_id: string
          plc_group_id: string
        }
        Insert: {
          joined_at?: string
          member_id: string
          plc_group_id: string
        }
        Update: {
          joined_at?: string
          member_id?: string
          plc_group_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plc_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plc_members_plc_group_id_fkey"
            columns: ["plc_group_id"]
            isOneToOne: false
            referencedRelation: "plc_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      plc_reports: {
        Row: {
          attendee_ids: string[]
          attendee_names: string[]
          cantidad_invitados: string | null
          comentarios: string | null
          convertidos_info: string | null
          created_at: string
          created_by: string | null
          expected_member_ids: string[]
          hubo_convertidos: boolean | null
          hubo_incorporados: boolean | null
          hubo_reconciliados: boolean | null
          id: string
          incorporados_info: string | null
          leader_id: string | null
          leader_name: string | null
          meeting_day: string | null
          nombres_invitados: string | null
          ofrenda_recolectada: string | null
          plc_group_id: string
          plc_name: string
          reconciliados_info: string | null
          report_date: string | null
          testimonio_milagros: string | null
          todos_recibieron_anuncios: boolean | null
          updated_at: string
        }
        Insert: {
          attendee_ids?: string[]
          attendee_names?: string[]
          cantidad_invitados?: string | null
          comentarios?: string | null
          convertidos_info?: string | null
          created_at?: string
          created_by?: string | null
          expected_member_ids?: string[]
          hubo_convertidos?: boolean | null
          hubo_incorporados?: boolean | null
          hubo_reconciliados?: boolean | null
          id?: string
          incorporados_info?: string | null
          leader_id?: string | null
          leader_name?: string | null
          meeting_day?: string | null
          nombres_invitados?: string | null
          ofrenda_recolectada?: string | null
          plc_group_id: string
          plc_name: string
          reconciliados_info?: string | null
          report_date?: string | null
          testimonio_milagros?: string | null
          todos_recibieron_anuncios?: boolean | null
          updated_at?: string
        }
        Update: {
          attendee_ids?: string[]
          attendee_names?: string[]
          cantidad_invitados?: string | null
          comentarios?: string | null
          convertidos_info?: string | null
          created_at?: string
          created_by?: string | null
          expected_member_ids?: string[]
          hubo_convertidos?: boolean | null
          hubo_incorporados?: boolean | null
          hubo_reconciliados?: boolean | null
          id?: string
          incorporados_info?: string | null
          leader_id?: string | null
          leader_name?: string | null
          meeting_day?: string | null
          nombres_invitados?: string | null
          ofrenda_recolectada?: string | null
          plc_group_id?: string
          plc_name?: string
          reconciliados_info?: string | null
          report_date?: string | null
          testimonio_milagros?: string | null
          todos_recibieron_anuncios?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      prayer_guides: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          pdf_name: string | null
          pdf_url: string | null
          period: string
          start_date: string
          title: string
          updated_at: string
          verses: string[] | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          pdf_name?: string | null
          pdf_url?: string | null
          period?: string
          start_date?: string
          title: string
          updated_at?: string
          verses?: string[] | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          pdf_name?: string | null
          pdf_url?: string | null
          period?: string
          start_date?: string
          title?: string
          updated_at?: string
          verses?: string[] | null
        }
        Relationships: []
      }
      prayer_history: {
        Row: {
          action: string
          action_date: string
          guide_id: string | null
          guide_title: string | null
          id: string
          member_id: string | null
          member_name: string | null
          notes: string | null
        }
        Insert: {
          action: string
          action_date?: string
          guide_id?: string | null
          guide_title?: string | null
          id?: string
          member_id?: string | null
          member_name?: string | null
          notes?: string | null
        }
        Update: {
          action?: string
          action_date?: string
          guide_id?: string | null
          guide_title?: string | null
          id?: string
          member_id?: string | null
          member_name?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prayer_history_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "prayer_guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prayer_history_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          is_recurring: boolean
          notify_at: string
          recipients: string[] | null
          recurrence_pattern: string | null
          target_date: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_recurring?: boolean
          notify_at: string
          recipients?: string[] | null
          recurrence_pattern?: string | null
          target_date: string
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_recurring?: boolean
          notify_at?: string
          recipients?: string[] | null
          recurrence_pattern?: string | null
          target_date?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      service_comments: {
        Row: {
          author_id: string | null
          author_name: string | null
          comment_date: string
          content: string
          created_at: string
          id: string
          is_highlighted: boolean
          reference_id: string | null
          reference_name: string | null
          type: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          comment_date?: string
          content: string
          created_at?: string
          id?: string
          is_highlighted?: boolean
          reference_id?: string | null
          reference_name?: string | null
          type: string
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          comment_date?: string
          content?: string
          created_at?: string
          id?: string
          is_highlighted?: boolean
          reference_id?: string | null
          reference_name?: string | null
          type?: string
        }
        Relationships: []
      }
      sunday_reports: {
        Row: {
          attendance: number | null
          conversions: number | null
          created_at: string
          created_by: string | null
          highlights: string | null
          id: string
          notes: string | null
          offerings: number | null
          report_date: string
          updated_at: string
          visitors: number | null
        }
        Insert: {
          attendance?: number | null
          conversions?: number | null
          created_at?: string
          created_by?: string | null
          highlights?: string | null
          id?: string
          notes?: string | null
          offerings?: number | null
          report_date: string
          updated_at?: string
          visitors?: number | null
        }
        Update: {
          attendance?: number | null
          conversions?: number | null
          created_at?: string
          created_by?: string | null
          highlights?: string | null
          id?: string
          notes?: string | null
          offerings?: number | null
          report_date?: string
          updated_at?: string
          visitors?: number | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          area: string | null
          category: Database["public"]["Enums"]["tag_category"]
          color: string
          created_at: string
          description: string | null
          id: string
          level: Database["public"]["Enums"]["discipleship_level"] | null
          name: string
        }
        Insert: {
          area?: string | null
          category: Database["public"]["Enums"]["tag_category"]
          color: string
          created_at?: string
          description?: string | null
          id?: string
          level?: Database["public"]["Enums"]["discipleship_level"] | null
          name: string
        }
        Update: {
          area?: string | null
          category?: Database["public"]["Enums"]["tag_category"]
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          level?: Database["public"]["Enums"]["discipleship_level"] | null
          name?: string
        }
        Relationships: []
      }
      testimonies: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          author_id: string | null
          author_name: string
          content: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["testimony_status"]
          testimony_date: string
          title: string
          updated_at: string
          visibility: Database["public"]["Enums"]["testimony_visibility"]
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          author_id?: string | null
          author_name: string
          content: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["testimony_status"]
          testimony_date?: string
          title: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["testimony_visibility"]
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          author_id?: string | null
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["testimony_status"]
          testimony_date?: string
          title?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["testimony_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "testimonies_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      tithe_records: {
        Row: {
          created_at: string
          currency: Database["public"]["Enums"]["tithe_currency"]
          first_fruits_amount: number
          first_fruits_payment_method: Database["public"]["Enums"]["tithe_payment_form"]
          first_fruits_transfer_number: string | null
          id: string
          member_id: string | null
          member_name: string
          notes: string | null
          offering_amount: number
          offering_payment_method: Database["public"]["Enums"]["tithe_payment_form"]
          offering_transfer_number: string | null
          pro_templo_amount: number
          pro_templo_payment_method: Database["public"]["Enums"]["tithe_payment_form"]
          pro_templo_transfer_number: string | null
          recorded_by: string | null
          special_offering_amount: number
          special_offering_payment_method: Database["public"]["Enums"]["tithe_payment_form"]
          special_offering_transfer_number: string | null
          tithe_amount: number
          tithe_date: string
          tithe_payment_method: Database["public"]["Enums"]["tithe_payment_form"]
          tithe_transfer_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: Database["public"]["Enums"]["tithe_currency"]
          first_fruits_amount?: number
          first_fruits_payment_method?: Database["public"]["Enums"]["tithe_payment_form"]
          first_fruits_transfer_number?: string | null
          id?: string
          member_id?: string | null
          member_name: string
          notes?: string | null
          offering_amount?: number
          offering_payment_method?: Database["public"]["Enums"]["tithe_payment_form"]
          offering_transfer_number?: string | null
          pro_templo_amount?: number
          pro_templo_payment_method?: Database["public"]["Enums"]["tithe_payment_form"]
          pro_templo_transfer_number?: string | null
          recorded_by?: string | null
          special_offering_amount?: number
          special_offering_payment_method?: Database["public"]["Enums"]["tithe_payment_form"]
          special_offering_transfer_number?: string | null
          tithe_amount?: number
          tithe_date: string
          tithe_payment_method?: Database["public"]["Enums"]["tithe_payment_form"]
          tithe_transfer_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: Database["public"]["Enums"]["tithe_currency"]
          first_fruits_amount?: number
          first_fruits_payment_method?: Database["public"]["Enums"]["tithe_payment_form"]
          first_fruits_transfer_number?: string | null
          id?: string
          member_id?: string | null
          member_name?: string
          notes?: string | null
          offering_amount?: number
          offering_payment_method?: Database["public"]["Enums"]["tithe_payment_form"]
          offering_transfer_number?: string | null
          pro_templo_amount?: number
          pro_templo_payment_method?: Database["public"]["Enums"]["tithe_payment_form"]
          pro_templo_transfer_number?: string | null
          recorded_by?: string | null
          special_offering_amount?: number
          special_offering_payment_method?: Database["public"]["Enums"]["tithe_payment_form"]
          special_offering_transfer_number?: string | null
          tithe_amount?: number
          tithe_date?: string
          tithe_payment_method?: Database["public"]["Enums"]["tithe_payment_form"]
          tithe_transfer_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tithe_records_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string
          display_name: string | null
          permissions: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          permissions?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          permissions?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_list_accounts: {
        Args: never
        Returns: {
          created_at: string
          display_name: string
          email: string
          permissions: string[]
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "pastor" | "leader" | "server" | "member"
      baptism_status: "scheduled" | "completed" | "cancelled"
      course_status: "in_progress" | "completed" | "dropped"
      discipleship_level: "beginner" | "intermediate" | "advanced"
      leader_category: "Adulto" | "Joven Adulto" | "Joven"
      member_status: "active" | "inactive" | "visitor"
      payment_method: "cash" | "transfer" | "pix" | "card"
      tag_category:
        | "discipleship"
        | "nuevos_comienzos"
        | "server"
        | "plc"
        | "custom"
      testimony_status: "pending" | "approved" | "rejected"
      testimony_visibility: "public" | "internal"
      tithe_currency: "GTQ" | "USD"
      tithe_payment_form: "efectivo" | "transferencia" | "cheque"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "pastor", "leader", "server", "member"],
      baptism_status: ["scheduled", "completed", "cancelled"],
      course_status: ["in_progress", "completed", "dropped"],
      discipleship_level: ["beginner", "intermediate", "advanced"],
      leader_category: ["Adulto", "Joven Adulto", "Joven"],
      member_status: ["active", "inactive", "visitor"],
      payment_method: ["cash", "transfer", "pix", "card"],
      tag_category: [
        "discipleship",
        "nuevos_comienzos",
        "server",
        "plc",
        "custom",
      ],
      testimony_status: ["pending", "approved", "rejected"],
      testimony_visibility: ["public", "internal"],
      tithe_currency: ["GTQ", "USD"],
      tithe_payment_form: ["efectivo", "transferencia", "cheque"],
    },
  },
} as const
