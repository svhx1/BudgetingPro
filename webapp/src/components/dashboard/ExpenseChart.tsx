"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobal } from "@/contexts/GlobalContext";
import { getDashboardSummary } from "@/actions/dashboard";

const CustomTooltip = ({ active, payload, isPrivacyMode }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#1a1a1a]/95 backdrop-blur-xl p-3 border border-white/10 rounded-xl shadow-xl">
                <p className="text-white font-medium mb-1">{payload[0].name}</p>
                <p className="text-sm" style={{ color: payload[0].payload.color }}>
                    {isPrivacyMode ? "R$ ••••" : `R$ ${payload[0].value.toFixed(2)}`}
                </p>
            </div>
        );
    }
    return null;
};

export default function ExpenseChart() {
    const { isPrivacyMode, currentPeriod, refreshTrigger } = useGlobal();
    const [chartData, setChartData] = useState<any[]>([]);
    const [allTransactions, setAllTransactions] = useState<any[]>([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const fallbackColors = ['#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#ef4444'];

    useEffect(() => {
        async function fetchChartData() {
            setLoading(true);
            const res = await getDashboardSummary(currentPeriod.month, currentPeriod.year);
            if (res.success && res.data) {
                const expenses = res.data.transactions.filter((t: any) => t.type === 'EXPENSE');
                setTotalExpenses(res.data.expenses);
                setAllTransactions(expenses);

                const grouped = expenses.reduce((acc: any, curr: any) => {
                    const catName = curr.category?.name || "Sem Categoria";
                    if (!acc[catName]) {
                        acc[catName] = { name: catName, value: 0, color: curr.category?.color };
                    }
                    acc[catName].value += Math.abs(curr.amount);
                    return acc;
                }, {});

                const dataArray = Object.values(grouped).map((item: any, index: number) => ({
                    ...item,
                    color: item.color || fallbackColors[index % fallbackColors.length]
                }));

                setChartData(dataArray.sort((a: any, b: any) => b.value - a.value));
            }
            setLoading(false);
        }
        fetchChartData();
    }, [currentPeriod.month, currentPeriod.year, refreshTrigger]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const selectedTxs = selectedCategory
        ? allTransactions.filter((t: any) => (t.category?.name || "Sem Categoria") === selectedCategory)
        : [];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-panel p-6 flex flex-col relative"
        >
            <h3 className="text-lg font-semibold text-white mb-4">Despesas por Categoria</h3>

            {/* Gráfico — altura fixa, centralizado */}
            <div className="relative w-full h-[240px] flex-shrink-0">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-36 h-36 rounded-full border-8 border-white/5 border-t-white/20 animate-spin" />
                    </div>
                ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={4}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={6}
                                onClick={(data) => {
                                    const name = data.name || "";
                                    setSelectedCategory(
                                        selectedCategory === name ? null : name
                                    );
                                }}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        className="cursor-pointer transition-opacity duration-300"
                                        opacity={selectedCategory && selectedCategory !== entry.name ? 0.3 : 1}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip isPrivacyMode={isPrivacyMode} />} />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm text-(--color-text-muted)">Sem despesas registradas.</span>
                    </div>
                )}

                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs text-(--color-text-muted)">Total Mês</span>
                    <span className="text-lg font-bold text-white mt-0.5">
                        {isPrivacyMode ? "R$ ••••" : formatCurrency(totalExpenses)}
                    </span>
                </div>
            </div>

            {/* Legenda — ABAIXO do gráfico, sem scrollbar */}
            <div className="flex flex-wrap gap-2 mt-4">
                {chartData.map((entry, idx) => (
                    <div key={idx} className="flex flex-col">
                        <button
                            onClick={() => setSelectedCategory(selectedCategory === entry.name ? null : entry.name)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-left text-sm ${selectedCategory === entry.name ? "bg-white/10 ring-1 ring-white/15" : "hover:bg-white/5"}`}
                        >
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                            <span className="text-white/80 font-medium">{entry.name}</span>
                            <span className="text-xs text-(--color-text-muted)">
                                {isPrivacyMode ? "••••" : formatCurrency(entry.value)}
                            </span>
                        </button>
                    </div>
                ))}
            </div>

            {/* Detalhe expandido da categoria selecionada */}
            <AnimatePresence>
                {selectedCategory && selectedTxs.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
                            <p className="text-xs text-(--color-text-muted) uppercase tracking-wider font-semibold mb-2">
                                Transações em {selectedCategory}
                            </p>
                            {selectedTxs.map((tx: any) => (
                                <div key={tx.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors">
                                    <span className="text-xs text-white/70">{tx.description}</span>
                                    <span className="text-xs text-white/50">
                                        {isPrivacyMode ? "••••" : `R$ ${Math.abs(tx.amount).toFixed(2).replace(".", ",")}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ambient glow */}
            <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none" />
        </motion.div>
    );
}
