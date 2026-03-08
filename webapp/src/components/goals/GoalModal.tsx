"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Target, X, Calculator, CalendarDays, Plus, Image as ImageIcon, Wallet, ShieldAlert, Save } from "lucide-react";
import { DatePicker } from "@/components/ui/DatePicker";
import { createGoal, updateGoal, GoalInput } from "@/actions/goals";
import { useGlobal } from "@/contexts/GlobalContext";

interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    goalToEdit?: any;
}

export default function GoalModal({ isOpen, onClose, goalToEdit }: GoalModalProps) {
    const { addToast } = useGlobal();

    const [name, setName] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [currentAmount, setCurrentAmount] = useState("");
    const [monthlyDeposit, setMonthlyDeposit] = useState("");
    const [interestRate, setInterestRate] = useState("");
    const [hasDeadline, setHasDeadline] = useState(false);
    const [deadline, setDeadline] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (goalToEdit) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setName(goalToEdit.name);
                setTargetAmount(goalToEdit.targetAmount.toString());
                setCurrentAmount(goalToEdit.currentAmount.toString());
                setMonthlyDeposit(goalToEdit.monthlyDeposit?.toString() || "");
                setInterestRate(goalToEdit.interestRate?.toString() || "");
                if (goalToEdit.deadline) {
                    setHasDeadline(true);
                    setDeadline(new Date(goalToEdit.deadline).toISOString().split("T")[0]);
                } else {
                    setHasDeadline(false);
                    setDeadline("");
                }
            } else {
                setName("");
                setTargetAmount("");
                setCurrentAmount("");
                setMonthlyDeposit("");
                setInterestRate("");
                setHasDeadline(false);
                setDeadline("");
            }
        }
    }, [isOpen, goalToEdit]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) return addToast("Dê um nome para a sua meta.", "error");
        if (!targetAmount || isNaN(Number(targetAmount)) || Number(targetAmount) <= 0) return addToast("Insira um valor alvo válido.", "error");

        setLoading(true);

        const data: GoalInput = {
            name,
            targetAmount: parseFloat(targetAmount),
            currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
            monthlyDeposit: monthlyDeposit ? parseFloat(monthlyDeposit) : 0,
            interestRate: interestRate ? parseFloat(interestRate) : 0,
            deadline: hasDeadline && deadline ? new Date(deadline).toISOString() : null
        };

        const res = goalToEdit
            ? await updateGoal(goalToEdit.id, data)
            : await createGoal(data);

        setLoading(false);

        if (res.success) {
            addToast(`Meta ${goalToEdit ? "atualizada" : "criada"} com sucesso!`, "success");
            onClose();
        } else {
            addToast(res.error || "Erro ao salvar meta.", "error");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto w-full h-full">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        className="relative w-[95%] max-w-xl max-h-[90vh] flex flex-col glass-panel rounded-3xl overflow-hidden shadow-2xl border border-(--color-text-main)/10"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-(--color-text-main)/10 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-(--color-neon-blue)/10 rounded-xl">
                                    <Target className="w-6 h-6 text-(--color-neon-blue)" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-(--color-text-main)">
                                        {goalToEdit ? "Editar Meta" : "Nova Meta"}
                                    </h2>
                                    <p className="text-xs text-(--color-text-muted)">Projete seu futuro financeiro.</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-(--color-text-main)/5 text-(--color-text-muted) transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form Body */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 hide-scrollbar">
                            <form id="goal-form" onSubmit={handleSave} className="flex flex-col gap-6">

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-(--color-text-muted) uppercase tracking-wider">Qual seu objetivo?</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex: Reserva de Emergência, Viagem..."
                                        className="w-full bg-(--color-text-main)/5 border border-(--color-text-main)/10 rounded-xl py-3 px-4 text-(--color-text-main) outline-none focus:border-(--color-text-main)/30 transition-colors"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-(--color-text-muted) uppercase tracking-wider flex justify-between">
                                            <span>Valor Alvo</span>
                                            <span className="text-(--color-text-main)">🎯</span>
                                        </label>
                                        <div className="relative flex items-center">
                                            <span className="absolute left-4 text-(--color-text-muted) font-medium">R$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                value={targetAmount}
                                                onChange={(e) => setTargetAmount(e.target.value)}
                                                placeholder="0,00"
                                                className="w-full bg-(--color-text-main)/5 border border-(--color-text-main)/10 rounded-xl py-3 pl-10 pr-4 text-(--color-text-main) font-semibold outline-none focus:border-(--color-text-main)/30 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-(--color-text-muted) uppercase tracking-wider flex justify-between">
                                            <span>Já guardado</span>
                                            <span className="text-(--color-text-main)">💰</span>
                                        </label>
                                        <div className="relative flex items-center">
                                            <span className="absolute left-4 text-(--color-text-muted) font-medium">R$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={currentAmount}
                                                onChange={(e) => setCurrentAmount(e.target.value)}
                                                placeholder="0,00"
                                                className="w-full bg-(--color-text-main)/5 border border-(--color-text-main)/10 rounded-xl py-3 pl-10 pr-4 text-(--color-text-main) font-semibold outline-none focus:border-(--color-text-main)/30 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Projection Engine Box */}
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-(--color-text-main)/5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Calculator className="w-5 h-5 text-(--color-neon-blue)" />
                                        <h3 className="font-semibold text-(--color-text-main)">Projeção Financeira</h3>
                                    </div>
                                    <p className="text-xs text-(--color-text-muted) mb-4">
                                        Se preencher estes campos, o Budgeting calculará exatamente quando você atingirá sua meta usando juros compostos.
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-medium text-(--color-text-muted) uppercase tracking-wider">Aporte Mensal</label>
                                            <div className="relative flex items-center">
                                                <span className="absolute left-4 text-(--color-text-muted) text-sm">R$</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={monthlyDeposit}
                                                    onChange={(e) => setMonthlyDeposit(e.target.value)}
                                                    placeholder="0,00"
                                                    className="w-full bg-(--color-text-main)/5 border border-(--color-text-main)/10 rounded-lg py-2 pl-10 pr-3 text-sm text-(--color-text-main) outline-none focus:border-(--color-text-main)/30 transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-medium text-(--color-text-muted) uppercase tracking-wider">Rendimento (a.m)</label>
                                            <div className="relative flex items-center">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={interestRate}
                                                    onChange={(e) => setInterestRate(e.target.value)}
                                                    placeholder="Ex: 0.8"
                                                    className="w-full bg-(--color-text-main)/5 border border-(--color-text-main)/10 rounded-lg py-2 px-3 text-sm text-(--color-text-main) outline-none focus:border-(--color-text-main)/30 transition-colors"
                                                />
                                                <span className="absolute right-4 text-(--color-text-muted) text-sm">%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Deadline (Optional) */}
                                <div className="flex flex-col gap-3 pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w - 5 h - 5 rounded flex items - center justify - center border transition - colors ${hasDeadline ? 'bg-(--color-neon-blue) border-(--color-neon-blue)' : 'bg-transparent border-(--color-text-main)/20 group-hover:border-(--color-text-main)/40'} `}>
                                            {hasDeadline && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Plus className="w-3 h-3 text-black rotate-45" /></motion.div>}
                                        </div>
                                        <span className="text-sm font-medium text-(--color-text-main) select-none">Possui data limite?</span>
                                    </label>

                                    <AnimatePresence>
                                        {hasDeadline && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="mt-1"
                                            >
                                                <DatePicker value={deadline} onChange={setDeadline} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                            </form>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-(--color-text-main)/10 shrink-0 bg-(--color-text-main)/5">
                            <button
                                form="goal-form"
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-xl font-bold text-(--color-text-main) shadow-lg bg-(--color-neon-blue) hover:bg-blue-400 shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 text-black" />
                                        <span className="text-black">{goalToEdit ? "Salvar Alterações" : "Criar Meta"}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
