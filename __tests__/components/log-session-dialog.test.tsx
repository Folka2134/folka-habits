import { LogSessionDialog } from "@/components/log-session-dialog";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
// import { toast } from "sonner";

// jest.mock("sonner", () => ({
//   toast: jest.fn(),
// }));

describe("LogSessionDialog", () => {
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

  const mockOnLogSession = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Renders dialog trigger button", () => {
    render(
      <LogSessionDialog
        subject={mockSubject}
        onLogSession={mockOnLogSession}
        disabled={false}
      />,
    );

    expect(
      screen.getByRole("button", { name: /log-button/i }),
    ).toBeInTheDocument();
  });

  it("Opens dialog when trigger button is clicked", async () => {
    render(
      <LogSessionDialog
        subject={mockSubject}
        onLogSession={mockOnLogSession}
        disabled={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /log-button/i }));
    expect(await screen.findByText("Log Study Session")).toBeInTheDocument();
    expect(screen.getByText(/Record your study time for/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /log-session-button/i }),
    ).toBeInTheDocument();
  });

  it("Displays input fields", async () => {
    render(
      <LogSessionDialog
        subject={mockSubject}
        onLogSession={mockOnLogSession}
        disabled={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /log-button/i }));
    expect(
      await screen.findByPlaceholderText("At least 25 minutes"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("At least 5 minutes"),
    ).toBeInTheDocument();
  });

  it("Display subject information and requirements", async () => {
    render(
      <LogSessionDialog
        subject={mockSubject}
        onLogSession={mockOnLogSession}
        disabled={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /log-button/i }));
    expect(
      await screen.findByText(
        /Record your study time for Mathematics. Level 2 requires 25 minutes of input and 5 minutes of output./,
      ),
    ).toBeInTheDocument();
  });

  it("Calls onLogSession when log session button is clicked", async () => {
    render(
      <LogSessionDialog
        subject={mockSubject}
        onLogSession={mockOnLogSession}
        disabled={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /log-button/i }));
    const input = screen.findByPlaceholderText("At least 25 minutes");
    const output = screen.getByPlaceholderText("At least 5 minutes");
    fireEvent.input(await input, { target: { value: "25" } });
    fireEvent.input(output, { target: { value: "25" } });
    fireEvent.click(
      await screen.findByRole("button", { name: /log-session-button/i }),
    );

    expect(mockOnLogSession).toHaveBeenCalled();
  });

  it("Button displays 'Already Logged Today' when session has been logged today", async () => {
    const mockSubject = {
      id: "1",
      name: "Japanese",
      level: 2,
      streak: 5,
      daysCompleted: 3,
      isArchived: false,
      sessions: [
        {
          id: "1",
          date: new Date().toISOString(), // Today
          inputMinutes: 40,
          outputMinutes: 20,
          meetsRequirement: true,
        },
      ],
    };
    render(
      <LogSessionDialog
        subject={mockSubject}
        onLogSession={mockOnLogSession}
        disabled={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /log-button/i }));
    expect(await screen.findByText("Already Logged Today"));
  });
});

// display invalid study time toast when log session button is clicked as required time is not met
// display session logged toast when log session button is clicked
