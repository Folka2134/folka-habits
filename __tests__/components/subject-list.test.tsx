import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SubjectList from "@/components/subject-list";
import { useSubjects } from "@/contexts/SubjectContext";
import "@testing-library/jest-dom";
import { getLevelConfig } from "@/lib/subjects";

// Mock dependencies
jest.mock("@/contexts/SubjectContext", () => ({
  useSubjects: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: jest.fn(),
}));

jest.mock("@/lib/subjects", () => ({
  getLevelConfig: jest.fn(),
}));

function mockUseSubjects(overrides = {}) {
  const defaultSubjects = [
    {
      id: "1",
      name: "Math",
      level: 1,
      streak: 0,
      daysCompleted: 0,
      isArchived: false,
      sessions: [],
    },
  ];

  (useSubjects as jest.Mock).mockReturnValue({
    subjects: defaultSubjects,
    setSubjects: jest.fn(),
    archiveSubject: jest.fn(),
    deleteSubject: jest.fn(),
    isLoading: false,
    ...overrides,
  });
}

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  (getLevelConfig as jest.Mock).mockReturnValue({
    inputMinutes: 30,
    outputMinutes: 15,
    requiredDays: 7,
  });
});

describe("SubjectList", () => {
  it("shows loading message when loading", () => {
    mockUseSubjects({ isLoading: true });
    render(<SubjectList />);
    expect(screen.getByText(/loading subjects/i)).toBeInTheDocument();
  });

  it("shows 'No Subjects Yet' when no subjects are available", () => {
    mockUseSubjects({ subjects: [], isLoading: false });
    render(<SubjectList />);
    expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Add your first subject to start tracking your study progress/i,
      ),
    ).toBeInTheDocument();
  });

  it("render a list of active subjects", () => {
    const subjects = [
      {
        id: "1",
        name: "Math",
        level: 1,
        streak: 2,
        daysCompleted: 2,
        sessions: [],
        isArchived: false,
      },
      {
        id: "2",
        name: "History",
        level: 1,
        streak: 2,
        daysCompleted: 2,
        sessions: [],
        isArchived: false,
      },
    ];

    mockUseSubjects({ subjects });
    render(<SubjectList />);

    expect(screen.getByText("Math")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
  });

  it("does not render archived subjects", () => {
    const subjects = [
      {
        id: "1",
        name: "Math",
        level: 1,
        streak: 2,
        daysCompleted: 2,
        sessions: [],
        isArchived: false,
      },
      {
        id: "2",
        name: "History",
        level: 1,
        streak: 2,
        daysCompleted: 2,
        sessions: [],
        isArchived: true,
      },
    ];

    mockUseSubjects({ subjects });
    render(<SubjectList />);
    expect(screen.queryByText("History")).not.toBeInTheDocument();
  });

  it("show 'Completed Today' if logged today", () => {
    const today = new Date().toISOString().split("T")[0];
    const subjects = [
      {
        id: "2",
        name: "History",
        level: 1,
        streak: 2,
        daysCompleted: 2,
        sessions: [
          {
            id: Date.now().toString(),
            date: today,
            inputMinutes: 20,
            outputMinutes: 15,
            meetsRequirement: true,
          },
        ],
        isArchived: false,
      },
    ];

    mockUseSubjects({ subjects });
    render(<SubjectList />);
    expect(screen.getByText("Completed Today")).toBeInTheDocument();
  });

  it("show 'Not Completed' if not logged today", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    const subjects = [
      {
        id: "2",
        name: "History",
        level: 1,
        streak: 2,
        daysCompleted: 2,
        sessions: [
          {
            id: Date.now().toString(),
            date: yesterdayStr,
            inputMinutes: 20,
            outputMinutes: 15,
            meetsRequirement: true,
          },
        ],
        isArchived: false,
      },
    ];

    mockUseSubjects({ subjects });
    render(<SubjectList />);
    expect(screen.getByText("Not Completed")).toBeInTheDocument();
  });

  it("archive a subject", async () => {
    const archiveSubject = jest.fn();
    const subjects = [
      {
        id: "2",
        name: "History",
        level: 1,
        streak: 2,
        daysCompleted: 2,
        sessions: [],
        isArchived: false,
      },
    ];
    mockUseSubjects({
      subjects,
      archiveSubject,
    });

    render(<SubjectList />);

    fireEvent.click(screen.getByRole("button", { name: /details-button/i }));
    fireEvent.click(screen.getByRole("button", { name: /archive-button/i }));
    fireEvent.click(screen.getByText("Archive"));

    await waitFor(() => {
      expect(archiveSubject).toHaveBeenCalledWith("2");
    });
  });

  it("deletes a subject correctly", async () => {
    const deleteSubject = jest.fn();
    const subjects = [
      {
        id: "2",
        name: "History",
        level: 1,
        streak: 2,
        daysCompleted: 2,
        sessions: [],
        isArchived: false,
      },
    ];
    mockUseSubjects({ subjects, deleteSubject });

    render(<SubjectList />);

    fireEvent.click(screen.getByRole("button", { name: /details-button/i }));
    fireEvent.click(screen.getByRole("button", { name: /delete-button/i }));
    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(deleteSubject).toHaveBeenCalledWith("2");
    });
  });

  it("logs a session correctly", async () => {
    const setSubjects = jest.fn();
    const subjects = [
      {
        id: "2",
        name: "History",
        level: 1,
        streak: 2,
        daysCompleted: 2,
        sessions: [],
        isArchived: false,
      },
    ];

    mockUseSubjects({ setSubjects, subjects });

    render(<SubjectList />);
    fireEvent.click(screen.getByText("Log Session"));

    const inputField = await screen.findByLabelText(/input minutes/i);
    const outputField = await screen.findByLabelText(/output minutes/i);
    fireEvent.change(inputField, { target: { value: "30" } });
    fireEvent.change(outputField, { target: { value: "15" } });

    fireEvent.click(screen.getByRole("button", { name: /log-button/i }));

    await waitFor(() => {
      expect(setSubjects).toHaveBeenCalled();
    });
  });

  it("display correct level requirement", () => {
    (getLevelConfig as jest.Mock).mockReturnValue({
      requiredDays: 30,
      inputMinutes: 45,
      outputMinutes: 15,
    });

    mockUseSubjects();

    render(<SubjectList />);

    expect(screen.getByText("60 min/day"));
    expect(screen.getByText("45 min"));
    expect(screen.getByText("15 min"));
  });

  it("display correct progess to next level", () => {
    const subjects = [
      {
        id: "2",
        name: "History",
        level: 2,
        streak: 2,
        daysCompleted: 2,
        sessions: [],
        isArchived: false,
      },
    ];

    (getLevelConfig as jest.Mock).mockReturnValue({
      level: 2,
      requiredDays: 30,
      inputMinutes: 45,
      outputMinutes: 15,
    });

    mockUseSubjects({ subjects });

    render(<SubjectList />);

    expect(screen.getByText("Progress to Level 3"));
    expect(screen.getByText("2/30 days"));
  });
});
