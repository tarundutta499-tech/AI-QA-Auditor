"use client"

import { useState } from 'react'
import { createScorecard, updateScorecard } from '@/app/dashboard/scorecards/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2 } from 'lucide-react'

export function ScorecardForm({ initialData }: { initialData?: any }) {
  const [parameters, setParameters] = useState(
    initialData?.parameters?.length > 0
      ? initialData.parameters
      : [{ id: 1, name: 'Greeting', max_score: 10, is_mandatory: true, weightage: 1 }]
  )

  const addParameter = () => {
    setParameters([
      ...parameters,
      { id: Date.now(), name: '', max_score: 10, is_mandatory: false, weightage: 1 }
    ])
  }

  const removeParameter = (id: number) => {
    setParameters(parameters.filter((p: any) => p.id !== id))
  }

  const updateParameter = (id: number, field: string, value: any) => {
    setParameters(parameters.map((p: any) => p.id === id ? { ...p, [field]: value } : p))
  }

  const totalMaxScore = parameters.reduce((sum: number, p: any) => sum + (Number(p.max_score) || 0), 0)
  const totalWeightage = parameters.reduce((sum: number, p: any) => sum + (Number(p.weightage) || 0), 0)

  const formAction = initialData ? updateScorecard : createScorecard

  return (
    <form action={formAction} className="space-y-8">
      {initialData && <input type="hidden" name="id" value={initialData.id} />}
      <Card>
        <CardHeader>
          <CardTitle>Scorecard Details</CardTitle>
          <CardDescription>Basic information about this QA scorecard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Scorecard Name</Label>
            <Input id="name" name="name" required placeholder="e.g. Standard Support Call" defaultValue={initialData?.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Describe the purpose of this scorecard..." defaultValue={initialData?.description} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Evaluation Parameters</CardTitle>
            <CardDescription>Define the criteria the AI will audit against.</CardDescription>
          </div>
          <Button type="button" onClick={addParameter} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add Parameter
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {parameters.map((param: any) => (
            <div key={param.id} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg bg-muted/50">
              <div className="col-span-12 md:col-span-5 space-y-2">
                <Label>Parameter Name</Label>
                <Input 
                  value={param.name} 
                  onChange={(e) => updateParameter(param.id, 'name', e.target.value)} 
                  required 
                  placeholder="e.g. Empathy & Tone"
                />
              </div>
              <div className="col-span-6 md:col-span-2 space-y-2">
                <Label>Max Score</Label>
                <Input 
                  type="number" 
                  step="0.1"
                  value={param.max_score} 
                  onChange={(e) => updateParameter(param.id, 'max_score', parseFloat(e.target.value) || 0)} 
                  required 
                  min={0.1}
                />
              </div>
              <div className="col-span-6 md:col-span-2 space-y-2">
                <Label>Weighting</Label>
                <Input 
                  type="number" 
                  step="0.1"
                  value={param.weightage} 
                  onChange={(e) => updateParameter(param.id, 'weightage', parseFloat(e.target.value) || 0)} 
                  required 
                  min={0.1}
                />
              </div>
              <div className="col-span-12 md:col-span-2 flex items-center space-x-2 pb-2">
                <Switch 
                  checked={param.is_mandatory} 
                  onCheckedChange={(checked) => updateParameter(param.id, 'is_mandatory', checked)}
                />
                <Label>Mandatory</Label>
              </div>
              <div className="col-span-12 md:col-span-1 flex justify-end pb-1">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  className="text-destructive"
                  onClick={() => removeParameter(param.id)}
                  disabled={parameters.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          <input type="hidden" name="parameters" value={JSON.stringify(parameters)} />
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-muted/30 border rounded-lg">
        <div className="flex gap-6 mb-4 md:mb-0">
          <div>
            <span className="text-sm text-muted-foreground">Total Max Score:</span>
            <span className="ml-2 font-bold text-lg">{totalMaxScore.toFixed(1)}</span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Total Weighting:</span>
            <span className="ml-2 font-bold text-lg">{totalWeightage.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => window.history.back()}>Cancel</Button>
          <Button type="submit">Save Scorecard</Button>
        </div>
      </div>
    </form>
  )
}
