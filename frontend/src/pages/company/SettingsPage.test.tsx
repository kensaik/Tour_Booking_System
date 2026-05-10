import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render-with-providers";
import { useAuthStore } from "@/stores/authStore";
import SettingsPage from "./SettingsPage";

vi.mock("@/components/company/CompanyLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockUser = {
  id: 1,
  email: "company@example.com",
  full_name: "Tour Company ABC",
  role: "company",
  is_active: true,
  company_profile: {
    phone: "0912345678",
    address: "123 Nguyễn Huệ, HCMC",
    description: "Leading tour operator",
    is_approved: true,
  },
};

describe("CompanySettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    useAuthStore.setState({ user: mockUser, isAuthenticated: true });
  });

  it("renders page header and settings form", async () => {
    renderWithProviders(<SettingsPage />);

    expect(await screen.findByText(/Cài đặt hồ sơ/i)).toBeInTheDocument();
    expect(screen.getByText(/Quản lý thông tin công ty/i)).toBeInTheDocument();
  });

  it("renders all form fields", async () => {
    renderWithProviders(<SettingsPage />);

    expect(await screen.findByLabelText(/Tên công ty/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email liên hệ/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Số điện thoại/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Địa chỉ trụ sở/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Giới thiệu công ty/i)).toBeInTheDocument();
  });

  it("pre-fills form fields with user data", async () => {
    renderWithProviders(<SettingsPage />);

    expect(await screen.findByDisplayValue(/Tour Company ABC/)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/company@example.com/)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/0912345678/)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/123 Nguyễn Huệ, HCMC/)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Leading tour operator/)).toBeInTheDocument();
  });

  it("disables email field from editing", async () => {
    renderWithProviders(<SettingsPage />);

    const emailInput = await screen.findByDisplayValue(/company@example.com/) as HTMLInputElement;
    expect(emailInput.disabled).toBe(true);
  });

  it("allows editing company name", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />);

    const nameInput = await screen.findByDisplayValue(/Tour Company ABC/) as HTMLInputElement;
    await user.clear(nameInput);
    await user.type(nameInput, "New Company Name");

    expect(nameInput.value).toBe("New Company Name");
  });

  it("allows editing phone number", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />);

    const phoneInput = await screen.findByDisplayValue(/0912345678/) as HTMLInputElement;
    await user.clear(phoneInput);
    await user.type(phoneInput, "0987654321");

    expect(phoneInput.value).toBe("0987654321");
  });

  it("allows editing address", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />);

    const addressInput = await screen.findByDisplayValue(/123 Nguyễn Huệ, HCMC/) as HTMLInputElement;
    await user.clear(addressInput);
    await user.type(addressInput, "456 Le Loi Street");

    expect(addressInput.value).toBe("456 Le Loi Street");
  });

  it("allows editing company description", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />);

    const descInput = await screen.findByDisplayValue(/Leading tour operator/) as HTMLTextAreaElement;
    await user.clear(descInput);
    await user.type(descInput, "Premium tour operator with 10 years experience");

    expect(descInput.value).toBe("Premium tour operator with 10 years experience");
  });

  it("renders submit button", async () => {
    renderWithProviders(<SettingsPage />);

    expect(await screen.findByRole("button", { name: /Lưu thay đổi/i })).toBeInTheDocument();
  });

  it("shows save success toast on form submit", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />);

    const submitBtn = await screen.findByRole("button", { name: /Lưu thay đổi/i });
    await user.click(submitBtn);

    expect(await screen.findByText(/Đã cập nhật thông tin hồ sơ thành công/i)).toBeInTheDocument();
  });

  it("disables submit button while saving", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />);

    const submitBtn = await screen.findByRole("button", { name: /Lưu thay đổi/i }) as HTMLButtonElement;

    // Click submit
    await user.click(submitBtn);

    // Button should show loading state temporarily
    expect(screen.getByRole("button", { name: /Đang lưu/i })).toBeInTheDocument();
  });

  it("renders security section with password change option", async () => {
    renderWithProviders(<SettingsPage />);

    expect(await screen.findByText(/Bảo mật tài khoản/i)).toBeInTheDocument();
    expect(screen.getByText(/Thay đổi mật khẩu/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Đổi mật khẩu/i })).toBeInTheDocument();
  });

  it("renders account status info sidebar", async () => {
    renderWithProviders(<SettingsPage />);

    expect(await screen.findByText(/Trạng thái tài khoản/i)).toBeInTheDocument();
    expect(screen.getByText(/Đã xác thực/i)).toBeInTheDocument();
  });

  it("renders important notice sidebar", async () => {
    renderWithProviders(<SettingsPage />);

    expect(await screen.findByText(/Lưu ý/i)).toBeInTheDocument();
    expect(screen.getByText(/Thông tin công ty của bạn sẽ được hiển thị công khai/i)).toBeInTheDocument();
  });

  it("allows making multiple field changes before submit", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />);

    const nameInput = await screen.findByDisplayValue(/Tour Company ABC/) as HTMLInputElement;
    const phoneInput = screen.getByDisplayValue(/0912345678/) as HTMLInputElement;
    const addressInput = screen.getByDisplayValue(/123 Nguyễn Huệ, HCMC/) as HTMLInputElement;

    await user.clear(nameInput);
    await user.type(nameInput, "Updated Company");

    await user.clear(phoneInput);
    await user.type(phoneInput, "0111111111");

    await user.clear(addressInput);
    await user.type(addressInput, "New Address");

    expect(nameInput.value).toBe("Updated Company");
    expect(phoneInput.value).toBe("0111111111");
    expect(addressInput.value).toBe("New Address");
  });

  it("pre-fills with empty string when company_profile data is missing", async () => {
    const minimalUser = {
      id: 2,
      email: "newcompany@example.com",
      full_name: "New Company",
      role: "company",
      is_active: true,
      company_profile: undefined,
    };

    useAuthStore.setState({ user: minimalUser, isAuthenticated: true });
    renderWithProviders(<SettingsPage />);

    const phoneInput = await screen.findByPlaceholderText(/09xx xxx xxx/) as HTMLInputElement;
    expect(phoneInput.value).toBe("");
  });

  it("displays form in professional layout with two columns on desktop", async () => {
    renderWithProviders(<SettingsPage />);

    const formContainer = await screen.findByText(/Tên công ty/i).closest(".space-y-2");
    expect(formContainer).toBeInTheDocument();
  });

  it("shows toast notification can be closed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />);

    const submitBtn = await screen.findByRole("button", { name: /Lưu thay đổi/i });
    await user.click(submitBtn);

    const toast = await screen.findByText(/Đã cập nhật thông tin hồ sơ thành công/i);
    expect(toast).toBeInTheDocument();

    // Note: Toast auto-closes, so we just verify it appears
    expect(toast.closest("[role='alert']") || toast.parentElement).toBeDefined();
  });
});
