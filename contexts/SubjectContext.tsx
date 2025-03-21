"use client"

import { Subject } from "@/lib/subjects"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"

type SubjectContextType = {
  subjects: Subject[]
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>
  addSubject: (subject: Subject) => void
  deleteSubject: (subjectId: string) => void
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

  const deleteSubject = (subjectId: string) => {
    setSubjects((prev) => prev.filter((subject) => subject.id !== subjectId))
  }

  return (
    <SubjectContext.Provider value={{ subjects, setSubjects, addSubject, deleteSubject, isLoading }}>
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
