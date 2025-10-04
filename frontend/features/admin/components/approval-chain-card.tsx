import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconSettings, IconTrash } from "@tabler/icons-react";
import { ApprovalChain } from "./types";

interface ApprovalChainCardProps {
  chain: ApprovalChain;
  onEdit: (chain: ApprovalChain) => void;
  onDelete: (chainId: number) => void;
}

export function ApprovalChainCard({
  chain,
  onEdit,
  onDelete,
}: ApprovalChainCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {chain.name}
            {chain.active && <Badge variant="secondary">Active</Badge>}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(chain)}>
              <IconSettings className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(chain.id)}
              className="hover:bg-destructive hover:text-destructive-foreground"
            >
              <IconTrash className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>Conditions: {chain.conditions}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {chain.steps.map((step, index) => (
            <div
              key={step.order}
              className="flex items-center gap-4 p-3 border rounded-lg"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                {step.order}
              </div>
              <div className="flex-1">
                <p className="font-medium">{step.role}</p>
                <p className="text-sm text-muted-foreground">
                  Escalates after {step.escalationDays} days
                </p>
              </div>
              {index < chain.steps.length - 1 && (
                <div className="text-muted-foreground">→</div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
