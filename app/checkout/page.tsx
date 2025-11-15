'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Package, CreditCard, MapPin, User, Mail, Phone, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart, formatPrice } from '@/contexts/CartContext'
import { useAuth } from '@/lib/auth'
import { createOrders } from '@/lib/orderService'
import Link from 'next/link'

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { items, getSubtotal, getItemsByBusiness, clearCart } = useCart()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderNumbers, setOrderNumbers] = useState<string[]>([])
  const [formData, setFormData] = useState({
    // Customer details
    name: '',
    email: '',
    phone: '',
    
    // Shipping details
    address: '',
    city: '',
    province: 'Gauteng',
    postalCode: '',
    notes: '',
    
    // Payment
    paymentMethod: 'payfast'
  })

  const itemsByBusiness = getItemsByBusiness()
  const subtotal = getSubtotal()
  const shipping = 0 // Free shipping for now
  const tax = Math.round(subtotal * 0.15) // 15% VAT
  const total = subtotal + shipping + tax

  // Get the first business name for "Continue Shopping" redirect
  const firstBusinessName = items.length > 0 ? items[0].businessName : null
  const continueShoppingUrl = firstBusinessName 
    ? `/profile/${encodeURIComponent(firstBusinessName)}`
    : '/'

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/')
    }
  }, [items, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.name && formData.email
      case 2:
        return formData.address && formData.city && formData.postalCode
      case 3:
        return formData.paymentMethod
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    } else {
      alert('Please fill in all required fields')
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      alert('Please complete all steps')
      return
    }

    setIsProcessing(true)

    try {
      // Group items by business
      const businessOrders = Object.entries(itemsByBusiness).map(([businessId, items]) => ({
        businessId,
        items
      }))

      // Create orders
      const orders = await createOrders({
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: formData.address,
        shippingCity: formData.city,
        shippingProvince: formData.province,
        shippingPostalCode: formData.postalCode,
        shippingNotes: formData.notes,
        paymentMethod: formData.paymentMethod,
        businessOrders
      }, user?.id)

      if (formData.paymentMethod === 'payfast') {
        // Handle PayFast payment
        await handlePayFastPayment(orders)
      } else {
        // Handle EFT or other payment methods
        clearCart()
        setOrderNumbers(orders.map(o => o.order_number))
        setOrderSuccess(true)
        setCurrentStep(4) // Success step
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to process order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePayFastPayment = async (orders: any[]) => {
    try {
      // Calculate total amount from all orders
      const totalAmount = orders.reduce((sum, order) => sum + order.total_cents, 0)
      const displayAmount = (totalAmount / 100).toFixed(2)
      
      // Generate payment reference using first order
      const reference = `ORDER_${orders[0].order_number}`
      
      // Create return URL with order IDs
      const returnUrl = new URL(`${window.location.origin}/payment/success`)
      returnUrl.searchParams.set('method', 'payfast')
      returnUrl.searchParams.set('order_ids', orders.map(o => o.id).join(','))

      // PayFast payment data
      const paymentData = {
        merchant_id: "10000100", // PayFast sandbox merchant ID
        merchant_key: "46f0cd694581a", // PayFast sandbox merchant key
        return_url: returnUrl.toString(),
        cancel_url: `${window.location.origin}/checkout`,
        notify_url: `${window.location.origin}/api/payfast/webhook`,
        
        amount: displayAmount,
        item_name: `Order Payment - ${orders.length} order${orders.length > 1 ? 's' : ''}`,
        item_description: `Payment for ${orders.length} order${orders.length > 1 ? 's' : ''} from A2Z Business Directory`,
        
        name_first: formData.name,
        email_address: formData.email,
        
        custom_str1: orders.map(o => o.id).join(','), // Order IDs
        custom_str2: 'checkout', // Payment type
        custom_str3: user?.id || 'guest', // Customer ID
        custom_str4: orders[0].order_number, // Primary order number
        
        m_payment_id: reference
      }

      // Create PayFast form and submit
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = 'https://sandbox.payfast.co.za/eng/process' // Sandbox URL
      
      Object.entries(paymentData).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value.toString()
        form.appendChild(input)
      })
      
      document.body.appendChild(form)
      
      // Clear cart before redirecting
      clearCart()
      
      // Submit form to PayFast
      form.submit()
      
    } catch (error) {
      console.error('PayFast payment error:', error)
      throw error
    }
  }

  if (items.length === 0) {
    return null // Will redirect
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
            currentStep >= step 
              ? 'bg-emerald-600 border-emerald-600 text-white' 
              : 'border-gray-300 text-gray-400'
          }`}>
            {currentStep > step ? (
              <Check className="w-5 h-5" />
            ) : (
              <span className="font-semibold">{step}</span>
            )}
          </div>
          {step < 3 && (
            <div className={`w-16 h-1 mx-2 ${
              currentStep > step ? 'bg-emerald-600' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="w-6 h-6 text-emerald-600" />
        <h2 className="text-2xl font-semibold text-gray-900">Customer Information</h2>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="john@example.com"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="+27 12 345 6789"
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-6 h-6 text-emerald-600" />
        <h2 className="text-2xl font-semibold text-gray-900">Shipping Address</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address *
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="123 Main Street"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Johannesburg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Province *
            </label>
            <select
              name="province"
              value={formData.province}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="Gauteng">Gauteng</option>
              <option value="Western Cape">Western Cape</option>
              <option value="KwaZulu-Natal">KwaZulu-Natal</option>
              <option value="Eastern Cape">Eastern Cape</option>
              <option value="Free State">Free State</option>
              <option value="Limpopo">Limpopo</option>
              <option value="Mpumalanga">Mpumalanga</option>
              <option value="Northern Cape">Northern Cape</option>
              <option value="North West">North West</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postal Code *
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="2000"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="Any special delivery instructions..."
          />
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="w-6 h-6 text-emerald-600" />
        <h2 className="text-2xl font-semibold text-gray-900">Payment Method</h2>
      </div>
      
      <div className="space-y-4">
        <label className="flex items-center gap-4 p-4 border-2 border-emerald-600 rounded-lg cursor-pointer bg-emerald-50">
          <input
            type="radio"
            name="paymentMethod"
            value="payfast"
            checked={formData.paymentMethod === 'payfast'}
            onChange={handleInputChange}
            className="w-5 h-5 text-emerald-600"
          />
          <div className="flex-1">
            <div className="font-semibold text-gray-900 text-lg">PayFast (Recommended)</div>
            <div className="text-gray-600">Secure online payment with card or EFT</div>
          </div>
        </label>
        
        <label className="flex items-center gap-4 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
          <input
            type="radio"
            name="paymentMethod"
            value="eft"
            checked={formData.paymentMethod === 'eft'}
            onChange={handleInputChange}
            className="w-5 h-5 text-emerald-600"
          />
          <div className="flex-1">
            <div className="font-semibold text-gray-900 text-lg">Direct EFT</div>
            <div className="text-gray-600">Bank transfer (payment details will be provided)</div>
          </div>
        </label>
      </div>
    </div>
  )

  const renderSuccess = () => (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="w-8 h-8 text-emerald-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
      <p className="text-gray-600 mb-6">Thank you for your order. We'll send you a confirmation email shortly.</p>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">Order Numbers:</h3>
        <div className="space-y-1">
          {orderNumbers.map(orderNumber => (
            <div key={orderNumber} className="text-emerald-600 font-mono">
              #{orderNumber}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={() => router.push('/orders')}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          View My Orders
        </Button>
        <Button
          onClick={() => router.push(continueShoppingUrl)}
          variant="outline"
          className="w-full"
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  )

  const renderOrderSummary = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
      
      {/* Items by Business */}
      <div className="space-y-4 mb-6">
        {Object.entries(itemsByBusiness).map(([businessId, businessItems]) => (
          <div key={businessId} className="space-y-2">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Package className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-sm text-gray-900">
                {businessItems[0].businessName}
              </h3>
            </div>
            
            {businessItems.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium text-gray-900">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-2 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-emerald-600">Free</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">VAT (15%)</span>
          <span className="font-medium text-gray-900">{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
          <span className="text-gray-900">Total</span>
          <span className="text-emerald-600">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Inject Back button styles */}
        <style>{`
          .pf-back-btn { background:#fff; text-align:center; width:192px; height:56px; border-radius:1rem; position:relative; color:#000; font-weight:600; font-size:1.125rem; overflow:hidden; border:1px solid #e5e7eb; }
          .pf-back-btn-inner { background:#34d399; height:48px; width:25%; border-radius:0.75rem; position:absolute; left:4px; top:4px; display:flex; align-items:center; justify-content:center; transition:width .5s; z-index:10; }
          .pf-back-btn:hover .pf-back-btn-inner { width:184px; }
          .pf-back-text { transform:translateX(0.5rem); position:relative; z-index:1; }
        `}</style>
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push(continueShoppingUrl)}
            className="pf-back-btn mb-4 group"
            aria-label="Back"
          >
            <div className="pf-back-btn-inner group-hover:w-[184px]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" height="25" width="25">
                <path d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z" fill="#000000"></path>
                <path d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z" fill="#000000"></path>
              </svg>
            </div>
            <p className="pf-back-text">Back</p>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Step Indicator */}
        {currentStep <= 3 && renderStepIndicator()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderSuccess()}

            {/* Navigation Buttons */}
            {currentStep <= 3 && (
              <div className="flex justify-between mt-8">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>

                {currentStep < 3 ? (
                  <Button
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isProcessing}
                    className="bg-emerald-600 hover:bg-emerald-700 px-8"
                  >
                    {isProcessing ? 'Processing...' : `Place Order - ${formatPrice(total)}`}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Order Summary - Only show during checkout steps */}
          {currentStep <= 3 && (
            <div className="lg:col-span-1">
              {renderOrderSummary()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
