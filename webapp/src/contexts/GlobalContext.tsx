"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
    refreshTrigger: number;
    triggerRefresh: () => void;
    addToast: (message: string, type?: ToastType) => void;
    profileData: ProfileData;
    setProfileData: (data: ProfileData) => void;
}

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
    const [isPrivacyMode, setIsPrivacyMode] = useState(false);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [currentPeriod, setCurrentPeriod] = useState<Period>({
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
    });

    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

    const [profileData, setProfileDataState] = useState<ProfileData>({
        name: "",
        email: "",
        avatarUrl: null,
    });

    // Load avatar from localStorage on mount
    useEffect(() => {
        const savedAvatar = localStorage.getItem("budgeting_avatar");
        if (savedAvatar) {
            setProfileDataState(prev => ({ ...prev, avatarUrl: savedAvatar }));
        }
    }, []);

    const setProfileData = (data: ProfileData) => {
        setProfileDataState(data);
        if (data.avatarUrl) {
            localStorage.setItem("budgeting_avatar", data.avatarUrl);
        }
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
                refreshTrigger,
                triggerRefresh,
                addToast,
                profileData,
                setProfileData,
            }}
        >
            {children}

            {/* Global Toasts Container */}
            <div className="fixed top-4 right-4 md:bottom-10 md:right-10 md:top-auto z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md transform transition-all duration-300 translate-y-0 opacity-100 flex items-center gap-3 ${toast.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                            toast.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-500" :
                                "bg-white/10 border-white/20 text-white"
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
