import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="sticky top-0 z-50 bg-blue-50 border-b border-blue-200">
      <div className="px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-3"
            aria-label="EcoDrip home"
          >
            <img
              src="/Logo.png"
              alt="EcoDrip logo"
              className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
            />
            <span className="text-lg sm:text-xl font-semibold text-gray-900">
              EcoDrip
            </span>
          </Link>

          {isAuthenticated && user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.firstName} {user.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
