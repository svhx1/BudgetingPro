"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Tags, Target, Trash2, DatabaseZap, ShieldAlert, Palette, Plus, Check, User, Save, Camera, LogOut, Paintbrush, Sparkles } from "lucide-react";
import { logoutUser } from "@/actions/auth";
import { useGlobal } from "@/contexts/GlobalContext";
import { getCategories, createCategory, deleteCategory } from "@/actions/categories";
import { getDashboardLimits, upsertLimit } from "@/actions/limits";
import { getUserProfile, updateUserProfile, uploadAvatar } from "@/actions/profile";
import ThemeSelector from "@/components/settings/ThemeSelector";
import GradientEditor from "@/components/settings/GradientEditor";
import DecorationPicker from "@/components/settings/DecorationPicker";

export default function SettingsPage() {
    const { addToast, currentPeriod, refreshTrigger, triggerRefresh, profileData, setProfileData } = useGlobal();

    const [categories, setCategories] = useState<any[]>([]);
    const [limits, setLimits] = useState<any[]>([]);

    const [loadingData, setLoadingData] = useState(true);

    // Profile — pre-load from localStorage for instant display
    const [profileName, setProfileName] = useState(() => {
        if (typeof window !== "undefined") return localStorage.getItem("budgeting_name") || "";
        return "";
    });
    const [profileEmail, setProfileEmail] = useState(() => {
        if (typeof window !== "undefined") return localStorage.getItem("budgeting_email") || "";
        return "";
    });
    const [profileDirty, setProfileDirty] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);

    // Form States
    const [isAddingCat, setIsAddingCat] = useState(false);
    const [newCatName, setNewCatName] = useState("");
    const [newCatColor, setNewCatColor] = useState("#10b981");

    const [isAddingLimit, setIsAddingLimit] = useState(false);
    const [limitCategoryId, setLimitCategoryId] = useState("");
    const [limitAmount, setLimitAmount] = useState("");

    const [mockLoading, setMockLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);

    const fetchData = async () => {
        setLoadingData(true);
        const [catsRes, limsRes, profileRes] = await Promise.all([
            getCategories(),
            getDashboardLimits(currentPeriod.month, currentPeriod.year),
            getUserProfile()
        ]);

        if (catsRes.success && catsRes.data) setCategories(catsRes.data);
        if (limsRes.success && limsRes.data) setLimits(limsRes.data);
        if (profileRes.success && profileRes.data) {
            setProfileName(profileRes.data.name || "");
            setProfileEmail(profileRes.data.email || "");
            setProfileData({
                name: profileRes.data.name || "",
                email: profileRes.data.email || "",
                avatarUrl: profileRes.data.avatarUrl || profileData.avatarUrl || null,
            });
        }
        setLoadingData(false);
    };

    useEffect(() => {
        fetchData();
    }, [currentPeriod.month, currentPeriod.year, refreshTrigger]);

    const handleSaveProfile = async () => {
        if (!profileName.trim()) return addToast("Nome não pode ser vazio", "error");
        setSavingProfile(true);
        const res = await updateUserProfile(profileName.trim());
        if (res.success) {
            addToast("Perfil atualizado!", "success");
            setProfileData({ ...profileData, name: profileName.trim() });
            setProfileDirty(false);
        } else {
            addToast(res.error || "Erro", "error");
        }
        setSavingProfile(false);
    };

    // Handlers
    const handleAddCategory = async () => {
        if (!newCatName.trim()) return addToast("Nome da categoria vazio", "error");

        addToast("Adicionando categoria...", "info");
        const res = await createCategory(newCatName, newCatColor);
        if (res.success) {
            addToast("Categoria criada!", "success");
            setNewCatName("");
            setIsAddingCat(false);
            triggerRefresh(); // Recarrega todas telas
        } else {
            addToast(res.error || "Erro", "error");
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("Deletar categoria? (Será removida permanentemente)")) return;
        addToast("Deletando categoria...", "info");
        const res = await deleteCategory(id);
        if (res.success) {
            addToast("Removida com sucesso", "success");
            triggerRefresh();
        } else {
            addToast(res.error || "Erro", "error");
        }
    };

    const handleSaveLimit = async () => {
        if (!limitCategoryId || !limitAmount || isNaN(Number(limitAmount))) return addToast("Categoria e valor numérico obrigatórios.", "error");

        addToast("Salvando teto de gastos...", "info");
        const res = await upsertLimit(limitCategoryId, Number(limitAmount));
        if (res.success) {
            addToast("Limite atualizado!", "success");
            setLimitAmount("");
            setLimitCategoryId("");
            setIsAddingLimit(false);
            triggerRefresh();
        } else {
            addToast(res.error || "Erro", "error");
        }
    };

    const handleMockDB = async () => {
        setMockLoading(true);
        const { populateMockDatabase } = await import("@/actions/settings");
        const res = await populateMockDatabase();
        if (res.success) {
            addToast("Banco de dados preenchido com dados fictícios!", "success");
            triggerRefresh();
        } else {
            addToast("Erro ao popular.", "error");
        }
        setMockLoading(false);
    };

    const handleResetDB = async () => {
        const confirm = window.confirm("CUIDADO: Isso apagará TODAS as suas transações. Continuar?");
        if (confirm) {
            setResetLoading(true);
            const { resetDatabase } = await import("@/actions/settings");
            const res = await resetDatabase();
            if (res.success) {
                addToast("Limpeza finalizada. Database limpa.", "success");
                triggerRefresh();
            } else {
                addToast("Erro", "error");
            }
            setResetLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-full pb-10">
            <header className="mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
                    Ajustes
                </h1>
                <p className="text-lg text-(--color-text-muted) font-light">
                    Personalize sua experiência corporativa e gerencie sua base de dados.
                </p>
            </header>

            {/* Perfil do Usuário */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6 md:p-8 mb-8"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-(--color-neon-green-light)" />
                        <h2 className="text-lg font-semibold text-white">Meu Perfil</h2>
                    </div>
                    <button
                        onClick={() => logoutUser()}
                        className="p-2 rounded-xl hover:bg-red-500/10 text-(--color-text-muted) hover:text-red-400 transition-colors"
                        title="Sair da conta"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Avatar with upload */}
                    <div className="relative group shrink-0">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="avatar-upload"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (file.size > 2 * 1024 * 1024) {
                                    return addToast("Imagem deve ter no máximo 2MB", "error");
                                }
                                addToast("Enviando foto...", "info");
                                const fd = new FormData();
                                fd.append("avatar", file);
                                const res = await uploadAvatar(fd);
                                if (res.success && res.url) {
                                    setProfileData({ ...profileData, avatarUrl: res.url });
                                    addToast("Foto atualizada!", "success");
                                } else {
                                    addToast(res.error || "Erro no upload", "error");
                                }
                            }}
                        />
                        <label htmlFor="avatar-upload" className="cursor-pointer block">
                            {profileData.avatarUrl ? (
                                <img
                                    src={profileData.avatarUrl}
                                    alt="Avatar"
                                    className="w-20 h-20 rounded-2xl object-cover shadow-lg ring-2 ring-white/10 group-hover:ring-emerald-500/40 transition-all"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-indigo-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg ring-2 ring-white/10 group-hover:ring-emerald-500/40 transition-all">
                                    {profileName ? profileName.charAt(0).toUpperCase() : "?"}
                                </div>
                            )}
                            <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        </label>
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-(--color-text-muted) uppercase tracking-wider">Nome</label>
                            <input
                                value={profileName}
                                onChange={(e) => { setProfileName(e.target.value); setProfileDirty(true); }}
                                className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white outline-none focus:border-white/25 transition-colors w-full md:max-w-sm"
                                placeholder="Seu nome"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-(--color-text-muted) uppercase tracking-wider">Email</label>
                            <p className="text-sm text-(--color-text-muted) px-1">{profileEmail}</p>
                        </div>

                        {profileDirty && (
                            <motion.button
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={handleSaveProfile}
                                disabled={savingProfile}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all text-sm font-medium disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {savingProfile ? "Salvando..." : "Salvar Alterações"}
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Theme & Decorations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Tema Visual */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                    className="glass-panel p-6 md:p-8 rounded-3xl"
                >
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                        <div className="p-2 bg-violet-500/10 rounded-xl text-violet-400"><Paintbrush className="w-5 h-5" /></div>
                        <h2 className="text-xl font-bold text-white">Tema Visual</h2>
                    </div>
                    <ThemeSelector />
                    <div className="mt-6">
                        <GradientEditor />
                    </div>
                </motion.section>

                {/* Decorações */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="glass-panel p-6 md:p-8 rounded-3xl"
                >
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                        <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400"><Sparkles className="w-5 h-5" /></div>
                        <h2 className="text-xl font-bold text-white">Decorações do Perfil</h2>
                    </div>
                    <DecorationPicker />
                </motion.section>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Categorias */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="glass-panel p-6 md:p-8 rounded-3xl"
                >
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400"><Tags className="w-5 h-5" /></div>
                        <h2 className="text-xl font-bold text-white">Suas Categorias</h2>
                    </div>

                    <div className="space-y-4">
                        {loadingData ? (
                            <div className="text-sm text-(--color-text-muted)">Carregando...</div>
                        ) : categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: cat.color }} />
                                    <span className="font-medium text-white">{cat.name}</span>
                                </div>
                                <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-(--color-text-muted) hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}

                        {isAddingCat ? (
                            <div className="flex items-center gap-3 p-4 bg-white/10 border border-(--color-neon-green-light)/30 rounded-2xl animate-in fade-in zoom-in duration-300">
                                <input type="color" value={newCatColor} onChange={(e) => setNewCatColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Nome da Categoria"
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/30 text-sm"
                                />
                                <button onClick={handleAddCategory} className="p-2 bg-(--color-neon-green-light)/20 text-(--color-neon-green-light) rounded-lg hover:bg-(--color-neon-green-light)/40">
                                    <Check className="w-4 h-4" />
                                </button>
                                <button onClick={() => setIsAddingCat(false)} className="p-2 text-(--color-text-muted) hover:text-white">✕</button>
                            </div>
                        ) : (
                            <button onClick={() => setIsAddingCat(true)} className="w-full py-3 mt-2 rounded-xl border border-dashed border-white/20 text-(--color-text-muted) hover:text-white hover:border-white/50 transition-all font-medium text-sm">
                                + Nova Categoria
                            </button>
                        )}
                    </div>
                </motion.section>

                {/* Limites de Gastos */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="glass-panel p-6 md:p-8 rounded-3xl"
                >
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400"><Target className="w-5 h-5" /></div>
                        <h2 className="text-xl font-bold text-white">Teto de Gastos</h2>
                    </div>

                    <p className="text-sm text-(--color-text-muted) mb-6">
                        Para habilitar a barra de progresso no Dashboard, defina limites mensais para cada categoria.
                    </p>

                    <div className="space-y-4">
                        {loadingData ? (
                            <div className="text-sm text-(--color-text-muted)">Carregando...</div>
                        ) : limits.map(lim => (
                            <div key={lim.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group hover:bg-white/10 transition-colors">
                                <div className="flex flex-col">
                                    <span className="font-medium text-white">{lim.categoryName}</span>
                                    <span className="text-xs text-emerald-400 font-semibold mt-1">Ativo: R$ {lim.limitAmount.toFixed(2)}</span>
                                </div>
                                <button className="text-sm font-medium px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-white">Editar</button>
                            </div>
                        ))}

                        {isAddingLimit ? (
                            <div className="flex flex-col gap-3 p-4 bg-white/10 border border-(--color-neon-green-light)/30 rounded-2xl animate-in fade-in zoom-in duration-300">
                                <select
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white text-sm outline-none"
                                    value={limitCategoryId}
                                    onChange={(e) => setLimitCategoryId(e.target.value)}
                                >
                                    <option value="" disabled className="text-black">Selecione uma categoria...</option>
                                    {categories.map((cat: any) => (
                                        <option key={cat.id} value={cat.id} className="text-black">{cat.name}</option>
                                    ))}
                                </select>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-(--color-text-muted) px-2">R$</span>
                                        <input
                                            type="number"
                                            placeholder="Gasto Máximo Mensal"
                                            value={limitAmount}
                                            onChange={(e) => setLimitAmount(e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 pl-12 text-white outline-none text-sm font-medium"
                                        />
                                    </div>
                                    <button onClick={handleSaveLimit} className="p-3 bg-(--color-neon-green-light) text-black rounded-xl hover:bg-white transition-colors">
                                        <Check className="w-5 h-5" />
                                    </button>
                                </div>
                                <button onClick={() => setIsAddingLimit(false)} className="text-xs text-(--color-text-muted) hover:text-white mt-1">Cancelar</button>
                            </div>
                        ) : (
                            <button onClick={() => setIsAddingLimit(true)} className="w-full py-3 mt-2 rounded-xl border border-dashed border-white/20 text-(--color-text-muted) hover:text-white hover:border-white/50 transition-all font-medium text-sm">
                                + Novo Limite de Categoria
                            </button>
                        )}
                    </div>
                </motion.section>

                {/* DB Tools (Danger Zone) */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="glass-panel p-6 md:p-8 rounded-3xl lg:col-span-2 relative overflow-hidden border-red-500/20"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0" />

                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                        <div className="p-2 bg-red-500/10 rounded-xl text-red-500"><ShieldAlert className="w-5 h-5" /></div>
                        <h2 className="text-xl font-bold text-white">Developer Tools</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <h3 className="font-medium text-white">Popular Banco de Dados</h3>
                            <p className="text-sm text-(--color-text-muted) mb-2">Gera 50 lançamentos aleatórios nos últimos 3 meses para testar a interface e paginadores.</p>
                            <button
                                onClick={handleMockDB}
                                disabled={mockLoading}
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-(--color-neon-green-light)/10 text-(--color-neon-green-light) hover:bg-(--color-neon-green-light)/20 transition-colors font-semibold disabled:opacity-50"
                            >
                                <DatabaseZap className="w-4 h-4" />
                                {mockLoading ? "Gerando..." : "Gerar Dados Mock"}
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h3 className="font-medium text-red-400">Hard Reset</h3>
                            <p className="text-sm text-(--color-text-muted) mb-2">Apaga TODAS as transações e categorias atreladas à sua conta. Ação irreversível.</p>
                            <button
                                onClick={handleResetDB}
                                disabled={resetLoading}
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all duration-300 font-semibold shadow-[0_0_15px_rgba(239,68,68,0.0)] hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Trash2 className="w-4 h-4" />
                                {resetLoading ? "Limpando Banco..." : "Resetar Database"}
                            </button>
                        </div>
                    </div>
                </motion.section>



            </div>
        </div>
    );
}
