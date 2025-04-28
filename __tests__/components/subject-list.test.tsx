import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SubjectList from "@/components/subject-list";
import { useSubjects } from "@/contexts/SubjectContext";
import "@testing-library/jest-dom";

jest.mock("@/contexts/SubjectContext", () => ({
  useSubjects: jest.fn(),
}));

function mockUseSubjects(overrides: any) {
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

it("shows loading message when loading", () => {
  mockUseSubjects({ isLoading: true });
  render(<SubjectList />);
  expect(screen.getByText(/loading subjects/i)).toBeInTheDocument();
});

// PRIOR TESTS --------------------------------------------------------------------------------

// // Mock dependencies
// jest.mock("sonner", () => ({
//   toast: jest.fn(),
// }));
//
// jest.mock("@/contexts/SubjectContext", () => ({
//   useSubjects: jest.fn(),
//   SubjectProvider: ({ children }) => <div>{children}</div>,
// }));
//
// jest.mock("@/lib/subjects", () => ({
//   getLevelConfig: jest.fn().mockReturnValue({
//     inputMinutes: 30,
//     outputMinutes: 15,
//     requiredDays: 7,
//   }),
// }));
//
// jest.mock("@/components/log-session-dialog", () => ({
//   LogSessionDialog: ({ onLogSession }) => (
//     <button
//       data-testid="log-session-button"
//       onClick={() => onLogSession({ input: 30, output: 15 })}
//     >
//       Log Session
//     </button>
//   ),
// }));
//
// jest.mock("@/components/subject-details-dialog", () => ({
//   SubjectDetailsDialog: ({ onDelete }) => (
//     <button data-testid="delete-subject-button" onClick={onDelete}>
//       Delete Subject
//     </button>
//   ),
// }));
//
// describe("SubjectList", () => {
//   const mockSubjects = [
//     {
//       id: "1",
//       name: "Mathematics",
//       level: 2,
//       streak: 3,
//       daysCompleted: 4,
//       sessions: [],
//     },
//     {
//       id: "2",
//       name: "Physics",
//       level: 1,
//       streak: 1,
//       daysCompleted: 2,
//       sessions: [
//         {
//           id: "123",
//           date: new Date().toISOString().split("T")[0],
//           inputMinutes: 30,
//           outputMinutes: 15,
//           meetsRequirement: true,
//         },
//       ],
//     },
//   ];
//
//   const mockSetSubjects = jest.fn();
//   const mockDeleteSubject = jest.fn();
//
//   beforeEach(() => {
//     jest.clearAllMocks();
//     require("@/contexts/SubjectContext").useSubjects.mockReturnValue({
//       subjects: mockSubjects,
//       setSubjects: mockSetSubjects,
//       deleteSubject: mockDeleteSubject,
//       isLoading: false,
//     });
//   });
//
//   test("renders loading state", () => {
//     require("@/contexts/SubjectContext").useSubjects.mockReturnValue({
//       isLoading: true,
//     });
//
//     render(<SubjectList />);
//     expect(screen.getByText("Loading subjects...")).toBeInTheDocument();
//   });
//
//   test("renders empty state when no subjects", () => {
//     require("@/contexts/SubjectContext").useSubjects.mockReturnValue({
//       subjects: [],
//       isLoading: false,
//     });
//
//     render(<SubjectList />);
//     expect(screen.getByText("No subjects yet")).toBeInTheDocument();
//   });
//
//   test("renders subjects correctly", () => {
//     render(<SubjectList />);
//
//     expect(screen.getByText("Mathematics")).toBeInTheDocument();
//     expect(screen.getByText("Physics")).toBeInTheDocument();
//     expect(screen.getByText("Level 2")).toBeInTheDocument();
//     expect(screen.getByText("3 day streak")).toBeInTheDocument();
//   });
//
//   test("handles logging a session", () => {
//     render(<SubjectList />);
//
//     fireEvent.click(screen.getAllByTestId("log-session-button")[0]);
//
//     expect(mockSetSubjects).toHaveBeenCalled();
//     expect(toast).toHaveBeenCalledWith("Session Logged", expect.any(Object));
//   });
//
//   test("handles deleting a subject", () => {
//     render(<SubjectList />);
//
//     fireEvent.click(screen.getAllByTestId("delete-subject-button")[0]);
//
//     expect(mockDeleteSubject).toHaveBeenCalledWith("1");
//     expect(toast).toHaveBeenCalledWith("Subject Deleted", expect.any(Object));
//   });
// });
