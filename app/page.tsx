import { Suspense } from "react"
import SubjectList from "@/components/subject-list"
import { AddSubjectButton } from "@/components/add-subject-button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { ActivityHistory } from "@/components/activity-history"

export default function Home() {
  return (
    <main className="container mx-auto p-4 max-w-[60rem]">
      <div className="flex flex-col items-center justify-center py-8">
        <h1 className="text-4xl font-bold text-center mb-2">Folka Habits</h1>
        <p className="text-muted-foreground text-center mb-8">Build your study habits and level up with consistency</p>

        <div className="w-full">
          <Card className="mb-8 border-none">
            <CardContent>
              <ActivityHistory />
            </CardContent>
          </Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Your Subjects</h2>
            <AddSubjectButton />
          </div>

          <Suspense fallback={<SubjectListSkeleton />}>
            <SubjectList />
          </Suspense>
        </div>
      </div>
    </main>
  )
}

function SubjectListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border rounded-lg p-6">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <div className="flex justify-between mb-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-6 w-1/4" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  )
}

