import { ActivityHistory } from "@/components/activity-history";
import { useSubjects } from "@/contexts/SubjectContext";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as dateFns from "date-fns";

// Mock the dependencies
jest.mock("@/contexts/SubjectContext", () => ({
  useSubjects: jest.fn(),
}));

jest.mock("date-fns", () => {
  const actual = jest.requireActual("date-fns");
  return {
    ...actual,
    format: jest.fn(actual.format),
    parseISO: jest.fn(actual.parseISO),
    startOfYear: jest.fn(actual.startOfYear),
    endOfYear: jest.fn(actual.endOfYear),
    eachDayOfInterval: jest.fn(actual.eachDayOfInterval),
    getYear: jest.fn(actual.getYear),
    getDay: jest.fn(actual.getDay),
  };
});

// Define types for our mock data
interface Session {
  id: string;
  date: string;
  inputMinutes: number;
  outputMinutes: number;
}

interface Subject {
  id: string;
  name: string;
  color: string;
  level: number;
  isArchived: boolean;
  sessions: Session[];
}

// Mock the localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Helper function to mock the useSubjects hook
function mockUseSubjects(overrides = {}) {
  (useSubjects as jest.Mock).mockReturnValue({
    subjects: [],
    isLoading: false,
    ...overrides,
  });
}

// Generate mock subject data with sessions for the current year
function generateMockSubjects(): Subject[] {
  const currentYear = new Date().getFullYear();

  return [
    {
      id: "1",
      name: "Math",
      color: "#FF5733",
      level: 2,
      isArchived: false,
      sessions: [
        {
          id: "session1",
          date: `${currentYear}-01-15`,
          inputMinutes: 30,
          outputMinutes: 15,
        },
        {
          id: "session2",
          date: `${currentYear}-02-20`,
          inputMinutes: 45,
          outputMinutes: 30,
        },
      ],
    },
    {
      id: "2",
      name: "Physics",
      color: "#33FF57",
      level: 3,
      isArchived: false,
      sessions: [
        {
          id: "session3",
          date: `${currentYear}-01-15`, // Same day as Math session
          inputMinutes: 60,
          outputMinutes: 30,
        },
      ],
    },
  ];
}

// Generate mock subject data with sessions for multiple years
function generateMultiYearMockSubjects(): Subject[] {
  const currentYear = new Date().getFullYear();

  return [
    {
      id: "1",
      name: "Math",
      color: "#FF5733",
      level: 2,
      isArchived: false,
      sessions: [
        {
          id: "session1",
          date: `${currentYear}-01-15`,
          inputMinutes: 30,
          outputMinutes: 15,
        },
      ],
    },
    {
      id: "3",
      name: "History",
      color: "#3357FF",
      level: 1,
      isArchived: false,
      sessions: [
        {
          id: "session4",
          date: `${currentYear - 1}-12-10`, // Previous year
          inputMinutes: 40,
          outputMinutes: 20,
        },
      ],
    },
  ];
}

describe("ActivityHistory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the localStorage mock
    localStorageMock.clear();

    // Mock the date-fns functions to return consistent values for testing
    const currentYear = new Date().getFullYear();
    (dateFns.getYear as jest.Mock).mockImplementation((date) => {
      if (date instanceof Date) {
        return date.getFullYear();
      }
      return currentYear;
    });
  });

  it("renders the collapsed view with header only", () => {
    mockUseSubjects();
    render(<ActivityHistory />);

    expect(screen.getByText("Activity History")).toBeInTheDocument();
    // In the collapsed view, the subtitle shouldn't be present
    expect(
      screen.queryByText("Your study activity over time"),
    ).not.toBeInTheDocument();
  });

  it("shows loading state when isLoading is true", () => {
    mockUseSubjects({ isLoading: true });

    render(<ActivityHistory />);
    // Expand the component
    fireEvent.click(screen.getByText("Activity History"));

    expect(screen.getByText("Loading activity history")).toBeInTheDocument();
  });

  it("shows empty state when no subjects with sessions exist", () => {
    mockUseSubjects({ subjects: [] });

    render(<ActivityHistory />);
    // Expand the component
    fireEvent.click(screen.getByText("Activity History"));

    expect(
      screen.getByText(
        "No activity recorded yet. Log your first study session to see your activity history.",
      ),
    ).toBeInTheDocument();
  });

  it("expands and collapses when clicking the header", async () => {
    mockUseSubjects({ subjects: generateMockSubjects() });

    render(<ActivityHistory />);

    // Initially collapsed
    expect(
      screen.queryByText("Your study activity over time"),
    ).not.toBeInTheDocument();

    // Expand
    fireEvent.click(screen.getByText("Activity History"));

    // Now expanded - look for subtitle text
    await waitFor(() => {
      expect(
        screen.getByText("Your study activity over time"),
      ).toBeInTheDocument();
    });

    // Collapse again
    fireEvent.click(screen.getByText("Activity History"));

    // Now collapsed again
    await waitFor(() => {
      expect(
        screen.queryByText("Your study activity over time"),
      ).not.toBeInTheDocument();
    });
  });

  it("renders the current year when there's activity", () => {
    const currentYear = new Date().getFullYear();
    const subjects = generateMockSubjects();
    mockUseSubjects({ subjects });

    render(<ActivityHistory />);
    // Expand the component
    fireEvent.click(screen.getByText("Activity History"));

    // The current year should be present as a tab
    expect(
      screen.getByRole("tab", { name: currentYear.toString() }),
    ).toBeInTheDocument();
  });

  it("displays day of week labels", () => {
    const subjects = generateMockSubjects();
    mockUseSubjects({ subjects });

    render(<ActivityHistory />);
    // Expand the component
    fireEvent.click(screen.getByText("Activity History"));

    // Check for day of week labels
    const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
    dayLabels.forEach((day) => {
      const elements = screen.getAllByText(day);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it("displays the legend correctly", () => {
    const subjects = generateMockSubjects();
    mockUseSubjects({ subjects });

    render(<ActivityHistory />);
    // Expand the component
    fireEvent.click(screen.getByText("Activity History"));

    // Check for the legend text
    expect(screen.getByText("Less")).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument();
  });

  it("processes session data correctly and displays month labels", () => {
    const subjects = generateMockSubjects();
    mockUseSubjects({ subjects });

    // Mock date-fns format to return specific month labels
    (dateFns.format as jest.Mock).mockImplementation((date, formatStr) => {
      if (formatStr === "MMM") {
        // Return month abbreviations
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return months[date.getMonth()];
      }
      return jest.requireActual("date-fns").format(date, formatStr);
    });

    render(<ActivityHistory />);
    // Expand the component
    fireEvent.click(screen.getByText("Activity History"));

    // Jan and Feb should be visible since we have data for those months
    expect(screen.getByText("Jan")).toBeInTheDocument();
    expect(screen.getByText("Feb")).toBeInTheDocument();
  });

  it("handles multiple years of data", () => {
    const subjects = generateMultiYearMockSubjects();
    mockUseSubjects({ subjects });

    // Mock necessary date-fns functions
    const currentYear = new Date().getFullYear();
    (dateFns.getYear as jest.Mock).mockImplementation((date) => {
      if (date instanceof Date) {
        return date.getFullYear();
      }
      return currentYear;
    });

    render(<ActivityHistory />);
    // Expand the component
    fireEvent.click(screen.getByText("Activity History"));

    // We should see the tablist element
    expect(screen.getByRole("tablist")).toBeInTheDocument();

    // Should have at least one tab
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBeGreaterThan(0);
  });
});
