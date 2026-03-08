"use client";

import { useState, useRef, useCallback } from "react";
import { useGlobal } from "@/contexts/GlobalContext";
import { CustomThemePoint } from "@/lib/themes";
import { Trash2, Plus } from "lucide-react";

export default function GradientEditor() {
    const { customTheme, setCustomTheme, currentThemeId } = useGlobal();
    const canvasRef = useRef<HTMLDivElement>(null);
    const [selectedPoint, setSelectedPoint] = useState<string | null>(null);

    const isActive = currentThemeId === "custom";

    const addPoint = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (customTheme.points.length >= 5) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

        const newPoint: CustomThemePoint = {
            id: `p${Date.now()}`,
            x,
            y,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
            radius: 35,
        };

        setCustomTheme({
            ...customTheme,
            points: [...customTheme.points, newPoint],
        });
        setSelectedPoint(newPoint.id);
    }, [customTheme, setCustomTheme]);

    const updatePoint = (id: string, updates: Partial<CustomThemePoint>) => {
        setCustomTheme({
            ...customTheme,
            points: customTheme.points.map(p => p.id === id ? { ...p, ...updates } : p),
        });
    };

    const removePoint = (id: string) => {
        setCustomTheme({
            ...customTheme,
            points: customTheme.points.filter(p => p.id !== id),
        });
        if (selectedPoint === id) setSelectedPoint(null);
    };

    const handleDrag = (e: React.MouseEvent<HTMLDivElement>, pointId: string) => {
        e.stopPropagation();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const onMove = (ev: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = Math.max(0, Math.min(100, Math.round(((ev.clientX - rect.left) / rect.width) * 100)));
            const y = Math.max(0, Math.min(100, Math.round(((ev.clientY - rect.top) / rect.height) * 100)));
            updatePoint(pointId, { x, y });
        };

        const onUp = () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        };

        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    };

    const bgGradients = customTheme.points
        .map(p => `radial-gradient(circle at ${p.x}% ${p.y}%, ${p.color}25 0%, transparent ${p.radius}%)`)
        .join(", ");

    return (
        <div className={`space-y-4 ${!isActive ? "opacity-40 pointer-events-none" : ""}`}>
            <p className="text-xs text-(--color-text-muted)">
                Clique no quadrado para adicionar pontos de cor ({customTheme.points.length}/5). Arraste para mover.
            </p>

            {/* Canvas */}
            <div
                ref={canvasRef}
                onClick={addPoint}
                className="relative w-full aspect-square max-w-[320px] rounded-2xl border border-(--color-text-main)/10 cursor-crosshair overflow-hidden select-none"
                style={{
                    backgroundColor: customTheme.baseBg,
                    backgroundImage: bgGradients,
                }}
            >
                {customTheme.points.map(point => (
                    <div
                        key={point.id}
                        onMouseDown={(e) => handleDrag(e, point.id)}
                        onClick={(e) => { e.stopPropagation(); setSelectedPoint(point.id); }}
                        className={`absolute w-5 h-5 rounded-full border-2 cursor-grab active:cursor-grabbing transition-shadow z-10 ${selectedPoint === point.id ? "ring-2 ring-white/50 scale-125" : ""
                            }`}
                        style={{
                            left: `${point.x}%`,
                            top: `${point.y}%`,
                            transform: "translate(-50%, -50%)",
                            backgroundColor: point.color,
                            borderColor: "rgba(255,255,255,0.5)",
                            boxShadow: `0 0 12px ${point.color}60`,
                        }}
                    />
                ))}

                {customTheme.points.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-(--color-text-muted) text-sm">
                        <Plus className="w-5 h-5 mr-2" /> Clique para adicionar
                    </div>
                )}
            </div>

            {/* Point controls */}
            {selectedPoint && (() => {
                const point = customTheme.points.find(p => p.id === selectedPoint);
                if (!point) return null;
                return (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-(--color-text-main)/5 border border-(--color-text-main)/10">
                        <input
                            type="color"
                            value={point.color}
                            onChange={(e) => updatePoint(point.id, { color: e.target.value })}
                            className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                        />
                        <div className="flex-1">
                            <label className="text-[10px] text-(--color-text-muted) uppercase tracking-wider">Raio</label>
                            <input
                                type="range"
                                min={10}
                                max={60}
                                value={point.radius}
                                onChange={(e) => updatePoint(point.id, { radius: Number(e.target.value) })}
                                className="w-full accent-emerald-500"
                            />
                        </div>
                        <button
                            onClick={() => removePoint(point.id)}
                            className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                );
            })()}

            {/* Base color */}
            <div className="flex items-center gap-3">
                <label className="text-xs text-(--color-text-muted)">Cor de fundo:</label>
                <input
                    type="color"
                    value={customTheme.baseBg}
                    onChange={(e) => setCustomTheme({ ...customTheme, baseBg: e.target.value })}
                    className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                />
            </div>
        </div>
    );
}
