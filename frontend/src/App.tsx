import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

import HomePage from './pages/guest/HomePage'
import ToursPage from './pages/guest/ToursPage'
import TourDetailPage from './pages/guest/TourDetailPage'
import CheckoutPage from './pages/guest/CheckoutPage'
import MyTripsPage from './pages/guest/MyTripsPage'
import ContactPage from './pages/guest/ContactPage'

import CompanyDashboardPage from './pages/company/DashboardPage'
import CompanyToursPage from './pages/company/ToursPage'
import CompanyDeparturesPage from './pages/company/DeparturesPage'
import CompanyBookingsPage from './pages/company/BookingsPage'
import CompanyAddDeparturePage from './pages/company/AddDeparturePage'
import CompanyAddTourPage from './pages/company/AddTourPage'
import CompanyTourDetailPage from './pages/company/TourDetailPage'

import AdminDashboardPage from './pages/admin/DashboardPage'
import AdminCompaniesPage from './pages/admin/CompaniesPage'

import { useEffect } from 'react'
import { useAuthStore } from './stores/authStore'

function App() {
  const { fetchUser, token } = useAuthStore()

  useEffect(() => {
    if (token) {
      fetchUser()
    }
  }, [token, fetchUser])

  return (
    <Routes>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="tours" element={<ToursPage />} />
        <Route path="tours/:id" element={<TourDetailPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="my-trips" element={<MyTripsPage />} />
        <Route path="contact" element={<ContactPage />} />
      </Route>

      <Route path="/company">
        <Route index element={<CompanyDashboardPage />} />
        <Route path="tours" element={<CompanyToursPage />} />
        <Route path="tours/new" element={<CompanyAddTourPage />} />
        <Route path="tours/:id" element={<CompanyTourDetailPage />} />
        <Route path="departures" element={<CompanyDeparturesPage />} />
        <Route path="departures/new" element={<CompanyAddDeparturePage />} />
        <Route path="bookings" element={<CompanyBookingsPage />} />
      </Route>

      <Route path="/admin">
        <Route index element={<AdminDashboardPage />} />
        <Route path="companies" element={<AdminCompaniesPage />} />
      </Route>
    </Routes>
  )
}

export default App
