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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import type { Subject } from "@/lib/subjects";
import { toast } from "sonner";
import { useSubjects } from "@/contexts/SubjectContext";

export function AddSubjectButton() {
  const [open, setOpen] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const { addSubject } = useSubjects();

  const handleAddSubject = () => {
    if (!subjectName.trim()) {
      toast("Subject name required", {
        description: "Please enter a name for your subject",
      });
      return;
    }

    // Create a new subject
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: subjectName.trim(),
      level: 1,
      streak: 0,
      daysCompleted: 0,
      sessions: [],
      isArchived: false,
    };

    addSubject(newSubject);

    // Reset form and close dialog
    setSubjectName("");
    setOpen(false);

    toast("Subject Added", {
      description: `${subjectName} has been added to your subjects.`,
    });
  };

  return (
    // Add listen to enter key
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Subject</DialogTitle>
          <DialogDescription>
            Create a new subject to track your study progress.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Mathematics, Programming, Language"
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === "Enter") {
                  handleAddSubject();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleAddSubject}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
