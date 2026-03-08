"use client";

import AvatarWithDecoration from "@/components/profile/AvatarWithDecoration";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    Wallet,
    LayoutDashboard,
    ArrowRightLeft,
    Target,
    Settings,
    Eye,
    EyeOff,
    ChevronLeft,
    ChevronRight,
    PieChart
} from "lucide-react";
import { useGlobal } from "@/contexts/GlobalContext";

export default function Sidebar() {
    const pathname = usePathname();
    const { isPrivacyMode, togglePrivacyMode, currentPeriod, setCurrentPeriod, profileData } = useGlobal();

    const menuItems = [
        { name: "Dashboard", icon: LayoutDashboard, href: "/" },
        { name: "Extrato", icon: ArrowRightLeft, href: "/history" },
        { name: "Metas", icon: Target, href: "/goals" },
        { name: "Orçamento", icon: PieChart, href: "/budget" },
        { name: "Ajustes", icon: Settings, href: "/settings" },
    ];

    const changeMonth = (delta: number) => {
        let newMonth = currentPeriod.month + delta;
        let newYear = currentPeriod.year;

        if (newMonth > 11) { newMonth = 0; newYear++; }
        if (newMonth < 0) { newMonth = 11; newYear--; }

        setCurrentPeriod({ month: newMonth, year: newYear });
    };

    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="fixed top-4 bottom-4 left-4 hidden md:flex flex-col w-64 h-[calc(100vh-2rem)] rounded-2xl p-6 border-r z-10 glass-panel overflow-hidden shadow-2xl">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-10">
                    <div className="p-2 bg-(--color-neon-green)/10 rounded-xl">
                        <Wallet className="text-(--color-neon-green-light) w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">Budgeting</span>
                </div>

                {/* Global Controls: Period & Privacy */}
                <div className="flex flex-col gap-3 mb-8 pb-8 border-b border-(--color-glass-border)">
                    <div className="flex items-center justify-between px-2 text-sm">
                        <button onClick={() => changeMonth(-1)} className="p-1 text-(--color-text-muted) hover:text-white transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="font-semibold text-white tracking-widest uppercase text-xs">
                            {monthNames[currentPeriod.month]} {currentPeriod.year}
                        </span>
                        <button onClick={() => changeMonth(1)} className="p-1 text-(--color-text-muted) hover:text-white transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={togglePrivacyMode}
                        className="flex items-center justify-center gap-3 px-4 py-2 mt-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors text-sm text-(--color-text-muted) hover:text-white"
                    >
                        {isPrivacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <span>{isPrivacyMode ? "Mostrar Valores" : "Ocultar Valores"}</span>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;

                        return (
                            <Link key={item.name} href={item.href}>
                                <div
                                    className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative group
                  ${isActive ? "text-white" : "text-(--color-text-muted) hover:text-white"}
                `}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-nav-bg-desktop"
                                            className="absolute inset-0 rounded-2xl"
                                            style={{
                                                background: "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.04) 100%)",
                                                border: "1px solid rgba(16,185,129,0.15)",
                                                boxShadow: "0 0 20px rgba(16,185,129,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
                                            }}
                                            initial={false}
                                            transition={{
                                                type: "spring",
                                                stiffness: 350,
                                                damping: 30,
                                                mass: 0.8,
                                            }}
                                        />
                                    )}

                                    <item.icon
                                        className={`w-5 h-5 z-10 transition-colors ${isActive ? "text-(--color-neon-green-light)" : "group-hover:text-(--color-neon-green-light)"
                                            }`}
                                    />

                                    <span className="z-10 font-medium text-sm">{item.name}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* User */}
                <div className="mt-auto">
                    <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-(--color-glass) border border-(--color-glass-border) hover:bg-(--color-glass-hover) transition-colors">
                        <AvatarWithDecoration size={32} />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">{profileData.name || "Minha Conta"}</span>
                            <span className="text-xs text-(--color-text-muted)">Configurações</span>
                        </div>
                    </Link>
                </div>
            </aside>

            {/* Mobile Bottom Navigation (Floating Pill) */}
            <div className="md:hidden fixed bottom-6 left-4 right-4 z-30 flex justify-center pointer-events-none">
                <nav className="pointer-events-auto rounded-[2rem] px-4 py-2 flex items-center justify-between w-full max-w-md backdrop-blur-2xl"
                    style={{
                        background: "linear-gradient(135deg, rgba(10,10,15,0.75) 0%, rgba(15,15,20,0.85) 100%)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                    }}
                >
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.name} href={item.href} className="flex-1 flex justify-center relative group">
                                <div className="flex flex-col items-center justify-center relative px-2 py-2">
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-nav-bg-mobile"
                                            className="absolute inset-0 rounded-xl"
                                            style={{
                                                background: "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)",
                                                border: "1px solid rgba(16,185,129,0.12)",
                                                boxShadow: "0 0 15px rgba(16,185,129,0.1), inset 0 1px 0 rgba(255,255,255,0.06)",
                                            }}
                                            initial={false}
                                            transition={{
                                                type: "spring",
                                                stiffness: 350,
                                                damping: 30,
                                                mass: 0.8,
                                            }}
                                        />
                                    )}
                                    <item.icon
                                        className={`w-6 h-6 mb-1 z-10 transition-all ${isActive ? "text-white" : "text-(--color-text-muted) group-hover:text-white/70"}`}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                    <span className={`text-[10px] z-10 font-medium ${isActive ? "text-white" : "text-(--color-text-muted)"}`}>
                                        {item.name}
                                    </span>
                                </div>
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </>
    );
}
