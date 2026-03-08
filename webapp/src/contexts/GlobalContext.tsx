"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ThemeConfig, CustomTheme, BUILT_IN_THEMES, DEFAULT_CUSTOM_THEME, applyTheme, applyCustomTheme } from "@/lib/themes";
import { getCategories } from "@/actions/categories";
import { getDashboardSummary } from "@/actions/dashboard";
import { setCacheData } from "@/hooks/useCachedData";

type Period = {
    month: number;
    year: number;
};

export type ToastType = "success" | "error" | "info";
export interface ToastInfo {
    id: number;
    message: string;
    type: ToastType;
}

export interface ProfileData {
    name: string;
    email: string;
    avatarUrl: string | null;
}

interface GlobalContextProps {
    isPrivacyMode: boolean;
    togglePrivacyMode: () => void;
    currentPeriod: Period;
    setCurrentPeriod: (period: Period) => void;
    isAddModalOpen: boolean;
    setAddModalOpen: (isOpen: boolean) => void;
    isEditModalOpen: boolean;
    setEditModalOpen: (isOpen: boolean) => void;
    editTxData: any;
    setEditTxData: (tx: any) => void;
    refreshTrigger: number;
    triggerRefresh: () => void;
    addToast: (message: string, type?: ToastType) => void;
    profileData: ProfileData;
    setProfileData: (data: ProfileData) => void;
    // Theme
    currentThemeId: string;
    setThemeById: (id: string) => void;
    customTheme: CustomTheme;
    setCustomTheme: (theme: CustomTheme) => void;
    // Decorations
    decorationId: string | null;
    setDecorationId: (id: string | null) => void;
    hatId: string | null;
    setHatId: (id: string | null) => void;
    // Categories Cache
    categories: any[];
    setCategories: (cats: any[]) => void;
}

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
    const [isPrivacyMode, setIsPrivacyMode] = useState(false);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editTxData, setEditTxData] = useState<any>(null);
    const [currentPeriod, setCurrentPeriod] = useState<Period>({
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
    });

    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

    const [categories, setCategories] = useState<any[]>([]);

    const [profileData, setProfileDataState] = useState<ProfileData>({
        name: "",
        email: "",
        avatarUrl: null,
    });

    // Theme state
    const [currentThemeId, setCurrentThemeId] = useState("ocean");
    const [customTheme, setCustomThemeState] = useState<CustomTheme>(DEFAULT_CUSTOM_THEME);

    // Decoration state
    const [decorationId, setDecorationIdState] = useState<string | null>(null);
    const [hatId, setHatIdState] = useState<string | null>(null);

    // Load all preferences from localStorage
    useEffect(() => {
        const savedAvatar = localStorage.getItem("budgeting_avatar");
        const savedName = localStorage.getItem("budgeting_name");
        const savedEmail = localStorage.getItem("budgeting_email");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProfileDataState(prev => ({
            ...prev,
            ...(savedAvatar ? { avatarUrl: savedAvatar } : {}),
            ...(savedName ? { name: savedName } : {}),
            ...(savedEmail ? { email: savedEmail } : {}),
        }));

        const savedTheme = localStorage.getItem("budgeting_theme");
        if (savedTheme) setCurrentThemeId(savedTheme);

        const savedCustom = localStorage.getItem("budgeting_custom_theme");
        if (savedCustom) {
            try { setCustomThemeState(JSON.parse(savedCustom)); } catch { }
        }

        const savedDecoration = localStorage.getItem("budgeting_decoration");
        if (savedDecoration) setDecorationIdState(savedDecoration);

        const savedHat = localStorage.getItem("budgeting_hat");
        if (savedHat) setHatIdState(savedHat);
    }, []);

    // Background Fetch for Categories & Pre-Caching (Current and Last Month)
    useEffect(() => {
        async function fetchBackground() {
            // 1. Categories
            const res = await getCategories();
            if (res.success && res.data) {
                setCategories(res.data);
            }

            // 2. Pre-cache Current Month
            const currRes = await getDashboardSummary(currentPeriod.month, currentPeriod.year);
            if (currRes.success && currRes.data) {
                setCacheData(`dashboard-summary-${currentPeriod.year}-${currentPeriod.month}`, currRes.data);
                setCacheData(`history-extrato-${currentPeriod.year}-${currentPeriod.month}`, currRes.data);
            }

            // 3. Pre-cache Previous Month
            const prevMonth = currentPeriod.month === 0 ? 11 : currentPeriod.month - 1;
            const prevYear = currentPeriod.month === 0 ? currentPeriod.year - 1 : currentPeriod.year;
            const prevRes = await getDashboardSummary(prevMonth, prevYear);
            if (prevRes.success && prevRes.data) {
                setCacheData(`dashboard-summary-${prevYear}-${prevMonth}`, prevRes.data);
                setCacheData(`history-extrato-${prevYear}-${prevMonth}`, prevRes.data);
            }
        }
        fetchBackground();
    }, [refreshTrigger, currentPeriod]);

    // Apply theme whenever it changes
    useEffect(() => {
        if (currentThemeId === "custom") {
            applyCustomTheme(customTheme);
        } else {
            const theme = BUILT_IN_THEMES.find(t => t.id === currentThemeId);
            if (theme) applyTheme(theme);
        }
    }, [currentThemeId, customTheme]);

    const setThemeById = (id: string) => {
        setCurrentThemeId(id);
        localStorage.setItem("budgeting_theme", id);
    };

    const setCustomTheme = (theme: CustomTheme) => {
        setCustomThemeState(theme);
        localStorage.setItem("budgeting_custom_theme", JSON.stringify(theme));
        if (currentThemeId === "custom") {
            applyCustomTheme(theme);
        }
    };

    const setDecorationId = (id: string | null) => {
        setDecorationIdState(id);
        if (id) localStorage.setItem("budgeting_decoration", id);
        else localStorage.removeItem("budgeting_decoration");
    };

    const setHatId = (id: string | null) => {
        setHatIdState(id);
        if (id) localStorage.setItem("budgeting_hat", id);
        else localStorage.removeItem("budgeting_hat");
    };

    const setProfileData = (data: ProfileData) => {
        setProfileDataState(data);
        if (data.avatarUrl) localStorage.setItem("budgeting_avatar", data.avatarUrl);
        if (data.name) localStorage.setItem("budgeting_name", data.name);
        if (data.email) localStorage.setItem("budgeting_email", data.email);
    };

    const [toasts, setToasts] = useState<ToastInfo[]>([]);
    const addToast = (message: string, type: ToastType = "info") => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    const togglePrivacyMode = () => setIsPrivacyMode((prev) => !prev);

    return (
        <GlobalContext.Provider
            value={{
                isPrivacyMode,
                togglePrivacyMode,
                currentPeriod,
                setCurrentPeriod,
                isAddModalOpen,
                setAddModalOpen,
                isEditModalOpen,
                setEditModalOpen,
                editTxData,
                setEditTxData,
                refreshTrigger,
                triggerRefresh,
                addToast,
                profileData,
                setProfileData,
                currentThemeId,
                setThemeById,
                customTheme,
                setCustomTheme,
                decorationId,
                setDecorationId,
                hatId,
                setHatId,
                categories,
                setCategories,
            }}
        >
            {children}

            {/* Global Toasts Container — top right */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md transform transition-all duration-300 translate-y-0 opacity-100 flex items-center gap-3 ${toast.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                            toast.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-500" :
                                "bg-(--color-text-main)/10 border-(--color-text-main)/20 text-(--color-text-main)"
                            }`}
                    >
                        <span className="font-semibold text-sm max-w-[300px] break-words">{toast.message}</span>
                    </div>
                ))}
            </div>
        </GlobalContext.Provider>
    );
}

export function useGlobal() {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error("useGlobal must be used within a GlobalProvider");
    }
    return context;
}
