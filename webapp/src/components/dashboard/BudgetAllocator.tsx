"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, AlertTriangle, CheckCircle2, Save, TrendingDown, DollarSign } from "lucide-react";
import { useGlobal } from "@/contexts/GlobalContext";
import { getBudgetAllocations, getZeroBasedSummary, setBudgetAllocation } from "@/actions/budget";

export default function BudgetAllocator() {
    const { isPrivacyMode, currentPeriod, refreshTrigger, addToast } = useGlobal();

    const [allocations, setAllocations] = useState<any[]>([]);
    const [summary, setSummary] = useState({ totalIncome: 0, totalAllocated: 0, unallocated: 0 });
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);

    // Estado local para inputs (para não depender apenas do value recarregado do DB)
    const [localInputs, setLocalInputs] = useState<Record<string, string>>({});

    const loadData = async () => {
        setLoading(true);
        const [allocRes, sumRes] = await Promise.all([
            getBudgetAllocations(currentPeriod.month, currentPeriod.year),
            getZeroBasedSummary(currentPeriod.month, currentPeriod.year)
        ]);

        if (allocRes.success && allocRes.data) {
            setAllocations(allocRes.data);

            // Popula os inputs locais com os valores alocados atuais
            const initialInputs: Record<string, string> = {};
            allocRes.data.forEach(a => {
                initialInputs[a.categoryId] = a.allocated.toString();
            });
            setLocalInputs(initialInputs);
        }

        if (sumRes.success && sumRes.data) {
            setSummary(sumRes.data);
        }

        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [currentPeriod.month, currentPeriod.year, refreshTrigger]);

    const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const handleSaveAllocation = async (categoryId: string) => {
        const valStr = localInputs[categoryId];
        const amount = parseFloat(valStr);

        if (isNaN(amount) || amount < 0) {
            return addToast("Valor inválido", "error");
        }

        setSavingId(categoryId);
        const res = await setBudgetAllocation({
            categoryId,
            amount,
            month: currentPeriod.month,
            year: currentPeriod.year
        });

        setSavingId(null);

        if (res.success) {
            addToast("Orçamento salvo!", "success");
            loadData(); // Recarrega paridade de Base Zero
        } else {
            addToast("Erro ao salvar", "error");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-6 w-full animate-pulse">
                <div className="h-32 bg-white/5 rounded-3xl" />
                <div className="h-20 bg-white/5 rounded-2xl" />
                <div className="h-20 bg-white/5 rounded-2xl" />
                <div className="h-20 bg-white/5 rounded-2xl" />
            </div>
        );
    }

    const { unallocated } = summary;
    const isZeroBasedDone = unallocated === 0;
    const isOverAllocated = unallocated < 0;

    return (
        <div className="w-full flex flex-col gap-8">

            {/* ZBB Indicator Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 md:p-8 rounded-3xl border relative overflow-hidden transition-colors duration-500 ${isZeroBasedDone ? 'bg-emerald-500/10 border-emerald-500/30' :
                        isOverAllocated ? 'bg-red-500/10 border-red-500/30' :
                            'bg-(--color-neon-blue)/10 border-(--color-neon-blue)/30'
                    }`}
            >
                {/* Glow effect matches the state */}
                <div className={`absolute top-0 right-0 w-64 h-64 rounded-bl-full opacity-50 pointer-events-none bg-gradient-to-br transition-colors duration-500 ${isZeroBasedDone ? 'from-emerald-500/20' :
                        isOverAllocated ? 'from-red-500/20' :
                            'from-(--color-neon-blue)/20'
                    } to-transparent`} />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            {isZeroBasedDone ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> :
                                isOverAllocated ? <AlertTriangle className="w-5 h-5 text-red-400" /> :
                                    <PieChart className="w-5 h-5 text-(--color-neon-blue)" />}

                            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                                {isZeroBasedDone ? "Orçamento Perfeito" :
                                    isOverAllocated ? "Estourou as Receitas" :
                                        "Orçamento Base Zero"}
                            </h2>
                        </div>

                        <h3 className={`text-4xl md:text-5xl font-extrabold tracking-tight ${isZeroBasedDone ? "text-emerald-400" :
                                isOverAllocated ? "text-red-400" :
                                    "text-(--color-neon-blue)"
                            }`}>
                            {isPrivacyMode ? "R$ ••••" : formatBRL(Math.abs(unallocated))}
                        </h3>
                        <p className="text-sm text-white/70 mt-2 font-medium">
                            {isZeroBasedDone ? "Todo dinheiro tem um destino esse mês. Parabéns!" :
                                isOverAllocated ? "Você alocou mais dinheiro do que declarou receber." :
                                    "Saldo restante para distribuir nas categorias."}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 p-4 bg-black/40 rounded-2xl backdrop-blur-md border border-white/5 min-w-[200px]">
                        <div className="flex justify-between items-center text-xs font-semibold text-(--color-text-muted)">
                            <span>Receitas Deste Mês</span>
                            <span className="text-emerald-400">{isPrivacyMode ? "••••" : formatBRL(summary.totalIncome)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-semibold text-(--color-text-muted)">
                            <span>Total Distribuído</span>
                            <span className="text-white">{isPrivacyMode ? "••••" : formatBRL(summary.totalAllocated)}</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* List of Categories to Allocate */}
            <div className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-(--color-neon-blue)" />
                    Distribuição por Categoria
                </h3>

                <AnimatePresence>
                    {allocations.map((alloc, idx) => {
                        const usageRatio = alloc.usagePercentage;
                        const isOverBudget = usageRatio > 100;
                        const isWarning = usageRatio > 80 && !isOverBudget;

                        const progressBarColor = isOverBudget ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500';

                        return (
                            <motion.div
                                key={alloc.categoryId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`p-5 rounded-2xl border transition-all duration-300 ${isOverBudget ? 'bg-red-500/5 border-red-500/20' : 'bg-[#111111] border-white/5 hover:border-white/10'
                                    }`}
                            >
                                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">

                                    {/* Info Panel */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div
                                            className="w-4 h-12 rounded-full"
                                            style={{ backgroundColor: alloc.categoryColor }}
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg text-white mb-1 group-hover:text-(--color-neon-blue) transition-colors inline-flex items-center gap-2">
                                                {alloc.categoryName}
                                                {isOverBudget && <AlertTriangle className="w-4 h-4 text-red-400" />}
                                            </h4>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-(--color-text-muted)">
                                                <span className="flex items-center gap-1">
                                                    Gasto: <span className="text-white font-medium">{isPrivacyMode ? '••••' : formatBRL(alloc.spent)}</span>
                                                </span>

                                                {alloc.allocated > 0 && (
                                                    <span className={`font-medium ${isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
                                                        {isPrivacyMode ? '••••' : formatBRL(Math.abs(alloc.remaining))} {isOverBudget ? "acima do orçado" : "restantes"}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progresso visual (Central) */}
                                    <div className="w-full lg:w-1/3 flex flex-col gap-2">
                                        <div className="flex justify-between text-xs font-semibold">
                                            <span className={isOverBudget ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-(--color-text-muted)'}>
                                                {alloc.allocated > 0 ? `${usageRatio.toFixed(0)}% utilizado` : "Sem limite numérico"}
                                            </span>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden relative">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(usageRatio, 100)}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className={`h-full rounded-full ${progressBarColor}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Action Box: Set Budget */}
                                    <div className="flex items-center gap-2 w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/5">
                                        <div className="relative flex-1 lg:w-40">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-muted) text-sm font-medium">R$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={localInputs[alloc.categoryId] || ""}
                                                onChange={(e) => setLocalInputs(prev => ({ ...prev, [alloc.categoryId]: e.target.value }))}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white font-semibold outline-none focus:border-white/30 transition-colors"
                                                placeholder="Orçamento"
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveAllocation(alloc.categoryId)}
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleSaveAllocation(alloc.categoryId)}
                                            disabled={savingId === alloc.categoryId}
                                            className="p-2.5 bg-white/5 hover:bg-(--color-neon-blue)/20 border border-white/10 text-white rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            {savingId === alloc.categoryId ? (
                                                <div className="w-5 h-5 border-2 border-transparent border-t-(--color-neon-blue) rounded-full animate-spin" />
                                            ) : (
                                                <Save className="w-5 h-5 text-(--color-neon-blue)" />
                                            )}
                                        </button>
                                    </div>

                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {allocations.length === 0 && (
                    <div className="p-10 text-center bg-white/5 rounded-3xl border border-white/10">
                        <p className="text-(--color-text-muted)">Crie categorias primeiro para poder distribuir seu orçamento nelas.</p>
                    </div>
                )}
            </div>

        </div>
    );
}
