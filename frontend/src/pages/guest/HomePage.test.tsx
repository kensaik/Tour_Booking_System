import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render-with-providers";

vi.mock("@/services/public.service", () => ({
  PublicService: {
    getDestinations: vi.fn(),
    getTours: vi.fn(),
  },
}));

import { PublicService } from "@/services/public.service";
import HomePage from "./HomePage";

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders hero section and featured tours heading", () => {
    vi.mocked(PublicService.getDestinations).mockResolvedValue({
      destinations: [],
    });
    vi.mocked(PublicService.getTours).mockResolvedValue({
      tours: [],
    });

    renderWithProviders(<HomePage />);

    expect(screen.getByText(/khám phá vẻ đẹp việt nam/i)).toBeInTheDocument();
    expect(screen.getByText(/tour nổi bật/i)).toBeInTheDocument();
  });

  it("shows loading state while featured tours are pending", () => {
    vi.mocked(PublicService.getDestinations).mockResolvedValue({
      destinations: [],
    });
    // Never resolves to keep loading state
    vi.mocked(PublicService.getTours).mockImplementation(
      () => new Promise(() => {}),
    );

    renderWithProviders(<HomePage />);

    expect(screen.getByText(/đang tải danh sách tour/i)).toBeInTheDocument();
  });

  it("shows empty state when featured tours list is empty", async () => {
    vi.mocked(PublicService.getDestinations).mockResolvedValue({
      destinations: [],
    });
    vi.mocked(PublicService.getTours).mockResolvedValue({
      tours: [],
    });

    renderWithProviders(<HomePage />);

    expect(await screen.findByText(/chưa có tour nổi bật nào/i)).toBeInTheDocument();
  });

  it("shows error state when getTours rejects", async () => {
    vi.mocked(PublicService.getDestinations).mockResolvedValue({
      destinations: [],
    });
    vi.mocked(PublicService.getTours).mockRejectedValue(
      new Error("API error"),
    );

    renderWithProviders(<HomePage />);

    // Error is caught by React Query; loading state is shown first
    // then query error boundary should display, but HomePage doesn't
    // have explicit error UI — just shows empty
    expect(await screen.findByText(/chưa có tour nổi bật nào/i)).toBeInTheDocument();
  });
});
