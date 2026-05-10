import api from './api'

export const PublicService = {
  getDestinations: async () => {
    const response = await api.get('/public/destinations')
    return response.data
  },

  getTours: async (params?: { 
    destination_id?: string | number; 
    keyword?: string;
    date?: string;
    guests?: string | number;
  }) => {
    const response = await api.get('/public/tours', { params })
    return response.data
  },

  getTourDetail: async (id: string | number) => {
    const response = await api.get(`/public/tours/${id}`)
    return response.data
  },
}
