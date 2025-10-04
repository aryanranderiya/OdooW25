import { DasSidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";
import { DollarSign } from "lucide-react";
import { CreditCard } from "lucide-react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen"
      )}
    >
      <DasSidebar />
      <Dashboard>{children}</Dashboard>
    </div>
  );
}

export const Dashboard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="p-2 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
              <CreditCard className="size-5" />
            </div>
            <span className="text-lg font-semibold">Expense Management</span>
          </div>
        </div>
      </header>

      <div className="">{children}</div>
    </div>
  );
};
