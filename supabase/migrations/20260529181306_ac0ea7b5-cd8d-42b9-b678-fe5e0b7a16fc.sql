
-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'pastor', 'leader', 'server', 'member');
CREATE TYPE public.member_status AS ENUM ('active', 'inactive', 'visitor');
CREATE TYPE public.tag_category AS ENUM ('discipleship', 'nuevos_comienzos', 'server', 'plc', 'custom');
CREATE TYPE public.discipleship_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE public.course_status AS ENUM ('in_progress', 'completed', 'dropped');
CREATE TYPE public.baptism_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE public.testimony_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.testimony_visibility AS ENUM ('public', 'internal');
CREATE TYPE public.payment_method AS ENUM ('cash', 'transfer', 'pix', 'card');
CREATE TYPE public.leader_category AS ENUM ('Adulto', 'Joven Adulto', 'Joven');

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- USER ROLES
-- ============================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- AUTO PROFILE TRIGGER ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)), NEW.email);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- HELPER: standard policies (auth-only read/write)
-- We'll inline per-table for clarity.
-- ============================================================

-- MEMBERS
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  birth_date DATE,
  conversion_date DATE,
  baptism_date DATE,
  status public.member_status NOT NULL DEFAULT 'active',
  role public.app_role NOT NULL DEFAULT 'member',
  plc_group_id UUID,
  photo_url TEXT,
  address TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.members TO authenticated;
GRANT ALL ON public.members TO service_role;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read members" ON public.members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated write members" ON public.members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_members_updated_at BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TAGS
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category public.tag_category NOT NULL,
  color TEXT NOT NULL,
  description TEXT,
  level public.discipleship_level,
  area TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT ALL ON public.tags TO service_role;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read tags" ON public.tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth write tags" ON public.tags FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- MEMBER_TAGS
