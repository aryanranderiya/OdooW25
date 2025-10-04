import { SignupForm } from "@/components/signup-form";
import { CardIcon } from "@/components/ui/icons";

export default function SignupPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <CardIcon className="size-4" />
          </div>
          Expense Management
        </a>
        <SignupForm />
      </div>
    </div>
  );
}
