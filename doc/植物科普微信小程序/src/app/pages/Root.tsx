import { Outlet } from "react-router";
import { BottomNav } from "@/app/components/BottomNav";

export default function Root() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Outlet />
      <BottomNav />
    </div>
  );
}
