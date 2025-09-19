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
    <nav className="sticky top-0 z-50 w-full bg-blue-50 border-b border-blue-200">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-3 flex-shrink-0"
            aria-label="EcoDrip home"
          >
            <img
              src="/Logo.png"
              alt="EcoDrip logo"
              className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14"
            />
            <span className="text-lg sm:text-xl font-semibold text-gray-900">
              EcoDrip
            </span>
          </Link>

          {isAuthenticated && user && (
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-6 ml-4">
              <div className="hidden md:flex items-center gap-2.5 text-sm md:text-base font-semibold text-slate-800">
                <User size={18} className="text-blue-500" />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap">
                  Welcome, {user.firstName}
                </span>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <nav className="flex items-center gap-1 sm:gap-2">
                  <NavbarItem to="/dashboard" icon={LayoutDashboard}>
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="sm:hidden">Dash</span>
                  </NavbarItem>
                  <NavbarItem to="/maps/new" icon={Upload}>
                    <span className="hidden sm:inline">Upload Map</span>
                    <span className="sm:hidden">Upload</span>
                  </NavbarItem>
                </nav>
                <NavbarItem onClick={handleLogout} icon={LogOut} type="button">
                  <span className="hidden sm:inline">Logout</span>
                  <span className="sm:hidden sr-only">Logout</span>
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
