import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, X, ChevronsLeft, LogOut } from "lucide-react";
import { navigationItems } from "@/lib/navigation";
import type { NavigationItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Sidebar() {
    const { isSidebarOpen, toggleSidebar } = useSidebar();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [expandedItems, setExpandedItems] = useState<string[]>(["User Management", "Approvals"]);
    const location = useLocation();
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const toggleExpanded = (title: string) => {
        setExpandedItems((prev) =>
            prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
        );
    };

    const isActive = (href?: string) => {
        if (!href) return false;
        return location.pathname === href;
    };

    const isParentActive = (item: NavigationItem) => {
        if (item.href && isActive(item.href)) return true;
        if (item.children) {
            return item.children.some((child) => isActive(child.href));
        }
        return false;
    };

    const renderNavItem = (item: NavigationItem, depth = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.includes(item.title);
        const active = isParentActive(item);
        const Icon = item.icon;

        if (hasChildren) {
            return (
                <div key={item.title} className="space-y-1">
                    <button
                        onClick={() => toggleExpanded(item.title)}
                        className={cn(
                            "group w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                            active
                                ? "bg-teal-600 text-white shadow-md shadow-teal-900/20"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <Icon strokeWidth={1.5} className={cn("h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110", active ? "text-white" : "text-slate-400 group-hover:text-white")} />
                            {isSidebarOpen && <span>{item.title}</span>}
                        </div>
                        {isSidebarOpen && (
                            <ChevronDown
                                className={cn(
                                    "h-4 w-4 transition-transform duration-200 opacity-50",
                                    isExpanded && "rotate-180"
                                )}
                            />
                        )}
                    </button>

                    {/* Children */}
                    {isExpanded && isSidebarOpen && item.children && (
                        <div className="ml-3 mt-1 space-y-1 border-l border-slate-800 pl-3">
                            {item.children.map((child) => renderNavItem(child, depth + 1))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link
                key={item.title}
                to={item.href!}
                className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive(item.href)
                        ? "bg-teal-600 text-white shadow-md shadow-teal-900/20"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
            >
                <Icon strokeWidth={1.5} className={cn("h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110", isActive(item.href) ? "text-white" : "text-slate-400 group-hover:text-white")} />
                {isSidebarOpen && <span>{item.title}</span>}
            </Link>
        );
    };

    return (
        <>
            {/* Sidebar Toggle Button */}
            <Button
                variant="outline"
                size="icon"
                className="fixed top-4 left-4 z-50"
                onClick={() => {
                    if (isDesktop) {
                        toggleSidebar();
                    } else {
                        setIsMobileOpen(!isMobileOpen);
                    }
                }}
            >
                {isDesktop ? (
                    isSidebarOpen ? <ChevronsLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />
                ) : (
                    isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />
                )}
            </Button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-40 h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300",
                    isSidebarOpen ? "w-64" : "w-16",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                        {isSidebarOpen ? (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-900/20">
                                    <span className="text-white font-bold text-sm">AP</span>
                                </div>
                                <div>
                                    <h1 className="text-sm font-semibold text-white">Admin Panel</h1>
                                    <p className="text-xs text-slate-400">Enterprise</p>
                                </div>
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-teal-900/20">
                                <span className="text-white font-bold text-sm">AP</span>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                        {navigationItems.map((item) => renderNavItem(item))}
                    </nav>

                    {/* Footer */}
                    <div className="p-3 border-t border-slate-800">
                        {isSidebarOpen ? (
                            <div className="space-y-2">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4 mr-3" />
                                    Logout
                                </Button>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                                    <span className="text-xs text-slate-400">Online</span>
                                </div>
                                <div className="px-3 text-xs text-slate-500">v1.0.0</div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-slate-400 hover:text-white hover:bg-slate-800"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                                <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}