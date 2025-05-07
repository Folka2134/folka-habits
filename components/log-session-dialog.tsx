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
import { ClipboardCheck } from "lucide-react";
import { type Subject, getLevelConfig } from "@/lib/subjects";
import { toast } from "sonner";

interface LogSessionDialogProps {
  subject: Subject;
  onLogSession: (minutes: { input: number; output: number }) => void;
  disabled?: boolean;
}

export function LogSessionDialog({
  subject,
  onLogSession,
  disabled,
}: LogSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const [inputMinutes, setInputMinutes] = useState("");
  const [outputMinutes, setOutputMinutes] = useState("");

  const levelConfig = getLevelConfig(subject.level);

  const handleSubmit = () => {
    const input = Number.parseInt(inputMinutes) || 0;
    const output = Number.parseInt(outputMinutes) || 0;

    // Validate minutes against level requirements
    if (
      input < levelConfig.inputMinutes ||
      output < levelConfig.outputMinutes
    ) {
      // Show an error message to the user
      toast("Invalid study time", {
        description: `Level ${subject.level} requires at least ${levelConfig.inputMinutes} minutes of input and ${levelConfig.outputMinutes} minutes of output.`,
      });
      return;
    }

    // Log session
    onLogSession({ input, output });
    setInputMinutes("");
    setOutputMinutes("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          aria-label="log-button"
          disabled={disabled}
          variant={disabled ? "outline" : "default"}
        >
          <ClipboardCheck className="mr-2 h-4 w-4" />
          {disabled ? "Already Logged Today" : "Log Session"}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Study Session</DialogTitle>
          <DialogDescription>
            Record your study time for {subject.name}. Level {subject.level}{" "}
            requires {levelConfig.inputMinutes} minutes of input and{" "}
            {levelConfig.outputMinutes} minutes of output.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="input" className="text-right">
              Input Minutes
            </Label>
            <Input
              id="input"
              type="number"
              min="0"
              value={inputMinutes}
              onChange={(e) => setInputMinutes(e.target.value)}
              className="col-span-3"
              placeholder={`At least ${levelConfig.inputMinutes} minutes`}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="output" className="text-right">
              Output Minutes
            </Label>
            <Input
              id="output"
              type="number"
              min="0"
              value={outputMinutes}
              onChange={(e) => setOutputMinutes(e.target.value)}
              className="col-span-3"
              placeholder={`At least ${levelConfig.outputMinutes} minutes`}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            aria-label="log-session-button"
            type="submit"
            onClick={handleSubmit}
          >
            Log Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
