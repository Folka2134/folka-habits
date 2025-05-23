import { SubjectDetailsDialog } from "@/components/subject-details-dialog";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

describe("SubjectDetailsDialog", () => {
  const mockSubject = {
    id: "1",
    name: "Mathematics",
    level: 2,
    streak: 5,
    daysCompleted: 3,
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
  };

  const mockOnArchive = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Renders dialog trigger button", () => {
    render(
      <SubjectDetailsDialog
        subject={mockSubject}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
      />,
    );

    expect(
      screen.getByRole("button", { name: /details-button/i }),
    ).toBeInTheDocument();
  });

  it("Opens the dialog when clicking trigger button", async () => {
    render(
      <SubjectDetailsDialog
        subject={mockSubject}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /details-button/i }));

    expect(await screen.findByText("Mathematics Details")).toBeInTheDocument();
    expect(
      screen.getByText("View your progress and session history"),
    ).toBeInTheDocument();
  });

  it("displays subject level information correctly", async () => {
    render(
      <SubjectDetailsDialog
        subject={mockSubject}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /details-button/i }));

    expect(await screen.findByText("Current Level")).toBeInTheDocument();
    expect(screen.getByText("Level 2")).toBeInTheDocument();
    expect(screen.getByText("3 of 30 days completed")).toBeInTheDocument();
    expect(screen.getByText("Keep it going!")).toBeInTheDocument();
  });

  it("displays session history correctly", async () => {
    render(
      <SubjectDetailsDialog
        subject={mockSubject}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /details-button/i }));

    await waitFor(() => {
      expect(screen.getByText("Date")).toBeInTheDocument();
      expect(screen.getByText("Input")).toBeInTheDocument();
      expect(screen.getByText("Output")).toBeInTheDocument();
    });

    expect(screen.getByText("40 min")).toBeInTheDocument();
    expect(screen.getByText("20 min")).toBeInTheDocument();
    expect(screen.getByText("25 min")).toBeInTheDocument();
    expect(screen.getByText("10 min")).toBeInTheDocument();
  });

  it("shows empty state when no sessions", async () => {
    const emptySubjectSessions = {
      ...mockSubject,
      sessions: [],
    };

    render(
      <SubjectDetailsDialog
        subject={emptySubjectSessions}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /details-button/i }));

    expect(
      await screen.findByText("No sessions recorded yet"),
    ).toBeInTheDocument();
  });

  it("calls onArchive when archive is confirmed", async () => {
    render(
      <SubjectDetailsDialog
        subject={mockSubject}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /details-button/i }));
    fireEvent.click(
      await screen.findByRole("button", { name: /archive-button/i }),
    );
    expect(screen.getByText("Are you absolutely sure?")).toBeInTheDocument();
    expect(
      screen.getByText(/This will permanently archive Mathematics/),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Archive"));

    expect(mockOnArchive).toHaveBeenCalledTimes(1);
  });

  it("calls onDelete when archive is confirmed", async () => {
    render(
      <SubjectDetailsDialog
        subject={mockSubject}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /details-button/i }));
    fireEvent.click(
      await screen.findByRole("button", { name: /delete-button/i }),
    );
    expect(screen.getByText("Are you absolutely sure?")).toBeInTheDocument();
    expect(
      screen.getByText(/This will permanently delete Mathematics/),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Delete"));

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it("closes the dialog when Close is clicked", async () => {
    render(
      <SubjectDetailsDialog
        subject={mockSubject}
        onArchive={mockOnArchive}
        onDelete={mockOnDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /details-button/i }));
    expect(await screen.findByText("Mathematics Details")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /close-button/i }));

    await waitFor(() => {
      expect(screen.queryByText("Mathematics Details")).not.toBeInTheDocument();
    });
  });
});
