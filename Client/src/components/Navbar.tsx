import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LayoutDashboard, Upload, LogOut, User } from "lucide-react";
import NavbarItem from "./NavbarItem";

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
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2.5 text-base font-semibold text-slate-800">
                <User size={18} className="text-blue-500" />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Welcome, {user.firstName} {user.lastName}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <nav className="flex items-center gap-2">
                  <NavbarItem to="/dashboard" icon={LayoutDashboard}>
                    Dashboard
                  </NavbarItem>
                  <NavbarItem to="/maps/new" icon={Upload}>
                    Upload Map
                  </NavbarItem>
                </nav>
                <NavbarItem onClick={handleLogout} icon={LogOut} type="button">
                  Logout
                </NavbarItem>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
