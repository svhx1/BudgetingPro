"use client";

import { useGlobal } from "@/contexts/GlobalContext";
import { useCachedData } from "@/hooks/useCachedData";
import { getRecurringData } from "@/actions/recurring";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightLeft, CreditCard, RotateCw, AlertTriangle } from "lucide-react";

export default function RecurringView() {
    const { isPrivacyMode, currentPeriod, refreshTrigger } = useGlobal();

    const { data: recurringData, loading } = useCachedData(
        `recurring-extrato-${currentPeriod.year}-${currentPeriod.month}`,
        async () => {
            const res = await getRecurringData(currentPeriod.month, currentPeriod.year);
            // Corrige o bug de parse da prop date (Transforma string ISO vinda da Server Action em Obj Date)
            if (res.success && res.data) {
                res.data.recurringTransactions = res.data.recurringTransactions.map((tx: any) => ({
                    ...tx,
                    date: new Date(tx.date)
                }));
            }
            return res.success && res.data ? { success: true, data: res.data } : { success: false };
        },
        [currentPeriod.month, currentPeriod.year, refreshTrigger]
    );

    const summary = recurringData || { totalRecurring: 0, totalIncome: 0, percentageOfIncome: 0, recurringTransactions: [] };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (date: Date) => {
        const d = date; // 'date' is already a Date object from the mapping above
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Extracting only DD/MM/YYYY for comparison
        const dString = d.toISOString().split("T")[0];
        const todayString = today.toISOString().split("T")[0];
        const yesterdayString = yesterday.toISOString().split("T")[0];

        if (dString === todayString) return "Hoje";
        if (dString === yesterdayString) return "Ontem";

        return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
    };

    // Colorir o card percentual com base num alarme de estresse orçamentário (> 30% das Receitas é arriscado para Fixos visando Regra 50/30/20)
    const getStressColor = (pct: number) => {
        if (pct > 50) return "text-red-500 bg-red-500/10 border-red-500/20";
        if (pct > 30) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <RotateCw className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-(--color-text-main)">Custos Recorrentes</h1>
                    <p className="text-sm font-medium text-(--color-text-muted)">Assinaturas e parcelamentos do mês</p>
                </div>
            </div>

            {/* Top Supercard: Somatória & SLA de Representatividade */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative"
            >
                <div className="flex flex-col z-10">
                    <span className="text-sm font-bold tracking-wider text-(--color-text-muted) uppercase mb-1 drop-shadow-sm">Soma dos Compromissos</span>
                    {loading ? (
                        <div className="h-10 w-48 bg-(--color-text-main)/5 rounded-lg animate-pulse" />
                    ) : (
                        <h2 className="text-4xl sm:text-5xl font-extrabold text-(--color-text-main) tracking-tighter">
                            {isPrivacyMode ? "R$ ••••" : formatCurrency(summary.totalRecurring)}
                        </h2>
                    )}
                </div>

                {/* Card de Impacto Percentual frente às Receitas */}
                <div className="flex flex-col z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-(--color-text-muted)">Impacto na Renda</span>
                        <div className="relative group/help">
                            <AlertTriangle className="w-3.5 h-3.5 text-(--color-text-muted) cursor-help" />
                            <div className="absolute right-0 top-6 w-56 p-2 rounded-lg bg-(--color-base-bg) border border-(--color-text-main)/10 opacity-0 group-hover/help:opacity-100 transition-opacity pointer-events-none text-xs text-(--color-text-muted) shadow-xl z-20">
                                Porcentagem que estes custos imutáveis consomem das suas ENTRADAS somadas neste mês.
                            </div>
                        </div>
                    </div>
                    {loading ? (
                        <div className="h-12 w-32 bg-(--color-text-main)/5 rounded-lg animate-pulse" />
                    ) : (
                        <div className={`flex flex-col px-4 py-2 border rounded-xl ${getStressColor(summary.percentageOfIncome)}`}>
                            <span className="text-2xl font-extrabold tracking-tight">
                                {summary.percentageOfIncome.toFixed(1)}%
                            </span>
                            <span className="text-[10px] font-bold uppercase opacity-80 mt-[-4px]">Comprometimento</span>
                        </div>
                    )}
                </div>

                {/* Giant Glow */}
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-violet-500/5 rounded-full blur-[80px]" />
            </motion.div>

            {/* Lista Estilo Extrato */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel overflow-hidden"
            >
                <div className="px-6 py-5 border-b border-(--color-text-main)/5 flex items-center justify-between bg-(--color-text-main)/[0.02]">
                    <h3 className="font-semibold text-(--color-text-main)">Detalhamento</h3>
                    <div className="px-2.5 py-1 rounded-full bg-(--color-text-main)/5 text-xs font-bold text-(--color-text-muted)">
                        {summary.recurringTransactions.length} Registros
                    </div>
                </div>

                <div className="divide-y divide-(--color-text-main)/5">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="px-6 py-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-(--color-text-main)/5 animate-pulse" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-32 bg-(--color-text-main)/5 rounded animate-pulse" />
                                    <div className="h-3 w-20 bg-(--color-text-main)/5 rounded animate-pulse" />
                                </div>
                                <div className="h-5 w-16 bg-(--color-text-main)/5 rounded animate-pulse" />
                            </div>
                        ))
                    ) : summary.recurringTransactions.length === 0 ? (
                        <div className="px-6 py-12 flex flex-col items-center justify-center text-center text-(--color-text-muted)">
                            <div className="w-16 h-16 mb-4 rounded-full bg-(--color-text-main)/5 flex items-center justify-center border border-(--color-text-main)/10">
                                <ArrowRightLeft className="w-6 h-6 opacity-50" />
                            </div>
                            <p className="font-semibold text-(--color-text-main)">Nenhum custo recorrente listado</p>
                            <p className="text-sm mt-1 max-w-sm">Você não registrou assinaturas mensais ou transações parceladas neste período.</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {summary.recurringTransactions.map((tx: any, idx: number) => (
                                <motion.div
                                    key={tx.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-(--color-text-main)/[0.02] transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: `${tx.category.color}15`, color: tx.category.color }}
                                        >
                                            {tx.installment ? <CreditCard className="w-5 h-5" /> : <RotateCw className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-(--color-text-main) text-sm">{tx.description}</p>
                                                {tx.installment && (
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                                        {tx.installment}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5 text-xs text-(--color-text-muted)">
                                                <span>{formatDate(tx.date)}</span>
                                                <span className="w-1 h-1 rounded-full bg-(--color-text-main)/20" />
                                                <span className="font-medium" style={{ color: tx.category.color }}>{tx.category.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right ml-14 sm:ml-0 flex-shrink-0">
                                        <p className="font-bold text-(--color-text-main)">
                                            {isPrivacyMode ? "R$ ••••" : formatCurrency(Math.abs(tx.amount))}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
