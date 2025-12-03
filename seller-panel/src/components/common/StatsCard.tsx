"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideProps } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: React.ComponentType<LucideProps>;
    trend?: {
        value: number;
        label: string;
        positive?: boolean;
    };
    className?: string;
    iconColor?: "blue" | "emerald" | "amber" | "purple" | "orange" | "red" | "default";
}

export function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className,
    iconColor = "default"
}: StatsCardProps) {

    const colorStyles = {
        default: "text-gray-600 bg-gray-100",
        blue: "text-blue-600 bg-blue-100",
        emerald: "text-emerald-600 bg-emerald-100",
        amber: "text-amber-600 bg-amber-100",
        purple: "text-purple-600 bg-purple-100",
        orange: "text-orange-600 bg-orange-100",
        red: "text-red-600 bg-red-100",
    };

    return (
        <Card className={cn("shadow-sm hover:shadow-md transition-shadow duration-200", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className={cn("p-2 rounded-full", colorStyles[iconColor])}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(description || trend) && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        {trend && (
                            <span className={cn(
                                "font-medium",
                                trend.positive ? "text-emerald-600" : "text-red-600"
                            )}>
                                {trend.positive ? "+" : ""}{trend.value}%
                            </span>
                        )}
                        <span>{description || trend?.label}</span>
                    </p>
                )}
            </CardContent>
        </Card>
    );
}