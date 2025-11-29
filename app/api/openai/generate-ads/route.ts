import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      apiKey,
      provider = 'openai',
      productName,
      productDescription,
      targetAudience,
      keyFeatures,
      priceInfo,
      callToAction,
      numberOfAds,
      tone,
      adLength,
      includeEmojis,
      language
    } = body

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      )
    }

    if (!productName || !productDescription) {
      return NextResponse.json(
        { error: 'Product name and description are required' },
        { status: 400 }
      )
    }

    // Build the prompt
    const toneDescriptions: Record<string, string> = {
      professional: 'professional and business-like',
      casual: 'casual, friendly, and conversational',
      enthusiastic: 'enthusiastic, energetic, and exciting',
      luxury: 'luxurious, premium, and sophisticated',
      urgent: 'urgent, action-driven, and compelling',
      informative: 'informative, educational, and detailed'
    }

    const lengthDescriptions: Record<string, string> = {
      short: '50-100 words',
      medium: '100-200 words',
      long: '200-300 words'
    }

    const languageNames: Record<string, string> = {
      english: 'English',
      afrikaans: 'Afrikaans',
      zulu: 'Zulu',
      xhosa: 'Xhosa'
    }

    const prompt = `You are a professional marketing copywriter. Create ${numberOfAds} unique WhatsApp marketing ad${numberOfAds > 1 ? 's' : ''} for the following product/service.

Product/Service: ${productName}
Description: ${productDescription}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${keyFeatures ? `Key Features:\n${keyFeatures}` : ''}
${priceInfo ? `Price: ${priceInfo}` : ''}
${callToAction ? `Call to Action: ${callToAction}` : ''}

Requirements:
- Tone: ${toneDescriptions[tone] || 'professional'}
- Length: ${lengthDescriptions[adLength] || '100-200 words'} per ad
- Language: ${languageNames[language] || 'English'}
- ${includeEmojis ? 'Include relevant emojis to make the ad engaging' : 'Do not use emojis'}
- Each ad should be unique and creative
- Format for WhatsApp messaging (clear, scannable, with line breaks)
- Include the call to action if provided
- Make it compelling and action-oriented

Generate ${numberOfAds} different ad${numberOfAds > 1 ? 's' : ''}, each with a unique angle or approach. Separate each ad with "---AD_SEPARATOR---"`

    // Determine API endpoint and model based on provider
    const apiEndpoint = provider === 'groq' 
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions'
    
    const model = provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini'

    // Call AI API (OpenAI or Grok)
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional marketing copywriter specializing in WhatsApp marketing campaigns. You create compelling, engaging ads that drive action.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      return NextResponse.json(
        { error: error.error?.message || 'Failed to generate ads' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const generatedText = data.choices[0]?.message?.content || ''

    // Split the generated text into individual ads
    const ads = generatedText
      .split('---AD_SEPARATOR---')
      .map((ad: string) => ad.trim())
      .filter((ad: string) => ad.length > 0)

    return NextResponse.json({ ads })
  } catch (error) {
    console.error('Error generating ads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
