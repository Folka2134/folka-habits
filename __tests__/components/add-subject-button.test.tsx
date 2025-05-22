import { AddSubjectButton } from "@/components/add-subject-button";
import { useSubjects } from "@/contexts/SubjectContext";
import { fireEvent, render, screen } from "@testing-library/react";
import { toast } from "sonner";

jest.mock("@/contexts/SubjectContext", () => ({
  useSubjects: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: jest.fn(),
}));

function mockUseSubjects(overrides = {}) {
  const mockAddSubject = jest.fn();

  (useSubjects as jest.Mock).mockReturnValue({
    subjects: [],
    setSubjects: jest.fn(),
    addSubject: mockAddSubject,
    deleteSubject: jest.fn(),
    isLoading: false,
    ...overrides,
  });

  return { mockAddSubject };
}

describe("Add Subject Button", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Renders dialog trigger button", () => {
    mockUseSubjects();
    render(<AddSubjectButton />);

    expect(screen.getByText("Add Subject")).toBeInTheDocument();
  });

  it("opens dialog when clicked", () => {
    mockUseSubjects();
    render(<AddSubjectButton />);

    fireEvent.click(screen.getByText("Add Subject"));

    expect(screen.getByText("Add New Subject")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  it("adds a new subject when form is submitted with valid data", () => {
    const { mockAddSubject } = mockUseSubjects();
    render(<AddSubjectButton />);

    // Open the dialog
    fireEvent.click(screen.getByText("Add Subject"));

    // Fill in the form
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Physics" },
    });

    // Find and click the submit button by its text "Add"
    // This matches what's shown in the error message
    fireEvent.click(screen.getByText("Add"));

    // Check if addSubject was called with correct data
    expect(mockAddSubject).toHaveBeenCalledTimes(1);
    expect(mockAddSubject).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Physics",
        level: 1,
        isArchived: false,
      }),
    );

    // Check if toast was displayed
    expect(toast).toHaveBeenCalledWith("Subject Added", {
      description: "Physics has been added to your subjects.",
    });
  });

  it("shows error toast when subject name is empty", () => {
    const { mockAddSubject } = mockUseSubjects();
    render(<AddSubjectButton />);

    // Open the dialog
    fireEvent.click(screen.getByText("Add Subject"));

    // Submit without entering a name
    // Find button by text content "Add" instead of role+name
    fireEvent.click(screen.getByText("Add"));

    // Check that addSubject was not called
    expect(mockAddSubject).not.toHaveBeenCalled();

    // Check if error toast was displayed
    expect(toast).toHaveBeenCalledWith("Subject name required", {
      description: "Please enter a name for your subject",
    });
  });

  it("adds a subject when pressing Enter in the input field", () => {
    const { mockAddSubject } = mockUseSubjects();
    render(<AddSubjectButton />);

    // Open the dialog
    fireEvent.click(screen.getByText("Add Subject"));

    // Fill in the form
    const input = screen.getByLabelText("Name");
    fireEvent.change(input, {
      target: { value: "Chemistry" },
    });

    // Press Enter key
    fireEvent.keyDown(input, { key: "Enter" });

    // Check if addSubject was called with correct data
    expect(mockAddSubject).toHaveBeenCalledTimes(1);
    expect(mockAddSubject).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Chemistry",
      }),
    );
  });
});
