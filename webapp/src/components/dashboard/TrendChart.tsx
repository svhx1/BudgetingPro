"use client";

import { useGlobal } from "@/contexts/GlobalContext";
import { useCachedData } from "@/hooks/useCachedData";
import { getTrendData } from "@/actions/trends";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, TrendingDown } from "lucide-react";

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
                        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
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

            {/* Glow Ambiental */}
            <div className="absolute top-1/2 left-0 w-64 h-64 rounded-full pointer-events-none -translate-y-1/2 -translate-x-1/2 opacity-70" style={{ background: `radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)` }} />
        </motion.div>
    );
}
