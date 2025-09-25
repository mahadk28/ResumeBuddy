import { Link } from 'react-router';

const Navbar = () => {
  return (
    <div>
      <nav className="navbar">
        <Link to="/">
          <p className="text-2xl font-bold text-gradient">RM</p>
        </Link>

        <div className="flex items-center gap-3" />
      </nav>

    </div>
  );
};

export default Navbar;