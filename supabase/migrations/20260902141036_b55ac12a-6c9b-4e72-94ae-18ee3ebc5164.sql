
-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_auth" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- enums
CREATE TYPE public.trip_status AS ENUM ('planning','active','completed');
CREATE TYPE public.distance_unit AS ENUM ('km','mi');
CREATE TYPE public.member_role AS ENUM ('owner','contributor','cheerleader','viewer');
CREATE TYPE public.member_status AS ENUM ('invited','active','removed');

-- trips
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status public.trip_status NOT NULL DEFAULT 'planning',
  currency TEXT NOT NULL DEFAULT 'USD',
  distance_unit public.distance_unit NOT NULL DEFAULT 'km',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trips TO authenticated;
GRANT ALL ON public.trips TO service_role;

-- trip members
CREATE TABLE public.trip_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  invite_email TEXT,
  role public.member_role NOT NULL DEFAULT 'viewer',
  status public.member_status NOT NULL DEFAULT 'invited',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (trip_id, user_id)
);
CREATE INDEX trip_members_trip_idx ON public.trip_members (trip_id);
CREATE INDEX trip_members_user_idx ON public.trip_members (user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trip_members TO authenticated;
GRANT ALL ON public.trip_members TO service_role;

-- role helpers
CREATE OR REPLACE FUNCTION public.trip_role(_trip_id UUID, _user_id UUID)
RETURNS public.member_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.trip_members
  WHERE trip_id = _trip_id AND user_id = _user_id AND status = 'active'
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_trip_member(_trip_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.trip_role(_trip_id, _user_id) IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.can_edit_trip(_trip_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.trip_role(_trip_id, _user_id) IN ('owner','contributor');
$$;

CREATE OR REPLACE FUNCTION public.is_trip_owner(_trip_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.trip_role(_trip_id, _user_id) = 'owner';
$$;

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trips_select_members" ON public.trips FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_trip_member(id, auth.uid()));
CREATE POLICY "trips_insert_own" ON public.trips FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "trips_update_owner" ON public.trips FOR UPDATE TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "trips_delete_owner" ON public.trips FOR DELETE TO authenticated USING (owner_id = auth.uid());

ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members_select" ON public.trip_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_trip_member(trip_id, auth.uid()));
CREATE POLICY "members_insert_owner" ON public.trip_members FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.owner_id = auth.uid()));
CREATE POLICY "members_update_owner" ON public.trip_members FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.owner_id = auth.uid()) OR user_id = auth.uid())
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.owner_id = auth.uid()) OR user_id = auth.uid());
CREATE POLICY "members_delete_owner" ON public.trip_members FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.owner_id = auth.uid()));

-- auto-add owner as active member
CREATE OR REPLACE FUNCTION public.handle_new_trip()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.trip_members (trip_id, user_id, role, status)
  VALUES (NEW.id, NEW.owner_id, 'owner', 'active')
  ON CONFLICT (trip_id, user_id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_trip_created AFTER INSERT ON public.trips
FOR EACH ROW EXECUTE FUNCTION public.handle_new_trip();

-- destinations
CREATE TABLE public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  address TEXT,
  distance_km NUMERIC(8,2),
  planned_arrival TIMESTAMPTZ,
  notes TEXT,
  created_by UUID NOT NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX destinations_trip_idx ON public.destinations (trip_id, position);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.destinations TO authenticated;
GRANT ALL ON public.destinations TO service_role;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "destinations_select_members" ON public.destinations FOR SELECT TO authenticated
  USING (public.is_trip_member(trip_id, auth.uid()));
CREATE POLICY "destinations_write_editors" ON public.destinations FOR ALL TO authenticated
  USING (public.can_edit_trip(trip_id, auth.uid())) WITH CHECK (public.can_edit_trip(trip_id, auth.uid()));

-- supplies (editors only, even for reads)
CREATE TABLE public.supplies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  packed BOOLEAN NOT NULL DEFAULT false,
  owner_note TEXT,
  created_by UUID NOT NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX supplies_trip_idx ON public.supplies (trip_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplies TO authenticated;
GRANT ALL ON public.supplies TO service_role;
ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "supplies_editors_only" ON public.supplies FOR ALL TO authenticated
  USING (public.can_edit_trip(trip_id, auth.uid())) WITH CHECK (public.can_edit_trip(trip_id, auth.uid()));

-- lodging (editors only)
CREATE TABLE public.lodging (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips ON DELETE CASCADE,
  destination_id UUID REFERENCES public.destinations ON DELETE SET NULL,
  name TEXT NOT NULL,
  check_in DATE,
  check_out DATE,
  cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  booking_ref TEXT,
  created_by UUID NOT NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX lodging_trip_idx ON public.lodging (trip_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lodging TO authenticated;
GRANT ALL ON public.lodging TO service_role;
ALTER TABLE public.lodging ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lodging_editors_only" ON public.lodging FOR ALL TO authenticated
  USING (public.can_edit_trip(trip_id, auth.uid())) WITH CHECK (public.can_edit_trip(trip_id, auth.uid()));

-- check-ins
CREATE TABLE public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips ON DELETE CASCADE,
  destination_id UUID REFERENCES public.destinations ON DELETE SET NULL,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  arrived_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  energy_level SMALLINT NOT NULL,
  mood_note TEXT,
  distance_km NUMERIC(8,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX check_ins_trip_idx ON public.check_ins (trip_id, arrived_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.check_ins TO authenticated;
GRANT ALL ON public.check_ins TO service_role;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "check_ins_select_members" ON public.check_ins FOR SELECT TO authenticated
  USING (public.is_trip_member(trip_id, auth.uid()));
CREATE POLICY "check_ins_insert_own" ON public.check_ins FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.can_edit_trip(trip_id, auth.uid()));
CREATE POLICY "check_ins_update_own" ON public.check_ins FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "check_ins_delete_own" ON public.check_ins FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_trip_owner(trip_id, auth.uid()));

CREATE OR REPLACE FUNCTION public.validate_energy()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.energy_level < 1 OR NEW.energy_level > 10 THEN
    RAISE EXCEPTION 'energy_level must be between 1 and 10';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER check_ins_validate_energy BEFORE INSERT OR UPDATE ON public.check_ins
FOR EACH ROW EXECUTE FUNCTION public.validate_energy();
