"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ExportCSVProps {
  data: any[]
  filename?: string
}

export function ExportCSV({ data, filename = "audits_export.csv" }: ExportCSVProps) {
  const downloadCSV = () => {
    if (data.length === 0) return

    // Define columns to export
    const headers = ["Date", "Client", "Agent", "Scorecard", "Score (%)", "Status"]

    const rows = data.map((audit) => [
      new Date(audit.created_at).toLocaleDateString(),
      `"${audit.calls?.client_name || ""}"`,
      `"${audit.calls?.users?.name || ""}"`,
      `"${audit.scorecards?.name || ""}"`,
      audit.compliance_percent,
      audit.status,
    ])

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button variant="outline" onClick={downloadCSV} disabled={data.length === 0}>
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  )
}
