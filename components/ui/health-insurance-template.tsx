'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Heart, 
  Users, 
  CheckCircle, 
  Phone, 
  Mail,
  Star,
  ArrowRight,
  Stethoscope,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HealthInsuranceTemplateProps {
  businessName: string
  businessLogo?: string
  heroImage?: string
  familyImage?: string
  companyDescription?: string
  contactPhone?: string
  contactEmail?: string
  heroLayout?: 'full-width' | 'split'
  headerStyle?: 'gradient' | 'simple'
  footerStyle?: 'detailed' | 'simple'
  plans: {
    name: string
    price: string
    features: string[]
    popular?: boolean
  }[]
  testimonials?: {
    name: string
    comment: string
    rating: number
  }[]
  ctaText?: string
  ctaUrl?: string
}

export default function HealthInsuranceTemplate({
  businessName = "OnePlan Health Insurance",
  businessLogo,
  heroImage,
  familyImage,
  companyDescription = "Insurance innovators for over a decade. Affordable insurance with PREPAID Dentistry Claims in minutes with the OnePlan Claim Card & App.",
  contactPhone = "+27 11 123 4567",
  contactEmail = "info@oneplan.co.za",
  heroLayout = "split",
  headerStyle = "gradient",
  footerStyle = "detailed",
  plans = [
    {
      name: "Core Plan",
      price: "FROM R480",
      features: ["Basic medical cover", "Emergency services", "GP consultations", "Basic dentistry"]
    },
    {
      name: "Silver Plan", 
      price: "FROM R850",
      features: ["Extended medical cover", "Specialist consultations", "Advanced dentistry", "Optical benefits"],
      popular: true
    },
    {
      name: "Gold Plan",
      price: "FROM R1200", 
      features: ["Comprehensive cover", "Private hospital", "Full dentistry", "Optical & wellness"]
    },
    {
      name: "Executive Plan",
      price: "FROM R1975",
      features: ["Premium cover", "International travel", "Concierge services", "Full wellness program"]
    }
  ],
  testimonials = [
    {
      name: "Sarah M.",
      comment: "OnePlan saved my family thousands on medical bills. The claim process is so simple!",
      rating: 5
    },
    {
      name: "David K.", 
      comment: "Best health insurance decision we ever made. Highly recommend to all families.",
      rating: 5
    }
  ],
  ctaText = "Get Free Quote",
  ctaUrl = "#quote"
}: HealthInsuranceTemplateProps) {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-teal-600 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          {heroLayout === 'full-width' ? (
            // Full-width banner layout
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                {businessLogo && (
                  <img src={businessLogo} alt={businessName} className="h-12 mb-6 mx-auto" />
                )}
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  {businessName} Health Insurance
                </h1>
                <p className="text-xl mb-8 text-blue-100">
                  Having a Doctor's Visit: Am I Covered?
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold"
                    onClick={() => {
                      const subject = encodeURIComponent('Health Insurance Quote Request')
                      const body = encodeURIComponent(`Hi ${businessName},\n\nI'm interested in getting a quote for health insurance. Please contact me with more information.\n\nThank you!`)
                      window.open(`mailto:${contactEmail}?subject=${subject}&body=${body}`, '_blank')
                    }}
                  >
                    {ctaText}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
                    onClick={() => window.open(`tel:${contactPhone}`, '_self')}
                  >
                    <Phone className="mr-2 w-5 h-5" />
                    Call {contactPhone}
                  </Button>
                </div>
              </motion.div>
            </div>
          ) : (
            // 50/50 split layout
            <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {businessLogo && (
                <img src={businessLogo} alt={businessName} className="h-12 mb-6" />
              )}
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                {businessName} Health Insurance
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Having a Doctor's Visit: Am I Covered?
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold"
                  onClick={() => {
                    const subject = encodeURIComponent('Health Insurance Quote Request')
                    const body = encodeURIComponent(`Hi ${businessName},\n\nI'm interested in getting a quote for health insurance. Please contact me with more information.\n\nThank you!`)
                    window.open(`mailto:${contactEmail}?subject=${subject}&body=${body}`, '_blank')
                  }}
                >
                  {ctaText}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
                  onClick={() => window.open(`tel:${contactPhone}`, '_self')}
                >
                  <Phone className="mr-2 w-5 h-5" />
                  Call {contactPhone}
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {heroImage ? (
                <img 
                  src={heroImage} 
                  alt="Healthcare professional" 
                  className="rounded-2xl shadow-2xl w-full h-96 object-cover"
                />
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                  <Stethoscope className="w-24 h-24 mx-auto mb-4 text-white/80" />
                  <p className="text-lg text-white/90">Professional Healthcare Coverage</p>
                </div>
              )}
            </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center"
            >
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Trusted Coverage</h3>
              <p className="text-gray-600">Over a decade of reliable service</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="bg-teal-100 p-4 rounded-full mb-4">
                <Activity className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quick Claims</h3>
              <p className="text-gray-600">Claims processed in minutes</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Family First</h3>
              <p className="text-gray-600">Comprehensive family coverage</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Expert Support</h3>
              <p className="text-gray-600">Dedicated customer care team</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Plans Comparison */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Perfect Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {companyDescription}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative ${
                  plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-1">{plan.price}</div>
                  <p className="text-gray-500">per month</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full py-3 font-semibold ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                  onClick={() => window.open(ctaUrl, '_blank')}
                >
                  Choose {plan.name}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Family Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold mb-6">
                Join the {businessName} Family Today
              </h2>
              <p className="text-xl mb-8 text-teal-100">
                Prepared for life with {businessName} Health Insurance. 
                Save on visits, get 20% off on a 3-month treatment plan.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-teal-300 mr-3" />
                  <span className="text-lg">Instant digital claim card</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-teal-300 mr-3" />
                  <span className="text-lg">24/7 customer support</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-teal-300 mr-3" />
                  <span className="text-lg">No waiting periods</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {familyImage ? (
                <img 
                  src={familyImage} 
                  alt="Happy family" 
                  className="rounded-2xl shadow-2xl w-full h-96 object-cover"
                />
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                  <Users className="w-24 h-24 mx-auto mb-4 text-white/80" />
                  <p className="text-lg text-white/90">Protecting Families Nationwide</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Members Say
            </h2>
            <p className="text-xl text-gray-600">
              Real stories from real families we protect
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-8"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 text-lg italic">
                  "{testimonial.comment}"
                </p>
                <p className="font-semibold text-gray-900">- {testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to Protect Your Family?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Get a free quote in under 2 minutes. No obligations, just peace of mind.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 px-12 py-4 text-lg font-semibold"
                onClick={() => {
                  const subject = encodeURIComponent('Health Insurance Quote Request')
                  const body = encodeURIComponent(`Hi ${businessName},\n\nI'm interested in getting a quote for health insurance. Please contact me with more information.\n\nThank you!`)
                  window.open(`mailto:${contactEmail}?subject=${subject}&body=${body}`, '_blank')
                }}
              >
                {ctaText}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 px-12 py-4 text-lg"
                onClick={() => {
                  const subject = encodeURIComponent('Health Insurance Inquiry')
                  const body = encodeURIComponent(`Hi ${businessName},\n\nI would like to learn more about your health insurance options. Please send me more information.\n\nBest regards`)
                  window.open(`mailto:${contactEmail}?subject=${subject}&body=${body}`, '_blank')
                }}
              >
                <Mail className="mr-2 w-5 h-5" />
                Email {contactEmail}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
