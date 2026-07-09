import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import SignIn from "@/pages/auth/sign-in";

const mockLogin = jest.fn();
const mockPush = jest.fn();
let mockUser: { role: "hirer" | "vendor" } | null = null;

jest.mock("next/router", () => ({
  useRouter: () => ({ isReady: true, push: mockPush, replace: jest.fn(), query: {} }),
}));

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: mockUser, login: mockLogin }),
}));

const renderPage = () => render(<ChakraProvider><SignIn /></ChakraProvider>);

function submit(username: string, password: string) {
  fireEvent.change(screen.getByPlaceholderText("Enter username"), { target: { value: username } });
  fireEvent.change(screen.getByPlaceholderText("Enter password"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: /login/i }));
}

describe("SignIn page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = null;
    mockLogin.mockResolvedValue(true);
  });

  test("renders username, password, and sign-up link", () => {
    renderPage();
    expect(screen.getByPlaceholderText("Enter username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
  });

  test("calls login with username and password", async () => {
    renderPage();
    submit("alice", "password1");
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith("alice", "password1"));
  });

  test("redirects an existing hirer to profile dashboard", async () => {
    mockUser = { role: "hirer" };
    renderPage();
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/user/hirer/profile-dashboard"));
  });

  test("redirects an existing vendor to vendor dashboard", async () => {
    mockUser = { role: "vendor" };
    renderPage();
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/user/vendor/dashboard"));
  });

  test("does not redirect when login fails", async () => {
    mockLogin.mockResolvedValue(false);
    renderPage();
    submit("wrong", "wrong");
    await waitFor(() => expect(mockLogin).toHaveBeenCalled());
    expect(mockPush).not.toHaveBeenCalled();
  });
});
