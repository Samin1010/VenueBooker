import { render, screen } from "@testing-library/react";
import Navbar from "@/components/Navbar";
import "@testing-library/jest-dom";

const mockLogout = jest.fn();

const hirerUser = {
  id: "1",
  username: "Alice",
  email: "alice@gmail.com",
  password: "password1",
  role: "hirer",
  phone: "",
};

const vendorUser = {
  id: "2",
  username: "Bob",
  email: "bob@gmail.com",
  password: "password2",
  role: "vendor",
  phone: "",
};

let mockUser: typeof hirerUser | typeof vendorUser | null = null;

jest.mock("next/router", () => ({
  useRouter: () => ({
    isReady: true,
    push: jest.fn(),
    replace: jest.fn(),
    pathname: "/",
    query: {},
  }),
}));

jest.mock("next/image", () => {
  function MockNextImage(props: React.ComponentProps<"img">) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt ?? ""} />;
  }

  return MockNextImage;
});

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout,
  }),
}));

describe("Navbar — signed out", () => {
  beforeEach(() => {
    mockUser = null;
    jest.clearAllMocks();
  });

  test("shows Sign In button when no user is logged in", () => {
    render(<Navbar />);
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
  });

  test("does NOT show a Sign out button when logged out", () => {
    render(<Navbar />);
    expect(screen.queryByRole("button", { name: /sign out/i })).not.toBeInTheDocument();
  });

  test("does NOT show dashboard link when logged out", () => {
    render(<Navbar />);
    expect(screen.queryByRole("link", { name: /dashboard/i })).not.toBeInTheDocument();
  });

});

describe("Navbar — signed in as hirer", () => {
  beforeEach(() => {
    mockUser = hirerUser;
    jest.clearAllMocks();
  });

  test("shows Dashboard link for hirer", () => {
    render(<Navbar />);
    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
  });

  test("shows Venue Listing link for hirer", () => {
    render(<Navbar />);
    expect(screen.getByRole("link", { name: /venue listing/i })).toBeInTheDocument();
  });

  test("shows Notifications link for hirer", () => {
    render(<Navbar />);
    expect(screen.getByRole("link", { name: /notifications/i })).toBeInTheDocument();
  });

  test("does NOT show Sign In button when hirer is logged in", () => {
    render(<Navbar />);
    expect(screen.queryByRole("link", { name: /sign in/i })).not.toBeInTheDocument();
  });

  test("shows the logged-in username in popover header", () => {
    render(<Navbar />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  test("shows Sign out button for logged-in hirer", () => {
    render(<Navbar />);
    // The Sign out button lives inside a Chakra Popover (hidden until hover),
    // so it has no accessible name — query by text content instead
    expect(screen.getByText(/sign out/i)).toBeInTheDocument();
  });
});

describe("Navbar — signed in as vendor", () => {
  beforeEach(() => {
    mockUser = vendorUser;
    jest.clearAllMocks();
  });

  test("shows Dashboard link for vendor", () => {
    render(<Navbar />);
    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
  });

  test("shows Venues link for vendor", () => {
    render(<Navbar />);
    expect(screen.getByRole("link", { name: /^venues$/i })).toBeInTheDocument();
  });

  test("shows Applications Received link for vendor", () => {
    render(<Navbar />);
    expect(
      screen.getAllByRole("link", { name: /applications received/i }).length,
    ).toBeGreaterThan(0);
  });

  test("does NOT show Notifications link for vendor", () => {
    render(<Navbar />);
    expect(screen.queryByRole("link", { name: /notifications/i })).not.toBeInTheDocument();
  });

  test("does NOT show Venue Listing link for vendor", () => {
    render(<Navbar />);
    expect(screen.queryByRole("link", { name: /venue listing/i })).not.toBeInTheDocument();
  });

  test("shows the vendor's username in the popover", () => {
    render(<Navbar />);
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });
});
