"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

function CTAButtons() {
  "use client"
  const { user } = useAuth()
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Link href="/login" className="w-full sm:w-auto">
        <Button className="w-full" variant="default" aria-label="Try Demo">
          Try Demo
        </Button>
      </Link>
      <Link href={user ? "/upload" : "/login"} className="w-full sm:w-auto">
        <Button className="w-full" variant="secondary" aria-label="Upload Study">
          Upload Study
        </Button>
      </Link>
    </div>
  )
}

export default function Page() {
  return (
    <main id="main-content" className="min-h-dvh">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div aria-hidden className="h-8 w-8 rounded-md bg-primary" />
            <span className="font-semibold">Radiology AI Assistant</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="underline underline-offset-4">
              Login
            </Link>
          </nav>
        </div>
      </header>

      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-semibold text-balance">Radiology AI Assistant</h1>
          <p className="mt-4 text-muted-foreground text-pretty">
            AI-assisted fracture detection with explainable overlays & draft reporting.
          </p>
          <div className="mt-6">
            <CTAButtons />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Fracture Detection", desc: "Automated screening highlights suspected fractures." },
          { title: "Grad-CAM Explainability", desc: "Overlay heatmaps for visual rationale." },
          { title: "Draft Report", desc: "Auto-generate structured report for review." },
          { title: "Role-Based Access", desc: "Placeholder roles for radiologists and admins." },
        ].map((f) => (
          <Card key={f.title} className="h-full">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" aria-hidden />
                <div>
                  <h3 className="font-medium">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="container mx-auto px-4 py-8 grid gap-6">
        <div>
          <h2 className="text-xl font-semibold">How it Works</h2>
          <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {["Upload Study", "AI Analysis", "Explainable Overlays", "Draft Report"].map((step, i) => (
              <li key={step} className="p-4 border rounded-md bg-card">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm mr-2">
                  {i + 1}
                </span>
                <span className="font-medium">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Security & Privacy</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              "AES-256 at rest (placeholder)",
              "Audit logs (placeholder)",
              "Access controls (placeholder)",
              "De-identification pipeline (placeholder)",
            ].map((s) => (
              <li key={s} className="p-4 border rounded-md bg-card">
                {s}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Radiology AI Assistant
        </div>
      </footer>
    </main>
  )
}
