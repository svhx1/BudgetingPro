"use client";

import { useEffect, useRef } from "react";
import { useGlobal } from "@/contexts/GlobalContext";
import { getUpcomingAlerts } from "@/actions/alerts";

export default function AlertsManager() {
    const { addToast } = useGlobal();
    const hasFetched = useRef(false);

    useEffect(() => {
        // Rodar apenas uma vez no mount do app para não encher o usuário de Toasts a cada refresh
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchAlerts = async () => {
            const res = await getUpcomingAlerts();
            if (res.success && res.alerts) {
                // Dispara toasts de erro primeiro (mais urgentes), seguidos de warning
                // Um pequeno delay para cada toast não encavalar
                res.alerts.forEach((alert, index) => {
                    setTimeout(() => {
                        addToast(`${alert.title}: ${alert.message}`, alert.type as any);
                    }, index * 1000); // 1 segundo entre cada toast
                });
            }
        };

        fetchAlerts();
    }, [addToast]);

    return null; // Componente fantasma, não renderiza nada
}
