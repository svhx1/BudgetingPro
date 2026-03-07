"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, TrendingDown, TrendingUp } from "lucide-react";
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
        window.__budgeting_tx_type = type;
        setAddModalOpen(true);
    };

    return (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 md:bottom-10 md:left-auto md:right-10 md:translate-x-0 z-40 flex items-center justify-center">

            {/* Bubbles — liquid glass circles */}
            <AnimatePresence>
                {isExpanded && (
                    <>
                        <motion.button
                            initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                            animate={{ scale: 1, opacity: 1, x: -55, y: -60 }}
                            exit={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            onClick={() => handleSelect("INCOME")}
                            className="absolute w-12 h-12 rounded-full flex items-center justify-center border border-white/15 hover:scale-110 transition-transform"
                            style={{
                                background: "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(255,255,255,0.04) 100%)",
                                backdropFilter: "blur(24px)",
                                WebkitBackdropFilter: "blur(24px)",
                                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.2)",
                            }}
                            title="Receita"
                        >
                            <TrendingUp className="w-5 h-5 text-emerald-400" strokeWidth={2.5} />
                        </motion.button>

                        <motion.button
                            initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                            animate={{ scale: 1, opacity: 1, x: 30, y: -70 }}
                            exit={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                            transition={{ duration: 0.15, ease: "easeOut", delay: 0.03 }}
                            onClick={() => handleSelect("EXPENSE")}
                            className="absolute w-12 h-12 rounded-full flex items-center justify-center border border-white/15 hover:scale-110 transition-transform"
                            style={{
                                background: "linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(255,255,255,0.04) 100%)",
                                backdropFilter: "blur(24px)",
                                WebkitBackdropFilter: "blur(24px)",
                                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.2)",
                            }}
                            title="Despesa"
                        >
                            <TrendingDown className="w-5 h-5 text-red-400" strokeWidth={2.5} />
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
                        className="relative p-4 md:p-5 rounded-full bg-(--color-neon-green) text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-200"
                    >
                        <motion.div
                            animate={{ rotate: isExpanded ? 45 : 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <Plus className="w-6 h-6 md:w-8 md:h-8" strokeWidth={3} />
                        </motion.div>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}

declare global {
    interface Window {
        __budgeting_tx_type?: "EXPENSE" | "INCOME";
    }
}
