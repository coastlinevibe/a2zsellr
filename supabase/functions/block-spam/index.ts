import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const BLOCKED_IPS = [
  "185.220.101.0/24", // Hostinger Paris range (example)
]

serve(async (req) => {
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || ""
  
  // Check if IP is blocked
  for (const blockedRange of BLOCKED_IPS) {
    if (clientIp.includes(blockedRange.split("/")[0])) {
      return new Response("Blocked", { status: 403 })
    }
  }
  
  return new Response("OK", { status: 200 })
})
