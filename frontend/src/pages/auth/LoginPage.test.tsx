import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render-with-providers";

vi.mock("@/services/auth.service", () => ({
  AuthService: {
    login: vi.fn(),
  },
}));

import { AuthService } from "@/services/auth.service";
import LoginPage from "./LoginPage";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders email and password inputs with submit button", () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^mật khẩu$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^đăng nhập$/i })).toBeInTheDocument();
  });

  it("blocks submit when email or password fields are empty (HTML5 validation)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const submitBtn = screen.getByRole("button", { name: /^đăng nhập$/i });

    await user.click(submitBtn);


    expect(AuthService.login).not.toHaveBeenCalled();
  });

  it("calls AuthService.login with payload and persists auth state on success", async () => {
    vi.mocked(AuthService.login).mockResolvedValue({
      access_token: "test-token-123",
      user: {
        id: 1,
        email: "guest@example.com",
        full_name: "Nguyễn A",
        role: "guest",
        is_active: true,
      },
    });

    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/^email$/i), "guest@example.com");
    await user.type(screen.getByLabelText(/^mật khẩu$/i), "password123");
    await user.click(screen.getByRole("button", { name: /^đăng nhập$/i }));

    expect(AuthService.login).toHaveBeenCalledWith("guest@example.com", "password123");
  });

  it("renders backend error message on login failure", async () => {
    vi.mocked(AuthService.login).mockRejectedValue({
      response: {
        data: {
          message: "Email hoặc mật khẩu không chính xác",
        },
      },
    });

    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/^email$/i), "wrong@example.com");
    await user.type(screen.getByLabelText(/^mật khẩu$/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /^đăng nhập$/i }));

    expect(await screen.findByText(/email hoặc mật khẩu không chính xác/i)).toBeInTheDocument();
  });

  it("shows deactivated account error message", async () => {
    vi.mocked(AuthService.login).mockRejectedValue({
      response: {
        data: {
          message: "Account is deactivated",
        },
      },
    });

    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/^email$/i), "deactivated@example.com");
    await user.type(screen.getByLabelText(/^mật khẩu$/i), "password");
    await user.click(screen.getByRole("button", { name: /^đăng nhập$/i }));

    expect(await screen.findByText(/tài khoản.*đã bị khóa/i)).toBeInTheDocument();
  });
});
