"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, CheckCircle2, Eye, EyeOff } from "lucide-react"

export function DashboardClient({ apiData }: { apiData: { key: string, webhookUrl: string } }) {
  const [copied, setCopied] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState(apiData.webhookUrl)

  useEffect(() => {
    // Use window.location.origin dynamically if running in browser
    if (typeof window !== 'undefined' && webhookUrl === "https://api.qacopilot.ai/api/v1/webhooks/genesys") {
      const dynamicUrl = `${window.location.origin}/api/v1/webhooks/genesys`
      if (dynamicUrl !== webhookUrl) {
        setWebhookUrl(dynamicUrl)
      }
    }
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl">Telephony Integrations (Webhooks)</CardTitle>
        <CardDescription>
          Connect Nexaviq directly to your phone system (Genesys, Twilio, Amazon Connect). 
          Once connected, calls will be automatically audited by AI the second the customer hangs up.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="bg-muted/50 p-4 rounded-xl border">
          <div className="text-sm font-medium text-muted-foreground mb-2">Your Production Webhook URL</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-background p-3 rounded-lg text-green-500 font-mono text-sm border">
              {webhookUrl}
            </code>
            <Button variant="outline" onClick={() => copyToClipboard(webhookUrl)}>
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-xl border">
          <div className="text-sm font-medium text-muted-foreground mb-2">Secret API Key</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-background p-3 rounded-lg text-blue-500 font-mono text-sm border">
              {showKey ? apiData.key : "••••••••••••••••••••••••••••"}
            </code>
            <Button variant="outline" onClick={() => setShowKey(!showKey)}>
              {showKey ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showKey ? "Hide" : "Reveal Key"}
            </Button>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
