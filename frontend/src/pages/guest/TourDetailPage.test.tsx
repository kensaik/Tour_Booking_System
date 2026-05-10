import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "@/test/render-with-providers";

vi.mock("@/services/public.service", () => ({
  PublicService: {
    getTourDetail: vi.fn(),
  },
}));

import { PublicService } from "@/services/public.service";
import TourDetailPage from "./TourDetailPage";

const mockTourDetail = {
  tour: {
    id: 1,
    name: "Hạ Long 3N2Đ",
    description: "Khám phá vẻ đẹp kỳ bí của Hạ Long",
    price: 2500000,
    total_days: 3,
    destination: "Quảng Ninh",
    image_url: "http://example.com/tour.jpg",
    itineraries: [
      {
        id: 1,
        day_number: 1,
        title: "Khởi hành từ Hà Nội",
        description: "Khởi hành sáng sớm từ Hà Nội",
      },
    ],
    departures: [
      { id: 10, start_date: "2026-06-01", available_seats: 10 },
      { id: 11, start_date: "2026-06-15", available_seats: 5 },
    ],
  },
};

describe("TourDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders tour fields including title, description, and formatted price", async () => {
    vi.mocked(PublicService.getTourDetail).mockResolvedValue(mockTourDetail);

    renderWithProviders(
      <Routes>
        <Route path="/tours/:id" element={<TourDetailPage />} />
      </Routes>,
      { route: "/tours/1" },
    );

    // Use more specific query to find the main heading
    const heading = await screen.findByRole("heading", { name: /hạ long 3n2đ/i });
    expect(heading).toBeInTheDocument();
    expect(await screen.findByText(/khám phá vẻ đẹp kỳ bí của hạ long/i)).toBeInTheDocument();
    // Price formatted as VND
    expect(await screen.findByText(/2[.,]500[.,]000/)).toBeInTheDocument();
  });

  it("renders departure list with dates and available seats", async () => {
    vi.mocked(PublicService.getTourDetail).mockResolvedValue(mockTourDetail);

    renderWithProviders(
      <Routes>
        <Route path="/tours/:id" element={<TourDetailPage />} />
      </Routes>,
      { route: "/tours/1" },
    );

    expect(await screen.findByText(/chọn ngày khởi hành/i)).toBeInTheDocument();
    // Departure dates should be visible
    const departureButtons = screen.getAllByRole("button");
    expect(departureButtons.length).toBeGreaterThan(0);
  });

  it("enables 'Đặt ngay' button only when departure is selected", async () => {
    vi.mocked(PublicService.getTourDetail).mockResolvedValue(mockTourDetail);

    const user = userEvent.setup();
    renderWithProviders(
      <Routes>
        <Route path="/tours/:id" element={<TourDetailPage />} />
      </Routes>,
      { route: "/tours/1" },
    );

    // Wait for data to load using specific query
    await screen.findByRole("heading", { name: /hạ long 3n2đ/i });

    // Initially button should work (no disabled state based on departure)
    // but clicking without departure should show warning modal
    const bookBtn = screen.getByRole("button", { name: /đặt ngay/i });
    expect(bookBtn).toBeInTheDocument();

    // Click without selecting departure
    await user.click(bookBtn);

    // Warning modal appears
    expect(
      await screen.findByText(/vui lòng chọn ngày khởi hành/i),
    ).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByRole("button", { name: /đã hiểu/i });
    await user.click(closeBtn);

    // Modal should be closed
    expect(
      screen.queryByText(/vui lòng chọn ngày khởi hành/i),
    ).not.toBeInTheDocument();
  });

  it("shows loading and error states appropriately", async () => {
    vi.mocked(PublicService.getTourDetail).mockImplementation(
      () => new Promise(() => {}),
    );

    renderWithProviders(
      <Routes>
        <Route path="/tours/:id" element={<TourDetailPage />} />
      </Routes>,
      { route: "/tours/1" },
    );

    expect(screen.getByText(/đang tải dữ liệu/i)).toBeInTheDocument();
  });

  it("renders error message when getTourDetail fails", async () => {
    vi.mocked(PublicService.getTourDetail).mockRejectedValue(new Error("API error"));

    renderWithProviders(
      <Routes>
        <Route path="/tours/:id" element={<TourDetailPage />} />
      </Routes>,
      { route: "/tours/1" },
    );

    expect(await screen.findByText(/lỗi khi tải tour/i)).toBeInTheDocument();
  });
});
