"use client"

import { useState, useEffect } from "react"
import { format, parseISO, startOfYear, endOfYear, eachDayOfInterval, getYear, getDay } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSubjects } from "@/contexts/SubjectContext"

interface DayData {
  date: string
  totalMinutes: number
  sessions: {
    subject: string
    inputMinutes: number
    outputMinutes: number
  }[]
}

interface YearData {
  year: number
  days: Record<string, DayData>
  maxMinutes: number
  hasActivity: boolean
}

export function ActivityHistory() {
  const [yearData, setYearData] = useState<Record<number, YearData>>({})
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [open, setOpen] = useState<boolean>(false)
  const { subjects, isLoading } = useSubjects()

  useEffect(() => {
    // Load subjects from localStorage
    const storedSubjects = localStorage.getItem("subjects")
    if (!storedSubjects) return

    // const subjects: Subject[] = JSON.parse(storedSubjects)
    const yearsWithActivity = new Set<number>()
    const yearDataMap: Record<number, YearData> = {}

    // Find all years with activity and initialize year data
    subjects.forEach((subject) => {
      subject.sessions.forEach((session) => {
        const sessionDate = parseISO(session.date)
        const year = getYear(sessionDate)
        yearsWithActivity.add(year)

        if (!yearDataMap[year]) {
          // Initialize the year data
          const yearStart = startOfYear(sessionDate)
          const yearEnd = endOfYear(sessionDate)
          const daysInYear = eachDayOfInterval({ start: yearStart, end: yearEnd })

          const days: Record<string, DayData> = {}
          daysInYear.forEach((date) => {
            const dateStr = format(date, "yyyy-MM-dd")
            days[dateStr] = {
              date: dateStr,
              totalMinutes: 0,
              sessions: [],
            }
          })

          yearDataMap[year] = {
            year,
            days,
            maxMinutes: 0,
            hasActivity: false,
          }
        }
      })
    })

    // Populate the year data with session information
    subjects.forEach((subject) => {
      subject.sessions.forEach((session) => {
        const sessionDate = parseISO(session.date)
        const year = getYear(sessionDate)
        const yearData = yearDataMap[year]

        if (yearData && yearData.days[session.date]) {
          const totalSessionMinutes = session.inputMinutes + session.outputMinutes

          // Add to total minutes for the day
          yearData.days[session.date].totalMinutes += totalSessionMinutes
          yearData.hasActivity = true

          // Track which subject contributed these minutes
          yearData.days[session.date].sessions.push({
            subject: subject.name,
            inputMinutes: session.inputMinutes,
            outputMinutes: session.outputMinutes,
          })

          // Track the highest minutes for any day in this year
          if (yearData.days[session.date].totalMinutes > yearData.maxMinutes) {
            yearData.maxMinutes = yearData.days[session.date].totalMinutes
          }
        }
      })
    })

    // Filter to only years with activity and sort
    const activeYears = Array.from(yearsWithActivity)
      .filter((year) => yearDataMap[year].hasActivity)
      .sort((a, b) => b - a) // Sort descending (newest first)

    setYearData(yearDataMap)
    setAvailableYears(activeYears)

    // Set the selected year to the most recent year with activity, or current year
    if (activeYears.length > 0) {
      setSelectedYear(activeYears[0])
    }
  }, [subjects])

  // Function to determine color intensity based on minutes
  const getColorIntensity = (minutes: number, maxMinutes: number) => {
    if (minutes === 0) return "bg-gray-100 dark:bg-gray-800"

    // Create 5 intensity levels
    const maxLevel = 5
    const level = Math.ceil((minutes / maxMinutes) * maxLevel)

    // Return appropriate color class based on level
    switch (level) {
      case 1:
        return "bg-green-400/20"
      case 2:
        return "bg-green-400/40"
      case 3:
        return "bg-green-400/60"
      case 4:
        return "bg-green-400/80"
      case 5:
        return "bg-green-400"
      default:
        return "bg-gray-100 dark:bg-gray-800"
    }
  }

  // If toggle is off
  if (!open) {
    return (
      <div className="w-full">
        <div className="flex justify-center">
          <h2 className="text-2xl font-semibold "><span className="hover:underline cursor-pointer" onClick={() => setOpen(!open)}>Activity History</span></h2>
        </div>
      </div >
    )
  }

  // If data is loading
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center flex-col mb-6">
          <h2 className="text-2xl font-semibold mb-2">Activity History</h2>
          <p className="text-muted-foreground">Your study activity over time</p>
        </div>
        <div className="text-center p-8 border border-dashed rounded-lg">
          <p className="text-muted-foreground">
            Loading activity history
          </p>
        </div>
      </div>
    )
  }

  // If no data or no years with activity
  if (availableYears.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center flex-col mb-6">
          <h2 className="text-2xl font-semibold mb-2">Activity History</h2>
          <p className="text-muted-foreground">Your study activity over time</p>
        </div>
        <div className="text-center p-8 border border-dashed rounded-lg">
          <p className="text-muted-foreground">
            No activity recorded yet. Log your first study session to see your activity history.
          </p>
        </div>
      </div>
    )
  }


  // Get the data for the selected year
  const currentYearData = yearData[selectedYear]
  if (!currentYearData) return null

  // Create a more accurate calendar grid for the selected year
  const renderYearGrid = (year: number) => {
    // Create a date for the first day of the year
    const firstDay = new Date(year, 0, 1)

    // Get all days in the year
    const allDays = eachDayOfInterval({
      start: startOfYear(firstDay),
      end: endOfYear(firstDay),
    })

    // Calculate the number of weeks in the year (52 or 53)
    const totalWeeks = Math.ceil((getDay(firstDay) + allDays.length) / 7)

    // Create a 2D array to hold all days
    // First dimension: weeks (columns)
    // Second dimension: days of week (rows, 0 = Sunday, 6 = Saturday)
    const calendarGrid: (Date | null)[][] = Array(totalWeeks)
      .fill(null)
      .map(() => Array(7).fill(null))

    // Fill the grid with dates
    let currentWeek = 0
    let currentDayOfWeek = getDay(firstDay)

    allDays.forEach((day) => {
      calendarGrid[currentWeek][currentDayOfWeek] = day

      // Move to the next day
      currentDayOfWeek++
      if (currentDayOfWeek === 7) {
        currentDayOfWeek = 0
        currentWeek++
      }
    })

    // Create month labels with their positions
    const monthLabels: { name: string; startWeek: number; endWeek: number }[] = []

    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(year, month, 1)
      // const monthEnd = endOfMonth(monthStart)

      // Find the week where this month starts
      let startWeek = -1
      let endWeek = -1

      // Find the start week
      for (let week = 0; week < totalWeeks; week++) {
        for (let day = 0; day < 7; day++) {
          const date = calendarGrid[week][day]
          if (date && date.getMonth() === month && startWeek === -1) {
            startWeek = week
            break
          }
        }
        if (startWeek !== -1) break
      }

      // Find the end week
      for (let week = totalWeeks - 1; week >= 0; week--) {
        for (let day = 6; day >= 0; day--) {
          const date = calendarGrid[week][day]
          if (date && date.getMonth() === month && endWeek === -1) {
            endWeek = week
            break
          }
        }
        if (endWeek !== -1) break
      }

      // Only add months that appear in the calendar
      if (startWeek !== -1 && endWeek !== -1) {
        monthLabels.push({
          name: format(monthStart, "MMM"),
          startWeek,
          endWeek,
        })
      }
    }

    // Calculate cell size and gap
    const cellSize = 12 // 12px
    const cellGap = 4 // 4px
    const cellTotal = cellSize + cellGap // 16px total width per cell

    return (
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Month labels */}
          <div className="relative flex h-5 mb-1">
            {monthLabels.map((month, i) => {
              const startPos = month.startWeek * cellTotal
              const width = (month.endWeek - month.startWeek + 1) * cellTotal

              return (
                <div
                  key={i}
                  className="absolute text-xs text-muted-foreground text-center"
                  style={{
                    left: `${startPos}px`,
                    width: `${width}px`,
                  }}
                >
                  {month.name}
                </div>
              )
            })}
          </div>

          {/* Calendar grid */}
          <div className="flex">
            {/* Day of week labels */}
            <div className="flex flex-col mr-2 text-xs text-muted-foreground">
              <div className="h-3 text-center mb-1">S</div>
              <div className="h-3 text-center mb-1">M</div>
              <div className="h-3 text-center mb-1">T</div>
              <div className="h-3 text-center mb-1">W</div>
              <div className="h-3 text-center mb-1">T</div>
              <div className="h-3 text-center mb-1">F</div>
              <div className="h-3 text-center mb-1">S</div>
            </div>

            {/* Calendar squares */}
            <div>
              {/* Render by week (column) */}
              <div className="flex">
                {calendarGrid.map((week, weekIndex) => (
                  <div key={weekIndex} className="mr-1">
                    {week.map((date, dayIndex) => {
                      if (!date) {
                        return <div key={`empty-${dayIndex}`} className="w-3 h-3 mb-1" />
                      }

                      const dateStr = format(date, "yyyy-MM-dd")
                      const dayData = yearData[year]?.days[dateStr] || { totalMinutes: 0, sessions: [] }

                      return (
                        <TooltipProvider key={dateStr}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`w-3 h-3 mb-1 rounded-sm ${getColorIntensity(dayData.totalMinutes, yearData[year].maxMinutes)} border border-border/30`}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs">
                                <div className="font-medium">{format(date, "MMM d, yyyy")}</div>
                                <div>{dayData.totalMinutes} minutes</div>
                                {dayData.sessions.length > 0 && (
                                  <div className="mt-1">
                                    {dayData.sessions.map((session, i) => (
                                      <div key={i} className="flex justify-between gap-2">
                                        <span>{session.subject}:</span>
                                        <span>{session.inputMinutes + session.outputMinutes} min</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute right-0 pt-2.5">
            <div className="flex items-center justify-end mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>Less</span>
                <div className="w-3 h-3 bg-primary border border-border/30 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-400/20 border border-border/30 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-400/40 border border-border/30 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-400/60 border border-border/30 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-400/80 border border-border/30 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-400 border border-border/30 rounded-sm"></div>
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full relative">
      <div className="mb-4 flex justify-center">
        <h2 className="text-2xl font-semibold "><span className="hover:underline cursor-pointer" onClick={() => setOpen(!open)}>Activity History</span></h2>
      </div>

      <Tabs
        value={selectedYear.toString()}
        onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
        className="w-full"
      >
        {availableYears.map((year) => (
          <TabsContent key={year} value={year.toString()} className="mt-0">
            {renderYearGrid(year)}
          </TabsContent>
        ))}
        <TabsList className="">
          {availableYears.map((year) => (
            <TabsTrigger key={year} value={year.toString()}>
              {year}
            </TabsTrigger>
          ))}
        </TabsList>

      </Tabs>
    </div>
  )
}

