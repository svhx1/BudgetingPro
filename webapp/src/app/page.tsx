import SummaryCards from "@/components/dashboard/SummaryCards";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import TransactionList from "@/components/dashboard/TransactionList";
import BudgetLimits from "@/components/dashboard/BudgetLimits";
import CashflowChart from "@/components/dashboard/CashflowChart";
import TrendChart from "@/components/dashboard/TrendChart";

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 w-full space-y-8 pb-10 mt-4 md:mt-0">

        {/* Top Intelligence Section (Ritmo + Cards) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TrendChart />
          </div>
          <div className="lg:col-span-1">
            <SummaryCards />
          </div>
        </section>

        {/* Row 1: Limits + Transactions */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <BudgetLimits />
          </div>
          <div className="lg:col-span-3">
            <TransactionList />
          </div>
        </section>

        {/* Row 2: Cashflow Chart — full width */}
        <section>
          <CashflowChart />
        </section>

        {/* Row 3: Expense Chart — standalone */}
        <section className="max-w-xl">
          <ExpenseChart />
        </section>
      </main>

      {/* Ambient BG */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-[radial-gradient(circle_at_50%_-20%,rgba(16,185,129,0.05),rgba(0,0,0,0)_50%)]" />
    </div>
  );
}
