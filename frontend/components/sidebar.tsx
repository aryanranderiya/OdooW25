import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from "@/components/ui/sidebar-internal";
<<<<<<< HEAD
import {
  IconDashboard,
  IconUsers,
  IconSettings,
  IconReceipt,
  IconPlus,
} from "@tabler/icons-react";
import { CardIcon } from "./ui/icons";
=======
import { IconDashboard, IconUsers, IconSettings } from "@tabler/icons-react";
import { DollarSign } from "lucide-react";
>>>>>>> 3cfe4c7 (feat: better dashboard layout)

export function DasSidebar() {
  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <IconDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "List Expenses",
      href: "/expenses",
      icon: (
        <IconReceipt className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Create Expense",
      href: "/expenses/create",
      icon: (
        <IconPlus className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: (
        <IconUsers className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: (
        <IconSettings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  return (
    <Sidebar animate>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Logo />
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

export const Logo = () => {
  return (
<<<<<<< HEAD
    <div className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
      <div className="h-6 w-6 flex-shrink-0">
        <CardIcon />
      </div>
      <span className="font-medium text-black dark:text-white whitespace-pre">
        Expense Management
      </span>
=======
    <div className="container mx-auto flex h-16 items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md">
          <DollarSign className="size-5" />
        </div>
        <span>Atom</span>
      </div>
>>>>>>> 3cfe4c7 (feat: better dashboard layout)
    </div>
  );
};
