import { Outlet } from "react-router-dom";

export default function AuthLayout() {
    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
            <div className="hidden bg-muted lg:block">
                <div className="flex h-full flex-col justify-between bg-zinc-900 p-10 text-white dark:border-r">
                    <div className="flex items-center text-lg font-medium">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2 h-6 w-6"
                        >
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        Seller Central
                    </div>
                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2">
                            <p className="text-lg">
                                &ldquo;Grow your business with our powerful seller tools.&rdquo;
                            </p>
                            <footer className="text-sm">Seller Team</footer>
                        </blockquote>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center py-12">
                <div className="mx-auto grid w-[350px] gap-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
