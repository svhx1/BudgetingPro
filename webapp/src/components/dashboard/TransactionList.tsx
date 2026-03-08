"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Home, Car, ShoppingBag, ArrowDownRight, ArrowUpRight, Edit3, Trash2, X, Check } from "lucide-react";
import { useGlobal } from "@/contexts/GlobalContext";
import { getDashboardSummary } from "@/actions/dashboard";
import { deleteTransaction } from "@/actions/transactions";
import { useCachedData } from "@/hooks/useCachedData";
import Link from "next/link";

export default function TransactionList() {
    const { isPrivacyMode, currentPeriod, refreshTrigger, triggerRefresh, addToast } = useGlobal();

    // Inline edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editDesc, setEditDesc] = useState("");
    const [editAmount, setEditAmount] = useState("");

    const { data: rawData, loading } = useCachedData(
        `dashboard-summary-${currentPeriod.year}-${currentPeriod.month}`,
        async () => {
            const res = await getDashboardSummary(currentPeriod.month, currentPeriod.year);
            return res.success && res.data ? { success: true, data: res.data } : { success: false };
        },
        [currentPeriod.month, currentPeriod.year, refreshTrigger]
    );

    const transactions = rawData && rawData.transactions
        ? [...rawData.transactions].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
        : [];

    const getIcon = (type: string, categoryName: string) => {
        if (type === "INCOME") return ArrowUpRight;
        const n = categoryName.toLowerCase();
        if (n.includes("mora") || n.includes("casa") || n.includes("alug")) return Home;
        if (n.includes("ali") || n.includes("comer") || n.includes("super")) return ShoppingBag;
        if (n.includes("trans") || n.includes("uber") || n.includes("post")) return Car;
        return ArrowDownRight;
    };

    const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleContextMenu = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        let x = e.clientX;
        let y = e.clientY;
        if (typeof window !== 'undefined') {
            if (x + 150 > window.innerWidth) x -= 150;
            if (y + 100 > window.innerHeight) y -= 100;
        }
        setContextMenu({ id, x, y });
    };

    const closeContextMenu = () => setContextMenu(null);

    const startEdit = (t: any) => {
        setEditingId(t.id);
        setEditDesc(t.description);
        setEditAmount(Math.abs(t.amount).toFixed(2));
        closeContextMenu();
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditDesc("");
        setEditAmount("");
    };

    const saveEdit = async () => {
        if (!editingId) return;
        try {
            const res = await fetch("/api/transactions/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: editingId, description: editDesc, amount: parseFloat(editAmount) })
            });
            if (res.ok) {
                addToast("Transação atualizada!", "success");
                triggerRefresh();
            } else {
                addToast("Erro ao atualizar", "error");
            }
        } catch {
            addToast("Erro de conexão", "error");
        }
        cancelEdit();
    };

    useEffect(() => {
        const handleClickOutside = () => closeContextMenu();
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, []);

    useEffect(() => {
        if (contextMenu) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [contextMenu]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-panel p-6 flex flex-col h-full overflow-hidden relative"
            ref={containerRef}
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-(--color-text-main)">Transações Recentes</h3>
                <Link href="/history" className="text-sm text-(--color-neon-green-light) hover:text-(--color-neon-green) transition-colors font-medium">
                    Ver todas
                </Link>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                    <div className="text-center text-(--color-text-muted) py-4">Carregando transações...</div>
                ) : transactions.length === 0 ? (
                    <div className="text-center text-(--color-text-muted) py-4">Nenhuma transação no período.</div>
                ) : transactions.map((t, i) => {
                    const Icon = getIcon(t.type, t.category?.name || "Outros");
                    const formattedDate = new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
                    const isEditing = editingId === t.id;

                    return (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.08 }}
                            className="group relative flex items-center justify-between p-4 rounded-2xl bg-(--color-text-main)/5 border border-(--color-text-main)/5 hover:bg-(--color-text-main)/10 transition-all duration-300"
                        >
                            {/* Hover Glow */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300 pointer-events-none 
              ${t.type === 'INCOME' ? 'bg-gradient-to-r from-emerald-500/5 to-transparent'
                                    : 'bg-gradient-to-r from-red-500/5 to-transparent'}`}
                            />

                            {/* Context Menu trigger */}
                            <div
                                className="absolute inset-0 cursor-pointer z-0"
                                onContextMenu={(e) => handleContextMenu(e, t.id)}
                            />

                            <div className="flex items-center gap-4 z-10 pointer-events-none">
                                <div className={`p-3 rounded-xl ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                    }`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    {isEditing ? (
                                        <input
                                            value={editDesc}
                                            onChange={(e) => setEditDesc(e.target.value)}
                                            className="pointer-events-auto bg-(--color-text-main)/10 border border-(--color-text-main)/20 rounded-lg px-2 py-1 text-(--color-text-main) text-sm outline-none focus:border-emerald-500/50 w-40"
                                            autoFocus
                                        />
                                    ) : (
                                        <p className="text-(--color-text-main) font-medium text-sm md:text-base line-clamp-1">{t.description}</p>
                                    )}
                                    <div className="flex items-center gap-2 text-xs text-(--color-text-muted) mt-1">
                                        <span>{t.category?.name || t.categoryId}</span>
                                        <span className="w-1 h-1 rounded-full bg-(--color-text-main)/20" />
                                        <span>{formattedDate}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="z-10 flex items-center gap-3">
                                {isEditing ? (
                                    <div className="flex items-center gap-2 pointer-events-auto">
                                        <input
                                            value={editAmount}
                                            onChange={(e) => setEditAmount(e.target.value)}
                                            className="bg-(--color-text-main)/10 border border-(--color-text-main)/20 rounded-lg px-2 py-1 text-(--color-text-main) text-sm outline-none focus:border-emerald-500/50 w-20 text-right"
                                        />
                                        <button onClick={saveEdit} className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button onClick={cancelEdit} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className={`pointer-events-none text-right font-medium min-w-fit ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-(--color-text-main)'}`}>
                                        {t.type === 'INCOME' ? '+' : '-'} {isPrivacyMode ? "R$ ••••" : `R$ ${Math.abs(t.amount).toFixed(2).replace('.', ',')}`}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Custom Context Menu */}
            <AnimatePresence>
                {contextMenu && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="fixed z-50 w-48 bg-[#1B1D22]/95 backdrop-blur-xl border border-(--color-text-main)/10 rounded-2xl shadow-2xl overflow-hidden"
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col py-2">
                            <button
                                onClick={() => {
                                    const tx = transactions.find(t => t.id === contextMenu.id);
                                    if (tx) startEdit(tx);
                                }}
                                className="flex items-center gap-3 px-4 py-3 text-sm text-(--color-text-main) hover:bg-(--color-text-main)/5 transition-colors text-left"
                            >
                                <Edit3 className="w-4 h-4 text-(--color-neon-green-light)" />
                                Editar Transação
                            </button>
                            <div className="h-px bg-(--color-text-main)/10 my-1 mx-2" />
                            <button
                                onClick={async () => {
                                    const id = contextMenu.id;
                                    closeContextMenu();
                                    addToast(`Deletando Lançamento...`, "info");
                                    const res = await deleteTransaction(id.toString());
                                    if (res.success) {
                                        addToast("Transação removida com sucesso", "success");
                                        triggerRefresh();
                                    } else {
                                        addToast(res.error || "Erro ao remover", "error");
                                    }
                                }}
                                className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                            >
                                <Trash2 className="w-4 h-4" />
                                Remover
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
