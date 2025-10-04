import { DasSidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";

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
      <div className="">{children}</div>
    </div>
  );
};
