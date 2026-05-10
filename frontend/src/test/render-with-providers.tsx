import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";

interface ProviderOptions extends Omit<RenderOptions, "wrapper"> {
  route?: string;
  queryClient?: QueryClient;
  authState?: {
    user?: Record<string, unknown> | null;
    token?: string | null;
    isAuthenticated?: boolean;
  };
}

export function renderWithProviders(
  ui: ReactElement,
  { route = "/", queryClient, authState, ...options }: ProviderOptions = {},
) {
  const client =
    queryClient ??
    new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

  // Seed auth store if provided
  if (authState) {
    useAuthStore.setState(authState);
  }

  return render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    ),
    ...options,
  });
}
