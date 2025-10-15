"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useData } from "@/components/data-provider"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { PDFDocument, StandardFonts } from "pdf-lib"

// 1) Put your demo images in /public and reference them here.
const sampleCase = {
  title: "Left Shoulder Radiograph — SAMPLE (Not for Clinical Use)",
  patientName: "Doe, Alex — 27 y/o — M — MRN: 102938 — Accession: SHD-2025-001",
  summary: `SAMPLE REPORT — NOT FOR CLINICAL USE.
Digital radiographs of the left shoulder (AP and scapular Y-equivalent projection simulated) were reviewed.
Osseous alignment is maintained without overt dislocation. No displaced fracture is identified.
Mild acromioclavicular (AC) joint prominence is noted with subtle cortical irregularity along the distal clavicle, which could reflect prior stress change or projectional artifact. Soft tissues are unremarkable; no radiopaque foreign body.
Recommend correlation with the site of pain/tenderness. If symptoms persist or clinical suspicion remains high, consider targeted axillary view or cross-sectional imaging.`,
  findings: `• Study/Views: Left shoulder radiographs obtained; appearance suggests AP projection with supplemental oblique view. Image quality adequate; no motion blur.
• Alignment: Glenohumeral alignment anatomic; humeral head well-seated within the glenoid. No anterior or posterior dislocation/subluxation.
• Fracture: No displaced cortical break or frank fracture line identified in the clavicle, scapula, proximal humerus, or ribs visualized. Subtle linear lucency is seen along the distal clavicle inferior cortex on the oblique view; this is nondiagnostic and may be projectional.
• AC Joint: Mild joint space narrowing with slight distal clavicle prominence; no high-grade separation appreciated on available views. Correlate with localized tenderness.
• Humeral Head/Neck: Trabecular pattern preserved; no Hill-Sachs or greater tuberosity avulsion evident.
• Scapula: Coracoid, acromion, and scapular spine appear intact.
• Ribs/Thorax (included field): No acute rib fracture seen within the limited field; lung apices clear of focal consolidation.
• Soft Tissues: No focal swelling, calcification, or radiopaque foreign body.
• Devices/Markers: L/R marker present in the superolateral field.
• Limitations: Lack of dedicated axillary view limits confident assessment of subtle AC separation or posterior dislocation.`,
  impression: `SAMPLE — NOT FOR CLINICAL USE.
1) No displaced fracture or frank dislocation of the left shoulder identified on available projections.
2) Mild AC joint prominence with equivocal subtle cortical irregularity at the distal clavicle; could be chronic or projectional.
3) If focal AC tenderness or instability is present, recommend dedicated axillary view or stress views; ultrasound or MRI may be considered if symptoms persist.`,
  recommendations: `• Correlate with the precise site of pain/tenderness.
• If high clinical suspicion for AC injury persists: obtain axillary view ± bilateral weighted stress views.
• Consider MRI without contrast to evaluate AC ligaments and rotator cuff if pain/weakness continues.
• Analgesia, rest, activity modification, and shoulder sling as clinically indicated.`,
  technique: "Digital radiography of the left shoulder; AP and oblique projection simulated. Exposure and collimation appropriate.",
  limitations: "No dedicated axillary view included; subtle AC separation and posterior dislocation can be occult without that view.",
  aiNote: "AI assist (DenseNet-121) probability output available; heatmap (Grad-CAM) provided for visual explanation only and is not diagnostic.",
  tags: "AGE:27; SEX:M; REGION:SHOULDER; SIDE:LEFT; VIEW:AP+OBLIQUE; FRACTURE:NO; AC_JOINT:SUSPECT_MILD_CHANGES; CONFIDENCE:0.31",
  disclaimer: "SAMPLE CONTENT ONLY — NOT FOR CLINICAL USE.",
  // >>> Add multiple demo images here (served from /public)
  images: [
    "/cam.png",
    "/detected.png",
  ] as string[],
}

