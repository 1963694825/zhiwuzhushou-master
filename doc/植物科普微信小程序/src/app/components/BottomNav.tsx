import { NavLink } from "react-router";
import { Home, ShoppingCart, Book, User } from "lucide-react";

export function BottomNav() {
  const navItems = [
    { path: "/", label: "首页", icon: Home },
    { path: "/shop", label: "商城", icon: ShoppingCart },
    { path: "/knowledge", label: "种植知识", icon: Book },
    { path: "/profile", label: "个人中心", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? "text-green-600" : "text-gray-500"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-6 h-6 ${isActive ? "text-green-600" : "text-gray-500"}`} />
                <span className="text-xs mt-1">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
