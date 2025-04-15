"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Award, Clock, Trash2 } from "lucide-react";
import { useSubjects } from "@/contexts/SubjectContext";
import { formatDate, GetTotalMinutes } from "@/lib/utils";

// interface SubjectDetailsDialogProps {
//   subject: Subject
//   onArchive: () => void
//   onDelete: () => void
// }

export function ArchivedSubjectList() {
  const [open, setOpen] = useState(false);
  const { subjects, deleteSubject } = useSubjects();
  const archivedSubjects = subjects.filter((subject) => subject.isArchived);

  if (archivedSubjects.length === 0) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <h1>Archived</h1>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px] max-h-[80vh] bg-black">
          <DialogHeader>
            <DialogTitle>Archived subjects</DialogTitle>
          </DialogHeader>

          <div className="text-center p-8 border border-dashed rounded-lg">
            <h3 className="text-xl font-medium mb-2">No archived subjects</h3>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <h1>Archived</h1>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] max-h-[80vh] bg-black">
        <DialogHeader>
          <DialogTitle>Archived subjects</DialogTitle>
        </DialogHeader>

        {subjects
          .filter((subject) => subject.isArchived)
          .map((subject) => {
            const totalMinutes = GetTotalMinutes(subject);
            const lastSession =
              subject.sessions.length > 0
                ? subject.sessions[subject.sessions.length - 1]
                : null;
            const lastSessionDate = lastSession
              ? formatDate(lastSession.date)
              : "No sessions";

            return (
              <div key={subject.id} className="overflow-hidden">
                <div className="pb-2">
                  <div className="flex gap-1 items-center">
                    <div className="text-xl">{subject.name}</div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-black">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete {subject.name} and all
                            of its session history. This action cannot be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              deleteSubject(subject.id);
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="pb-2">
                  <div className="flex justify-evenly mb-1 text-sm">
                    <div className="flex flex-col gap-1">
                      <div className="flex">
                        <Award className="h-4 w-4 mr-1" />
                        <span>Level {subject.level}</span>
                      </div>
                      <div className="flex">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Total minutes: {totalMinutes}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span>Last session</span>
                      <span>{lastSessionDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </DialogContent>
    </Dialog>
  );
}
