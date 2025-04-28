import { Suspense } from "react";
import SubjectList from "@/components/subject-list";
import { AddSubjectButton } from "@/components/add-subject-button";
import { Card, CardContent } from "@/components/ui/card";
import { ActivityHistory } from "@/components/activity-history";
import { ArchivedSubjectList } from "@/components/archived-subject-list";

export default function Home() {
  return (
    <main className="container mx-auto max-w-[60rem] p-4">
      <div className="flex flex-col items-center justify-center py-8">
        <h1 className="mb-2 text-center text-4xl font-bold">Folka Habits</h1>
        <p className="text-muted-foreground mb-8 text-center">
          Build your study habits and level up with consistency
        </p>

        <div className="w-full">
          <Card className="mb-8 border-none">
            <CardContent>
              <ActivityHistory />
            </CardContent>
          </Card>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex gap-3">
              <h2 className="text-2xl font-semibold">Your Subjects</h2>
              <ArchivedSubjectList />
            </div>
            <AddSubjectButton />
          </div>

          <SubjectList />
        </div>
      </div>
    </main>
  );
}
