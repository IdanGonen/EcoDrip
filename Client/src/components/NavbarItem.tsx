import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

interface NavbarItemProps {
  to?: string;
  onClick?: () => void;
  icon: LucideIcon;
  children: React.ReactNode;
  type?: "link" | "button";
}

function NavbarItem({
  to,
  onClick,
  icon: Icon,
  children,
  type = "link",
}: NavbarItemProps) {
  const className = "group flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out text-slate-700 bg-white/60 backdrop-blur-sm border border-slate-200/50 hover:text-slate-900 hover:bg-white hover:border-slate-300 hover:shadow-md hover:scale-105 active:scale-95";

  if (type === "button") {
    return (
      <button onClick={onClick} className={`${className} cursor-pointer`}>
        <Icon size={18} className="transition-transform duration-200 group-hover:scale-110" />
        {children}
      </button>
    );
  }

  return (
    <Link to={to!} className={className}>
      <Icon size={16} />
      {children}
    </Link>
  );
}

export default NavbarItem;
