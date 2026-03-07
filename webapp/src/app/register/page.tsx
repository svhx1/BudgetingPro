"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Mail, User, ArrowRight } from "lucide-react";
import { sendVerificationCode } from "@/actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await sendVerificationCode(email);

        if (res?.success) {
            router.push(`/verify?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`);
        } else {
            setError(res?.error || "Erro ao enviar código.");
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black text-white selection:bg-(--color-neon-green-light) selection:text-black">
            {/* Liquid Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 50, ease: "linear" }}
                    className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-emerald-500/20 to-transparent blur-[100px]"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                    className="absolute top-[40%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-bl from-indigo-500/20 to-transparent blur-[120px]"
                />
            </div>

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md p-8 sm:p-12 mx-4 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-[2rem]"
            >
                <div className="flex flex-col items-center justify-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                        className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-indigo-500 rounded-2xl flex items-center justify-center p-0.5 shadow-lg mb-6"
                    >
                        <div className="w-full h-full bg-black/80 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <Wallet className="w-8 h-8 text-white" />
                        </div>
                    </motion.div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Criar Conta
                    </h1>
                    <p className="text-(--color-text-muted) text-sm text-center mt-2 font-light">
                        Preencha seus dados e enviaremos um código de verificação.
                    </p>
                </div>

                <form onSubmit={handleRegister} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-(--color-text-muted) uppercase tracking-widest pl-2">
                            Nome
                        </label>
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500" />
                            <div className="relative flex items-center">
                                <User className="absolute left-4 w-5 h-5 text-(--color-text-muted) group-focus-within:text-white transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Seu nome completo"
                                    className="w-full bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/30 outline-none focus:border-white/30 transition-all font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-(--color-text-muted) uppercase tracking-widest pl-2">
                            Email
                        </label>
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500" />
                            <div className="relative flex items-center">
                                <Mail className="absolute left-4 w-5 h-5 text-(--color-text-muted) group-focus-within:text-white transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu.email@exemplo.com"
                                    className="w-full bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/30 outline-none focus:border-white/30 transition-all font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                            {error}
                        </motion.p>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        type="submit"
                        className="group relative w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-bold mt-2 hover:bg-gray-100 transition-all disabled:opacity-70"
                    >
                        {loading ? "Enviando código..." : "Criar Conta"}
                        {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </motion.button>
                </form>

                <p className="text-center text-sm text-(--color-text-muted) mt-6">
                    Já tem conta?{" "}
                    <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                        Entrar
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
