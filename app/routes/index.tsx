import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';

export const meta = () => ([
  { title: 'ResumeBuddy | Redirecting to Sign In' },
]);

export default function IndexRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Preserve any existing search params, but default to /auth
    // If someone hits "/" directly and is already signed in, the /auth route
    // will handle redirecting them onwards to /home when appropriate.
    const search = location.search || '';
    navigate(`/auth${search}`, { replace: true });
  }, [navigate, location.search]);

  return null;
}
