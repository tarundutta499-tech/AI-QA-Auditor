import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createAgent } from '../actions'
import Link from 'next/link'

export default function NewAgentPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Add Team Member</h1>
        <p className="text-muted-foreground mt-2">Create a new profile for a QA Analyst or Agent.</p>
      </div>
      
      <form action={createAgent}>
        <Card>
          <CardHeader>
            <CardTitle>Member Details</CardTitle>
            <CardDescription>Enter the basic information for the new member.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" required placeholder="e.g. Jane Doe" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" required placeholder="jane@example.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select name="role" defaultValue="agent">
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent">Support Agent</SelectItem>
                  <SelectItem value="qa">QA Analyst</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="pt-4 flex justify-end gap-4">
              <Link href="/dashboard/agents">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
              <Button type="submit">Add Member</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
