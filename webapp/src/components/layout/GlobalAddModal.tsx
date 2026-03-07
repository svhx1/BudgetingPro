"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, RefreshCw, Layers, CalendarDays, X, Plus } from "lucide-react";
import { createTransaction } from "@/actions/transactions";
import { getCategories, createCategory } from "@/actions/categories";
import { useGlobal } from "@/contexts/GlobalContext";

export default function GlobalAddModal() {
    const { isAddModalOpen, setAddModalOpen, triggerRefresh, refreshTrigger, addToast } = useGlobal();

    const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
    const [recurrence, setRecurrence] = useState<"unico" | "parcelado" | "fixo">("unico");
    const [installments, setInstallments] = useState<number>(2);
    const [amount, setAmount] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [categoryId, setCategoryId] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const [dbCategories, setDbCategories] = useState<any[]>([]);
    const [showNewCat, setShowNewCat] = useState(false);
    const [newCatName, setNewCatName] = useState("");
    const [creatingCat, setCreatingCat] = useState(false);

    useEffect(() => {
        async function fetchCats() {
            const res = await getCategories();
            if (res.success && res.data) {
                setDbCategories(res.data);
                if (res.data.length > 0 && !categoryId) {
                    setCategoryId(res.data[0].id);
                }
            }
        }
        if (isAddModalOpen) {
            fetchCats();
            setShowNewCat(false);
            setNewCatName("");
        }
    }, [isAddModalOpen, refreshTrigger]);

    const handleCreateCategory = async () => {
        if (!newCatName.trim()) return;
        setCreatingCat(true);
        const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#ef4444", "#14b8a6", "#f97316"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const res = await createCategory(newCatName.trim(), randomColor);
        if (res.success && res.data) {
            setDbCategories(prev => [...prev, res.data]);
            setCategoryId(res.data.id);
            setNewCatName("");
            setShowNewCat(false);
            addToast(`Categoria "${newCatName.trim()}" criada!`, "success");
        } else {
            addToast(res.error || "Erro ao criar categoria", "error");
        }
        setCreatingCat(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || isNaN(Number(amount))) return addToast("Insira um valor numérico válido.", "error");

        setLoading(true);

        const res = await createTransaction({
            description,
            amount: parseFloat(amount),
            type,
            date,
            categoryId,
            recurrence,
            installments: recurrence === "parcelado" ? installments : undefined,
        });

        if (res?.success) {
            setAmount("");
            setDescription("");
            setDate(new Date().toISOString().split("T")[0]);
            setAddModalOpen(false);
            addToast("Sua transação já está no banco e no Dashboard!", "success");
            triggerRefresh();
        } else {
            addToast("Erro ao registrar no banco de dados.", "error");
        }

        setLoading(false);
    };

    const isExpense = type === "EXPENSE";
    const glowColor = isExpense
        ? "shadow-[0_0_20px_rgba(239,68,68,0.15)] focus-within:border-(--color-neon-red-light)"
        : "shadow-[0_0_20px_rgba(16,185,129,0.15)] focus-within:border-(--color-neon-green-light)";

    return (
        <AnimatePresence>
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto w-full h-screen">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setAddModalOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl my-auto flex flex-col items-center justify-center z-10 max-h-[90vh]"
                    >
                        <div className={`glass-panel p-6 md:p-8 flex flex-col gap-6 transition-all duration-500 w-full overflow-y-auto rounded-3xl hide-scrollbar ${glowColor}`}>

                            {/* Header */}
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight text-white">Transação Rápida</h2>
                                    <p className="text-sm text-(--color-text-muted) font-light">Adicione uma receita ou despesa facilmente.</p>
                                </div>
                                <button
                                    onClick={() => setAddModalOpen(false)}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-(--color-text-muted) hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="flex flex-col gap-6">
                                {/* Type Selector Toggle */}
                                <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 relative">
                                    <div
                                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl transition-all duration-300 ease-in-out ${isExpense ? "left-1 bg-red-500/20 border border-red-500/30" : "left-[calc(50%+2px)] bg-emerald-500/20 border border-emerald-500/30"
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setType("EXPENSE")}
                                        className={`flex-1 py-3 text-sm font-medium rounded-xl z-10 transition-colors ${isExpense ? "text-red-400" : "text-(--color-text-muted) hover:text-white"
                                            }`}
                                    >
                                        Despesa (Saída)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType("INCOME")}
                                        className={`flex-1 py-3 text-sm font-medium rounded-xl z-10 transition-colors ${!isExpense ? "text-emerald-400" : "text-(--color-text-muted) hover:text-white"
                                            }`}
                                    >
                                        Receita (Entrada)
                                    </button>
                                </div>

                                {/* Amount Input */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-(--color-text-muted) uppercase tracking-wider">Valor Monetário</label>
                                    <div className="relative flex items-center">
                                        <span className={`absolute left-4 text-xl font-bold ${isExpense ? "text-red-400" : "text-emerald-400"}`}>
                                            R$
                                        </span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0,00"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-3xl font-bold text-white outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Base Info Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-(--color-text-muted) uppercase tracking-wider">Descrição</label>
                                        <input
                                            type="text"
                                            required
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Ex: Supermercado"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-white/30 transition-colors"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-(--color-text-muted) uppercase tracking-wider">Data</label>
                                        <div className="relative">
                                            <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--color-text-muted)" />
                                            <input
                                                type="date"
                                                required
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-white/30 transition-colors"
                                                style={{ colorScheme: 'dark' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Category with inline create */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-(--color-text-muted) uppercase tracking-wider">Categoria</label>
                                        <button
                                            type="button"
                                            onClick={() => setShowNewCat(!showNewCat)}
                                            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Nova
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {showNewCat && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <input
                                                        type="text"
                                                        value={newCatName}
                                                        onChange={(e) => setNewCatName(e.target.value)}
                                                        placeholder="Nome da categoria"
                                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm outline-none focus:border-emerald-500/30 transition-colors"
                                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateCategory(); } }}
                                                        autoFocus
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleCreateCategory}
                                                        disabled={creatingCat || !newCatName.trim()}
                                                        className="px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-sm font-medium hover:bg-emerald-500/30 transition-all disabled:opacity-50"
                                                    >
                                                        {creatingCat ? "..." : "Criar"}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <select
                                        required
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-white/30 appearance-none"
                                    >
                                        {dbCategories.length === 0 && <option value="" disabled className="text-black">Nenhuma categoria criada</option>}
                                        {dbCategories.map(cat => (
                                            <option key={cat.id} value={cat.id} className="text-black">{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Recurrence Engine */}
                                <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
                                    <label className="text-sm font-medium text-(--color-text-muted) uppercase tracking-wider flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4" />
                                        Motor de Recorrência
                                    </label>

                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: "unico", label: "Único", icon: PlusCircle },
                                            { id: "parcelado", label: "Parcelado", icon: Layers },
                                            { id: "fixo", label: "Fixo (Mensal)", icon: RefreshCw },
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setRecurrence(opt.id as any)}
                                                className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${recurrence === opt.id
                                                    ? "bg-white/10 border-white/30 text-white"
                                                    : "bg-transparent border-transparent text-(--color-text-muted) hover:bg-white/5"
                                                    }`}
                                            >
                                                <opt.icon className="w-5 h-5" />
                                                <span className="text-xs font-semibold">{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Conditional Recurrence inputs */}
                                    {recurrence === "parcelado" && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 mt-2"
                                        >
                                            <span className="text-sm text-(--color-text-muted)">Em quantas parcelas? (2x a 60x)</span>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="range" min="2" max="60"
                                                    value={installments}
                                                    onChange={(e) => setInstallments(Number(e.target.value))}
                                                    className="w-32 accent-(--color-neon-green-light)"
                                                />
                                                <span className="font-bold w-8 text-right text-white">{installments}x</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {recurrence === "fixo" && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            className="p-4 bg-white/5 rounded-xl border border-white/10 mt-2"
                                        >
                                            <p className="text-sm text-(--color-text-muted) text-center">
                                                Este gasto será replicado automaticamente nos <b>próximos 12 meses</b>.
                                            </p>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className={`w-full py-4 mt-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 ${isExpense
                                        ? "bg-red-500 hover:bg-red-400 shadow-red-500/25"
                                        : "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/25"
                                        }`}
                                >
                                    Salvar {isExpense ? "Saída" : "Entrada"}
                                </button>

                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
