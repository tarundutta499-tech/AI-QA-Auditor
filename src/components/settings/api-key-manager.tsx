"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, RefreshCw, Eye, EyeOff, Check } from "lucide-react"
import { regenerateApiKey } from "@/app/dashboard/settings/actions"

export function ApiKeyManager({ initialKey, companyId, isAdmin }: { initialKey: string, companyId: string, isAdmin: boolean }) {
  const [apiKey, setApiKey] = useState(initialKey || 'No API Key Generated')
  const [isVisible, setIsVisible] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleRegenerate = async () => {
    if (!confirm("Are you sure? This will immediately break any external integrations using your old API key.")) return
    
    setIsLoading(true)
    setError('')
    try {
      const res = await regenerateApiKey(companyId)
      if (res.success && res.newKey) {
        setApiKey(res.newKey)
        setIsVisible(true)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate key')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input 
            type={isVisible ? "text" : "password"} 
            value={apiKey} 
            readOnly 
            className="font-mono text-sm pr-10"
          />
          <button 
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        
        <Button variant="outline" size="icon" onClick={handleCopy} title="Copy to clipboard">
          {isCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive font-medium">{error}</p>}

      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground max-w-[70%]">
          Use this key in the <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">Authorization: Bearer</code> header when sending calls to the <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">/api/v1/ingest</code> endpoint.
        </p>
        
        {isAdmin && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleRegenerate} 
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        )}
      </div>
    </div>
  )
}
