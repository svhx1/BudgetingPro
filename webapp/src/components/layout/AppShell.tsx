"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import GlobalAddModal from "@/components/layout/GlobalAddModal";
import FloatingActionButton from "@/components/layout/FloatingActionButton";
import AvatarWithDecoration from "@/components/profile/AvatarWithDecoration";
import { useGlobal } from "@/contexts/GlobalContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = ["/login", "/register"].includes(pathname);
    const { profileData } = useGlobal();

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen overflow-x-hidden">
            <Sidebar />

            {/* Mobile Header with Profile Photo */}
            <div className="md:hidden flex items-center justify-between px-5 pt-4 pb-2">
                <Link href="/settings" className="flex items-center gap-3">
                    <AvatarWithDecoration size={40} />
                    <div className="flex flex-col">
                        <span className="text-white text-sm font-semibold leading-tight">
                            {profileData.name || "Minha Conta"}
                        </span>
                        <span className="text-(--color-text-muted) text-xs leading-tight">
                            {profileData.email || ""}
                        </span>
                    </div>
                </Link>
            </div>

            <main className="flex-1 p-6 md:p-10 md:ml-64 overflow-x-hidden overflow-y-auto pb-24 md:pb-10 max-w-[100vw]">
                <div className="mx-auto max-w-6xl">
                    {children}
                </div>
            </main>
            <GlobalAddModal />
            <FloatingActionButton />
        </div>
    );
}
