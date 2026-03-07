"use client";

import { motion } from "framer-motion";
import { useGlobal } from "@/contexts/GlobalContext";
import { Target, Plus, TrendingUp } from "lucide-react";

export default function GoalsPage() {
    const { isPrivacyMode } = useGlobal();

    return (
        <div className="flex flex-col min-h-screen w-full pb-10">
            <header className="mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
                    Metas Financeiras
                </h1>
                <p className="text-lg text-(--color-text-muted) font-light">
                    Defina objetivos e acompanhe seu progresso ao longo dos meses.
                </p>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-10 md:p-16 rounded-3xl flex flex-col items-center justify-center text-center"
            >
                <div className="p-6 bg-white/5 rounded-2xl mb-6">
                    <Target className="w-16 h-16 text-(--color-text-muted)" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-3">Em Breve</h2>
                <p className="text-(--color-text-muted) max-w-md mb-8">
                    Aqui você poderá criar metas como "Viagem de Férias" ou "Reserva de Emergência" e monitorar o quanto já guardou. Estamos finalizando essa funcionalidade.
                </p>

                <div className="flex items-center gap-4 text-sm text-(--color-text-muted)">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                        <TrendingUp className="w-4 h-4" />
                        <span>Tracking de Progresso</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                        <Plus className="w-4 h-4" />
                        <span>Metas Ilimitadas</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
