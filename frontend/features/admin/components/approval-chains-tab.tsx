"use client";

import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { ApprovalChain } from "./types";
import { ApprovalChainCard } from "./approval-chain-card";

interface ApprovalChainsTabProps {
  chains: ApprovalChain[];
  onCreateChain: () => void;
  onEditChain: (chain: ApprovalChain) => void;
  onDeleteChain: (chainId: number) => void;
}

export function ApprovalChainsTab({
  chains,
  onCreateChain,
  onEditChain,
  onDeleteChain,
}: ApprovalChainsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Approval Chains</h2>
          <p className="text-muted-foreground">
            Configure multi-step approval workflows
          </p>
        </div>
        <Button onClick={onCreateChain}>
          <IconPlus className="h-4 w-4 mr-2" />
          Create New Chain
        </Button>
      </div>

      <div className="grid gap-4">
        {chains.map((chain) => (
          <ApprovalChainCard
            key={chain.id}
            chain={chain}
            onEdit={onEditChain}
            onDelete={onDeleteChain}
          />
        ))}
      </div>
    </div>
  );
}
