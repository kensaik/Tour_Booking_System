import api from "./api";

interface BookingContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  note?: string;
}

export const GuestService = {
  async bookDeparture(
    departureId: number | string,
    numPeople: number,
    contact?: BookingContactInfo,
  ) {
    const payload: Record<string, any> = { num_people: numPeople };

    if (contact) {
      payload.contact_name = contact.name;
      payload.contact_email = contact.email;
      payload.contact_phone = contact.phone;
      payload.notes = contact.note;
    }

    const response = await api.post(`/guest/departures/${departureId}/book`, payload);
    return response.data;
  },

  async getMyBookings() {
    const response = await api.get("/guest/bookings");
    return response.data;
  },

  async getBookingDetail(id: number | string) {
    const response = await api.get(`/guest/bookings/${id}`);
    return response.data;
  },

  async createPayment(bookingId: number | string, amount: number, paymentMethod: string) {
    const response = await api.post("/guest/payments", {
      booking_id: bookingId,
      amount,
      payment_method: paymentMethod,
    });
    return response.data;
  },

  async getMyPayments(bookingId?: number | string) {
    const response = await api.get("/guest/payments", {
      params: { booking_id: bookingId },
    });
    return response.data;
  },
};
