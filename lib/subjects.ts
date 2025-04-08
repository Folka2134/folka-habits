export interface Session {
  id: string
  date: string
  inputMinutes: number
  outputMinutes: number
  meetsRequirement: boolean
}

export interface Subject {
  id: string
  name: string
  level: number
  streak: number
  daysCompleted: number
  sessions: Session[]
  isArchived: boolean;
}

export interface LevelConfig {
  level: number
  requiredDays: number
  inputMinutes: number
  outputMinutes: number
}

export const LEVEL_CONFIGS: LevelConfig[] = [
  {
    level: 1,
    requiredDays: 15,
    inputMinutes: 13,
    outputMinutes: 2,
  },
  {
    level: 2,
    requiredDays: 30,
    inputMinutes: 25,
    outputMinutes: 5,
  },
  {
    level: 3,
    requiredDays: 30,
    inputMinutes: 45,
    outputMinutes: 15,
  },
  // Add more levels as needed
  {
    level: 4,
    requiredDays: 30,
    inputMinutes: 60,
    outputMinutes: 20,
  },
  {
    level: 5,
    requiredDays: 30,
    inputMinutes: 75,
    outputMinutes: 25,
  },
]

export function getLevelConfig(level: number): LevelConfig {
  const config = LEVEL_CONFIGS.find((config) => config.level === level)

  // If level is higher than our defined configs, return the last one
  if (!config) {
    return LEVEL_CONFIGS[LEVEL_CONFIGS.length - 1]
  }

  return config
}

