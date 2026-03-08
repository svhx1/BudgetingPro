"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
    value: string; // Expected format: YYYY-MM-DD
    onChange: (date: string) => void;
}

export function DatePicker({ value, onChange }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Initialize calendar state based on passed value or current date
    const initialDate = value ? new Date(value + "T12:00:00Z") : new Date();
    const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
    const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

    // Handle outside clicks to close the popover
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                popoverRef.current && !popoverRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleSelectDay = (day: number) => {
        const formattedMonth = String(currentMonth + 1).padStart(2, "0");
        const formattedDay = String(day).padStart(2, "0");
        const newDateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
        onChange(newDateStr);
        setIsOpen(false); // Close immediately
    };

    const formatDisplayDate = (dateStr: string) => {
        if (!dateStr) return "Selecione uma data";
        try {
            const [y, m, d] = dateStr.split("-");
            return `${d}/${m}/${y}`;
        } catch {
            return dateStr;
        }
    };

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

    // Generate padding days for the calendar grid
    const blanks = Array.from({ length: firstDay }, (_, i) => i);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const isSelected = (day: number) => {
        if (!value) return false;
        const [y, m, d] = value.split("-").map(Number);
        return y === currentYear && m === currentMonth + 1 && d === day;
    };

    const isToday = (day: number) => {
        const today = new Date();
        return today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    };

    return (
        <div className="relative w-full">
            {/* Display Button */}
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center bg-(--color-text-main)/5 hover:bg-(--color-text-main)/10 border border-(--color-text-main)/10 rounded-xl py-3 px-4 text-(--color-text-main) font-semibold outline-none focus:border-(--color-text-main)/30 transition-all cursor-pointer"
            >
                <CalendarDays className="w-5 h-5 text-(--color-text-muted) mr-3" />
                <span>{formatDisplayDate(value)}</span>
            </button>

            {/* Calendar Popover */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={popoverRef}
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute left-0 mt-2 z-50 w-72 glass-panel border border-(--color-text-main)/10 rounded-2xl shadow-2xl p-4"
                        style={{ top: "100%" }}
                    >
                        {/* Header: Month/Year Nav */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                type="button"
                                onClick={prevMonth}
                                className="p-1.5 rounded-lg text-(--color-text-muted) hover:bg-(--color-text-main)/10 hover:text-(--color-text-main) transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="font-bold text-(--color-text-main)">
                                {monthNames[currentMonth]} {currentYear}
                            </span>
                            <button
                                type="button"
                                onClick={nextMonth}
                                className="p-1.5 rounded-lg text-(--color-text-muted) hover:bg-(--color-text-main)/10 hover:text-(--color-text-main) transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Weekdays */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {weekDays.map((wd, i) => (
                                <div key={i} className="text-center text-xs font-semibold text-(--color-text-muted)">
                                    {wd}
                                </div>
                            ))}
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {blanks.map((b) => (
                                <div key={`blank-${b}`} className="w-8 h-8" />
                            ))}
                            {days.map((d) => {
                                const active = isSelected(d);
                                const todayLine = isToday(d);
                                return (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => handleSelectDay(d)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all duration-200 ${active
                                                ? "bg-(--color-text-main) text-(--color-bg-base) font-bold shadow-md"
                                                : "text-(--color-text-main) hover:bg-(--color-text-main)/10"
                                            } ${todayLine && !active ? "border border-(--color-text-main)/30 font-bold" : ""}`}
                                    >
                                        {d}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
