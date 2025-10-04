"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { IconAlertTriangle } from "@tabler/icons-react";
import { EscalationSettings } from "./types";

interface EscalationSettingsTabProps {
  settings: EscalationSettings;
  onUpdateSettings: (settings: EscalationSettings) => void;
}

export function EscalationSettingsTab({
  settings,
  onUpdateSettings,
}: EscalationSettingsTabProps) {
  const updateSetting = <K extends keyof EscalationSettings>(
    key: K,
    value: EscalationSettings[K]
  ) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconAlertTriangle className="h-5 w-5" />
          Escalation Settings
        </CardTitle>
        <CardDescription>
          Configure escalation rules and timeouts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="default-escalation">
              Default Escalation Time (Days)
            </Label>
            <Input
              id="default-escalation"
              type="number"
              value={settings.defaultEscalationDays}
              onChange={(e) =>
                updateSetting("defaultEscalationDays", parseInt(e.target.value))
              }
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">
              Default number of days before escalating to the next approver
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-escalations">Maximum Escalation Levels</Label>
            <Select
              value={settings.maxEscalationLevels.toString()}
              onValueChange={(value) =>
                updateSetting(
                  "maxEscalationLevels",
                  value === "unlimited" ? "unlimited" : parseInt(value)
                )
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Levels</SelectItem>
                <SelectItem value="4">4 Levels</SelectItem>
                <SelectItem value="5">5 Levels</SelectItem>
                <SelectItem value="unlimited">Unlimited</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekend Escalation</Label>
              <p className="text-sm text-muted-foreground">
                Count weekends in escalation timing
              </p>
            </div>
            <Switch
              checked={settings.weekendEscalation}
              onCheckedChange={(checked) =>
                updateSetting("weekendEscalation", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Approve on Final Escalation</Label>
              <p className="text-sm text-muted-foreground">
                Automatically approve if all escalation levels are reached
              </p>
            </div>
            <Switch
              checked={settings.autoApproveOnFinalEscalation}
              onCheckedChange={(checked) =>
                updateSetting("autoApproveOnFinalEscalation", checked)
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
