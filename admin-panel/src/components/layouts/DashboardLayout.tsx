import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useSidebar } from "@/contexts/SidebarContext";

export default function DashboardLayout() {
    const { isSidebarOpen } = useSidebar();

    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <main className={`transition-all duration-300 ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'} pl-0`}>
                <div className="p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}