import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    const { chatId, message, image, buttons, options } = await request.json()

    if (!sessionId || !chatId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, chatId, message' },
        { status: 400 }
      )
    }

    console.log(`📨 [SEND-MESSAGE] Sending to ${chatId} for session ${sessionId}`)
    if (image) {
      console.log(`📨 [SEND-MESSAGE] With image attachment`)
    }
    if (buttons && buttons.length > 0) {
      console.log(`📨 [SEND-MESSAGE] With ${buttons.length} button(s)`)
    }

    // Call the Express server
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'
    console.log(`📨 [SEND-MESSAGE] Using server URL: ${serverUrl}`)
    const response = await fetch(`${serverUrl}/api/whatsapp/send-message/${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId,
        message,
        image: image || null,
        buttons: buttons || null,
        options: options || {}
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`❌ [SEND-MESSAGE] Error:`, error)
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log(`✅ [SEND-MESSAGE] Sent successfully`)
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ [SEND-MESSAGE] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send message' },
      { status: 500 }
    )
  }
}
