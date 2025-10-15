"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useData } from "@/components/data-provider"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { PDFDocument, StandardFonts } from "pdf-lib"   // 👈 add this

export default function ReportsPage() {
  const { reports } = useData()
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)     // 👈 add this
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!loading && reports.length > 0 && !selectedId) {
      setSelectedId(reports[0].id)
    }
  }, [loading, reports, selectedId])

  const selected = useMemo(() => reports.find((r) => r.id === selectedId), [reports, selectedId])

  // ---------- PDF helpers ----------
  const dataURLToUint8Array = (dataURL: string) => {
    const [head, body] = dataURL.split(",")
    const binary = atob(body)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
  }

  const wrapText = (text: string, font: any, fontSize: number, maxWidth: number) => {
    const words = (text || "").split(/\s+/).filter(Boolean)
    const lines: string[] = []
    let line = ""
    for (const w of words) {
      const test = line ? line + " " + w : w
      if (font.widthOfTextAtSize(test, fontSize) <= maxWidth) {
        line = test
      } else {
        if (line) lines.push(line)
        line = w
      }
    }
    if (line) lines.push(line)
    return lines
  }

  const handleExportDraft = async () => {
    if (!selected) return
    setExporting(true)
    try {
      const doc = await PDFDocument.create()
      const A4 = { w: 595.28, h: 841.89 } // points
      let page = doc.addPage([A4.w, A4.h])
      const margin = 40
      const font = await doc.embedFont(StandardFonts.Helvetica)
      const bold = await doc.embedFont(StandardFonts.HelveticaBold)
      const bodySize = 11
      const titleSize = 14
      const lineGap = 14
      let y = A4.h - margin

      const newPage = () => {
        page = doc.addPage([A4.w, A4.h])
        y = A4.h - margin
      }

      const drawLabelValue = (label: string, value: string) => {
        const maxWidth = A4.w - margin * 2
        page.drawText(label, { x: margin, y, size: bodySize, font: bold })
        y -= lineGap
        const lines = wrapText(value || "-", font, bodySize, maxWidth)
        for (const l of lines) {
          if (y < margin + 60) newPage()
          page.drawText(l, { x: margin, y, size: bodySize, font })
          y -= lineGap
        }
        y -= 6
      }

      // Header
      page.drawText("Radiology AI Assistant — Draft Report", {
        x: margin, y, size: titleSize, font: bold
      })
      y -= 24

      // Meta
      drawLabelValue("TITLE", selected.title || "-")
      drawLabelValue("PATIENT", selected.patientName || "Unknown")
      drawLabelValue("REPORT ID", selected.id)

      // Image (if present)
      if (selected.imageDataUrl) {
        if (y < margin + 260) newPage()
        const bytes = dataURLToUint8Array(selected.imageDataUrl)
        const isPng = selected.imageDataUrl.startsWith("data:image/png")
        const img = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes)

        const maxW = A4.w - margin * 2
        const maxH = 300
        const scale = Math.min(maxW / img.width, maxH / img.height)
        const w = img.width * scale
        const h = img.height * scale

        page.drawText("STUDY IMAGE", { x: margin, y, size: bodySize, font: bold })
        y -= lineGap
        page.drawImage(img, { x: margin, y: y - h, width: w, height: h })
        y -= h + 12
      }

      // Sections
      drawLabelValue("SUMMARY", selected.summary || "-")
      drawLabelValue("FINDINGS", selected.findings || "Model findings placeholder. Grad-CAM overlays to follow.")
      drawLabelValue("IMPRESSION", selected.impression || "Likely fracture. Recommend clinical correlation.")

      // Footer
      if (y < margin + 40) newPage()
      page.drawText(`Generated: ${new Date().toLocaleString()}`, {
        x: margin, y: margin, size: 9, font
      })

      const bytes = await doc.save()
      const blob = new Blob([bytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      const safeName = (selected.patientName || "patient").replace(/\s+/g, "_")
      a.href = url
      a.download = `${safeName}-${selected.id}-draft.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error("PDF export failed:", e)
      alert("Couldn't export the PDF. Check console for details.")
    } finally {
      setExporting(false)
    }
  }
  // ---------- /PDF helpers ----------

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {loading ? (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </>
          ) : reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reports yet.</p>
          ) : (
            <>
              <div className="grid gap-2" role="list" aria-label="Reports list">
                {reports.map((r) => (
                  <button
                    key={r.id}
                    role="listitem"
                    onClick={() => setSelectedId(r.id)}
                    className={`text-left p-3 border rounded-md hover:bg-accent focus-visible:outline-none focus-visible:ring-2 ${selectedId === r.id ? "bg-accent" : "bg-card"}`}
                    aria-pressed={selectedId === r.id}
                  >
                    <div className="font-medium">{r.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">{r.summary}</div>
                  </button>
                ))}
              </div>

              {selected && (
                <div className="border rounded-md overflow-hidden">
                  <ResizablePanelGroup direction="horizontal" className="min-h-[360px]">
                    <ResizablePanel defaultSize={50} minSize={35}>
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <img
                          src={selected.imageDataUrl || "/placeholder.jpg"}
                          alt={`Study image for ${selected.title}`}
                          className="max-h-[60vh] w-auto object-contain"
                        />
                      </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={50} minSize={35}>
                      <div className="h-full w-full p-4 overflow-auto">
                        <h2 className="text-lg font-semibold text-balance">{selected.title}</h2>
                        <p className="text-sm text-muted-foreground mb-3">
                          {selected.patientName || "Unknown patient"}
                        </p>
                        <div className="grid gap-3">
                          <section>
                            <h3 className="font-medium mb-1">Summary</h3>
                            <p className="text-sm">{selected.summary}</p>
                          </section>
                          <section>
                            <h3 className="font-medium mb-1">Findings</h3>
                            <p className="text-sm">
                              {selected.findings || "Model findings placeholder. Grad-CAM overlays to follow."}
                            </p>
                          </section>
                          <section>
                            <h3 className="font-medium mb-1">Impression</h3>
                            <p className="text-sm">
                              {selected.impression || "Likely fracture. Recommend clinical correlation."}
                            </p>
                          </section>
                          <div className="pt-2">
                            <Button variant="secondary" onClick={handleExportDraft} disabled={exporting}>
                              {exporting ? "Exporting…" : "Export Draft"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
