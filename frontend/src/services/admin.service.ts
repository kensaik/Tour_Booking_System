import api from "./api";

export const AdminService = {
  getDestinations: async () => {
    const response = await api.get("/admin/destinations");
    return response.data;
  },

  createDestination: async (data: Record<string, unknown>) => {
    const response = await api.post("/admin/destinations", data);
    return response.data;
  },

  updateDestination: async (id: number | string, data: Record<string, unknown>) => {
    const response = await api.put(`/admin/destinations/${id}`, data);
    return response.data;
  },

  deleteDestination: async (id: number | string) => {
    const response = await api.delete(`/admin/destinations/${id}`);
    return response.data;
  },

  getCompanies: async (status?: string) => {
    const params = status ? { status } : {};
    const response = await api.get("/admin/companies", { params });
    return response.data;
  },

  approveCompany: async (id: number | string) => {
    const response = await api.put(`/admin/companies/${id}/approve`);
    return response.data;
  },

  updateCommission: async (id: number | string, commission_rate: number) => {
    const response = await api.put(`/admin/companies/${id}/commission`, { commission_rate });
    return response.data;
  },

  toggleStatus: async (id: number | string) => {
    const response = await api.put(`/admin/companies/${id}/toggle-status`);
    return response.data;
  },

  createCompany: async (data: Record<string, unknown>) => {
    const response = await api.post("/auth/register", { ...data, role: "company" });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/admin/stats");
    return response.data;
  },
};
