"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import GlobalAddModal from "@/components/layout/GlobalAddModal";
import FloatingActionButton from "@/components/layout/FloatingActionButton";
import AvatarWithDecoration from "@/components/profile/AvatarWithDecoration";
import AlertsManager from "@/components/layout/AlertsManager";
import { useGlobal } from "@/contexts/GlobalContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = ["/login", "/register"].includes(pathname);
    const { profileData, currentPeriod, setCurrentPeriod } = useGlobal();

    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    const handleMonthChange = (delta: number) => {
        let newMonth = currentPeriod.month + delta;
        let newYear = currentPeriod.year;

        if (newMonth > 11) { newMonth = 0; newYear++; }
        if (newMonth < 0) { newMonth = 11; newYear--; }

        setCurrentPeriod({ month: newMonth, year: newYear });
    };

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen overflow-x-hidden">
            <Sidebar />

            {/* Mobile Header with Profile Photo & Month Selector */}
            <div className="md:hidden flex items-center justify-between px-5 pt-4 pb-2 z-20 relative">
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

                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-2 py-1 backdrop-blur-md">
                    <button onClick={() => handleMonthChange(-1)} className="p-1 text-(--color-text-muted) hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <span className="text-xs font-semibold text-white tracking-wider uppercase min-w-[50px] text-center">
                        {monthNames[currentPeriod.month]}
                    </span>
                    <button onClick={() => handleMonthChange(1)} className="p-1 text-(--color-text-muted) hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    </button>
                </div>
            </div>

            <main className="flex-1 p-6 md:p-10 md:ml-64 overflow-x-hidden overflow-y-auto pb-24 md:pb-10 max-w-[100vw]">
                <div className="mx-auto max-w-6xl">
                    {children}
                </div>
            </main>
            <GlobalAddModal />
            <FloatingActionButton />
            <AlertsManager />
        </div>
    );
}
