"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useData } from "@/components/data-provider"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, FileText, AlarmClock, AlertTriangle } from "lucide-react"

function DashboardContent() {
  "use client"
  const { studies, reports, cases } = useData()
  const loading = false

  const totalStudies = studies.length
  const pendingStudies = studies.filter((s) => s.status === "pending").length
  const totalReports = reports.length
  const highCases = cases.filter((c) => c.priority === "high").length

  const worklist = [...studies].sort((a, b) => (b.studyDate || "").localeCompare(a.studyDate || "")).slice(0, 6)
  const recentReports = [...reports].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 5)
  const criticalCases = cases.filter((c) => c.priority === "high").slice(0, 5)

  return (
    <main className="grid gap-6">
      {/* Stats */}
      <section aria-labelledby="stats-heading" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <h2 id="stats-heading" className="sr-only">
          Overview statistics
        </h2>
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" aria-hidden />
              Studies
            </CardTitle>
            <Badge variant="outline" aria-label={`Total studies ${totalStudies}`}>
              {totalStudies}
            </Badge>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Total uploaded studies</CardContent>
        </Card>
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlarmClock className="h-4 w-4" aria-hidden />
              Pending
            </CardTitle>
            <Badge variant="secondary" aria-label={`Pending studies ${pendingStudies}`}>
              {pendingStudies}
            </Badge>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Awaiting review</CardContent>
        </Card>
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" aria-hidden />
              Reports
            </CardTitle>
            <Badge variant="outline" aria-label={`Total reports ${totalReports}`}>
              {totalReports}
            </Badge>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Draft reports available</CardContent>
        </Card>
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" aria-hidden />
              High Cases
            </CardTitle>
            <Badge variant="destructive" aria-label={`High priority cases ${highCases}`}>
              {highCases}
            </Badge>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">High-priority cases</CardContent>
        </Card>
      </section>

      {/* Worklist and Reports */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Worklist</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/upload" aria-label="Upload a new study">
                Upload
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3">
            {worklist.length === 0 ? (
              <>
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </>
            ) : (
              worklist.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-md border flex items-center justify-between bg-card hover:bg-accent/50 focus-within:ring-2 focus-within:ring-ring transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{s.patientName}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {s.fileName} {s.studyDate ? `· ${s.studyDate}` : ""}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground capitalize">
                    {s.status}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Recent Reports</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/reports" aria-label="Open all reports">
                View all
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3">
            {recentReports.length === 0 ? (
              <>
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </>
            ) : (
              recentReports.map((r) => (
                <div key={r.id} className="p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium truncate">{r.title}</div>
                    <span className="text-xs text-muted-foreground shrink-0">{r.createdAt?.slice(0, 10) || ""}</span>
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-1">{r.summary}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      {/* High Priority & Shortcuts */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader>
            <CardTitle>High Priority Cases</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {criticalCases.length === 0 ? (
              <p className="text-sm text-muted-foreground">No high-priority cases.</p>
            ) : (
              criticalCases.map((c) => (
                <div key={c.id} className="p-3 rounded-md border flex items-center justify-between bg-card">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{c.title}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {c.patientName} · {c.modality || "N/A"} {c.createdAt ? `· ${c.createdAt}` : ""}
                    </div>
                  </div>
                  <Badge variant="destructive" className="capitalize shrink-0">
                    {c.priority}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/upload">Upload Study</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/reports">Open Reports</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/cases">View Cases</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/settings">Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

export default function DashboardPage() {
  return <DashboardContent />
}
