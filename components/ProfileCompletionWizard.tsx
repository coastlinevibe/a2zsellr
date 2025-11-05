'use client'
import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft, CheckCircle2, User, Building2, Clock, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UserProfile {
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  phone_number: string | null
  website_url: string | null
  business_category: string | null
  business_location: string | null
  business_hours: any
  subscription_tier: 'free' | 'premium' | 'business'
}

interface ProfileCompletionWizardProps {
  profile: UserProfile | null
  onClose: () => void
  onFieldFocus: (fieldId: string) => void
}

interface WizardStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  fields: {
    id: string
    label: string
    completed: boolean
    required: boolean
  }[]
}

export default function ProfileCompletionWizard({ 
  profile, 
  onClose, 
  onFieldFocus 
}: ProfileCompletionWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [wizardSteps, setWizardSteps] = useState<WizardStep[]>([])

  useEffect(() => {
    if (!profile) return

    const steps: WizardStep[] = [
      {
        id: 'personal',
        title: 'Personal Information',
        description: 'Let customers know who you are',
        icon: User,
        fields: [
          {
            id: 'display_name',
            label: 'Business Display Name',
            completed: !!profile.display_name?.trim(),
            required: true
          },
          {
            id: 'bio',
            label: 'Business Description (20+ characters)',
            completed: !!profile.bio?.trim() && profile.bio.trim().length >= 20,
            required: true
          }
        ]
      },
      {
        id: 'business',
        title: 'Business Details',
        description: 'Help customers find and contact you',
        icon: Building2,
        fields: [
          {
            id: 'phone_number',
            label: 'Phone Number',
            completed: !!profile.phone_number?.trim(),
            required: true
          },
          {
            id: 'business_category',
            label: 'Business Category',
            completed: !!profile.business_category?.trim(),
            required: true
          },
          {
            id: 'business_location',
            label: 'Business Location',
            completed: !!profile.business_location?.trim(),
            required: true
          }
        ]
      },
      {
        id: 'hours',
        title: 'Operating Hours',
        description: 'When can customers reach you?',
        icon: Clock,
        fields: [
          {
            id: 'business_hours',
            label: 'Weekly Schedule',
            completed: !!profile.business_hours,
            required: true
          }
        ]
      },
      {
        id: 'profile',
        title: 'Profile Enhancement',
        description: 'Make your business stand out',
        icon: Upload,
        fields: [
          {
            id: 'avatar_url',
            label: 'Profile Picture',
            completed: !!profile.avatar_url?.trim(),
            required: false
          },
          {
            id: 'website_url',
            label: 'Website URL',
            completed: !!profile.website_url?.trim(),
            required: false
          }
        ]
      }
    ]

    // Filter out completed steps
    const incompleteSteps = steps.filter(step => 
      step.fields.some(field => !field.completed)
    )

    setWizardSteps(incompleteSteps)
    
    // Start with first incomplete step
    setCurrentStep(0)
  }, [profile])

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFieldClick = (fieldId: string) => {
    onFieldFocus(fieldId)
    // Scroll to the field (you might want to add smooth scrolling)
    const element = document.getElementById(fieldId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const getCurrentStepCompletion = () => {
    if (wizardSteps.length === 0) return 100
    const currentStepData = wizardSteps[currentStep]
    if (!currentStepData) return 100
    
    const completed = currentStepData.fields.filter(field => field.completed).length
    const total = currentStepData.fields.length
    return Math.round((completed / total) * 100)
  }

  const getOverallCompletion = () => {
    if (wizardSteps.length === 0) return 100
    
    const allFields = wizardSteps.flatMap(step => step.fields)
    const completed = allFields.filter(field => field.completed).length
    const total = allFields.length
    return Math.round((completed / total) * 100)
  }

  // Don't show wizard if all steps are complete
  if (wizardSteps.length === 0) {
    return null
  }

  const currentStepData = wizardSteps[currentStep]
  const StepIcon = currentStepData?.icon || User
  const stepCompletion = getCurrentStepCompletion()
  const overallCompletion = getOverallCompletion()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <StepIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Profile Setup</h2>
                <p className="text-emerald-100 text-sm">
                  Step {currentStep + 1} of {wizardSteps.length}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-emerald-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-emerald-100 mb-1">
              <span>Overall Progress</span>
              <span>{overallCompletion}%</span>
            </div>
            <div className="w-full bg-emerald-400 bg-opacity-30 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallCompletion}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Step */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {currentStepData.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {currentStepData.description}
            </p>

            {/* Step Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>This Step</span>
                <span>{stepCompletion}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    stepCompletion === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${stepCompletion}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-3 mb-6">
            {currentStepData.fields.map((field) => (
              <div
                key={field.id}
                onClick={() => handleFieldClick(field.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  field.completed
                    ? 'border-emerald-200 bg-emerald-50'
                    : field.required
                    ? 'border-red-200 bg-red-50'
                    : 'border-amber-200 bg-amber-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {field.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        field.required ? 'border-red-400' : 'border-amber-400'
                      }`}></div>
                    )}
                    <div>
                      <span className={`font-medium ${
                        field.completed ? 'text-emerald-900' : 
                        field.required ? 'text-red-900' : 'text-amber-900'
                      }`}>
                        {field.label}
                      </span>
                      {field.required && !field.completed && (
                        <span className="text-xs text-red-600 block">Required</span>
                      )}
                      {!field.required && !field.completed && (
                        <span className="text-xs text-amber-600 block">Recommended</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentStep < wizardSteps.length - 1 ? (
              <Button
                onClick={handleNext}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Finish Setup
              </Button>
            )}
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">💡 Pro Tip</h4>
            <p className="text-xs text-blue-700">
              {currentStep === 0 && "A compelling business description increases customer inquiries by 60%"}
              {currentStep === 1 && "Complete contact details make customers 3x more likely to reach out"}
              {currentStep === 2 && "Clear operating hours reduce customer confusion and improve satisfaction"}
              {currentStep === 3 && "A professional profile picture builds trust and credibility"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
