"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobal } from "@/contexts/GlobalContext";
import { Plus, Target } from "lucide-react";
import { getGoals, deleteGoal } from "@/actions/goals";
import GoalCard from "@/components/goals/GoalCard";
import GoalModal from "@/components/goals/GoalModal";

export default function GoalsPage() {
    const { isPrivacyMode, addToast } = useGlobal();

    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [goalToEdit, setGoalToEdit] = useState<any>(null);

    const loadGoals = async () => {
        setLoading(true);
        const res = await getGoals();
        if (res.success && res.data) {
            setGoals(res.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadGoals();
    }, []);

    const handleEdit = (goal: any) => {
        setGoalToEdit(goal);
        setIsModalOpen(true);
    };

    const handleDelete = async (goalId: string) => {
        if (!confirm("Tem certeza que deseja deletar esta meta? Esta ação não pode ser desfeita.")) return;
        const res = await deleteGoal(goalId);
        if (res.success) {
            addToast("Meta deletada com sucesso.", "success");
            loadGoals(); // Refresh local array
        } else {
            addToast("Erro ao deletar meta.", "error");
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setGoalToEdit(null);
        loadGoals(); // Refresh ao fechar (se salvou)
    };

    return (
        <div className="flex flex-col min-h-screen w-full pb-10">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-(--color-text-main) mb-2">
                        Metas Financeiras
                    </h1>
                    <p className="text-lg text-(--color-text-muted) font-light">
                        Seus sonhos organizados, poupados e projetados no tempo certo.
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex shrink-0 items-center justify-center gap-2 px-6 py-4 bg-(--color-neon-blue) text-black rounded-2xl font-bold shadow-lg shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Nova Meta
                </button>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-(--color-text-main)/5 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : goals.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-10 md:p-16 rounded-3xl flex flex-col items-center justify-center text-center border-dashed border-2 border-(--color-text-main)/10"
                >
                    <div className="p-6 bg-(--color-text-main)/5 rounded-2xl mb-6">
                        <Target className="w-16 h-16 text-(--color-text-muted)" />
                    </div>

                    <h2 className="text-2xl font-bold text-(--color-text-main) mb-3">Nenhuma meta ainda</h2>
                    <p className="text-(--color-text-muted) max-w-md mb-8">
                        Crie sua primeira meta ("Viagem de Férias", "Reserva de Emergência") e deixe o Budgeting projetar os juros compostos para você.
                    </p>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-3 bg-(--color-text-main)/10 hover:bg-(--color-text-main)/20 text-(--color-text-main) rounded-xl font-medium transition-colors border border-(--color-text-main)/10"
                    >
                        Criar Primeira Meta
                    </button>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence>
                        {goals.map(goal => (
                            <GoalCard
                                key={goal.id}
                                goal={goal}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            <GoalModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                goalToEdit={goalToEdit}
            />
        </div>
    );
}