CREATE TABLE public.member_tags (
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (member_id, tag_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_tags TO authenticated;
GRANT ALL ON public.member_tags TO service_role;
ALTER TABLE public.member_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read member_tags" ON public.member_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth write member_tags" ON public.member_tags FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PLC GROUPS
CREATE TABLE public.plc_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  leader_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  meeting_day TEXT,
  meeting_time TEXT,
  location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plc_groups TO authenticated;
GRANT ALL ON public.plc_groups TO service_role;
ALTER TABLE public.plc_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read plc_groups" ON public.plc_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth write plc_groups" ON public.plc_groups FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_plc_groups_updated_at BEFORE UPDATE ON public.plc_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PLC MEMBERS
CREATE TABLE public.plc_members (
  plc_group_id UUID NOT NULL REFERENCES public.plc_groups(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (plc_group_id, member_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plc_members TO authenticated;
GRANT ALL ON public.plc_members TO service_role;
ALTER TABLE public.plc_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read plc_members" ON public.plc_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth write plc_members" ON public.plc_members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- EVENTS
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  location TEXT,
  type TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_type TEXT,
  recurrence_day TEXT,
  recurrence_frequency TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read events" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth write events" ON public.events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- EVENT REGISTRATIONS
CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  checked_in BOOLEAN NOT NULL DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  qr_code TEXT,
  extra JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_registrations TO authenticated;
GRANT INSERT ON public.event_registrations TO anon;
GRANT ALL ON public.event_registrations TO service_role;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read regs" ON public.event_registrations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can register for event" ON public.event_registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Auth update regs" ON public.event_registrations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete regs" ON public.event_registrations FOR DELETE TO authenticated USING (true);

-- TITHES
CREATE TABLE public.tithes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  tithe_date DATE NOT NULL,
  payment_method public.payment_method NOT NULL,
  reference TEXT,
  notes TEXT,
  recorded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tithes TO authenticated;
GRANT ALL ON public.tithes TO service_role;
ALTER TABLE public.tithes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins/pastors read tithes" ON public.tithes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pastor'));
CREATE POLICY "Admins/pastors write tithes" ON public.tithes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pastor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pastor'));

-- TESTIMONIES
CREATE TABLE public.testimonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  testimony_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status public.testimony_status NOT NULL DEFAULT 'pending',
  visibility public.testimony_visibility NOT NULL DEFAULT 'internal',
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonies TO authenticated;
GRANT INSERT ON public.testimonies TO anon;
GRANT SELECT ON public.testimonies TO anon;
GRANT ALL ON public.testimonies TO service_role;
ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public sees approved public testimonies" ON public.testimonies FOR SELECT
  USING (status = 'approved' AND visibility = 'public');
CREATE POLICY "Auth sees all testimonies" ON public.testimonies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can submit testimony" ON public.testimonies FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Auth update testimony" ON public.testimonies FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete testimony" ON public.testimonies FOR DELETE TO authenticated USING (true);
CREATE TRIGGER trg_testimonies_updated_at BEFORE UPDATE ON public.testimonies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- BAPTISMS
CREATE TABLE public.baptisms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  scheduled_date DATE,
  completed_date DATE,
  status public.baptism_status NOT NULL DEFAULT 'scheduled',
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.baptisms TO authenticated;
GRANT INSERT ON public.baptisms TO anon;
GRANT ALL ON public.baptisms TO service_role;
ALTER TABLE public.baptisms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read baptisms" ON public.baptisms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone register baptism" ON public.baptisms FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Auth update baptisms" ON public.baptisms FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete baptisms" ON public.baptisms FOR DELETE TO authenticated USING (true);
CREATE TRIGGER trg_baptisms_updated_at BEFORE UPDATE ON public.baptisms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- DISCIPLESHIP STUDENTS
CREATE TABLE public.discipleship_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  level public.discipleship_level NOT NULL DEFAULT 'beginner',
  status public.course_status NOT NULL DEFAULT 'in_progress',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completion_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.discipleship_students TO authenticated;
GRANT ALL ON public.discipleship_students TO service_role;
ALTER TABLE public.discipleship_students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth all discipleship" ON public.discipleship_students FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_disc_updated_at BEFORE UPDATE ON public.discipleship_students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- NUEVOS COMIENZOS
CREATE TABLE public.nuevos_comienzos_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  status public.course_status NOT NULL DEFAULT 'in_progress',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completion_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nuevos_comienzos_participants TO authenticated;
GRANT INSERT ON public.nuevos_comienzos_participants TO anon;
GRANT ALL ON public.nuevos_comienzos_participants TO service_role;
ALTER TABLE public.nuevos_comienzos_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read nc" ON public.nuevos_comienzos_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone register nc" ON public.nuevos_comienzos_participants FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Auth update nc" ON public.nuevos_comienzos_participants FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete nc" ON public.nuevos_comienzos_participants FOR DELETE TO authenticated USING (true);
CREATE TRIGGER trg_nc_updated_at BEFORE UPDATE ON public.nuevos_comienzos_participants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- MEMBRESIA
CREATE TABLE public.membresia_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  status public.course_status NOT NULL DEFAULT 'in_progress',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completion_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.membresia_students TO authenticated;
GRANT ALL ON public.membresia_students TO service_role;
ALTER TABLE public.membresia_students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth all membresia" ON public.membresia_students FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_membresia_updated_at BEFORE UPDATE ON public.membresia_students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CREENCIAS
CREATE TABLE public.creencias_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  status public.course_status NOT NULL DEFAULT 'in_progress',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completion_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.creencias_students TO authenticated;
GRANT ALL ON public.creencias_students TO service_role;
ALTER TABLE public.creencias_students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth all creencias" ON public.creencias_students FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_creencias_updated_at BEFORE UPDATE ON public.creencias_students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PRAYER GUIDES
CREATE TABLE public.prayer_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  verses TEXT[],
  period TEXT NOT NULL DEFAULT 'daily',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  pdf_url TEXT,
  pdf_name TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prayer_guides TO authenticated;
GRANT ALL ON public.prayer_guides TO service_role;
ALTER TABLE public.prayer_guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth all prayer_guides" ON public.prayer_guides FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_prayer_guides_updated_at BEFORE UPDATE ON public.prayer_guides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PRAYER HISTORY
CREATE TABLE public.prayer_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID REFERENCES public.prayer_guides(id) ON DELETE CASCADE,
  guide_title TEXT,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  member_name TEXT,
  action TEXT NOT NULL,
  action_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prayer_history TO authenticated;
GRANT ALL ON public.prayer_history TO service_role;
ALTER TABLE public.prayer_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth all prayer_history" ON public.prayer_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SUNDAY REPORTS
CREATE TABLE public.sunday_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE NOT NULL,
  attendance INTEGER,
  visitors INTEGER,
  conversions INTEGER,
  offerings NUMERIC(12,2),
  highlights TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sunday_reports TO authenticated;
GRANT ALL ON public.sunday_reports TO service_role;
ALTER TABLE public.sunday_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth all sunday_reports" ON public.sunday_reports FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_sunday_updated_at BEFORE UPDATE ON public.sunday_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SERVICE COMMENTS
CREATE TABLE public.service_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  reference_id UUID,
  reference_name TEXT,
  author_id UUID,
  author_name TEXT,
  content TEXT NOT NULL,
  comment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_highlighted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_comments TO authenticated;
GRANT ALL ON public.service_comments TO service_role;
ALTER TABLE public.service_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth all service_comments" ON public.service_comments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- REMINDERS
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'custom',
  target_date TIMESTAMPTZ NOT NULL,
  notify_at TIMESTAMPTZ NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_pattern TEXT,
  recipients TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminders TO authenticated;
GRANT ALL ON public.reminders TO service_role;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth all reminders" ON public.reminders FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CALENDAR ACTIVITIES
CREATE TABLE public.calendar_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  activity_date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  type TEXT,
  ministry_id UUID,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_pattern TEXT,
  notify_before INTEGER,
  color TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_activities TO authenticated;
GRANT ALL ON public.calendar_activities TO service_role;
ALTER TABLE public.calendar_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth all calendar" ON public.calendar_activities FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_cal_updated_at BEFORE UPDATE ON public.calendar_activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- LEADERS LIST (publicly readable)
CREATE TABLE public.leaders_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position INTEGER NOT NULL,
  name TEXT NOT NULL,
  category public.leader_category NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.leaders_list TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leaders_list TO authenticated;
GRANT ALL ON public.leaders_list TO service_role;
ALTER TABLE public.leaders_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read leaders" ON public.leaders_list FOR SELECT USING (true);
CREATE POLICY "Admins manage leaders" ON public.leaders_list FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pastor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pastor'));
CREATE TRIGGER trg_leaders_updated_at BEFORE UPDATE ON public.leaders_list FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SEED LEADERS
INSERT INTO public.leaders_list (position, name, category, phone) VALUES
  (1,'Silvio Alejandro Rodríguez Guevara','Adulto','52023805'),
  (2,'Vivian Judith Guerra de Rodríguez','Adulto','53607701'),
  (3,'David Alejandro Rodríguez','Joven Adulto','30506764'),
  (4,'Daniel Esteban Rodríguez Guerra','Joven','49772616'),
  (5,'Pastora Judith de Guerra','Adulto','30768196'),
  (6,'Rosa María Chub Sub','Joven Adulto','46145838'),
  (7,'Claudia Calderón Cruz','Adulto','42307077'),
  (8,'Carlos Adolfo Del Cid Arriaza','Adulto','30286853'),
  (9,'Cristy Reyes de Del Cid','Adulto','56279409'),
  (10,'Estefany Marisol Del Cid Reyes','Joven','35245980'),
  (11,'Cindy Azucena Del Cid Reyes','Joven','35245980'),
  (12,'Samuel Marroquín','Adulto','30132077'),
  (13,'Luzbina Victoria Salvador Morales (Vicky)','Adulto','57150979'),
  (14,'Eli Andrea Oscal Salvador','Joven','57864764'),
  (15,'Emili Daniela Oscal Salvador','Joven','33924383'),
  (16,'Kevin Hiran Piche Ambrosio','Adulto','42055054'),
  (17,'Wendy Karina Rodríguez de Piche','Adulto','42342249'),
  (18,'Magali Tello','Adulto','55505928'),
  (19,'Carlos Ivan López Tello','Adulto','58254102'),
  (20,'Ana Beatriz Estrada Guerrero de López','Adulto','47684612'),
  (21,'Danielle Ximena López Estrada','Joven','35091234'),
  (22,'Francisco Javier García Tezcucano','Adulto','30252127'),
  (23,'Alejandra Danielle Del Cid Tello de García','Adulto','55108525'),
  (24,'Pablo Antonio García Morales','Adulto','41499377'),
  (25,'Evelyn Macaria Alvarado Garrido de García','Adulto','55998342'),
  (26,'Paula José García Alvarado','Joven','42519166'),
  (27,'Allison Sofia García Alvarado','Joven','-'),
  (28,'Claudia Leonor Garcia Morales','Adulto','41003286'),
  (29,'Wilfred Renato Arce Morales','Adulto','39082273'),
  (30,'Deglyn Gálvez','Adulto','30518775'),
  (31,'Renata Arce Gálvez','Joven','48822432'),
  (32,'Angie Arce Gálvez','Joven','38435110'),
  (33,'Mercedes Morales Melgar','Adulto','59041567'),
  (34,'Esperanza Morales Melgar','Adulto','59771357'),
  (35,'Hugo Giovani Gálvez Castro','Adulto','38884174'),
  (36,'Bridgitte Estrada de Gálvez','Adulto','42150095'),
  (37,'Keneth Piche Ambrosio','Adulto','55357518'),
  (38,'Tita Sandoval de Piche','Adulto','41911524'),
  (39,'Wendy Deydania Piche Ambrosio','Adulto','55494951'),
  (40,'Olga Leticia Raqec de Rodríguez','Adulto','42916265'),
  (41,'Caroleyn Yamileth Rodríguez','Joven','50107279'),
  (42,'Wadson Gabriel Fernándes','Joven Adulto','51300977'),
  (43,'Ivette Castro de Trejo','Adulto','57046902'),
  (44,'Pamela Galiano Castro','Joven Adulto','57042808'),
  (45,'Jürgen Wöhlers','Joven Adulto','31116060'),
  (46,'Olga Chen','Joven','35720201'),
  (47,'Rubi Chen','Joven Adulto','30187742'),
  (48,'Flor Monroy','Adulto','44788767'),
  (49,'Mariale Trejo','Joven','54692469'),
  (50,'Daniel Chacón','Joven','58346480');
