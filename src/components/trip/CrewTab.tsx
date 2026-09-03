import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, UserPlus } from "lucide-react";
import { inviteMember, listMembers, removeMember, type TripMember } from "@/lib/api/trips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLES: TripMember["role"][] = ["contributor", "cheerleader", "viewer"];

export function CrewTab({ tripId, isOwner }: { tripId: string; isOwner: boolean }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<TripMember["role"]>("contributor");

  const { data: members = [] } = useQuery({
    queryKey: ["members", tripId],
    queryFn: () => listMembers(tripId),
  });

  const invite = useMutation({
    mutationFn: (email: string) => inviteMember(tripId, email, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members", tripId] });
      setOpen(false);
      toast.success("Invite sent");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: removeMember,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members", tripId] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      {isOwner && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button className="h-12 w-full">
              <UserPlus className="mr-2 h-4 w-4" /> Invite someone
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>Invite to trip</SheetTitle>
            </SheetHeader>
            <form
              className="mt-4 space-y-4 pb-6"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                invite.mutate(String(fd.get("email") ?? "").trim());
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required className="h-12" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as TripMember["role"])}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="h-12 w-full" disabled={invite.isPending}>
                Send invite
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      )}

      <ul className="space-y-3">
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {m.profiles?.display_name ?? m.invite_email ?? "Invited rider"}
              </p>
              <p className="text-xs text-muted-foreground">{m.status}</p>
            </div>
            <Badge variant="secondary">{m.role}</Badge>
            {isOwner && m.role !== "owner" && (
              <Button
                size="icon"
                variant="ghost"
                aria-label="Remove member"
                onClick={() => remove.mutate(m.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
