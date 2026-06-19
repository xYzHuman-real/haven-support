import { Link } from "@tanstack/react-router";
import { Home, Users, Heart, User } from "lucide-react";

const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/circles", label: "Circles", icon: Users },
  { to: "/encourage", label: "Encourage", icon: Heart },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function TabBar() {
  return (
    <nav className="absolute bottom-0 inset-x-0 h-20 bg-white/85 backdrop-blur-lg border-t border-sage-100 flex items-center justify-around px-2 pb-3 z-30">
      {tabs.map(({ to, label, icon: Icon }) => (
        <Link key={to} to={to} className="flex flex-col items-center gap-1 px-3">
          {({ isActive }) => (
            <>
              <div
                className={
                  isActive
                    ? "size-7 rounded-full bg-sage-600/10 flex items-center justify-center text-sage-600"
                    : "size-7 flex items-center justify-center text-sage-400"
                }
              >
                <Icon className="size-4" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={
                  isActive
                    ? "text-[10px] font-semibold text-sage-600"
                    : "text-[10px] font-medium text-sage-400"
                }
              >
                {label}
              </span>
            </>
          )}
        </Link>
      ))}
    </nav>
  );
}
