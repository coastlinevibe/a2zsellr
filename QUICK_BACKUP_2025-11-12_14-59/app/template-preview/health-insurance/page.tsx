'use client'

import HealthInsuranceTemplate from '@/components/ui/health-insurance-template'

export default function HealthInsurancePreviewPage() {
  // Sample data matching OnePlan structure from the images
  const samplePlans = [
    {
      name: "Core Plan",
      price: "FROM R480",
      features: [
        "Basic medical cover",
        "Emergency services", 
        "GP consultations",
        "Basic dentistry",
        "Prescribed medication"
      ]
    },
    {
      name: "Silver Plan",
      price: "FROM R850", 
      features: [
        "Extended medical cover",
        "Specialist consultations",
        "Advanced dentistry",
        "Optical benefits",
        "Wellness programs"
      ],
      popular: true
    },
    {
      name: "Gold Plan", 
      price: "FROM R1200",
      features: [
        "Comprehensive cover",
        "Private hospital access",
        "Full dentistry coverage",
        "Optical & wellness",
        "Maternity benefits"
      ]
    },
    {
      name: "Executive Plan",
      price: "FROM R1975",
      features: [
        "Premium cover",
        "International travel insurance",
        "Concierge medical services", 
        "Full wellness program",
        "Priority specialist access"
      ]
    }
  ]

  const sampleTestimonials = [
    {
      name: "Sarah M.",
      comment: "OnePlan saved my family thousands on medical bills. The claim process is so simple and fast!",
      rating: 5
    },
    {
      name: "David K.",
      comment: "Best health insurance decision we ever made. The digital claim card works everywhere.",
      rating: 5
    },
    {
      name: "Linda P.",
      comment: "Finally, health insurance that actually works for South African families. Highly recommend!",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen">
      <HealthInsuranceTemplate
        businessName="OnePlan"
        companyDescription="Insurance innovators for over a decade. Affordable insurance with PREPAID Dentistry Claims in minutes with the OnePlan Claim Card & App."
        contactPhone="+27 11 123 4567"
        contactEmail="info@oneplan.co.za"
        plans={samplePlans}
        testimonials={sampleTestimonials}
        ctaText="Get Free Quote"
        ctaUrl="/contact"
      />
    </div>
  )
}
