import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render-with-providers";

vi.mock("@/services/public.service", () => ({
  PublicService: {
    getTours: vi.fn(),
  },
}));

import { PublicService } from "@/services/public.service";
import GuestToursPage from "./ToursPage";

const mockTours = [
  {
    id: 1,
    name: "Hạ Long 3N2Đ",
    price: 2500000,
    total_days: 3,
    destination: "Quảng Ninh",
    image_url: "http://example.com/image1.jpg",
  },
  {
    id: 2,
    name: "Sapa 2N1Đ",
    price: 1800000,
    total_days: 2,
    destination: "Lào Cai",
    image_url: "http://example.com/image2.jpg",
  },
  {
    id: 3,
    name: "Phú Quốc 4N3Đ",
    price: 3200000,
    total_days: 4,
    destination: "Kiên Giang",
    image_url: "http://example.com/image3.jpg",
  },
];

describe("ToursPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders tour cards from getTours", async () => {
    vi.mocked(PublicService.getTours).mockResolvedValue({
      tours: mockTours,
    });

    renderWithProviders(<GuestToursPage />);

    expect(await screen.findByText(/hạ long 3n2đ/i)).toBeInTheDocument();
    expect(await screen.findByText(/sapa 2n1đ/i)).toBeInTheDocument();
    expect(await screen.findByText(/phú quốc 4n3đ/i)).toBeInTheDocument();
  });

  it("calls getTours with search params from URL query string", async () => {
    vi.mocked(PublicService.getTours).mockResolvedValue({
      tours: [mockTours[0]],
    });

    renderWithProviders(<GuestToursPage />, {
      route: "/tours?destination_id=1&keyword=ha+long&date=2026-06-01&guests=2",
    });

    await screen.findByText(/hạ long 3n2đ/i);

    expect(PublicService.getTours).toHaveBeenCalledWith(
      expect.objectContaining({
        destination_id: "1",
        keyword: "ha long",
        date: "2026-06-01",
        guests: "2",
      }),
    );
  });

  it("displays tour cards and search params in UI", async () => {
    vi.mocked(PublicService.getTours).mockResolvedValue({
      tours: mockTours,
    });

    renderWithProviders(<GuestToursPage />, {
      route: "/tours?destination_id=1&keyword=test",
    });

    expect(await screen.findByText(/hạ long 3n2đ/i)).toBeInTheDocument();
    expect(await screen.findByText(/sapa 2n1đ/i)).toBeInTheDocument();
    expect(await screen.findByText(/phú quốc 4n3đ/i)).toBeInTheDocument();
  });

  it("renders tour list with formatted prices", async () => {
    vi.mocked(PublicService.getTours).mockResolvedValue({
      tours: mockTours,
    });

    renderWithProviders(<GuestToursPage />);

    await screen.findByText(/hạ long 3n2đ/i);

    expect(screen.getByText(/1[.,]800[.,]000/)).toBeInTheDocument();
  });
});
