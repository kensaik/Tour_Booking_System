import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CreditCard, Building2, Truck, ShieldCheck, ArrowLeft, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { GuestService } from '@/services/guest.service'
import { formatPrice, formatDate } from '@/lib/format'

interface BookingState {
  tour: {
    id: number | string
    name: string
    image: string
    duration: string
  }
  departure: {
    id: number | string
    start_date: string
  }
  guests: number
  pricePerPerson: number
}

export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const bookingState = location.state as BookingState | null

  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('vnpay')
  const [bookingId, setBookingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    note: '',
  })

  if (!bookingState) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Không tìm thấy thông tin đặt tour.</p>
          <button onClick={() => navigate(-1)} className="text-primary hover:underline">Quay lại trang trước</button>
        </div>
      </div>
    )
  }

  const { tour, departure, guests, pricePerPerson } = bookingState
  const totalAmount = guests * pricePerPerson

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleStep1 = async () => {
    const { name, email, phone, note } = formData
    if (!name || !email || !phone) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc.')
      return
    }

    try {
      const res = await GuestService.bookDeparture(departure.id, guests, { name, email, phone, note })
      setBookingId(res.booking_id)
      setStep(2)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi đặt tour')
    }
  }

  const handleStep2 = async () => {
    if (!bookingId) return

    try {
      await GuestService.createPayment(bookingId, totalAmount, paymentMethod)
      setStep(3)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi thanh toán')
    }
  }

  const handleNext = () => {
    if (step === 1) return handleStep1()
    if (step === 2) return handleStep2()
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-surface-container-low">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        <Link
          to="/tours"
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Link>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  step >= s
                    ? 'bg-primary text-white'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              <span className={`ml-2 text-sm ${step >= s ? 'text-primary font-medium' : 'text-on-surface-variant'}`}>
                {s === 1 ? 'Thông tin' : s === 2 ? 'Thanh toán' : 'Hoàn tất'}
              </span>
              {s < 3 && <div className="w-16 h-0.5 bg-surface-container-high mx-4" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-surface-container-lowest rounded-xl p-6">
                <h2 className="text-xl font-bold text-on-surface mb-6">Thông tin liên hệ</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Họ và tên *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Số điện thoại *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="0xxx xxx xxx"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ghi chú (tùy chọn)</label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                      placeholder="Yêu cầu đặc biệt, sở thích ăn uống..."
                    />
                  </div>
                </div>
                <button
                  onClick={handleNext}
                  className="w-full mt-6 bg-primary hover:bg-primary-container text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Tiếp tục
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-surface-container-lowest rounded-xl p-6">
                <h2 className="text-xl font-bold text-on-surface mb-6">Phương thức thanh toán</h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-4 p-4 border border-outline-variant rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <input type="radio" name="payment" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={() => setPaymentMethod('vnpay')} className="w-5 h-5 accent-primary" />
                    <Building2 className="w-6 h-6 text-primary" />
                    <div>
                      <p className="font-medium">VNPay</p>
                      <p className="text-sm text-on-surface-variant">Thanh toán qua ví VNPay</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-4 p-4 border border-outline-variant rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <input type="radio" name="payment" value="momo" checked={paymentMethod === 'momo'} onChange={() => setPaymentMethod('momo')} className="w-5 h-5 accent-primary" />
                    <Truck className="w-6 h-6 text-pink-500" />
                    <div>
                      <p className="font-medium">MoMo</p>
                      <p className="text-sm text-on-surface-variant">Thanh toán qua ví MoMo</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-4 p-4 border border-outline-variant rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <input type="radio" name="payment" value="banking" checked={paymentMethod === 'banking'} onChange={() => setPaymentMethod('banking')} className="w-5 h-5 accent-primary" />
                    <CreditCard className="w-6 h-6 text-secondary" />
                    <div>
                      <p className="font-medium">Chuyển khoản ngân hàng</p>
                      <p className="text-sm text-on-surface-variant">Chuyển khoản trực tiếp vào tài khoản</p>
                    </div>
                  </label>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-outline-variant text-on-surface font-semibold py-3 rounded-lg hover:bg-surface-container-low transition-colors"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 bg-primary hover:bg-primary-container text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Thanh toán
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-surface-container-lowest rounded-xl p-6 text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-on-surface mb-2">Đặt tour thành công!</h2>
                <p className="text-on-surface-variant mb-6">
                  Cảm ơn bạn đã đặt tour. Chúng tôi đã gửi email xác nhận đến địa chỉ của bạn.
                </p>
                <div className="bg-surface-container-low p-4 rounded-lg mb-6 text-left">
                  <p className="text-sm text-on-surface-variant mb-1">Mã đặt tour:</p>
                  <p className="text-xl font-bold text-primary">#TG-{new Date().getFullYear()}-{bookingId}</p>
                </div>
                <Link
                  to="/my-trips"
                  className="inline-block bg-primary hover:bg-primary-container text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                >
                  Xem chuyến đi của tôi
                </Link>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-surface-container-lowest rounded-xl p-6 sticky top-24">
              <h3 className="text-lg font-bold text-on-surface mb-4">Tóm tắt đơn hàng</h3>

              <div className="flex gap-4 mb-4">
                <img
                  src={tour.image}
                  alt={tour.name}
                  className="w-20 h-16 object-cover rounded-lg bg-slate-200"
                />
                <div>
                  <h4 className="font-medium text-on-surface line-clamp-1">{tour.name}</h4>
                  <p className="text-sm text-on-surface-variant">{tour.duration}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm border-t border-outline-variant pt-4">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Ngày khởi hành</span>
                  <span className="font-medium">{formatDate(departure.start_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Số khách</span>
                  <span className="font-medium">{guests} người</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Giá/người</span>
                  <span className="font-medium">{formatPrice(pricePerPerson)}</span>
                </div>
              </div>

              <div className="border-t border-outline-variant mt-4 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-6 text-xs text-on-surface-variant">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Thanh toán an toàn, mã hóa SSL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

