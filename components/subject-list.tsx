"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Award, Flame } from "lucide-react";
import { LogSessionDialog } from "@/components/log-session-dialog";
import { SubjectDetailsDialog } from "@/components/subject-details-dialog";
import { getLevelConfig } from "@/lib/subjects";
import { toast } from "sonner";
import { useSubjects } from "@/contexts/SubjectContext";

export default function SubjectList() {
  const { subjects, setSubjects, archiveSubject, deleteSubject, isLoading } =
    useSubjects();
  const activeSubjects = subjects.filter((subject) => !subject.isArchived);

  const handleLogSession = (
    subjectId: string,
    minutes: { input: number; output: number },
  ) => {
    setSubjects((prevSubjects) => {
      return prevSubjects.map((subject) => {
        if (subject.id !== subjectId) return subject;

        const levelConfig = getLevelConfig(subject.level);
        const totalRequired =
          levelConfig.inputMinutes + levelConfig.outputMinutes;
        const totalLogged = minutes.input + minutes.output;

        // Check if the session meets the daily requirement
        const meetsRequirement =
          totalLogged >= totalRequired &&
          minutes.input >= levelConfig.inputMinutes &&
          minutes.output >= levelConfig.outputMinutes;

        // Get today's date as a string (YYYY-MM-DD)
        const today = new Date().toISOString().split("T")[0];

        // Check if already logged today
        const alreadyLoggedToday = subject.sessions.some(
          (session) => session.date === today,
        );

        // Update streak logic
        let streak = subject.streak;
        let daysCompleted = subject.daysCompleted;
        let level = subject.level;

        if (meetsRequirement) {
          // If this is the first log today and meets requirements
          if (!alreadyLoggedToday) {
            // Check if the last session was yesterday
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split("T")[0];

            const lastSessionDate =
              subject.sessions.length > 0
                ? subject.sessions[subject.sessions.length - 1].date
                : null;

            if (
              lastSessionDate === yesterdayStr ||
              subject.sessions.length === 0
            ) {
              // Streak continues or starts
              streak += 1;
              daysCompleted += 1;
              // Check if level up is needed
              if (daysCompleted >= levelConfig.requiredDays) {
                level += 1;
                daysCompleted = 0;
                toast("Level Up!", {
                  description: `${subject.name} is now at Level ${level}!`,
                });
              }
            } else {
              // Streak broken, restart
              streak = 1;
              daysCompleted = 1;
              toast("Streak Reset", {
                description: `Your streak for ${subject.name} has been reset. Starting fresh!`,
              });
            }
          }
        }

        // Add the new session
        const newSession = {
          id: Date.now().toString(),
          date: today,
          inputMinutes: minutes.input,
          outputMinutes: minutes.output,
          meetsRequirement,
        };

        return {
          ...subject,
          sessions: [...subject.sessions, newSession],
          streak,
          daysCompleted,
          level,
        };
      });
    });

    toast("Session Logged", {
      description: "Your study session has been recorded.",
    });
  };

  const handleArchiveSubject = (subjectId: string) => {
    archiveSubject(subjectId);

    toast("Subject Archived", {
      description: "The subject has been added to the archive list.",
    });
  };

  const handleDeleteSubject = (subjectId: string) => {
    deleteSubject(subjectId);

    toast("Subject Deleted", {
      description: "The subject has been removed from your list.",
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-xl font-medium">Loading subjects...</h3>
      </div>
    );
  }
  if (activeSubjects.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <h3 className="mb-2 text-xl font-medium">No subjects yet</h3>
        <p className="text-muted-foreground mb-4">
          Add your first subject to start tracking your study progress
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {subjects
        .filter((subject) => !subject.isArchived)
        .map((subject) => {
          const levelConfig = getLevelConfig(subject.level);
          const progress =
            (subject.daysCompleted / levelConfig.requiredDays) * 100;

          // Check if already logged today
          const today = new Date().toISOString().split("T")[0];
          const loggedToday = subject.sessions.some(
            (session) => session.date === today && session.meetsRequirement,
          );

          return (
            <Card key={subject.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{subject.name}</CardTitle>
                  <Badge variant={loggedToday ? "default" : "outline"}>
                    {loggedToday ? "Completed Today" : "Not Completed"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="mb-1 flex justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    <span>Level {subject.level}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span>{subject.streak} day streak</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {levelConfig.inputMinutes + levelConfig.outputMinutes}{" "}
                      min/day
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs">
                    <span>Progress to Level {subject.level + 1}</span>
                    <span>
                      {subject.daysCompleted}/{levelConfig.requiredDays} days
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded border p-2">
                    <div className="text-muted-foreground">Input</div>
                    <div className="font-medium">
                      {levelConfig.inputMinutes} min
                    </div>
                  </div>
                  <div className="rounded border p-2">
                    <div className="text-muted-foreground">Output</div>
                    <div className="font-medium">
                      {levelConfig.outputMinutes} min
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <SubjectDetailsDialog
                  subject={subject}
                  onDelete={() => handleDeleteSubject(subject.id)}
                  onArchive={() => handleArchiveSubject(subject.id)}
                />
                <LogSessionDialog
                  subject={subject}
                  onLogSession={(minutes) =>
                    handleLogSession(subject.id, minutes)
                  }
                  disabled={loggedToday}
                />
              </CardFooter>
            </Card>
          );
        })}
    </div>
  );
}
