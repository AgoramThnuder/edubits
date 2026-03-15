-- Create an RPC to safely allow users to delete their own accounts
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- We delete from auth.users where id matches the currently logged in user
  -- Any associated profile should be deleted via ON DELETE CASCADE setting or triggers.
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
