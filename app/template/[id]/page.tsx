'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import HealthInsuranceTemplate from '@/components/ui/health-insurance-template'
import { supabase } from '@/lib/supabaseClient'
import { Loader2 } from 'lucide-react'

export default function SharedTemplatePage() {
  const params = useParams()
  const [templateData, setTemplateData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const { data, error } = await supabase
          .from('user_templates')
          .select(`
            *,
            template:templates(*)
          `)
          .eq('id', params.id)
          .single()

        if (error) throw error

        setTemplateData(data)
      } catch (err) {
        console.error('Error fetching template:', err)
        setError('Template not found')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchTemplate()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    )
  }

  if (error || !templateData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Template Not Found</h1>
          <p className="text-gray-600">The template you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  const customData = templateData.customized_data

  // Convert customized data to template props
  const templateProps = {
    businessName: customData.businessName,
    companyDescription: customData.businessDescription,
    contactPhone: customData.contactPhone,
    contactEmail: customData.contactEmail,
    plans: customData.plans,
    testimonials: customData.testimonials,
    ctaText: customData.ctaPrimary,
    ctaUrl: `mailto:${customData.contactEmail}?subject=Quote Request&body=Hi, I'm interested in getting a quote for health insurance.`
  }

  return (
    <div className="min-h-screen">
      {/* Analytics tracking */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Track template view
            if (typeof gtag !== 'undefined') {
              gtag('event', 'template_view', {
                template_id: '${templateData.id}',
                template_type: 'health_insurance'
              });
            }
          `
        }}
      />
      
      <HealthInsuranceTemplate {...templateProps} />
    </div>
  )
}
