"use client";

import { useState } from "react";
import { useGlobal } from "@/contexts/GlobalContext";
import { useCachedData } from "@/hooks/useCachedData";
import { getTrendData, getTrendTransactionsByDay } from "@/actions/trends";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, TrendingDown, Layers, X, Coffee } from "lucide-react";

const CustomTooltip = ({ active, payload, label, isPrivacyMode }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[var(--color-base-bg)]/95 backdrop-blur-2xl border border-[var(--color-text-main)]/10 rounded-xl px-4 py-3 shadow-2xl">
                <p className="text-(--color-text-main)/60 text-xs mb-1.5 font-medium">Dia {label}</p>
                {payload.map((p: any, i: number) => {
                    // Ignora nulls do eixo X futuro
                    if (p.value === null || p.value === undefined) return null;
                    const isLastMonth = p.name === "lastAccumulatedExpense";
                    return (
                        <p key={i} className={`text-sm font-semibold flex items-center gap-1.5 ${isLastMonth ? 'text-(--color-text-muted)' : 'text-(--color-text-main)'}`}>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.stroke || p.fill || 'gray' }} />
                            {isLastMonth ? "Mês Passado: " : "Este Mês: "}
                            {isPrivacyMode ? "R$ ••••" : `R$ ${p.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                        </p>
                    );
                })}
            </div>
        );
    }
    return null;
};

export default function TrendChart() {
    const { isPrivacyMode, currentPeriod, refreshTrigger } = useGlobal();

    const { data: trendPayload, loading } = useCachedData(
        `dashboard-trends-${currentPeriod.year}-${currentPeriod.month}`,
        async () => {
            const res = await getTrendData(currentPeriod.month, currentPeriod.year, "EXPENSE");
            return res.success && res.data ? { success: true, data: res } : { success: false };
        },
        [currentPeriod.month, currentPeriod.year, refreshTrigger]
    );

    const data = trendPayload?.data || [];
    const metrics = trendPayload?.metrics || { totalExpenseCurrent: 0, totalExpenseLast: 0, percentageChangeExpense: 0 };

    const [clickedDay, setClickedDay] = useState<number | null>(null);
    const [isDayModalOpen, setIsDayModalOpen] = useState(false);
    const [loadingDayTx, setLoadingDayTx] = useState(false);
    const [dayTransactions, setDayTransactions] = useState<any[]>([]);

    const handleChartClick = async (state: any) => {
        if (state && state.activePayload && state.activePayload.length > 0) {
            const payload = state.activePayload[0].payload;
            if (!payload || payload.day === undefined) return;

            setClickedDay(payload.day);
            setIsDayModalOpen(true);
            setLoadingDayTx(true);

            const res = await getTrendTransactionsByDay(payload.day, currentPeriod.month, currentPeriod.year);
            if (res.success && res.data) {
                setDayTransactions(res.data);
            }
            setLoadingDayTx(false);
        }
    };

    const isGoodTrend = metrics.percentageChangeExpense <= 0;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
    };

    const formatYAxis = (value: number) => {
        if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
        return `R$ ${value}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-panel p-6 md:p-8 relative h-full flex flex-col"
        >
            {/* Header: Title & Big Number */}
            <div className="flex flex-col mb-8 relative z-10 w-full sm:flex-row justify-between items-start sm:items-end gap-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2 text-(--color-text-muted)">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Ritmo de Gastos</span>
                    </div>
                    {loading ? (
                        <div className="h-10 w-32 bg-(--color-text-main)/5 rounded-lg animate-pulse" />
                    ) : (
                        <div className="flex items-baseline gap-3">
                            <h2 className="text-3xl lg:text-4xl font-extrabold text-(--color-text-main) tracking-tight">
                                {isPrivacyMode ? "R$ ••••" : formatCurrency(metrics.totalExpenseCurrent)}
                            </h2>
                            <span className="text-sm font-medium text-(--color-text-muted)">este mês</span>
                        </div>
                    )}

                    {/* Badge change */}
                    {!loading && (
                        <div className="flex items-center gap-2 mt-3">
                            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-bold ${isGoodTrend ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                {isGoodTrend ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                {Math.abs(metrics.percentageChangeExpense).toFixed(1)}%
                            </div>
                            <span className="text-xs text-(--color-text-muted) font-medium">
                                vs {isPrivacyMode ? "R$ ••••" : formatCurrency(metrics.totalExpenseLast)} {new Date().getMonth() + 1 === currentPeriod.month ? 'no mesmo período' : 'ano passado/mês anterior'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Area Chart - Preenche o espaço disponível */}
            <div className="relative z-10 flex-1 w-full min-h-[220px] mt-auto">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-(--color-text-main)/10 border-t-(--color-text-main)/40 rounded-full animate-spin" />
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart onClick={handleChartClick} data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} className="cursor-pointer">
                            <defs>
                                <linearGradient id="colorCurrentExp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--color-text-muted)"
                                strokeOpacity={0.15}
                                vertical={false}
                            />

                            {/* Mostra apenas a cada 5 dias aprox no eixo X */}
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                                type="number"
                                domain={['dataMin', 'dataMax']}
                                tickCount={7}
                            />

                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={formatYAxis}
                                tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                            />

                            <Tooltip
                                content={<CustomTooltip isPrivacyMode={isPrivacyMode} />}
                                cursor={{ stroke: "var(--color-text-main)", strokeWidth: 1, strokeDasharray: "4 4", opacity: 0.2 }}
                            />

                            {/* Linha Fundo - Mês passado (Tracejada e sem área de preenchimento) */}
                            <Area
                                type="monotone"
                                dataKey="lastAccumulatedExpense"
                                stroke="var(--color-text-muted)"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                fillOpacity={0}
                                isAnimationActive={false}
                                name="lastAccumulatedExpense"
                            />

                            {/* Linha Frente - Mês atual (Conecta os pontos com preenchimento abaixo) */}
                            <Area
                                type="monotone"
                                dataKey="accumulatedExpense"
                                stroke="#f59e0b" // Laranja pra dar ideia de Ritmo/Alarme
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorCurrentExp)"
                                connectNulls={false}
                                activeDot={{ r: 6, strokeWidth: 0, fill: "#f59e0b" }}
                                name="accumulatedExpense"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Custom Legend for Area Chart */}
            <div className="flex gap-4 mt-6 items-center text-xs font-semibold text-(--color-text-muted)">
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-1 rounded-full bg-[#f59e0b]" />
                    <span>Este mês</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-1 rounded-full border-t-2 border-dashed border-(--color-text-muted)" />
                    <span>Mês passado</span>
                </div>
            </div>

            {/* Modal de Transações do Dia */}
            <AnimatePresence>
                {isDayModalOpen && clickedDay !== null && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
                            onClick={() => setIsDayModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="fixed z-[70] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-[var(--color-base-bg)] border border-[var(--color-text-main)]/10 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[80vh]"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-(--color-text-main)">
                                    Gastos do Dia {clickedDay}
                                </h3>
                                <button onClick={() => setIsDayModalOpen(false)} className="p-2 rounded-xl hover:bg-(--color-text-main)/5 text-(--color-text-muted) transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
                                {loadingDayTx ? (
                                    <div className="py-10 text-center text-(--color-text-muted) animate-pulse">Carregando compras do dia...</div>
                                ) : dayTransactions.length === 0 ? (
                                    <div className="py-10 flex flex-col items-center justify-center text-center opacity-60">
                                        <Coffee className="w-12 h-12 mb-3 text-(--color-text-muted)" />
                                        <p className="text-sm">Nenhum gasto impulsionou o Ritmo neste dia.</p>
                                    </div>
                                ) : (
                                    dayTransactions.map((tx: any) => (
                                        <div key={tx.id} className="p-4 rounded-2xl bg-(--color-text-main)/5 border border-(--color-text-main)/5 flex flex-col gap-2">
                                            <div className="flex justify-between items-start gap-2">
                                                <span className="font-semibold text-(--color-text-main) break-words text-sm">{tx.description || "Sem descrição"}</span>
                                                <span className="font-bold text-red-400 shrink-0 text-right">
                                                    {isPrivacyMode ? "R$ ••••" : `- R$ ${Math.abs(tx.amount).toFixed(2).replace('.', ',')}`}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-(--color-text-muted)">
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

            {/* Glow Ambiental */}
            <div className="absolute top-1/2 left-0 w-64 h-64 rounded-full pointer-events-none -translate-y-1/2 -translate-x-1/2 opacity-70" style={{ background: `radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)` }} />
        </motion.div>
    );
}