export default function ReportsPage() {
  const { reports } = useData()
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!loading && reports.length > 0 && !selectedId) {
      setSelectedId(reports[0].id)
    }
  }, [loading, reports, selectedId])

  const selectedRaw = useMemo(() => reports.find((r) => r.id === selectedId), [reports, selectedId])

  // 2a) Normalize images: prefer report images, else imageDataUrl, else sampleCase.images.
  const imgs =
  Array.isArray(selectedRaw?.images) && selectedRaw.images.length > 0
    ? selectedRaw.images
    : (selectedRaw?.imageDataUrl ? [selectedRaw.imageDataUrl] : sampleCase.images)

  const selected = useMemo(() => {
    if (!selectedRaw) return null
    const merged = { ...sampleCase, ...selectedRaw }

    const fromSample = Array.isArray(sampleCase.images) ? sampleCase.images.filter(Boolean) : []
    const fromReport = Array.isArray(selectedRaw.images) ? selectedRaw.images.filter(Boolean) : []
    const fromDataUrl = selectedRaw.imageDataUrl ? [selectedRaw.imageDataUrl] : []

    // Order: code images first (what you want), then any report images, then a single data URL.
    // Also dedupe and keep only truthy strings.
    const seen = new Set<string>()
    const imgs = [...fromSample, ...fromReport, ...fromDataUrl]
      .filter((s): s is string => !!s && typeof s === "string")
      .filter((s) => (seen.has(s) ? false : (seen.add(s), true)))

    return { ...merged, images: imgs }
  }, [selectedRaw])


  useEffect(() => { setImgIdx(0) }, [selectedId])

  const onKey = useCallback((e: KeyboardEvent) => {
    if (!selected?.images?.length) return
    if (e.key === "ArrowRight") setImgIdx((i) => Math.min(i + 1, selected.images.length - 1))
    if (e.key === "ArrowLeft") setImgIdx((i) => Math.max(i - 1, 0))
  }, [selected?.images])
  useEffect(() => {
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onKey])

  // ---------- PDF helpers ----------
  const dataURLToUint8Array = (dataURL: string) => {
    if (!dataURL?.includes(",")) return new Uint8Array()
    const [, body] = dataURL.split(",")
    const binary = atob(body)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
  }

  // 2b) NEW: handle both data: URLs and /public paths
  const getImageBytes = async (src: string) => {
    if (src.startsWith("data:")) {
      return dataURLToUint8Array(src)
    }
    // fetch from /public (or any absolute/relative path)
    const res = await fetch(src)
    const buf = await res.arrayBuffer()
    return new Uint8Array(buf)
  }

  const handleExportDraft = async () => {
    if (!selected) return
    setExporting(true)
    try {
      const doc = await PDFDocument.create()
      const A4 = { w: 595.28, h: 841.89 }
      const margin = 40
      const lineGap = 14

      let page = doc.addPage([A4.w, A4.h])
      const font = await doc.embedFont(StandardFonts.Helvetica)
      const bold = await doc.embedFont(StandardFonts.HelveticaBold)
      const italic = await doc.embedFont(StandardFonts.HelveticaOblique)
      const bodySize = 11
      const titleSize = 16
      let y = A4.h - margin

      const newPage = () => {
        page = doc.addPage([A4.w, A4.h])
        y = A4.h - margin
      }

      const wrapText = (text: string, fnt: any, fontSize: number, maxWidth: number) => {
        const words = (text || "").split(/\s+/).filter(Boolean)
        const lines: string[] = []
        let line = ""
        for (const w of words) {
          const test = line ? line + " " + w : w
          if (fnt.widthOfTextAtSize(test, fontSize) <= maxWidth) line = test
          else { if (line) lines.push(line); line = w }
        }
        if (line) lines.push(line)
        return lines
      }

      const drawPara = (text: string, size = bodySize, fnt = font, addGap = lineGap, maxWidth?: number) => {
        const width = maxWidth ?? A4.w - margin * 2
        const lines = wrapText(text || "-", fnt, size, width)
        for (const l of lines) {
          if (y < margin + 40) newPage()
          page.drawText(l, { x: margin, y, size, font: fnt })
          y -= addGap
        }
      }

      const drawLabelValue = (label: string, value: string) => {
        if (y < margin + 60) newPage()
        page.drawText(label, { x: margin, y, size: bodySize, font: bold })
        y -= lineGap
        drawPara(value || "-", bodySize, font)
        y -= 4
      }

      // Header + meta
      page.drawText("Radiology AI Assistant — Draft Report", { x: margin, y, size: titleSize, font: bold })
      y -= 24
      drawLabelValue("TITLE", selected.title || "-")
      drawLabelValue("PATIENT", selected.patientName || "Unknown")
      drawLabelValue("REPORT ID", selected.id || "—")

      // All images section (works with data URLs and public paths)
      if (selected.images?.length) {
        for (let i = 0; i < selected.images.length; i++) {
          const src = selected.images[i]
          if (!src) continue
          if (y < margin + 260) newPage()

          const bytes = await getImageBytes(src)
          // Try to decide encoder: prefer PNG if the path ends with .png or data URL is png
          const isPng = src.startsWith("data:image/png") || /\.png(\?|$)/i.test(src)
          const img = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes)

          const maxW = A4.w - margin * 2
          const maxH = 300
          const scale = Math.min(maxW / img.width, maxH / img.height)
          const w = img.width * scale
          const h = img.height * scale
          page.drawText(`STUDY IMAGE ${i + 1}/${selected.images.length}`, { x: margin, y, size: bodySize, font: bold })
          y -= lineGap
          page.drawImage(img, { x: margin, y: y - h, width: w, height: h })
          y -= h + 12
        }
      }

      // Sections
      drawLabelValue("SUMMARY", selected.summary)
      drawLabelValue("FINDINGS", selected.findings)
      drawLabelValue("IMPRESSION", selected.impression)
      if (selected.recommendations) drawLabelValue("RECOMMENDATIONS", selected.recommendations)
      if (selected.technique) drawLabelValue("TECHNIQUE", selected.technique)
      if (selected.limitations) drawLabelValue("LIMITATIONS", selected.limitations)
      if (selected.aiNote) drawLabelValue("AI NOTE", selected.aiNote)
      if (selected.tags) drawLabelValue("TAGS", selected.tags)

      if (y < margin + 60) newPage()
      page.drawText(`Generated: ${new Date().toLocaleString()}`, { x: margin, y, size: 9, font })
      y -= 12
      if (selected.disclaimer) {
        const width = A4.w - margin * 2
        const lines = wrapText(selected.disclaimer, italic, 9, width)
        for (const l of lines) {
          if (y < margin + 40) newPage()
          page.drawText(l, { x: margin, y, size: 9, font: italic })
          y -= 12
        }
      }

      const bytes = await doc.save()
      const blob = new Blob([bytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      const safeName = (selected.patientName || "patient").replace(/[^\w\-]+/g, "_")
      a.href = url
      a.download = `${safeName}-${selected.id || "draft"}.pdf`
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
              {selected && (
                <div className="border rounded-md overflow-hidden">
                  <ResizablePanelGroup direction="horizontal" className="min-h-[360px]">
                    {/* LEFT: gallery */}
                    <ResizablePanel defaultSize={50} minSize={35}>
                      <div className="h-full w-full bg-muted flex flex-col">
                        {/* Main preview */}
                        <div className="flex-1 min-h-[220px] flex items-center justify-center border-b">
                          <img
                            src={selected.images?.[imgIdx] || "/placeholder.jpg"}
                            alt={`Study image ${imgIdx + 1}`}
                            className="max-h-[60vh] w-auto object-contain"
                          />
                        </div>
                        {/* Thumbnails */}
                        <div className="p-3 overflow-x-auto">
                          <div className="flex gap-2">
                            {selected.images.map((src: string, i: number) => (
                              <button
                                key={i}
                                onClick={() => setImgIdx(i)}
                                className={`border rounded-md overflow-hidden focus-visible:ring-2 ${i === imgIdx ? "ring-2 ring-primary" : ""}`}
                                title={`Image ${i + 1}`}
                              >
                                <img
                                  src={src}
                                  alt={`thumb ${i + 1}`}
                                  className="h-20 w-20 object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    {/* RIGHT: report text */}
                    <ResizablePanel defaultSize={50} minSize={35}>
                      <div className="h-full w-full p-4 overflow-auto">
                        <h2 className="text-lg font-semibold text-balance">{selected.title}</h2>
                        <p className="text-sm text-muted-foreground mb-3">
                          {selected.patientName || "Unknown patient"}
                        </p>

                        <div className="grid gap-3">
                          <section>
                            <h3 className="font-medium mb-1">Summary</h3>
                            <p className="text-sm whitespace-pre-line">{selected.summary}</p>
                          </section>

                          <section>
                            <h3 className="font-medium mb-1">Findings</h3>
                            <p className="text-sm whitespace-pre-line">
                              {selected.findings || "Model findings placeholder. Grad-CAM overlays to follow."}
                            </p>
                          </section>

                          <section>
                            <h3 className="font-medium mb-1">Impression</h3>
                            <p className="text-sm whitespace-pre-line">
                              {selected.impression || "Likely fracture. Recommend clinical correlation."}
                            </p>
                          </section>

                          {selected.recommendations && (
                            <section>
                              <h3 className="font-medium mb-1">Recommendations</h3>
                              <p className="text-sm whitespace-pre-line">{selected.recommendations}</p>
                            </section>
                          )}

                          {selected.technique && (
                            <section>
                              <h3 className="font-medium mb-1">Technique</h3>
                              <p className="text-sm whitespace-pre-line">{selected.technique}</p>
                            </section>
                          )}

                          {selected.limitations && (
                            <section>
                              <h3 className="font-medium mb-1">Limitations</h3>
                              <p className="text-sm whitespace-pre-line">{selected.limitations}</p>
                            </section>
                          )}

                          {selected.aiNote && (
                            <section>
                              <h3 className="font-medium mb-1">AI Note</h3>
                              <p className="text-sm whitespace-pre-line">{selected.aiNote}</p>
                            </section>
                          )}

                          {selected.tags && (
                            <section>
                              <h3 className="font-medium mb-1">Tags</h3>
                              <p className="text-sm font-mono">{selected.tags}</p>
                            </section>
                          )}

                          {selected.disclaimer && (
                            <section>
                              <h3 className="font-medium mb-1">Disclaimer</h3>
                              <p className="text-sm text-muted-foreground whitespace-pre-line">
                                {selected.disclaimer}
                              </p>
                            </section>
                          )}

                          <div className="pt-2 flex gap-2">
                            <Button variant="secondary" onClick={handleExportDraft} disabled={exporting}>
                              {exporting ? "Exporting…" : "Export Draft PDF"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </div>
              )}

              {/* List of reports */}
              <div className="grid gap-2" role="list" aria-label="Reports list">
                {reports.map((r) => (
                  <button
                    key={r.id}
                    role="listitem"
                    onClick={() => setSelectedId(r.id)}
                    className={`text-left p-3 border rounded-md hover:bg-accent focus-visible:outline-none focus-visible:ring-2 ${
                      selectedId === r.id ? "bg-accent" : "bg-card"
                    }`}
                    aria-pressed={selectedId === r.id}
                  >
                    <div className="font-medium">{r.title || sampleCase.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {r.summary || sampleCase.summary}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
