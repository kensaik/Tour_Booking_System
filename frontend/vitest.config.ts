import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      // Coverage scoped to layers actively under unit-test in Phases 1-2:
      // pure logic (lib/, stores/) and the two highest-risk forms.
      // Pages without business logic and untested service modules are out of
      // scope for the unit gate; E2E in Phases 3-6 covers those flows.
      include: [
        "src/lib/**/*.{ts,tsx}",
        "src/stores/**/*.{ts,tsx}",
        "src/pages/auth/RegisterPage.tsx",
        "src/pages/auth/LoginPage.tsx",
        "src/pages/guest/CheckoutPage.tsx",
        "src/pages/guest/HomePage.tsx",
        "src/pages/guest/ToursPage.tsx",
        "src/pages/guest/TourDetailPage.tsx",
        "src/pages/guest/MyTripsPage.tsx",
        "src/pages/company/DashboardPage.tsx",
        "src/pages/company/ToursPage.tsx",
        "src/pages/company/AddTourPage.tsx",
        "src/pages/company/AddDeparturePage.tsx",
        "src/pages/company/BookingsPage.tsx",
        "src/pages/company/SettingsPage.tsx",
        "src/pages/admin/DashboardPage.tsx",
        "src/pages/admin/CompaniesPage.tsx",
        "src/pages/admin/DestinationsPage.tsx",
      ],
      exclude: [
        "src/main.tsx",
        "src/App.tsx",
        "src/vite-env.d.ts",
        "src/**/*.test.{ts,tsx}",
        "src/test/**",
        "src/components/layout/**",
      ],
      thresholds: {
        lines: 70,
        statements: 70,
        branches: 60,
        functions: 65,
      },
    },
  },
});
