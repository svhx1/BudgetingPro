"use server";

import { prisma } from "@/lib/prisma";
import { getLoggedUserId } from "@/actions/auth";

type TransactionType = "INCOME" | "EXPENSE";

export interface DailyTrend {
    day: number;
    currentMonthExpense: number;
    currentMonthIncome: number;
    lastMonthExpense: number;
    lastMonthIncome: number;
    accumulatedExpense: number;
    accumulatedIncome: number;
    lastAccumulatedExpense: number;
    lastAccumulatedIncome: number;
}

export interface TrendResponse {
    success: boolean;
    data?: DailyTrend[];
    metrics?: {
        totalExpenseCurrent: number;
        totalExpenseLast: number;
        percentageChangeExpense: number; // Negativo é bom (gastou menos)
    };
    error?: string;
}

export async function getTrendData(jsMonth: number, year: number, type: TransactionType = "EXPENSE"): Promise<TrendResponse> {
    try {
        const userId = await getLoggedUserId();
        if (!userId) {
            return { success: false, error: "Não autorizado" };
        }

        // Mapear o Month (jsMonth do frontend varia de 0 a 11) para 1-12
        const month = jsMonth + 1;

        // Determinar as datas do Mês Atual (selecionado no App)
        // Usar formato UTC literal para evitar drift de Fuso Horário no Servidor (Ex: 01 de Março virar 28 de Fev as 21:00)
        const currentMonthStr = month.toString().padStart(2, '0');
        const currentStartDate = new Date(`${year}-${currentMonthStr}-01T00:00:00.000Z`);

        // Final do mês atual
        const currentEndDateObj = new Date(year, month, 0); // Ex: 31 de março
        const currentEndDayStr = currentEndDateObj.getDate().toString().padStart(2, '0');
        const currentEndDate = new Date(`${year}-${currentMonthStr}-${currentEndDayStr}T23:59:59.999Z`);

        const currentDaysInMonth = currentEndDateObj.getDate();

        // Determinar as datas do Mês Anterior
        let lastMonth = month - 1;
        let lastYear = year;
        if (lastMonth < 1) {
            lastMonth = 12;
            lastYear--;
        }
        const lastMonthStr = lastMonth.toString().padStart(2, '0');
        const lastStartDate = new Date(`${lastYear}-${lastMonthStr}-01T00:00:00.000Z`);

        // Final do Mês Anterior
        const lastEndDateObj = new Date(lastYear, lastMonth, 0);
        const lastEndDayStr = lastEndDateObj.getDate().toString().padStart(2, '0');
        const lastEndDate = new Date(`${lastYear}-${lastMonthStr}-${lastEndDayStr}T23:59:59.999Z`);

        // Se quisermos mapear até o dia 31, usamos o maior número de dias entre os dois meses
        const maxDays = Math.max(currentDaysInMonth, lastEndDate.getDate());

        // Buscar todas as transações do Mês Atual filtradas por tipo
        const currentTxs = await prisma.transaction.findMany({
            where: {
                userId,
                date: { gte: currentStartDate, lte: currentEndDate },
                type: type
            },
            select: { amount: true, date: true }
        });

        // Buscar todas as transações do Mês Anterior filtradas por tipo
        const lastTxs = await prisma.transaction.findMany({
            where: {
                userId,
                date: { gte: lastStartDate, lte: lastEndDate },
                type: type
            },
            select: { amount: true, date: true }
        });

        // Inicializar array de suporte para cada dia do mês (1 a maxDays)
        const dailyData: DailyTrend[] = Array.from({ length: maxDays }, (_, i) => ({
            day: i + 1,
            currentMonthExpense: 0,
            currentMonthIncome: 0,
            lastMonthExpense: 0,
            lastMonthIncome: 0,
            accumulatedExpense: 0,
            accumulatedIncome: 0,
            lastAccumulatedExpense: 0,
            lastAccumulatedIncome: 0,
        }));

        // Popular ocorrências diárias (Mês Atual)
        currentTxs.forEach(tx => {
            const dayIdx = tx.date.getUTCDate() - 1;
            const absAmount = Math.abs(tx.amount);
            if (type === "EXPENSE") dailyData[dayIdx].currentMonthExpense += absAmount;
            if (type === "INCOME") dailyData[dayIdx].currentMonthIncome += absAmount;
        });

        // Popular ocorrências diárias (Mês Passado)
        lastTxs.forEach(tx => {
            const dayIdx = tx.date.getUTCDate() - 1;
            const absAmount = Math.abs(tx.amount);
            if (type === "EXPENSE") dailyData[dayIdx].lastMonthExpense += absAmount;
            if (type === "INCOME") dailyData[dayIdx].lastMonthIncome += absAmount;
        });

        // Calcular a cursa de Acúmulo (Running Total)
        let runningCurrentExp = 0, runningCurrentInc = 0;
        let runningLastExp = 0, runningLastInc = 0;

        // Limite do mês atual (ex: se hoje é dia 15 do mês corrente, não desenhamos o acumulo do dia 16 pra frente para o mês atual, apenas deixamos null/0)
        const now = new Date();
        const isCurrentMonth = now.getMonth() + 1 === month && now.getFullYear() === year;
        const currentDayCap = isCurrentMonth ? now.getDate() : currentDaysInMonth;

        dailyData.forEach(d => {
            // Last Month
            if (d.day <= lastEndDate.getDate()) {
                runningLastExp += d.lastMonthExpense;
                runningLastInc += d.lastMonthIncome;
            }
            d.lastAccumulatedExpense = runningLastExp;
            d.lastAccumulatedIncome = runningLastInc;

            // Current Month
            if (d.day <= currentDayCap) {
                runningCurrentExp += d.currentMonthExpense;
                runningCurrentInc += d.currentMonthIncome;
                d.accumulatedExpense = runningCurrentExp;
                d.accumulatedIncome = runningCurrentInc;
            } else {
                // Manter o último valor constante (ou omitir visualmente no frontend)
                // Para manter a linha plana ou cortar no chart vamos setar indefinido se necessário
                // Mas aqui mandamos o total repetido ou podemos setar null no frontend.
                // Vamos enviar repedido para facilitar o Recharts
                d.accumulatedExpense = isCurrentMonth ? 0 : runningCurrentExp;
                d.accumulatedIncome = isCurrentMonth ? 0 : runningCurrentInc;
            }
        });

        // Se current month ainda não terminou, zerar do array o futuro
        if (isCurrentMonth) {
            dailyData.forEach(d => {
                if (d.day > currentDayCap) {
                    // Hack para o recharts cortar a linha em vez de despencar pro 0
                    (d as any).accumulatedExpense = null;
                    (d as any).accumulatedIncome = null;
                }
            })
        }

        // Metrics globais (Mês todo vs Mês todo, ou acumulado até o dia de hoje)
        const totalExpenseCurrent = runningCurrentExp;
        // Para comparar perfeitamente, devemos comparar com o mês anterior *ATÉ* o mesmo dia?
        // Sim, se estamos no dia 15, comparar com o gasto do dia 15 do mês passado faz mais sentido.
        const comparableLastExp = isCurrentMonth ? dailyData[currentDayCap - 1]?.lastAccumulatedExpense || 0 : runningLastExp;

        const percentageChangeExpense = comparableLastExp > 0
            ? ((totalExpenseCurrent - comparableLastExp) / comparableLastExp) * 100
            : 0;

        return {
            success: true,
            data: dailyData,
            metrics: {
                totalExpenseCurrent,
                totalExpenseLast: comparableLastExp,
                percentageChangeExpense
            }
        }
    } catch (error) {
        console.error("Failed to fetch trend data", error);
        return { success: false, error: "Falha ao buscar ritmo de gastos" };
    }
}
