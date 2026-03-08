const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const txs = await prisma.transaction.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });
  console.log(txs.map(t => ({ id: t.id, desc: t.description, amount: t.amount, date: t.date, createdAt: t.createdAt })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
