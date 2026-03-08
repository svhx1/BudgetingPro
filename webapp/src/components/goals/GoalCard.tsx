"use client";

import { motion } from "framer-motion";
import { Target, TrendingUp, Calendar, ArrowRight, CheckCircle2, ChevronRight, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GoalCardProps {
    goal: any;
    onEdit: (goal: any) => void;
    onDelete: (goalId: string) => void;
}

export default function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
    const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -4 }}
            className="glass-panel border border-(--color-text-main)/5 rounded-3xl p-6 relative overflow-hidden group shadow-xl hover:shadow-[0_10px_40px_rgba(59,130,246,0.15)] transition-all duration-300"
        >
            {/* Glow Effect */}
            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${goal.isReached ? 'from-emerald-500/10' : 'from-(--color-neon-blue)/10'} to-transparent rounded-bl-full opacity-50 pointer-events-none`} />

            {/* Header */}
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${goal.isReached ? 'bg-emerald-500/10 text-emerald-400' : 'bg-(--color-neon-blue)/10 text-(--color-neon-blue)'}`}>
                        {goal.isReached ? <CheckCircle2 className="w-7 h-7" /> : <Target className="w-7 h-7" />}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-(--color-text-main) mb-1 group-hover:text-(--color-neon-blue) transition-colors">{goal.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-(--color-text-muted)">
                            <span className="font-semibold text-(--color-text-main)">{formatBRL(goal.currentAmount)}</span>
                            <span>de</span>
                            <span>{formatBRL(goal.targetAmount)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                    <button onClick={() => onEdit(goal)} className="p-2 text-(--color-text-muted) hover:text-(--color-neon-blue) bg-(--color-text-main)/5 hover:bg-(--color-text-main)/10 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(goal.id)} className="p-2 text-(--color-text-muted) hover:text-red-400 bg-(--color-text-main)/5 hover:bg-(--color-text-main)/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6 relative z-10">
                <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className={goal.isReached ? "text-emerald-400" : "text-(--color-neon-blue)"}>
                        {goal.progress.toFixed(1)}% Alcançado
                    </span>
                    <span className="text-(--color-text-muted)">
                        Falta: {formatBRL(goal.targetAmount - goal.currentAmount)}
                    </span>
                </div>
                <div className="w-full bg-(--color-text-main)/5 rounded-full h-3 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full relative overflow-hidden ${goal.isReached ? 'bg-emerald-400' : 'bg-(--color-neon-blue)'}`}
                    >
                        {!goal.isReached && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-[200%] animate-[shimmer_2s_infinite]" />
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Projection Engine Results */}
            {!goal.isReached && goal.monthlyDeposit > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-(--color-text-main)/5 relative z-10">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-(--color-text-main)/5">
                            <TrendingUp className="w-4 h-4 text-(--color-text-muted)" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-(--color-text-muted) tracking-wider mb-0.5">Aporte + Rendimento</p>
                            <p className="text-sm font-semibold text-(--color-text-main)">{formatBRL(goal.monthlyDeposit)} <span className="text-xs font-normal text-(--color-text-muted)">/mês</span> a {goal.interestRate}%</p>
                        </div>
                    </div>

                    {goal.projectedDate && (
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-(--color-text-main)/5">
                                <Calendar className="w-4 h-4 text-(--color-text-muted)" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-(--color-text-muted) tracking-wider mb-0.5">Previsão Fim</p>
                                <p className="text-sm font-semibold text-(--color-text-main) capitalize">{format(new Date(goal.projectedDate), "MMM yyyy", { locale: ptBR })}</p>
                                <p className="text-[10px] text-(--color-neon-blue) font-medium mt-0.5">
                                    Em ~{goal.projectedMonths} meses
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!goal.isReached && goal.monthlyDeposit === 0 && (
                <div className="mt-4 pt-4 border-t border-(--color-text-main)/5 relative z-10 text-center">
                    <p className="text-sm text-(--color-text-muted)">Defina um aporte mensal para ver a projeção exata do fim.</p>
                </div>
            )}

            {goal.isReached && (
                <div className="mt-4 pt-4 border-t border-(--color-text-main)/5 relative z-10 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-bold text-emerald-400 tracking-wide uppercase">Objetivo Concluído!</span>
                </div>
            )}

        </motion.div>
    );
}
