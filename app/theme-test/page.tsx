"use client"

import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ThemeTestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Theme Test Page</h1>
          <ThemeToggle isScrolled={true} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Light Theme</CardTitle>
              <CardDescription>Test card in light mode</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This is a test card to demonstrate the light theme styling.
              </p>
              <Button variant="default">Primary Button</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Dark Theme</CardTitle>
              <CardDescription>Test card in dark mode</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This card should adapt to dark theme when toggled.
              </p>
              <Button variant="secondary">Secondary Button</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>System Theme</CardTitle>
              <CardDescription>Follows system preference</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This respects your system theme setting.
              </p>
              <Button variant="outline">Outline Button</Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Theme Variables Test</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-primary text-primary-foreground rounded">
              Primary
            </div>
            <div className="p-4 bg-secondary text-secondary-foreground rounded">
              Secondary
            </div>
            <div className="p-4 bg-accent text-accent-foreground rounded">
              Accent
            </div>
            <div className="p-4 bg-muted text-muted-foreground rounded">
              Muted
            </div>
          </div>
        </div>
        
        <div className="border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Click the theme toggle button in the top right</li>
            <li>Switch between Light, Dark, and System themes</li>
            <li>Notice how colors change automatically</li>
            <li>Try changing your system theme to see System mode work</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
