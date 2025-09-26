import { Link, useNavigate } from 'react-router';
import { usePuterStore } from '~/lib/puter';

const Navbar = () => {
  const { auth, isLoading } = usePuterStore();
  const navigate = useNavigate();

  return (
    <div>
      <nav className="navbar">
        <Link to="/">
          <p className="text-2xl font-bold text-gradient">RM</p>
        </Link>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <span className="text-sm text-gray-500">Loading…</span>
          ) : auth.isAuthenticated ? (
            <button
              onClick={async () => {
                await auth.signOut();
                navigate('/');
              }}
              className="px-4 py-2 rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
            >
              Sign Out
            </button>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-2 rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

    </div>
  );
};

export default Navbar;