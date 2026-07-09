import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import SignUp from "@/pages/auth/sign-up";
import { AuthFetcherService } from "@/services/auth.api";

const mockPush = jest.fn();

jest.mock("next/router", () => ({
  useRouter: () => ({
    isReady: true,
    push: mockPush,
    replace: jest.fn(),
    query: {},
  }),
}));

const renderPage = () => render(<ChakraProvider><SignUp /></ChakraProvider>);

function fillForm(username = "mark.zuck", password = "Password3!", confirm = password) {
  fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "Mark" } });
  fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "Zuck" } });
  fireEvent.change(screen.getByLabelText(/username/i), { target: { value: username } });
  fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: "mark@fb.com" } });
  fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: password } });
  fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: confirm } });
  fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
}

describe("SignUp page", () => {
  const signUp = jest.spyOn(AuthFetcherService.prototype, "signUp");

  beforeEach(() => {
    jest.clearAllMocks();
    signUp.mockResolvedValue({ success: true, message: "Account created" });
  });

  test("renders all registration fields", () => {
    renderPage();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  test("submits the explicit username and redirects after API success", async () => {
    renderPage();
    fillForm();

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith(
        "mark@fb.com",
        "Mark",
        "Zuck",
        "mark.zuck",
        "Password3!",
      );
      expect(mockPush).toHaveBeenCalledWith("/auth/sign-in");
    });
  });

  test("does not call the API when passwords do not match", async () => {
    renderPage();
    fillForm("mark.zuck", "Password3!", "Different3!");
    await waitFor(() => expect(signUp).not.toHaveBeenCalled());
  });

  test("revalidates password matching when the password field changes", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "Password3!" } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "Password3!" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "Changed4!" } });

    expect(await screen.findByText("The password is not matching")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "Changed4!" } });
    await waitFor(() => {
      expect(screen.queryByText("The password is not matching")).not.toBeInTheDocument();
    });
  });

  test("does not redirect when the API rejects registration", async () => {
    signUp.mockResolvedValue({ success: false, message: "Username exists" });
    renderPage();
    fillForm();
    await waitFor(() => expect(signUp).toHaveBeenCalled());
    expect(mockPush).not.toHaveBeenCalled();
  });
});
