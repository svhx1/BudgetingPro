import RecurringView from "@/components/recurring/RecurringView";

export const metadata = {
    title: "Recorrentes | Budgeting",
    description: "Gerencie e visualize seus gastos fixos e parcelados",
};

export default function RecurringPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 w-full pb-10 mt-4 md:mt-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <RecurringView />
            </main>

            {/* Ambient Background Radial */}
            <div className="fixed top-0 right-0 w-3/4 h-3/4 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.06),rgba(0,0,0,0)_60%)]" />
            <div className="fixed bottom-0 left-0 w-1/2 h-1/2 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.04),rgba(0,0,0,0)_60%)]" />
        </div>
    );
}
