"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, DollarSign, CreditCard, X, Coffee, Layers } from "lucide-react";
import { useGlobal } from "@/contexts/GlobalContext";
import { getDashboardSummary } from "@/actions/dashboard";
import { useCachedData } from "@/hooks/useCachedData";
import { AnimatePresence } from "framer-motion";

export default function SummaryCards() {
    const { isPrivacyMode, currentPeriod, refreshTrigger } = useGlobal();

    const { data: summaryData, loading } = useCachedData(
        `dashboard-summary-${currentPeriod.year}-${currentPeriod.month}`,
        async () => {
            const response = await getDashboardSummary(currentPeriod.month, currentPeriod.year);
            if (response.success && response.data) {
                return {
                    success: true,
                    data: {
                        incomes: response.data.incomes,
                        expenses: response.data.expenses,
                        balance: response.data.balance,
                        creditUsed: response.data.creditUsed || 0,
                        monthBalance: response.data.monthBalance || 0,
                        transactions: response.data.transactions || [],
                    }
                };
            }
            return { success: false };
        },
        [currentPeriod.month, currentPeriod.year, refreshTrigger]
    );

    const summary = summaryData || { incomes: 0, expenses: 0, balance: 0, creditUsed: 0, monthBalance: 0, transactions: [] };
    const transactions = summaryData?.transactions || [];

    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"INCOME" | "EXPENSE">("INCOME");

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const handleOpenModal = (type: "INCOME" | "EXPENSE") => {
        if (!transactions.length) return;
        setModalType(type);
        setModalOpen(true);
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
            className="flex flex-col gap-4 w-full h-full"
        >
            {/* Balance - Prominent & Centered */}
            <motion.div
                variants={item}
                className="glass-panel p-6 flex flex-col items-center justify-center text-center relative group cursor-default h-full"
            >
                <span className="text-sm font-medium text-(--color-text-muted) mb-2">Saldo Disponível</span>
                {loading ? (
                    <div className="h-10 w-40 bg-(--color-text-main)/5 rounded-lg animate-pulse" />
                ) : (
                    <h2 className={`text-3xl font-extrabold tracking-tight animate-in fade-in duration-500 ${summary.balance < 0 && !isPrivacyMode ? 'text-red-400' : 'text-(--color-text-main)'}`}>
                        {isPrivacyMode ? "R$ ••••" : formatCurrency(summary.balance)}
                    </h2>
                )}

                <div
                    className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-[800ms] pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${summary.balance >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'} 0%, transparent 70%)` }}
                />
            </motion.div>

            {/* Incomes Container */}
            <motion.div
                variants={item}
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => handleOpenModal("INCOME")}
                className="glass-panel p-6 flex flex-col relative group cursor-pointer hover:border-emerald-500/20 h-full justify-center"
            >
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-(--color-text-muted) uppercase tracking-wider">Entradas</span>
                    <div className="p-1.5 rounded-lg bg-emerald-500/10">
                        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                    </div>
                </div>
                {loading ? (
                    <div className="h-8 w-24 bg-(--color-text-main)/5 rounded-lg animate-pulse" />
                ) : (
                    <h3 className="text-2xl font-bold tracking-tight text-(--color-text-main) animate-in fade-in duration-500">
                        {isPrivacyMode ? "R$ ••••" : formatCurrency(summary.incomes)}
                    </h3>
                )}
            </motion.div>

            {/* Expenses Container */}
            <motion.div
                variants={item}
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => handleOpenModal("EXPENSE")}
                className="glass-panel p-6 flex flex-col relative group cursor-pointer hover:border-red-500/20 h-full justify-center"
            >
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-(--color-text-muted) uppercase tracking-wider">Saídas</span>
                    <div className="p-1.5 rounded-lg bg-red-500/10">
                        <ArrowDownRight className="w-4 h-4 text-red-400" />
                    </div>
                </div>
                {loading ? (
                    <div className="h-8 w-24 bg-(--color-text-main)/5 rounded-lg animate-pulse mb-6" />
                ) : (
                    <div className="flex flex-col gap-3">
                        <h3 className="text-2xl font-bold tracking-tight text-(--color-text-main) animate-in fade-in duration-500">
                            {isPrivacyMode ? "R$ ••••" : formatCurrency(summary.expenses)}
                        </h3>

                        {/* Breakdown Debit/Credit Simplificado */}
                        <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium text-(--color-text-muted)">D: {isPrivacyMode ? "••••" : formatCurrency(summary.expenses - summary.creditUsed)}</span>
                            <span className="font-medium text-purple-400">C: {isPrivacyMode ? "••••" : formatCurrency(summary.creditUsed)}</span>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Modal de Transações (Interatividade no Dashboard) */}
            <AnimatePresence>
                {modalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
                            onClick={() => setModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="fixed z-[70] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-[var(--color-base-bg)] border border-[var(--color-text-main)]/10 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[80vh]"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold flex items-center gap-2 text-(--color-text-main)">
                                    {modalType === "INCOME" ? (
                                        <><ArrowUpRight className="w-5 h-5 text-emerald-400" /> Entradas do Mês</>
                                    ) : (
                                        <><ArrowDownRight className="w-5 h-5 text-red-400" /> Saídas do Mês</>
                                    )}
                                </h3>
                                <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl hover:bg-(--color-text-main)/5 text-(--color-text-muted) transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
                                {transactions.filter((tx: any) => tx.type === modalType).length === 0 ? (
                                    <div className="py-10 flex flex-col items-center justify-center text-center opacity-60">
                                        <Coffee className="w-12 h-12 mb-3 text-(--color-text-muted)" />
                                        <p className="text-sm">Nenhum lançamento fechado deste mês consta aqui ainda.</p>
                                    </div>
                                ) : (
                                    transactions.filter((tx: any) => tx.type === modalType).map((tx: any) => (
                                        <div key={tx.id} className="p-4 rounded-2xl bg-(--color-text-main)/5 border border-(--color-text-main)/5 flex flex-col gap-2">
                                            <div className="flex justify-between items-start gap-2">
                                                <span className="font-semibold text-(--color-text-main) break-words text-sm">{tx.description || "Sem descrição"}</span>
                                                <span className={`font-bold shrink-0 text-right ${modalType === "INCOME" ? "text-emerald-400" : "text-red-400"}`}>
                                                    {isPrivacyMode ? "R$ ••••" : `${modalType === "INCOME" ? '+' : '-'} R$ ${Math.abs(tx.amount).toFixed(2).replace('.', ',')}`}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-(--color-text-muted)">
                                                <span>{new Date(tx.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                                                <span>•</span>
                                                <span className="px-2 py-0.5 rounded-md bg-(--color-text-main)/5 border border-(--color-text-main)/10">
                                                    {tx.category?.name || "Sem Categ"}
                                                </span>
                                                {tx.installment && (
                                                    <span className="flex items-center gap-1 font-bold">
                                                        <Layers className="w-3 h-3" /> {tx.installment}
                                                    </span>
                                                )}
                                                {tx.paymentMethod === "CREDIT" && (
                                                    <span className="text-fuchsia-500 font-bold uppercase tracking-wider text-[10px]">Crédito</span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
