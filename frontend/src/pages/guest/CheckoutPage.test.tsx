import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "@/test/render-with-providers";

vi.mock("@/services/guest.service", () => ({
  GuestService: {
    bookDeparture: vi.fn(),
    createPayment: vi.fn(),
  },
}));

import { GuestService } from "@/services/guest.service";
import CheckoutPage from "./CheckoutPage";

const validBookingState = {
  tour: { id: 1, name: "Hạ Long 3N2Đ", image: "", duration: "3 ngày 2 đêm" },
  departure: { id: 99, start_date: "2026-06-01" },
  guests: 2,
  pricePerPerson: 1500000,
};

const renderCheckout = () => {
  return renderWithProviders(
    <Routes>
      <Route path="/checkout" element={<CheckoutPage />} />
    </Routes>,
    {
      route: "/checkout",

    },
  );
};


import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function renderCheckoutWithState(state: unknown) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[{ pathname: "/checkout", state }]}>
        <Routes>
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("CheckoutPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders fallback when booking state is missing", () => {
    renderCheckout();
    expect(screen.getByText(/không tìm thấy thông tin đặt tour/i)).toBeInTheDocument();
  });

  it("renders contact form on step 1 when booking state present", () => {
    renderCheckoutWithState(validBookingState);
    expect(screen.getByText(/thông tin liên hệ/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/nhập họ và tên/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email@example/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/0xxx/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tiếp tục/i })).toBeInTheDocument();
  });

  it("renders order summary with formatted price and date", () => {
    renderCheckoutWithState(validBookingState);
    expect(screen.getByText(/hạ long 3n2đ/i)).toBeInTheDocument();

    expect(screen.getAllByText(/3[.,]000[.,]000đ/).length).toBeGreaterThan(0);
  });

  it("blocks submission when required contact fields are empty (modal)", async () => {
    const user = userEvent.setup();
    renderCheckoutWithState(validBookingState);

    await user.click(screen.getByRole("button", { name: /tiếp tục/i }));
    expect(await screen.findByText(/điền đầy đủ thông tin/i)).toBeInTheDocument();
    expect(GuestService.bookDeparture).not.toHaveBeenCalled();
  });

  it("calls bookDeparture with contact info when fields are valid", async () => {
    vi.mocked(GuestService.bookDeparture).mockResolvedValue({ booking_id: 42 });
    const user = userEvent.setup();
    renderCheckoutWithState(validBookingState);

    await user.type(screen.getByPlaceholderText(/nhập họ và tên/i), "Trần Bình");
    await user.type(screen.getByPlaceholderText(/email@example/i), "binh@example.com");
    await user.type(screen.getByPlaceholderText(/0xxx/i), "0987654321");
    await user.click(screen.getByRole("button", { name: /tiếp tục/i }));

    expect(GuestService.bookDeparture).toHaveBeenCalledWith(
      99,
      2,
      expect.objectContaining({
        name: "Trần Bình",
        email: "binh@example.com",
        phone: "0987654321",
      }),
    );
  });

  it("shows backend error via modal when booking fails", async () => {
    vi.mocked(GuestService.bookDeparture).mockRejectedValue({
      response: { data: { message: "Hết chỗ" } },
    });
    const user = userEvent.setup();
    renderCheckoutWithState(validBookingState);

    await user.type(screen.getByPlaceholderText(/nhập họ và tên/i), "A");
    await user.type(screen.getByPlaceholderText(/email@example/i), "a@b.c");
    await user.type(screen.getByPlaceholderText(/0xxx/i), "012");
    await user.click(screen.getByRole("button", { name: /tiếp tục/i }));

    expect(await screen.findByText(/hết chỗ/i)).toBeInTheDocument();
  });
});
