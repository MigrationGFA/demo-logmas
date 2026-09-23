/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Eye, MessageSquare, CheckCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAdminComplaints } from "@/hooks/queries/useComplaints";
import { useStaffManagement } from "@/hooks/queries/useLgaAdmin";

function ManageDialog({
  complaint,
  readOnly,
}: {
  complaint: any;
  readOnly: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(complaint.status);
  const [selectedCouncillorId, setSelected] = useState(
    complaint.assignedToId ?? "",
  );
  const [newMessage, setNewMessage] = useState("");

  const {
    updateComplaint,
    isUpdating,
    useGetComplaint,
    adminRespond,
    isAdminResponding,
  } = useAdminComplaints();

  const { useGetStaff } = useStaffManagement();
  const { data: councillorsData } = useGetStaff({ role: "ward_councillor" });
  const councillors = councillorsData ?? [];

  // Full thread only needs fetching once the dialog is actually open  - 
  // the table row's `complaint` prop is enough for the summary header.
  const {
    data: activeComplaint,
    isLoading: loadingThread,
    refetch: refetchThread,
  } = useGetComplaint(open ? complaint.id : "");

  const current = activeComplaint ?? complaint;
  const isClosed = current.status === "closed";

  const messages = activeComplaint
    ? [
        {
          id: "original",
          from: "citizen" as const,
          text: activeComplaint.description,
          time: new Date(activeComplaint.createdAt).toLocaleString(),
        },
        ...(activeComplaint.responses ?? []).map((r: any) => ({
          id: r.id,
          from:
            (r.respondedBy?.id ?? r.responderId) === activeComplaint.raisedById
              ? ("citizen" as const)
              : ("staff" as const),
          text: r.message,
          time: new Date(r.createdAt).toLocaleString(),
        })),
      ]
    : [];

  const save = async () => {
    const payload: { assignedToId?: string; status?: string } = {};
    if (
      selectedCouncillorId &&
      selectedCouncillorId !== complaint.assignedToId
    ) {
      payload.assignedToId = selectedCouncillorId;
    }
    if (status !== complaint.status) {
      payload.status = status;
    }
    if (!payload.assignedToId && !payload.status) return;

    await updateComplaint({ id: complaint.id, data: payload });
    refetchThread();
  };

  const handleSendReply = async () => {
    if (!newMessage.trim()) return;
    await adminRespond({ id: complaint.id, data: { message: newMessage } });
    setNewMessage("");
    refetchThread();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Eye className="h-3.5 w-3.5 mr-1" /> {readOnly ? "View" : "Manage"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0">
        <DialogHeader className="p-5 border-b shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold leading-tight flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />{" "}
                {complaint.ticketNumber}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                From {complaint.raisedBy?.firstName}{" "}
                {complaint.raisedBy?.lastName} • {complaint.ward?.name}
              </p>
            </div>
            <Badge variant="outline">{complaint.category || "General"}</Badge>
          </div>
        </DialogHeader>

        {/* Conversation thread */}
        <div className="flex-1 overflow-y-auto divide-y divide-border min-h-0">
          {loadingThread ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 ${msg.from === "staff" ? "bg-primary/5" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-semibold ${msg.from === "staff" ? "text-primary" : "text-foreground"}`}
                    >
                      {msg.from === "staff"
                        ? "Staff"
                        : `${complaint.raisedBy?.firstName ?? "Citizen"}`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {msg.time}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {msg.text}
                  </p>
                </div>
              ))}

              {messages.length === 1 && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No responses yet.
                </div>
              )}

              {current.resolutionNote && (
                <div className="p-4 bg-success/5 border-t border-success/20">
                  <p className="text-xs font-semibold text-success mb-1">
                    Resolution
                  </p>
                  <p className="text-sm">{current.resolutionNote}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Assign + status controls  -  locked once closed */}
        {!readOnly && (
          <div className="p-4 border-t space-y-3 shrink-0">
            {/* {!complaint.assignedTo && (
              <div>
                <Label>Assign to Ward Councillor</Label>
                <select
                  className="w-full mt-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  value={selectedCouncillorId}
                  onChange={(e) => setSelected(e.target.value)}
                  disabled={isClosed}
                >
                  <option value=""> -  Select councillor  - </option>
                  {councillors.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                      {c.ward?.name ? `  -  ${c.ward.name} Ward` : "  -  No ward"}
                    </option>
                  ))}
                </select>
              </div>
            )} */}

            <div>
              <Label>Status</Label>
              <div className="mt-1.5 flex items-center gap-2">
                <Select
                  value={status}
                  onValueChange={setStatus}
                  disabled={isClosed}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Close
                  </Button>
                  <Button
                    onClick={save}
                    disabled={isUpdating || isClosed}
                    className="bg-gradient-hero"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    {isUpdating ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inline reply  -  same lock as everything else once closed */}
        {!readOnly && !isClosed && (
          <div className="p-4 border-t flex gap-2 shrink-0">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your reply..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendReply();
                }
              }}
            />
            <Button
              onClick={handleSendReply}
              disabled={isAdminResponding || !newMessage.trim()}
              className="bg-gradient-hero shrink-0"
            >
              {isAdminResponding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {isClosed && (
          <div className="p-3 border-t text-center text-xs text-muted-foreground shrink-0">
            This ticket is closed. No further changes or replies can be made.
          </div>
        )}

        {readOnly && !isClosed && (
          <div className="p-3 border-t flex justify-end shrink-0">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ManageDialog;

