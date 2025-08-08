import { useAuth } from "../hooks/useAuth";

export const useIsAdmin = () => {
  const { user } = useAuth();
  return user?.isAdmin || false;
};

export const isAdmin = (user: { isAdmin: boolean } | null) => {
  return user?.isAdmin || false;
};
