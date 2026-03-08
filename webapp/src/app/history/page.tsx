"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobal } from "@/contexts/GlobalContext";
import { getDashboardSummary } from "@/actions/dashboard";
import { deleteTransaction, deleteTransactionGroup } from "@/actions/transactions";
import { Trash2, Coffee, ArrowUpRight, ArrowDownRight, Layers, ShieldAlert, ChevronLeft, ChevronRight, MoreVertical, Edit2 } from "lucide-react";
import { useCachedData } from "@/hooks/useCachedData";

export default function HistoryPage() {
    const { isPrivacyMode, refreshTrigger, triggerRefresh, addToast, setEditModalOpen, setEditTxData } = useGlobal();

    // Local month selector for history
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth());
    const [year, setYear] = useState(now.getFullYear());

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTx, setSelectedTx] = useState<any>(null);

    // Dropdown state
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    const { data: summaryData, loading } = useCachedData(
        `history-extrato-${year}-${month}`,
        async () => {
            const res = await getDashboardSummary(month, year);
            return res.success && res.data ? { success: true, data: res.data } : { success: false };
        },
        [month, year, refreshTrigger]
    );

    const transactions = summaryData?.transactions || [];
    const totalMoved = (summaryData?.incomes || 0) + (summaryData?.expenses || 0);
    const monthBalance = summaryData?.monthBalance || 0;

    const prevMonth = () => {
        if (month === 0) { setMonth(11); setYear(year - 1); }
        else setMonth(month - 1);
    };

    const nextMonth = () => {
        if (month === 11) { setMonth(0); setYear(year + 1); }
        else setMonth(month + 1);
    };

    const handleDeleteClick = (tx: any) => {
        setOpenDropdownId(null);
        setSelectedTx(tx);
        setModalOpen(true);
    };

    const handleEditClick = (tx: any) => {
        setOpenDropdownId(null);
        setEditTxData(tx);
        setEditModalOpen(true);
    };

    const confirmDelete = async (deleteSeries: boolean) => {
        if (!selectedTx) return;

        if (deleteSeries && selectedTx.groupId) {
            await deleteTransactionGroup(selectedTx.groupId);
            addToast("Parcelas excluídas", "success");
        } else {
            await deleteTransaction(selectedTx.id);
            addToast("Transação removida com sucesso!", "success");
        }

        triggerRefresh();
        setModalOpen(false);
        setSelectedTx(null);
    };

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Extracting only DD/MM/YYYY for comparison to avoid timezone shifting
        const dString = d.toISOString().split("T")[0];
        const todayString = today.toISOString().split("T")[0];
        const yesterdayString = yesterday.toISOString().split("T")[0];

        if (dString === todayString) return "Hoje";
        if (dString === yesterdayString) return "Ontem";

        return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
    };

    return (
        <div className="flex flex-col min-h-screen w-full">
            <header className="mb-8 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-(--color-text-main) mb-2">
                            Extrato Detalhado
                        </h1>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 glass-panel rounded-full text-sm font-medium">
                            <span className="text-(--color-text-muted)">Total Movimentado:</span>
                            <span className="text-(--color-text-main)">
                                {isPrivacyMode ? "R$ ••••" : `R$ ${totalMoved.toFixed(2).replace('.', ',')}`}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 glass-panel rounded-full text-sm font-medium">
                            <span className="text-(--color-text-muted)">Saldo do Mês:</span>
                            <span className={monthBalance >= 0 ? "text-emerald-400" : "text-red-400"}>
                                {isPrivacyMode ? "R$ ••••" : `R$ ${Math.abs(monthBalance).toFixed(2).replace('.', ',')}`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Month Selector */}
                <div className="flex items-center justify-center gap-4">
                    <button onClick={prevMonth} className="p-2 rounded-xl bg-(--color-text-main)/5 hover:bg-(--color-text-main)/10 border border-(--color-text-main)/10 text-(--color-text-muted) hover:text-(--color-text-main) transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="px-6 py-2.5 rounded-2xl bg-(--color-text-main)/5 border border-(--color-text-main)/10 min-w-[200px] text-center">
                        <span className="text-(--color-text-main) font-bold text-lg">{monthNames[month]}</span>
                        <span className="text-(--color-text-muted) ml-2 text-sm">{year}</span>
                    </div>
                    <button onClick={nextMonth} className="p-2 rounded-xl bg-(--color-text-main)/5 hover:bg-(--color-text-main)/10 border border-(--color-text-main)/10 text-(--color-text-muted) hover:text-(--color-text-main) transition-all">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="flex-1 glass-panel p-6 md:p-10 rounded-3xl shadow-2xl">
                <div className="flex flex-col gap-4">
                    {loading ? (
                        <div className="text-center text-(--color-text-muted) py-20">Carregando extrato...</div>
                    ) : (
                        <AnimatePresence>
                            {transactions.map((t: any, idx: number) => {
                                const isIncome = t.type === "INCOME";
                                const isSeries = !!t.groupId;

                                return (
                                    <motion.div
                                        key={t.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="group relative flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-(--color-text-main)/5 border border-(--color-text-main)/5 hover:bg-(--color-text-main)/10 transition-all duration-300 gap-4"
                                    >
                                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300 pointer-events-none 
                                        ${isIncome ? 'bg-gradient-to-r from-emerald-500/5 to-transparent' : 'bg-gradient-to-r from-red-500/5 to-transparent'}`}
                                        />

                                        <div className="flex items-center gap-5 z-10 w-full md:w-auto">
                                            <div className={`p-4 rounded-xl shrink-0 shadow-lg ${isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {isSeries ? <Layers className="w-6 h-6" /> : isIncome ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                                            </div>
                                            <div className="flex flex-col flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className={`font-semibold text-base ${!t.description ? 'text-(--color-text-muted) italic' : 'text-(--color-text-main)'}`}>
                                                        {t.description || "Sem descrição"}
                                                    </p>
                                                    {!t.description && (
                                                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-[10px] uppercase font-bold text-orange-400" title="Adicione uma descrição depois">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                                            Pendente
                                                        </span>
                                                    )}
                                                    {isSeries && (
                                                        <span className="px-2 py-0.5 rounded-full bg-(--color-text-main)/10 text-[10px] uppercase font-bold text-(--color-text-muted)">
                                                            {t.installment || "Série"}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 text-sm text-(--color-text-muted) mt-1">
                                                    <span className="px-2 py-[2px] rounded-md bg-(--color-text-main)/5 border border-(--color-text-main)/10">{t.category?.name || "Sem categoria"}</span>
                                                    <span>•</span>
                                                    <span>{formatDate(t.date)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-6 z-10 w-full md:w-auto border-t md:border-t-0 border-(--color-text-main)/10 pt-4 md:pt-0">
                                            <div className={`text-lg md:text-xl font-bold ${isIncome ? 'text-emerald-400' : 'text-(--color-text-main)'}`}>
                                                {isIncome ? '+' : '-'} {isPrivacyMode ? "R$ ••••" : `R$ ${Math.abs(t.amount).toFixed(2).replace('.', ',')}`}
                                            </div>

                                            {/* Options Dropdown */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setOpenDropdownId(openDropdownId === t.id ? null : t.id)}
                                                    className="p-2 rounded-xl text-(--color-text-muted) hover:text-(--color-text-main) hover:bg-(--color-text-main)/5 transition-colors"
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>

                                                <AnimatePresence>
                                                    {openDropdownId === t.id && (
                                                        <>
                                                            {/* Invisible backdrop to catch clicks outside */}
                                                            <div
                                                                className="fixed inset-0 z-10"
                                                                onClick={() => setOpenDropdownId(null)}
                                                            />
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                transition={{ duration: 0.15 }}
                                                                className="absolute right-0 top-full mt-2 w-48 bg-(--color-base-bg) border border-(--color-text-main)/10 rounded-2xl shadow-xl z-20 overflow-hidden flex flex-col"
                                                            >
                                                                <button
                                                                    onClick={() => handleEditClick(t)}
                                                                    className="w-full text-left px-4 py-3 text-sm font-medium text-(--color-text-main) hover:bg-(--color-text-main)/5 flex items-center gap-3 transition-colors"
                                                                >
                                                                    <Edit2 className="w-4 h-4 text-emerald-400" />
                                                                    Editar
                                                                </button>
                                                                <div className="h-px bg-(--color-text-main)/10 w-full" />
                                                                <button
                                                                    onClick={() => handleDeleteClick({ ...t, isSeries })}
                                                                    className="w-full text-left px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                                    Excluir
                                                                </button>
                                                            </motion.div>
                                                        </>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}

                    {!loading && transactions.length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center text-center opacity-50">
                            <Coffee className="w-16 h-16 mb-4 text-(--color-text-muted)" />
                            <p className="text-xl font-medium text-(--color-text-main)">Nenhum lançamento encontrado.</p>
                            <p className="text-sm">Aproveite que o mês está limpo!</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal de Exclusão */}
            <AnimatePresence>
                {modalOpen && selectedTx && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-panel border border-(--color-text-main)/10 p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                            <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
                            <h2 className="text-2xl font-bold text-(--color-text-main) mb-2">Excluir Registro</h2>
                            <p className="text-(--color-text-muted) mb-6">
                                Tem certeza que deseja apagar <b>{selectedTx.description}</b>?
                                {selectedTx.isSeries && " Esta transação faz parte de um parcelamento ou recorrência fixa."}
                            </p>

                            <div className="flex flex-col gap-3">
                                {selectedTx.isSeries && (
                                    <button
                                        onClick={() => confirmDelete(true)}
                                        className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-(--color-text-main) transition-all font-semibold shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                                    >
                                        Excluir Parcelas
                                    </button>
                                )}
                                <button
                                    onClick={() => confirmDelete(false)}
                                    className="w-full py-3 rounded-xl bg-(--color-text-main)/5 text-(--color-text-main) border border-(--color-text-main)/10 hover:bg-(--color-text-main)/10 transition-all font-medium"
                                >
                                    Excluir Apenas Este Item
                                </button>
                                <button
                                    onClick={() => { setModalOpen(false); setSelectedTx(null) }}
                                    className="w-full py-3 rounded-xl text-(--color-text-muted) hover:text-(--color-text-main) transition-all font-medium mt-2"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
