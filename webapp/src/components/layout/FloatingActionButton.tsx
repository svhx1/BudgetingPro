"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useGlobal } from "@/contexts/GlobalContext";
import { usePathname } from "next/navigation";

export default function FloatingActionButton() {
    const { isAddModalOpen, setAddModalOpen } = useGlobal();
    const pathname = usePathname();

    // Se estivermos na tela de login (que faremos depois), ocultamos o FAB.
    if (pathname === "/login") return null;

    return (
        <AnimatePresence>
            {!isAddModalOpen && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setAddModalOpen(true)}
                    className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-40 p-4 md:p-5 rounded-full bg-(--color-neon-green) text-black shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_40px_rgba(16,185,129,0.8)] transition-shadow duration-300"
                >
                    <Plus className="w-6 h-6 md:w-8 md:h-8" strokeWidth={3} />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
