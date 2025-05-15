import { ArchivedSubjectList } from "@/components/archived-subject-list";
import { useSubjects } from "@/contexts/SubjectContext";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/contexts/SubjectContext", () => ({
  useSubjects: jest.fn(),
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
      sessions: [
        {
          id: "1",
          date: "2025-04-28", // Yesterday
          inputMinutes: 40,
          outputMinutes: 20,
          meetsRequirement: true,
        },
        {
          id: "2",
          date: "2025-04-27", // Two days ago
          inputMinutes: 25,
          outputMinutes: 10,
          meetsRequirement: false,
        },
      ],
    },
    {
      id: "2",
      name: "Japanese",
      level: 1,
      streak: 5,
      daysCompleted: 5,
      isArchived: true,
      sessions: [
        {
          id: "1",
          date: "2025-04-28", // Yesterday
          inputMinutes: 40,
          outputMinutes: 20,
          meetsRequirement: true,
        },
        {
          id: "2",
          date: "2025-04-27", // Two days ago
          inputMinutes: 25,
          outputMinutes: 10,
          meetsRequirement: true,
        },
      ],
    },
  ];

  (useSubjects as jest.Mock).mockReturnValue({
    subjects: defaultSubjects,
    setSubjects: jest.fn(),
    deleteSubject: jest.fn(),
    isLoading: false,
    ...overrides,
  });
}

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe("ArchivedSubjectList", () => {
  it("Renders archive trigger button", () => {
    mockUseSubjects();
    render(<ArchivedSubjectList />);
    expect(screen.getByText("Archived"));
  });

  it("Displays only archived subjects", async () => {
    mockUseSubjects();
    render(<ArchivedSubjectList />);

    fireEvent.click(screen.getByText("Archived"));

    expect(await screen.findByText("Japanese")).toBeInTheDocument();
    expect(screen.queryByText("Math")).not.toBeInTheDocument();
  });

  it("Displays 'No archived subjects' when archive list is empty", async () => {
    mockUseSubjects({
      subjects: [
        {
          id: "1",
          name: "Math",
          level: 1,
          streak: 0,
          daysCompleted: 0,
          isArchived: false,
          sessions: [
            {
              id: "1",
              date: "2025-04-28", // Yesterday
              inputMinutes: 40,
              outputMinutes: 20,
              meetsRequirement: true,
            },
            {
              id: "2",
              date: "2025-04-27", // Two days ago
              inputMinutes: 25,
              outputMinutes: 10,
              meetsRequirement: false,
            },
          ],
        },
      ],
    });

    render(<ArchivedSubjectList />);

    fireEvent.click(screen.getByText("Archived"));

    expect(await screen.findByText("No archived subjects")).toBeInTheDocument();
  });

  it("Displays correct archived subject data", async () => {
    mockUseSubjects();
    render(<ArchivedSubjectList />);

    fireEvent.click(screen.getByText("Archived"));

    expect(await screen.findByText("Level 1")).toBeInTheDocument();
    expect(screen.getByText("Total minutes: 95")).toBeInTheDocument();
    expect(screen.getByText("Last session")).toBeInTheDocument();
    // expect(screen.getByText(/Apr 28, 2025/)).toBeInTheDocument();
  });

  it("Clicking delete button triggers delete", async () => {
    const deleteSubject = jest.fn();
    mockUseSubjects({ deleteSubject });
    render(<ArchivedSubjectList />);

    fireEvent.click(screen.getByText("Archived"));

    fireEvent.click(
      await screen.findByRole("button", { name: /delete-button/i }),
    );

    expect(await screen.findByText("Delete")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(deleteSubject).toHaveBeenCalled();
    });
  });
});
