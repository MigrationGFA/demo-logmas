/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/shared";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, MessageSquare, CheckCircle2, Loader2, Send } from "lucide-react";
import { useAuth } from "@/hooks/queries/useAuth";
import {
  useCitizenComplaints,
  useCouncillorComplaints,
  useAdminComplaints,
} from "@/hooks/queries/useComplaints";
import { Complaint } from "@/services/apiComplaints";
import { useStaffManagement } from "@/hooks/queries/useLgaAdmin";
import RaiseComplaintView from "./RaiseComplaintView";
import { Input } from "@/components/ui/input";
import CouncillorComplaintsView from "./CouncillorComplaintsView";
import AdminComplaintsView from "./AdminComplaintsView";

export default function ComplaintsPage() {
  const { user } = useAuth();
  if (!user) return null;
  const role = user?.role;
  const isManager =
    role === "lga_admin" ||
    role === "ward_councillor" ||
    role === "super_admin" ||
    role === "chairman";
  const isReadOnly = role === "chairman";

  if (isManager) {
    if (role === "ward_councillor") {
      return <CouncillorComplaintsView readOnly={isReadOnly} />;
    }
    return <AdminComplaintsView readOnly={isReadOnly} />;
  }

  // Citizens / Business users / Field Officers / Treasurer / Contractor  -  raise complaint
  return <RaiseComplaintView />;
}


export function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: "bg-warning/15 text-warning-foreground border-warning/30",
    assigned: "bg-info/15 text-info border-info/30",
    in_progress: "bg-primary/15 text-primary border-primary/30",
    resolved: "bg-success/15 text-success border-success/30",
    closed: "bg-gray-100 text-gray-600 border-gray-300",
  };
  return (
    <Badge
      variant="outline"
      className={`capitalize ${map[status] || map.open}`}
    >
      {status.replace("_", " ")}
    </Badge>
  );
}

export function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  const colorMap: Record<string, string> = {
    warning: "#f59e0b",
    info: "#3b82f6",
    success: "#10b981",
    primary: "#6366f1",
  };
  return (
    <Card className="p-4 bg-gradient-card border-border/40">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className="text-2xl font-bold mt-1"
        style={{ color: colorMap[tone] }}
      >
        {value}
      </div>
    </Card>
  );
}

