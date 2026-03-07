"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, TrendingDown, TrendingUp, X } from "lucide-react";
import { useGlobal } from "@/contexts/GlobalContext";
import { usePathname } from "next/navigation";

export default function FloatingActionButton() {
    const { isAddModalOpen, setAddModalOpen } = useGlobal();
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);

    const authPages = ["/login", "/register"];
    if (authPages.includes(pathname)) return null;

    const handleSelect = (type: "EXPENSE" | "INCOME") => {
        setIsExpanded(false);
        // Store the selected type so the modal picks it up
        window.__budgeting_tx_type = type;
        setAddModalOpen(true);
    };

    return (
        <>
            {/* Backdrop when expanded */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsExpanded(false)}
                        className="fixed inset-0 z-39 bg-black/30 backdrop-blur-[2px]"
                    />
                )}
            </AnimatePresence>

            {/* Container */}
            <div className="fixed bottom-28 left-1/2 -translate-x-1/2 md:bottom-10 md:left-auto md:right-10 md:translate-x-0 z-40 flex flex-col items-center gap-3">

                {/* Bubbles */}
                <AnimatePresence>
                    {isExpanded && (
                        <>
                            {/* Income bubble (left) */}
                            <motion.button
                                initial={{ scale: 0, opacity: 0, y: 20, x: 30 }}
                                animate={{ scale: 1, opacity: 1, y: 0, x: -44 }}
                                exit={{ scale: 0, opacity: 0, y: 20, x: 30 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.05 }}
                                onClick={() => handleSelect("INCOME")}
                                className="absolute bottom-0 flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-colors backdrop-blur-xl shadow-lg whitespace-nowrap"
                            >
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-sm font-semibold">Receita</span>
                            </motion.button>

                            {/* Expense bubble (right) */}
                            <motion.button
                                initial={{ scale: 0, opacity: 0, y: 20, x: -30 }}
                                animate={{ scale: 1, opacity: 1, y: 0, x: 44 }}
                                exit={{ scale: 0, opacity: 0, y: 20, x: -30 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0 }}
                                onClick={() => handleSelect("EXPENSE")}
                                className="absolute bottom-0 flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors backdrop-blur-xl shadow-lg whitespace-nowrap"
                            >
                                <TrendingDown className="w-4 h-4" />
                                <span className="text-sm font-semibold">Despesa</span>
                            </motion.button>
                        </>
                    )}
                </AnimatePresence>

                {/* Main FAB */}
                <AnimatePresence>
                    {!isAddModalOpen && (
                        <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsExpanded(prev => !prev)}
                            className="relative p-4 md:p-5 rounded-full bg-(--color-neon-green) text-black shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_40px_rgba(16,185,129,0.8)] transition-all duration-300"
                        >
                            <motion.div
                                animate={{ rotate: isExpanded ? 45 : 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <Plus className="w-6 h-6 md:w-8 md:h-8" strokeWidth={3} />
                            </motion.div>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}

// Type augmentation for the window object
declare global {
    interface Window {
        __budgeting_tx_type?: "EXPENSE" | "INCOME";
    }
}
