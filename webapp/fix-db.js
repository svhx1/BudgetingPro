const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
    const groups = await prisma.transaction.groupBy({
        by: ['groupId'],
        where: {
            groupId: { not: null },
            installment: { not: null, notIn: ["Fixo"] }
        },
        _min: { date: true }
    });

    for (const g of groups) {
        if (!g.groupId || !g._min.date) continue;
        await prisma.transaction.updateMany({
            where: { groupId: g.groupId },
            data: { originalDate: g._min.date }
        });
    }

    console.log(`Updated ${groups.length} installment groups.`);

    // Agora vamos recalcular os monthly summaries globalmente
    const allTransactions = await prisma.transaction.findMany();
    const groupedMap = new Map();

    for (const tx of allTransactions) {
        const m = tx.date.getUTCMonth() + 1;
        const y = tx.date.getUTCFullYear();
        const slotKey = `${y}-${m}_${tx.userId}`;

        if (!groupedMap.has(slotKey)) {
            groupedMap.set(slotKey, { userId: tx.userId, year: y, month: m, incomes: 0, expenses: 0, credit: 0 });
        }

        const box = groupedMap.get(slotKey);

        if (tx.type === "INCOME") box.incomes += tx.amount;
        if (tx.type === "EXPENSE") {
            box.expenses += tx.amount;
            if (tx.paymentMethod === "CREDIT") box.credit += tx.amount;
        }
    }

    await prisma.monthlySummary.deleteMany();

    const upsertArray = Array.from(groupedMap.values()).map(data => ({
        userId: data.userId,
        year: data.year,
        month: data.month,
        totalIncomes: data.incomes,
        totalExpenses: data.expenses,
        totalCreditUsed: data.credit
    }));

    if (upsertArray.length > 0) {
        await prisma.monthlySummary.createMany({ data: upsertArray });
    }

    console.log(`Recreated ${upsertArray.length} monthly summaries.`);
}

fix().catch(console.error).finally(() => prisma.$disconnect());
