"use client";

import { motion } from "framer-motion";
import BudgetAllocator from "@/components/dashboard/BudgetAllocator";

export default function BudgetPage() {
    return (
        <div className="flex flex-col min-h-screen w-full pb-10">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
                        Orçamento
                    </h1>
                    <p className="text-lg text-(--color-text-muted) font-light">
                        Pratique o Base Zero. Distribua sua renda de forma inteligente.
                    </p>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-5xl"
            >
                <BudgetAllocator />
            </motion.div>
        </div>
    );
}
