import api from './api';

export const CompanyService = {

  getMyTours: async () => {
    const response = await api.get('/company/tours');
    return response.data;
  },

  createTour: async (data: Record<string, unknown>) => {
    const response = await api.post('/company/tours', data);
    return response.data;
  },

  getTourDetail: async (id: number | string) => {
    const response = await api.get(`/company/tours/${id}`);
    return response.data;
  },

  updateTour: async (id: number | string, data: Record<string, unknown>) => {
    const response = await api.put(`/company/tours/${id}`, data);
    return response.data;
  },

  deleteTour: async (id: number | string) => {
    const response = await api.delete(`/company/tours/${id}`);
    return response.data;
  },

  addItinerary: async (tourId: number | string, data: Record<string, unknown>) => {
    const response = await api.post(`/company/tours/${tourId}/itineraries`, data);
    return response.data;
  },

  modifyItinerary: async (id: number | string, data: Record<string, unknown>, method: 'PUT' | 'DELETE') => {
    const config = method === 'DELETE' ? { method: 'DELETE' } : { method: 'PUT', data };
    const response = await api(`/company/itineraries/${id}`, config);
    return response.data;
  },

  getCompanyDepartures: async () => {
    const response = await api.get('/company/departures');
    return response.data;
  },

  addDeparture: async (tourId: number | string, data: Record<string, unknown>) => {
    const response = await api.post(`/company/tours/${tourId}/departures`, data);
    return response.data;
  },

  getCompanyBookings: async (params?: { status?: string; departure_id?: string | number }) => {
    const response = await api.get('/company/bookings', { params });
    return response.data;
  },

  getBookingDetail: async (id: number | string) => {
    const response = await api.get(`/company/bookings/${id}`);
    return response.data;
  },

  updateBookingStatus: async (id: number | string, status: string) => {
    const response = await api.put(`/company/bookings/${id}/status`, { booking_status: status });
    return response.data;
  }
};
