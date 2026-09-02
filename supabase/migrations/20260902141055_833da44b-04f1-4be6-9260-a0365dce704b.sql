
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_trip() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_energy() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trip_role(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_trip_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_edit_trip(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_trip_owner(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.trip_role(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_trip_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_edit_trip(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_trip_owner(uuid, uuid) TO authenticated;
