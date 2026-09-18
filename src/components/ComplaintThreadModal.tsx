// components/complaints/ComplaintThreadModal.tsx
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2 } from "lucide-react";
import { useCitizenComplaints } from "@/hooks/queries/useComplaints";
import { Complaint } from "@/services/apiComplaints";

const statusColors: Record<string, string> = {
  open:        "bg-warning/15 text-warning-foreground border border-warning/30",
  assigned:    "bg-info/15 text-info border border-info/30",
  in_progress: "bg-primary/15 text-primary border border-primary/30",
  resolved:    "bg-success/15 text-success border border-success/30",
  closed:      "bg-gray-100 text-gray-600 border border-gray-300",
};

interface Props {
  complaint: Complaint | null;
  open:      boolean;
  onClose:   () => void;
  onRefetch: () => void;
  // Who is viewing  -  determines if reply box shows
  viewerRole: string;
  viewerId:   string;
}

export function ComplaintThreadModal({
  complaint, open, onClose, onRefetch, viewerRole, viewerId,
}: Props) {
  const [newMessage, setNewMessage] = useState("");
  const { addResponse, isAddingResponse } = useCitizenComplaints();

  if (!complaint) return null;

  // Citizen and business_owner can reply  -  admins use their own respond flow
  const canReply = ["citizen", "business_owner", "field_officer"].includes(viewerRole)
    && complaint.status !== "closed"
    && complaint.status !== "resolved";

  const handleSend = async () => {
    if (!newMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }
    await addResponse({
      id:   complaint.id,
      data: { message: newMessage },
    });
    setNewMessage("");
    onRefetch();
  };

  // Shape messages from the real responses array
  // complaint.raisedById tells us who is the original poster
  const messages = [
    // Original complaint as first message
    {
      id:          "original",
      from:        "user" as const,
      responderId: complaint.raisedById,
      text:        complaint.description,
      time:        new Date(complaint.createdAt).toLocaleString(),
    },
    // All responses
    ...(complaint.responses ?? []).map((r) => ({
      id:          r.id,
      from:        r.responderId === complaint.raisedById ? "user" as const : "admin" as const,
      responderId: r.responderId,
      text:        r.message,
      time:        new Date(r.createdAt).toLocaleString(),
    })),
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0">
        <DialogHeader className="p-5 border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold leading-tight">
                {complaint.title}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {complaint.ticketNumber} · {complaint.category || "General"} · {complaint.ward?.name}
              </p>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${statusColors[complaint.status]}`}>
              {complaint.status.replace("_", " ")}
            </span>
          </div>
        </DialogHeader>

        {/* Message thread */}
        <div className="flex-1 overflow-y-auto divide-y divide-border min-h-0">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 ${msg.from === "admin" ? "bg-primary/5" : ""}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold ${
                  msg.from === "admin" ? "text-primary" : "text-foreground"
                }`}>
                  {msg.from === "admin" ? "Support Officer" : "You"}
                </span>
                <span className="text-xs text-muted-foreground">{msg.time}</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{msg.text}</p>
            </div>
          ))}

          {messages.length === 1 && (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No responses yet. We'll get back to you soon.
            </div>
          )}

          {complaint.resolutionNote && (
            <div className="p-4 bg-success/5 border-t border-success/20">
              <p className="text-xs font-semibold text-success mb-1">Resolution Note</p>
              <p className="text-sm text-foreground">{complaint.resolutionNote}</p>
            </div>
          )}
        </div>

        {/* Reply box  -  only for citizens when not closed/resolved */}
        {canReply && (
          <div className="p-4 border-t flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your reply..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              onClick={handleSend}
              disabled={isAddingResponse || !newMessage.trim()}
              className="bg-gradient-hero shrink-0"
            >
              {isAddingResponse
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Send className="h-4 w-4" />
              }
            </Button>
          </div>
        )}

        {complaint.status === "closed" && (
          <div className="p-3 border-t text-center text-xs text-muted-foreground">
            This complaint is closed. Open a new ticket if you need further assistance.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
