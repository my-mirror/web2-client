import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthTwa } from '~/shared/services/authTwa';

export const ProtectedLayout = () => {
  const auth = useAuthTwa();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    void auth.mutateAsync().finally(() => {
      setIsInitialLoad(false);
    });
  }, []);

  if (isInitialLoad || auth.isLoading) {
    return null;
  }

  return <Outlet />;
};