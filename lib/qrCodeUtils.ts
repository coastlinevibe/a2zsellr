/**
 * QR Code Utilities
 * Handles QR code generation and scanning for social integrations
 */

/**
 * Generate a QR code data URL from text
 * Uses the QR Server API for simplicity
 */
export async function generateQRCode(text: string, size: number = 300): Promise<string> {
  try {
    const encodedText = encodeURIComponent(text)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}`
    return qrUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw error
  }
}

/**
 * Download QR code as image
 */
export async function downloadQRCode(qrDataUrl: string, filename: string = 'qrcode.png'): Promise<void> {
  try {
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error downloading QR code:', error)
    throw error
  }
}

/**
 * Copy QR code URL to clipboard
 */
export async function copyQRCodeToClipboard(qrDataUrl: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(qrDataUrl)
  } catch (error) {
    console.error('Error copying to clipboard:', error)
    throw error
  }
}

/**
 * Format session ID for display
 */
export function formatSessionId(sessionId: string): string {
  return sessionId.substring(0, 8).toUpperCase()
}

/**
 * Check if browser supports camera access
 */
export function isCameraSupported(): boolean {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia
  )
}

/**
 * Request camera permissions
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    stream.getTracks().forEach(track => track.stop())
    return true
  } catch (error) {
    console.error('Camera permission denied:', error)
    return false
  }
}
