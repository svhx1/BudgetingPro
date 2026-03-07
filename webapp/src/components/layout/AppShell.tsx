"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import GlobalAddModal from "@/components/layout/GlobalAddModal";
import FloatingActionButton from "@/components/layout/FloatingActionButton";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = ["/login", "/register", "/verify"].includes(pathname);

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            <Sidebar />
            <main className="flex-1 p-6 md:p-10 overflow-auto pb-24 md:pb-10">
                <div className="mx-auto max-w-6xl">
                    {children}
                </div>
            </main>
            <GlobalAddModal />
            <FloatingActionButton />
        </div>
    );
}
