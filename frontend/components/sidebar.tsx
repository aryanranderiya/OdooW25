"use client";

import {
  SidebarBody,
  SidebarLink,
  useSidebar,
} from "@/components/ui/sidebar-internal";
import {
  IconDashboard,
  IconUsers,
  IconReceipt,
  IconPlus,
} from "@tabler/icons-react";
import { CardIcon } from "./ui/icons";
import { ROUTES } from "@/lib/constants";
import { CheckCheck } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

export function DasSidebar() {
  const { user } = useAuth();

  const baseLinks = [
    {
      label: "Dashboard",
      href: ROUTES.DASHBOARD,
      icon: (
        <IconDashboard className="h-5 w-5 flex-shrink-0 text-neutral-600 dark:text-neutral-400" />
      ),
    },
    {
      label: "Expenses",
      href: ROUTES.EXPENSES,
      icon: (
        <IconReceipt className="h-5 w-5 flex-shrink-0 text-neutral-600 dark:text-neutral-400" />
      ),
    },
  ];

  const adminLinks = [
    {
      label: "Users",
      href: ROUTES.USERS,
      icon: (
        <IconUsers className="h-5 w-5 flex-shrink-0 text-neutral-600 dark:text-neutral-400" />
      ),
    },
  ];

  const managerLinks = [
    {
      label: "Approval",
      href: ROUTES.ADMIN,
      icon: (
        <CheckCheck className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  const links = [
    ...baseLinks,
    ...(user?.role === "ADMIN" ? adminLinks : []),
    ...(user?.role === "MANAGER" || user?.role === "ADMIN" ? managerLinks : []),
  ];

  return (
    <SidebarBody className="justify-between gap-10">
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Logo />
        <CreateExpenseButton />
        <div className="mt-6 flex flex-col gap-1">
          {links.map((link, idx) => (
            <SidebarLink key={idx} link={link} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1 border-t border-neutral-200 dark:border-neutral-700 pt-4">
        {managerLinks.map((link, idx) => (
          <SidebarLink key={idx} link={link} />
        ))}
      </div>
    </SidebarBody>
  );
}

const CreateExpenseButton = () => {
  const { open, animate } = useSidebar();
  const router = useRouter();

  const handleClick = () => {
    router.push(ROUTES.CREATE_EXPENSE);
  };

  return (
    <motion.button
      onClick={handleClick}
      animate={{
        width: animate ? (open ? "100%" : "44px") : "100%",
      }}
      className="group relative mt-6 flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow hover:shadow-blue-500/30  active:scale-[0.98] dark:from-blue-600 dark:to-blue-700 dark:shadow-blue-600/20"
    >
      <IconPlus className="h-5 w-5 flex-shrink-0" strokeWidth={2.5} />
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="whitespace-nowrap font-medium"
      >
        New Expense
      </motion.span>
    </motion.button>
  );
};

const Logo = () => {
  const { open, animate } = useSidebar();

  return (
    <motion.div
      className="flex items-center gap-3 px-3 py-2 relative z-20"
      animate={{
        justifyContent: animate
          ? open
            ? "flex-start"
            : "center"
          : "flex-start",
      }}
    >
      <div className="h-8 w-8 flex items-center justifyce">
        <CardIcon />
      </div>
      <motion.div
        animate={{
          display: animate ? (open ? "block" : "none") : "block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="flex flex-col"
      >
        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
          Expense Manager
        </span>
      </motion.div>
    </motion.div>
  );
};
