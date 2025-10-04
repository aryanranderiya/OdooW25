"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { IconBell, IconMail } from "@tabler/icons-react";
import { NotificationSettings } from "./types";

interface NotificationsTabProps {
  settings: NotificationSettings;
  onUpdateSettings: (settings: NotificationSettings) => void;
}

export function NotificationsTab({
  settings,
  onUpdateSettings,
}: NotificationsTabProps) {
  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconBell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Configure how and when approval notifications are sent
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send email notifications for approval requests
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) =>
                updateSetting("emailNotifications", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show notifications within the application
              </p>
            </div>
            <Switch
              checked={settings.inAppNotifications}
              onCheckedChange={(checked) =>
                updateSetting("inAppNotifications", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Escalation Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Send reminders before escalation deadlines
              </p>
            </div>
            <Switch
              checked={settings.escalationReminders}
              onCheckedChange={(checked) =>
                updateSetting("escalationReminders", checked)
              }
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-medium">Email Templates</h4>
          <div className="grid gap-3">
            {[
              {
                title: "Approval Request",
                description: "Sent when an expense requires approval",
              },
              {
                title: "Approval Granted",
                description: "Sent when an expense is approved",
              },
              {
                title: "Approval Rejected",
                description: "Sent when an expense is rejected",
              },
            ].map((template) => (
              <div
                key={template.title}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{template.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <IconMail className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
