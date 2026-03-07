"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { useGlobal } from "@/contexts/GlobalContext";
import { getCashflowData, CashflowPeriod } from "@/actions/cashflow";
import { CalendarDays } from "lucide-react";

type ViewMode = "expense" | "income" | "balance";

const CustomTooltip = ({ active, payload, label, isPrivacyMode }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0d0d15]/95 backdrop-blur-2xl border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
                <p className="text-white/60 text-xs mb-1.5 font-medium">{label}</p>
                {payload.map((p: any, i: number) => (
                    <p key={i} className="text-sm font-semibold" style={{ color: p.fill }}>
                        {isPrivacyMode ? "R$ ••••" : `R$ ${p.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function CashflowChart() {
    const { isPrivacyMode, currentPeriod, refreshTrigger } = useGlobal();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<CashflowPeriod>("month");
    const [viewMode, setViewMode] = useState<ViewMode>("expense");

    useEffect(() => {
        async function fetch() {
            setLoading(true);
            const res = await getCashflowData(period, currentPeriod.year);
            if (res.success && res.data) {
                setData(res.data);
            }
            setLoading(false);
        }
        fetch();
    }, [period, currentPeriod.year, refreshTrigger]);

    const periodOptions: { label: string; value: CashflowPeriod }[] = [
        { label: "15 dias", value: "15d" },
        { label: "30 dias", value: "30d" },
        { label: "60 dias", value: "60d" },
        { label: "Por Mês", value: "month" },
    ];

    const viewOptions: { label: string; value: ViewMode; color: string; gradient: string }[] = [
        { label: "Saídas", value: "expense", color: "#ef4444", gradient: "barGradientExpense" },
        { label: "Entradas", value: "income", color: "#10b981", gradient: "barGradientIncome" },
        { label: "Sobras", value: "balance", color: "#f59e0b", gradient: "barGradientBalance" },
    ];

    const activeView = viewOptions.find(v => v.value === viewMode)!;

    const barDataKey = viewMode === "expense" ? "expense" : viewMode === "income" ? "income" : "balance";

    const formatYAxis = (value: number) => {
        if (Math.abs(value) >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
        return `R$ ${value}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="glass-panel p-6 md:p-8 relative overflow-hidden"
        >
            {/* Header */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">Cashflow</h3>
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span>{currentPeriod.year}</span>
                    </div>
                </div>

                {/* Period filter */}
                <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
                    {periodOptions.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setPeriod(opt.value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${period === opt.value
                                ? "bg-white/10 text-white shadow-sm"
                                : "text-white/40 hover:text-white/70"
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* View mode toggle */}
            <div className="relative z-10 flex items-center gap-2 mb-6">
                {viewOptions.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => setViewMode(opt.value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${viewMode === opt.value
                            ? "text-white"
                            : "text-white/30 hover:text-white/60"
                            }`}
                        style={viewMode === opt.value ? {
                            backgroundColor: `${opt.color}20`,
                            border: `1px solid ${opt.color}30`,
                            boxShadow: `0 0 20px ${opt.color}15`,
                        } : { border: "1px solid transparent" }}
                    >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.color }} />
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Chart */}
            <div className="relative z-10 w-full h-[280px]">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} barCategoryGap="20%">
                            <defs>
                                {/* Saídas — Red */}
                                <linearGradient id="barGradientExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#dc2626" stopOpacity={0.5} />
                                </linearGradient>
                                {/* Entradas — Emerald (identidade visual) */}
                                <linearGradient id="barGradientIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#059669" stopOpacity={0.5} />
                                </linearGradient>
                                {/* Sobras — Amber */}
                                <linearGradient id="barGradientBalance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#d97706" stopOpacity={0.5} />
                                </linearGradient>
                                <filter id="barGlow">
                                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>

                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.04)"
                                horizontal={true}
                                vertical={false}
                            />

                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 12 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={formatYAxis}
                                tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }}
                                width={60}
                            />

                            <Tooltip
                                content={<CustomTooltip isPrivacyMode={isPrivacyMode} />}
                                cursor={{ fill: "rgba(255,255,255,0.03)", radius: 8 }}
                            />

                            <Bar
                                dataKey={barDataKey}
                                fill={`url(#${activeView.gradient})`}
                                radius={[6, 6, 0, 0]}
                                maxBarSize={36}
                                filter="url(#barGlow)"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Ambient glows */}
            <div className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${activeView.color}08 0%, transparent 70%)` }} />
            <div className="absolute top-0 right-1/4 w-36 h-36 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${activeView.color}05 0%, transparent 70%)` }} />
        </motion.div>
    );
}
