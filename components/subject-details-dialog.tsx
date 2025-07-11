"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Info, Trash2 } from "lucide-react";
import { type Subject, getLevelConfig } from "@/lib/subjects";

interface SubjectDetailsDialogProps {
  subject: Subject;
  onArchive: () => void;
  onDelete: () => void;
}

export function SubjectDetailsDialog({
  subject,
  onArchive,
  onDelete,
}: SubjectDetailsDialogProps) {
  const [open, setOpen] = useState(false);

  // Sort sessions by date (newest first)
  const sortedSessions = [...subject.sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button aria-label="details-button" variant="outline" size="icon">
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] bg-black sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{subject.name} Details</DialogTitle>
          <DialogDescription>
            View your progress and session history
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <h3 className="mb-2 font-medium">Level Information</h3>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="rounded border p-3">
              <div className="text-muted-foreground text-sm">Current Level</div>
              <div className="text-lg font-semibold">Level {subject.level}</div>
              <div className="mt-1 text-sm">
                {subject.daysCompleted} of{" "}
                {getLevelConfig(subject.level).requiredDays} days completed
              </div>
            </div>
            <div className="rounded border p-3">
              <div className="text-muted-foreground text-sm">
                Current Streak
              </div>
              <div className="text-lg font-semibold">{subject.streak} days</div>
              <div className="mt-1 text-sm">
                {subject.streak > 0
                  ? "Keep it going!"
                  : "Start your streak today!"}
              </div>
            </div>
          </div>

          <h3 className="mb-2 font-medium">Session History</h3>
          <ScrollArea className="h-[300px] rounded-md border">
            {sortedSessions.length === 0 ? (
              <div className="text-muted-foreground p-4 text-center">
                No sessions recorded yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Input</TableHead>
                    <TableHead>Output</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        {new Date(session.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{session.inputMinutes} min</TableCell>
                      <TableCell>{session.outputMinutes} min</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="flex justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                aria-label="archive-button"
                variant="destructive"
                size="sm"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Archive Subject
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-black">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently archive {subject.name} and all of its
                  session history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onArchive();
                    setOpen(false);
                  }}
                >
                  Archive
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                aria-label="delete-button"
                variant="destructive"
                size="sm"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Subject
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-black">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {subject.name} and all of its
                  session history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onDelete();
                    setOpen(false);
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            aria-label="close-button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
