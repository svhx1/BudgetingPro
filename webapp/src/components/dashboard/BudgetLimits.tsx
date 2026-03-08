"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobal } from "@/contexts/GlobalContext";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { getDashboardLimits } from "@/actions/limits";
import { getDashboardSummary } from "@/actions/dashboard";
import { useCachedData } from "@/hooks/useCachedData";

export default function BudgetLimits() {
    const { isPrivacyMode, currentPeriod, refreshTrigger } = useGlobal();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [expandedTxs, setExpandedTxs] = useState<any[]>([]);
    const [txLoading, setTxLoading] = useState(false);

    const { data: limitsData, loading } = useCachedData(
        `dashboard-limits-${currentPeriod.year}-${currentPeriod.month}`,
        async () => {
            const res = await getDashboardLimits(currentPeriod.month, currentPeriod.year);
            return res.success && res.data ? { success: true, data: res.data } : { success: false };
        },
        [currentPeriod.month, currentPeriod.year, refreshTrigger]
    );

    const limits = limitsData || [];

    const toggleExpand = async (item: any) => {
        if (expandedId === item.id) {
            setExpandedId(null);
            setExpandedTxs([]);
            return;
        }

        setExpandedId(item.id);
        setTxLoading(true);

        // Fetch transactions for this category
        const res = await getDashboardSummary(currentPeriod.month, currentPeriod.year);
        if (res.success && res.data) {
            const catTxs = res.data.transactions.filter(
                (t: any) => t.category?.name === item.categoryName && t.type === "EXPENSE"
            );
            setExpandedTxs(catTxs);
        }
        setTxLoading(false);
    };

    function hexToRgba(hex: string, alpha: number) {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }
        return `rgba(${r},${g},${b},${alpha})`;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-panel p-6 flex flex-col h-full"
        >
            <h3 className="text-lg font-semibold text-white mb-6">Limites de Gastos</h3>

            <div className="space-y-5 flex-1 pr-2 custom-scrollbar overflow-y-auto">
                {loading ? (
                    <div className="text-center text-(--color-text-muted) py-4">Carregando limites...</div>
                ) : limits.length === 0 ? (
                    <div className="text-center text-(--color-text-muted) py-4">Nenhum limite configurado.</div>
                ) : (
                    limits.map((item, idx) => {
                        const percentage = Math.min((item.spent / item.limitAmount) * 100, 100);
                        const isExceeded = item.spent > item.limitAmount;
                        const isExpanded = expandedId === item.id;
                        const glowProp = `0 0 15px ${hexToRgba(item.color, isExceeded ? 0.8 : 0.4)}`;

                        return (
                            <div key={item.id} className="group relative">
                                {/* Header do limite — clicável para expandir */}
                                <button
                                    onClick={() => toggleExpand(item)}
                                    className="w-full text-left"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-white flex items-center gap-2">
                                            {item.categoryName}
                                            {isExceeded && <AlertCircle className="w-4 h-4 text-red-500" />}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div className="text-xs text-right">
                                                <span className={isExceeded ? "text-red-400 font-bold" : "text-white"}>
                                                    {isPrivacyMode ? "R$ ••••" : `R$ ${item.spent.toFixed(2)}`}
                                                </span>
                                                <span className="text-(--color-text-muted) mx-1">/</span>
                                                <span className="text-(--color-text-muted)">
                                                    {isPrivacyMode ? "••••" : `R$ ${item.limitAmount.toFixed(2)}`}
                                                </span>
                                            </div>
                                            {isExpanded ? (
                                                <ChevronUp className="w-4 h-4 text-(--color-text-muted)" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-(--color-text-muted)" />
                                            )}
                                        </div>
                                    </div>
                                </button>

                                {/* Barra de Progresso */}
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden relative">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                                        className="h-full rounded-full"
                                        style={{
                                            backgroundColor: isExceeded ? '#ef4444' : item.color,
                                            boxShadow: isExceeded ? `0 0 15px rgba(239,68,68,0.8)` : glowProp
                                        }}
                                    />
                                </div>

                                {isExceeded && (
                                    <p className="text-[10px] text-red-400 mt-1 uppercase tracking-wider font-semibold animate-pulse">
                                        Limite Excedido
                                    </p>
                                )}

                                {/* Dropdown expansível com transações da categoria */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-3 pl-2 border-l-2 space-y-2" style={{ borderColor: hexToRgba(item.color, 0.3) }}>
                                                {txLoading ? (
                                                    <p className="text-xs text-(--color-text-muted) py-2">Carregando...</p>
                                                ) : expandedTxs.length === 0 ? (
                                                    <p className="text-xs text-(--color-text-muted) py-2">Nenhum gasto nesta categoria.</p>
                                                ) : (
                                                    expandedTxs.map((tx: any) => (
                                                        <div key={tx.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors">
                                                            <div>
                                                                <p className="text-xs text-white font-medium">{tx.description}</p>
                                                                <p className="text-[10px] text-(--color-text-muted)">
                                                                    {new Date(tx.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                                                                </p>
                                                            </div>
                                                            <span className="text-xs text-white font-medium">
                                                                {isPrivacyMode ? "R$ ••••" : `R$ ${Math.abs(tx.amount).toFixed(2).replace(".", ",")}`}
                                                            </span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
}
