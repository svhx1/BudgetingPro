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

    const cards = [
        {
            title: "Saldo Disponível",
            amount: formatCurrency(summary.balance),
            icon: DollarSign,
            color: "text-(--color-neon-green-light)",
            accentColor: summary.balance >= 0 ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
            borderHover: summary.balance >= 0 ? "hover:border-emerald-500/30" : "hover:border-red-500/30"
        },
        {
            title: "Entradas do Mês",
            amount: formatCurrency(summary.incomes),
            icon: ArrowUpRight,
            color: "text-(--color-neon-green-light)",
            accentColor: "rgba(16,185,129,0.1)",
            borderHover: "hover:border-emerald-500/20"
        },
        {
            title: "Saídas do Mês",
            amount: formatCurrency(summary.expenses),
            icon: ArrowDownRight,
            color: "text-(--color-neon-red-light)",
            accentColor: "rgba(239,68,68,0.1)",
            borderHover: "hover:border-red-500/20"
        },
    ];

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
            {cards.map((card, idx) => (
                <motion.div
                    key={idx}
                    variants={item}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`glass-panel p-6 flex flex-col justify-between h-36 relative group cursor-default ${card.borderHover}`}
                >
                    <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-(--color-text-muted)">
                            {card.title}
                        </span>
                        <div className="p-2 rounded-xl bg-white/5">
                            <card.icon className={`w-5 h-5 ${card.color}`} />
                        </div>
                    </div>
                    <div className="mt-4">
                        {loading ? (
                            <div className="h-9 md:h-10 w-32 bg-white/5 rounded-lg animate-pulse" />
                        ) : (
                            <h3 className={`text-2xl lg:text-3xl font-bold tracking-tight animate-in fade-in duration-500 ${idx === 0 && summary.balance < 0 && !isPrivacyMode ? 'text-red-400' : 'text-white'}`}>
                                {isPrivacyMode ? "R$ ••••" : card.amount}
                            </h3>
                        )}
                    </div>
                    {/* Smooth ambient glow — circular, no square ever */}
                    <div
                        className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-[800ms] pointer-events-none"
                        style={{ background: `radial-gradient(circle, ${card.accentColor} 0%, transparent 70%)` }}
                    />
                </motion.div>
            ))}
        </motion.div>
    );
}
