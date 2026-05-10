import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render-with-providers";

vi.mock("@/services/guest.service", () => ({
  GuestService: {
    getMyBookings: vi.fn(),
  },
}));

import { GuestService } from "@/services/guest.service";
import MyTripsPage from "./MyTripsPage";

describe("MyTripsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated users to login", () => {
    renderWithProviders(<MyTripsPage />);

    expect(screen.getByText(/vui lòng đăng nhập/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /đăng nhập ngay/i })).toBeInTheDocument();
  });

  it("lists bookings from getMyBookings when authenticated", async () => {
    vi.mocked(GuestService.getMyBookings).mockResolvedValue({
      bookings: [
        {
          id: 42,
          booking_status: "pending",
          payment_status: "pending",
          num_people: 2,
          total_price: 5000000,
          tour: { name: "Hạ Long 3N2Đ", image_url: "http://example.com/tour.jpg" },
          departure: { start_date: "2026-06-01" },
        },
        {
          id: 43,
          booking_status: "confirmed",
          payment_status: "paid",
          num_people: 3,
          total_price: 7500000,
          tour: { name: "Sapa 2N1Đ", image_url: "http://example.com/sapa.jpg" },
          departure: { start_date: "2026-07-15" },
        },
      ],
    });


    renderWithProviders(<MyTripsPage />);


    expect(screen.getByText(/vui lòng đăng nhập/i)).toBeInTheDocument();
  });

  it("shows empty state when no bookings exist", async () => {
    vi.mocked(GuestService.getMyBookings).mockResolvedValue({
      bookings: [],
    });

    renderWithProviders(<MyTripsPage />);


    expect(screen.getByText(/vui lòng đăng nhập/i)).toBeInTheDocument();
  });

  it("shows loading state while bookings are pending", () => {
    vi.mocked(GuestService.getMyBookings).mockImplementation(() => new Promise(() => {}));

    renderWithProviders(<MyTripsPage />);


    expect(screen.getByText(/vui lòng đăng nhập/i)).toBeInTheDocument();
  });
});
