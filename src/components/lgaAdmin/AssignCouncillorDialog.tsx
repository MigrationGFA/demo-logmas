/* eslint-disable @typescript-eslint/no-explicit-any */


import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserPlus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

function AssignCouncillorDialog({ ward, councillors, onAssign, isAssigning }: { ward: any; councillors: any[]; onAssign: (cid: string) => void; isAssigning: boolean }) {
  const [open, setOpen] = useState(false);
  const [cid, setCid] = useState("");

  const submit = () => {
    if (!cid) return toast.error("Select a councillor");
    onAssign(cid);
    setOpen(false);
    setCid("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full h-8 text-xs">
          <UserPlus className="h-3 w-3 mr-1" />
          Assign Councillor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Councillor to {ward.name}</DialogTitle>
          <DialogDescription>Pick from unassigned councillors.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Available Councillors</Label>
          <Select value={cid} onValueChange={setCid}>
            <SelectTrigger>
              <SelectValue placeholder="Select a councillor" />
            </SelectTrigger>
            <SelectContent>
              {councillors.length === 0 && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">No unassigned councillors</div>
              )}
              {councillors.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}  -  {c.email}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!cid || isAssigning}>{isAssigning ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AssignCouncillorDialog
