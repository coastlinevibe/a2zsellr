import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    console.log(`📨 [GROUPS] Fetching groups for session: ${sessionId}`)

    // Call the Express server
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'
    console.log(`📨 [GROUPS] Using server URL: ${serverUrl}`)
    const response = await fetch(`${serverUrl}/api/whatsapp/groups/${sessionId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`❌ [GROUPS] Error:`, error)
      return NextResponse.json(
        { error: 'Failed to fetch groups' },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log(`✅ [GROUPS] Fetched successfully`)
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ [GROUPS] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch groups' },
      { status: 500 }
    )
  }
}
