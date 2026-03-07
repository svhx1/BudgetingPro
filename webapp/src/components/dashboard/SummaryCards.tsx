"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, DollarSign } from "lucide-react";
import { useGlobal } from "@/contexts/GlobalContext";
import { getDashboardSummary } from "@/actions/dashboard";

export default function SummaryCards() {
    const { isPrivacyMode, currentPeriod, refreshTrigger } = useGlobal();

    const [summary, setSummary] = useState({ incomes: 0, expenses: 0, balance: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadSummary() {
            setLoading(true);
            const response = await getDashboardSummary(currentPeriod.month, currentPeriod.year);
            if (response.success && response.data) {
                setSummary({
                    incomes: response.data.incomes,
                    expenses: response.data.expenses,
                    balance: response.data.balance,
                });
            }
            setLoading(false);
        }

        loadSummary();
    }, [currentPeriod.month, currentPeriod.year, refreshTrigger]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const container: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const item: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-4 mb-8"
        >
            {/* Balance - Prominent & Centered */}
            <motion.div
                variants={item}
                className="glass-panel p-6 md:p-8 flex flex-col items-center justify-center text-center relative group cursor-default"
            >
                <span className="text-sm font-medium text-(--color-text-muted) mb-2">Saldo Disponível</span>
                {loading ? (
                    <div className="h-10 w-40 bg-white/5 rounded-lg animate-pulse" />
                ) : (
                    <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight animate-in fade-in duration-500 ${summary.balance < 0 && !isPrivacyMode ? 'text-red-400' : 'text-white'}`}>
                        {isPrivacyMode ? "R$ ••••" : formatCurrency(summary.balance)}
                    </h2>
                )}
                <div className="flex items-center gap-2 mt-2">
                    <DollarSign className={`w-4 h-4 ${summary.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                    <span className="text-xs text-(--color-text-muted)">
                        {summary.balance >= 0 ? "Você está no positivo" : "Atenção: saldo negativo"}
                    </span>
                </div>
                <div
                    className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-[800ms] pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${summary.balance >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'} 0%, transparent 70%)` }}
                />
            </motion.div>

            {/* Income & Expenses Side by Side */}
            <div className="grid grid-cols-2 gap-4">
                <motion.div
                    variants={item}
                    whileHover={{ y: -3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="glass-panel p-5 flex flex-col relative group cursor-default hover:border-emerald-500/20"
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-(--color-text-muted) uppercase tracking-wider">Entradas</span>
                        <div className="p-1.5 rounded-lg bg-emerald-500/10">
                            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                    {loading ? (
                        <div className="h-8 w-24 bg-white/5 rounded-lg animate-pulse" />
                    ) : (
                        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white animate-in fade-in duration-500">
                            {isPrivacyMode ? "R$ ••••" : formatCurrency(summary.incomes)}
                        </h3>
                    )}
                    <div
                        className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-[800ms] pointer-events-none"
                        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)" }}
                    />
                </motion.div>

                <motion.div
                    variants={item}
                    whileHover={{ y: -3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="glass-panel p-5 flex flex-col relative group cursor-default hover:border-red-500/20"
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-(--color-text-muted) uppercase tracking-wider">Saídas</span>
                        <div className="p-1.5 rounded-lg bg-red-500/10">
                            <ArrowDownRight className="w-4 h-4 text-red-400" />
                        </div>
                    </div>
                    {loading ? (
                        <div className="h-8 w-24 bg-white/5 rounded-lg animate-pulse" />
                    ) : (
                        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white animate-in fade-in duration-500">
                            {isPrivacyMode ? "R$ ••••" : formatCurrency(summary.expenses)}
                        </h3>
                    )}
                    <div
                        className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-[800ms] pointer-events-none"
                        style={{ background: "radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)" }}
                    />
                </motion.div>
            </div>
        </motion.div>
    );
}
