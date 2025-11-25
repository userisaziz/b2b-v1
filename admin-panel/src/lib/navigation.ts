import { LayoutDashboard, Users, UserCircle, ShoppingBag, CheckCircle, ListTree, Package, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavigationItem {
    title: string;
    href?: string;
    icon: LucideIcon;
    children?: NavigationItem[];
}

export const navigationItems: NavigationItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "User Management",
        href: "/users",
        icon: Users,
    },
    {
        title: "Categories",
        href: "/categories",
        icon: ListTree,
    },
    {
        title: "Products",
        href: "/products",
        icon: Package,
    },
    {
        title: "RFQs",
        href: "/rfqs",
        icon: FileText,
    },
    {
        title: "Approvals",
        icon: CheckCircle,
        children: [
            {
                title: "Seller Approvals",
                href: "/approvals/sellers",
                icon: ShoppingBag,
            },
            {
                title: "Category Approvals",
                href: "/approvals/categories",
                icon: ListTree,
            },
            {
                title: "Product Approvals",
                href: "/approvals/products",
                icon: Package,
            },
        ],
    },
];