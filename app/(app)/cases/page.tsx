"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useData } from "@/components/data-provider"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"

export default function CasesPage() {
  const { cases, reports } = useData()
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [priority, setPriority] = useState<"all" | "low" | "normal" | "high">("all")
  const [modality, setModality] = useState<"all" | "X-ray" | "CT" | "MRI" | "US" | "Other">("all")
  const [from, setFrom] = useState<string>("")
  const [to, setTo] = useState<string>("")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  const filtered = cases.filter((c) => {
    const matchesQuery = [c.title, c.patientName, c.priority].some((v) => v.toLowerCase().includes(query.toLowerCase()))
    const matchesPriority = priority === "all" ? true : c.priority === priority
    const matchesModality = modality === "all" ? true : c.modality === modality
    const created = c.createdAt ? new Date(c.createdAt) : null
    const fromOk = from ? (created ? created >= new Date(from) : false) : true
    const toOk = to ? (created ? created <= new Date(to) : false) : true
    return matchesQuery && matchesPriority && matchesModality && fromOk && toOk
  })

  const selectedCase = useMemo(
    () => filtered.find((c) => c.id === selectedId) ?? cases.find((c) => c.id === selectedId) ?? null,
    [filtered, cases, selectedId],
  )
  const relatedReport = useMemo(
    () =>
      selectedCase
        ? reports.find((r) => r.patientName === selectedCase.patientName || r.title.includes(selectedCase.title))
        : null,
    [reports, selectedCase],
  )

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Cases</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1" htmlFor="case-search">
                Search
              </label>
              <Input
                id="case-search"
                placeholder="Search by case, patient, priority"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1" htmlFor="case-priority">
                Priority
              </label>
              <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                <SelectTrigger id="case-priority" aria-label="Filter by priority">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1" htmlFor="case-modality">
                Modality
              </label>
              <Select value={modality} onValueChange={(v) => setModality(v as any)}>
                <SelectTrigger id="case-modality" aria-label="Filter by modality">
                  <SelectValue placeholder="Modality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="X-ray">X-ray</SelectItem>
                  <SelectItem value="CT">CT</SelectItem>
                  <SelectItem value="MRI">MRI</SelectItem>
                  <SelectItem value="US">Ultrasound</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block" htmlFor="from-date">
                  From
                </label>
                <Input id="from-date" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block" htmlFor="to-date">
                  To
                </label>
                <Input id="to-date" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("")
                setPriority("all")
                setModality("all")
                setFrom("")
                setTo("")
              }}
            >
              <Filter className="h-4 w-4 mr-2" aria-hidden /> Reset
            </Button>
          </div>

          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No cases match your filters.</p>
          ) : (
            <div className="grid gap-3" role="list" aria-label="Cases list">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  role="listitem"
                  className={`p-3 border rounded-md flex items-center justify-between ${selectedId === c.id ? "bg-accent" : "bg-card"} hover:bg-accent/50 transition-colors`}
                >
                  <div className="min-w-0">
                    <div className="font-medium">{c.title}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      <button
                        type="button"
                        onClick={() => setSelectedId(c.id)}
                        className="underline underline-offset-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-pressed={selectedId === c.id}
                        aria-controls="case-detail"
                      >
                        {c.patientName}
                      </button>{" "}
                      · {c.modality || "N/A"} {c.createdAt ? `· ${c.createdAt}` : ""}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground capitalize">
                    {c.priority}
                  </span>
                </div>
              ))}
            </div>
          )}

          {selectedCase && (
            <div id="case-detail" className="border rounded-md overflow-hidden">
              <ResizablePanelGroup direction="horizontal" className="min-h-[360px]">
                <ResizablePanel defaultSize={50} minSize={35}>
                  <div className="h-full w-full bg-muted flex items-center justify-center">
                    <img
                      src={relatedReport?.imageDataUrl || "/placeholder.jpg"}
                      alt={`Study image for ${selectedCase.title}`}
                      className="max-h-[60vh] w-auto object-contain"
                    />
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50} minSize={35}>
                  <div className="h-full w-full p-4 overflow-auto">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-lg font-semibold text-balance">{selectedCase.title}</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedId(null)}
                        aria-label="Close case detail"
                      >
                        Close
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {selectedCase.patientName} · {selectedCase.modality || "N/A"}{" "}
                      {selectedCase.createdAt ? `· ${selectedCase.createdAt}` : ""}
                    </p>
                    <div className="grid gap-3">
                      <section>
                        <h3 className="font-medium mb-1">Summary</h3>
                        <p className="text-sm">
                          {relatedReport?.summary || "No draft report available for this case yet."}
                        </p>
                      </section>
                      <section>
                        <h3 className="font-medium mb-1">Findings</h3>
                        <p className="text-sm">
                          {relatedReport?.findings || "Model findings placeholder. Grad-CAM overlays to follow."}
                        </p>
                      </section>
                      <section>
                        <h3 className="font-medium mb-1">Impression</h3>
                        <p className="text-sm">
                          {relatedReport?.impression || "Likely fracture. Recommend clinical correlation."}
                        </p>
                      </section>
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
