"use client"

import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'

export function PrintWrapper({ children }: { children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null)
  
  const handlePrint = useReactToPrint({ 
    content: () => contentRef.current,
    contentRef: contentRef,
    documentTitle: 'QA_Audit_Scorecard'
  } as any)

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handlePrint()} variant="outline" className="bg-white text-black hover:bg-gray-200">
          <FileDown className="mr-2 h-4 w-4" /> Download PDF
        </Button>
      </div>
      <div ref={contentRef} className="print:p-8">
        {children}
      </div>
    </>
  )
}
