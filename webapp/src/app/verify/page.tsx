"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Wallet, ShieldCheck, RotateCw } from "lucide-react";
import { verifyCodeAndLogin, sendVerificationCode } from "@/actions/auth";
import { useSearchParams } from "next/navigation";

function VerifyForm() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    const name = searchParams.get("name") || undefined;

    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendCooldown, setResendCooldown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Cooldown timer
    useEffect(() => {
        if (resendCooldown <= 0) {
            setCanResend(true);
            return;
        }
        const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    // Auto-focus first input
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^[0-9]?$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-advance
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all filled
        if (value && index === 5) {
            const fullCode = newCode.join("");
            if (fullCode.length === 6) {
                handleVerify(fullCode);
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 6) {
            const newCode = pasted.split("");
            setCode(newCode);
            inputRefs.current[5]?.focus();
            handleVerify(pasted);
        }
    };

    const handleVerify = async (fullCode: string) => {
        setLoading(true);
        setError("");

        const res = await verifyCodeAndLogin(email, fullCode, name);

        if (res?.success) {
            window.location.href = "/";
        } else {
            setError(res?.error || "Código inválido.");
            setCode(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        setCanResend(false);
        setResendCooldown(60);
        setError("");

        const res = await sendVerificationCode(email);
        if (!res.success) {
            setError(res.error || "Erro ao reenviar");
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black text-white">
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
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                    </motion.div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Verificação
                    </h1>
                    <p className="text-(--color-text-muted) text-sm text-center mt-2 font-light">
                        Enviamos um código de 6 dígitos para
                    </p>
                    <p className="text-white font-medium text-sm mt-1">{email}</p>
                </div>

                {/* OTP Inputs */}
                <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
                    {code.map((digit, index) => (
                        <motion.input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.05 }}
                            className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border outline-none transition-all
                                ${digit
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                    : "bg-black/50 border-white/10 text-white"
                                }
                                focus:border-emerald-500/50 focus:bg-emerald-500/5
                            `}
                        />
                    ))}
                </div>

                {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20 mb-4">
                        {error}
                    </motion.p>
                )}

                {loading && (
                    <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-white/10 border-t-emerald-400 rounded-full animate-spin" />
                    </div>
                )}

                {/* Resend */}
                <div className="text-center mt-4">
                    {canResend ? (
                        <button
                            onClick={handleResend}
                            className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
                        >
                            <RotateCw className="w-4 h-4" />
                            Reenviar código
                        </button>
                    ) : (
                        <p className="text-sm text-(--color-text-muted)">
                            Reenviar em <span className="text-white font-medium">{resendCooldown}s</span>
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-8 h-8 border-2 border-white/10 border-t-emerald-400 rounded-full animate-spin" />
            </div>
        }>
            <VerifyForm />
        </Suspense>
    );
}
