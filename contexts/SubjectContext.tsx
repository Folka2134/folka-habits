"use client"

import { Subject } from "@/lib/subjects"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"

type SubjectContextType = {
  subjects: Subject[]
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>
  addSubject: (subject: Subject) => void
  deleteSubject: (subjectId: string) => void
  archiveSubject: (subjectId: string) => Subject[]
  isLoading: boolean
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined)

export function SubjectProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Load subjects from localStorage
    const storedSubjects = localStorage.getItem("subjects")
    if (storedSubjects) {
      setSubjects(JSON.parse(storedSubjects))
    }
    setIsLoading(false)
  }, [])

  // Save subjects to localStorage
  useEffect(() => {
    if (subjects.length > 0) {
      localStorage.setItem("subjects", JSON.stringify(subjects))
    }
  }, [subjects])

  const addSubject = (subject: Subject) => {
    setSubjects((prev) => [...prev, subject])
  }

  const archiveSubject = (subjectId: string) => {
    const updatedSubjects = subjects.map((subject) => {
      return subject.id === subjectId
        ? { ...subject, isArchived: true }
        : subject
    });

    setSubjects(updatedSubjects);
    const archivedSubject = updatedSubjects.find(subject => subject.id === subjectId);
    console.log("Subject archived: ", archivedSubject);

    return updatedSubjects; // Since your type definition expects a return value
  }

  const deleteSubject = (subjectId: string) => {
    setSubjects((prev) => prev.filter((subject) => subject.id !== subjectId))
  }

  return (
    <SubjectContext.Provider value={{ subjects, setSubjects, addSubject, archiveSubject, deleteSubject, isLoading }}>
      {children}
    </SubjectContext.Provider>
  )
}

export function useSubjects() {
  const context = useContext(SubjectContext)
  if (context === undefined) {
    throw new Error("useSubjects must be used within a SubjectProvider")
  }
  return context
}
