"use client";

import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { Category } from "@/lib/storefront";
import { cn } from "@/lib/utils";

interface CategoryGridProps {
    categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
    // Take top 10 categories for the grid
    const displayCategories = categories.slice(0, 10);

    // Helper to determine grid span classes based on index
    const getGridClasses = (index: number) => {
        switch (index) {
            case 0:
                return "md:col-span-2 md:row-span-2"; // Large square
            case 1:
                return "md:col-span-1 md:row-span-2"; // Tall vertical
            case 4:
                return "md:col-span-2 md:row-span-1"; // Wide horizontal
            default:
                return "md:col-span-1 md:row-span-1"; // Standard square
        }
    };

    // Helper for background gradients
    const getGradient = (index: number) => {
        const gradients = [
            "from-blue-600 to-indigo-700",
            "from-purple-600 to-pink-700",
            "from-emerald-500 to-teal-700",
            "from-orange-500 to-red-600",
            "from-cyan-500 to-blue-600",
            "from-rose-500 to-orange-600",
            "from-violet-600 to-purple-700",
            "from-amber-500 to-orange-600",
        ];
        return gradients[index % gradients.length];
    };

    return (
        <section className="py-16 bg-white">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Explore Categories</h2>
                        <p className="text-slate-500 mt-2">Sourcing solutions for every industry</p>
                    </div>
                    <Link
                        href="/categories"
                        className="hidden sm:flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors group"
                    >
                        View All Categories
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
                    {displayCategories.map((category, index) => (
                        <Link
                            key={category._id}
                            href={`/categories/${category._id}`}
                            className={cn(
                                "group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl",
                                getGridClasses(index)
                            )}
                        >
                            {/* Background Image/Gradient */}
                            <div className="absolute inset-0 bg-slate-100">
                                {category.image ? (
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className={cn(
                                        "w-full h-full bg-gradient-to-br opacity-80 transition-opacity group-hover:opacity-100",
                                        getGradient(index)
                                    )} />
                                )}
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />
                            </div>

                            {/* Content */}
                            <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                                        <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                                            {category.productCount ? `${category.productCount}+ Items` : 'Featured'}
                                        </span>
                                    </div>
                                    <h3 className={cn(
                                        "font-bold leading-tight mb-1",
                                        index === 0 ? "text-3xl" : "text-xl"
                                    )}>
                                        {category.name}
                                    </h3>
                                    <div className="h-0 group-hover:h-6 overflow-hidden transition-all duration-300">
                                        <span className="text-sm text-white/80 flex items-center gap-1 mt-2">
                                            Browse Collection <ArrowRight className="h-3 w-3" />
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Icon (only for non-image placeholders) */}
                            {!category.image && (
                                <div className="absolute top-4 right-4 text-white/20 group-hover:text-white/40 transition-colors">
                                    <Package className={cn(
                                        index === 0 ? "h-24 w-24" : "h-12 w-12"
                                    )} />
                                </div>
                            )}
                        </Link>
                    ))}
                </div>

                <div className="mt-8 text-center sm:hidden">
                    <Link
                        href="/categories"
                        className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                    >
                        View All Categories
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
