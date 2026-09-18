// app/dev/notifications/page.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/api";

type ResultBlock = { label: string; data: unknown; isError: boolean } | null;

export default function DevNotificationsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<ResultBlock>(null);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setLoading(label);
    setResult(null);
    try {
      const data = await fn();
      setResult({ label, data, isError: false });
    } catch (err) {
      const apiErr = err as ApiError;
      setResult({
        label,
        data: { message: apiErr.message, status: apiErr.status, code: apiErr.code },
        isError: true,
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Notification Diagnostics</h1>
        <p className="text-sm text-muted-foreground">
          Hits Termii/SMTP directly on the deployed backend  -  bypasses the DB-backed notify()
          flow so errors show up raw, unmasked.
        </p>
      </div>

      <Card className="p-5 space-y-3">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            disabled={!!loading}
            onClick={() => run("SMTP Status", () => api.get("/test/smtp-status"))}
          >
            {loading === "SMTP Status" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Check SMTP Status
          </Button>

          <Button
            variant="outline"
            disabled={!!loading}
            onClick={() => run("Test SMS", () => api.post("/test/test-sms", {}))}
          >
            {loading === "Test SMS" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Send Test SMS
          </Button>

          <Button
            variant="outline"
            disabled={!!loading}
            onClick={() => run("Test Email", () => api.post("/test/test-email", {}))}
          >
            {loading === "Test Email" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Send Test Email
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Uses TEST_RECIPIENT_PHONE / TEST_RECIPIENT_EMAIL from the backend's env  -  no input
          needed unless you want to override those.
        </p>
      </Card>

      {result && (
        <Card className={`p-5 ${result.isError ? "border-destructive/50 bg-destructive/5" : ""}`}>
          <h3 className="font-semibold text-sm mb-2">
            {result.label}  -  {result.isError ? "Error" : "Response"}
          </h3>
          <pre className="text-xs overflow-auto bg-muted/40 p-3 rounded-md whitespace-pre-wrap break-all">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}
