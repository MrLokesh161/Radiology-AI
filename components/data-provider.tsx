"use client"

import type React from "react"
import { createContext, useContext, useMemo, useState, useEffect } from "react"
import { nanoid } from "nanoid"

export type Study = {
  id: string
  fileName: string
  patientName: string
  status: "processed" | "pending"
  size: number
  // new
  imageDataUrl?: string
  patientId?: string
  age?: number
  sex?: "male" | "female" | "other"
  modality?: string
  notes?: string
  studyDate?: string
}

export type Report = {
  id: string
  title: string
  summary: string
  // new
  imageDataUrl?: string
  patientName?: string
  findings?: string
  impression?: string
  createdAt?: string
}

export type Case = {
  id: string
  title: string
  patientName: string
  priority: "low" | "normal" | "high"
  modality?: "X-ray" | "CT" | "MRI" | "US" | "Other"
  createdAt?: string
}

type DataContextType = {
  studies: Study[]
  reports: Report[]
  cases: Case[]
  addStudy: (s: Omit<Study, "id">) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const initialStudies: Study[] = [
  {
    id: nanoid(),
    fileName: "ankle_01.dcm",
    patientName: "Alex R.",
    status: "processed",
    size: 512_000,
    studyDate: "2025-10-01",
  },
  {
    id: nanoid(),
    fileName: "wrist_02.dcm",
    patientName: "Jamie K.",
    status: "processed",
    size: 760_000,
    studyDate: "2025-10-02",
  },
  {
    id: nanoid(),
    fileName: "knee_03.dcm",
    patientName: "Morgan S.",
    status: "pending",
    size: 680_000,
    studyDate: "2025-10-03",
  },
  {
    id: nanoid(),
    fileName: "elbow_04.dcm",
    patientName: "Taylor D.",
    status: "processed",
    size: 430_000,
    studyDate: "2025-10-05",
  },
  {
    id: nanoid(),
    fileName: "shoulder_05.dcm",
    patientName: "Riley P.",
    status: "pending",
    size: 900_000,
    studyDate: "2025-10-06",
  },
  {
    id: nanoid(),
    fileName: "hand_06.dcm",
    patientName: "Jordan L.",
    status: "processed",
    size: 370_000,
    studyDate: "2025-10-08",
  },
]

const initialReports: Report[] = [
  {
    id: nanoid(),
    title: "Ankle X-ray - Draft",
    summary: "Suspected distal fibula fracture. Review heatmap overlay.",
    patientName: "Alex R.",
    createdAt: "2025-10-01T09:12:00Z",
  },
  {
    id: nanoid(),
    title: "Wrist X-ray - Draft",
    summary: "Possible scaphoid fracture. Correlate clinically.",
    patientName: "Jamie K.",
    createdAt: "2025-10-02T10:22:00Z",
  },
  {
    id: nanoid(),
    title: "Knee X-ray - Draft",
    summary: "Joint effusion suspected; evaluate for tibial plateau fracture.",
    patientName: "Morgan S.",
    createdAt: "2025-10-03T13:45:00Z",
  },
  {
    id: nanoid(),
    title: "Elbow X-ray - Draft",
    summary: "Consider radial head fracture; check posterior fat pad sign.",
    patientName: "Taylor D.",
    createdAt: "2025-10-05T08:03:00Z",
  },
]

const initialCases: Case[] = [
  {
    id: nanoid(),
    title: "ER-1245",
    patientName: "Chris P.",
    priority: "high",
    modality: "X-ray",
    createdAt: "2025-10-04",
  },
  {
    id: nanoid(),
    title: "OP-9032",
    patientName: "Sam T.",
    priority: "normal",
    modality: "CT",
    createdAt: "2025-10-03",
  },
  { id: nanoid(), title: "ER-1288", patientName: "Dana Q.", priority: "high", modality: "CT", createdAt: "2025-10-06" },
  { id: nanoid(), title: "OP-9101", patientName: "Lee W.", priority: "low", modality: "MRI", createdAt: "2025-10-02" },
  {
    id: nanoid(),
    title: "ER-1290",
    patientName: "Pat C.",
    priority: "normal",
    modality: "X-ray",
    createdAt: "2025-10-07",
  },
  { id: nanoid(), title: "OP-9120", patientName: "Ari N.", priority: "high", modality: "US", createdAt: "2025-10-05" },
]

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [studies, setStudies] = useState<Study[]>(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("raa_studies") : null
    if (raw) {
      try {
        return JSON.parse(raw) as Study[]
      } catch {}
    }
    return initialStudies
  })
  const [reports, setReports] = useState<Report[]>(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("raa_reports") : null
    if (raw) {
      try {
        return JSON.parse(raw) as Report[]
      } catch {}
    }
    return initialReports.map((r) => ({
      imageDataUrl: "/placeholder.jpg",
      createdAt: r.createdAt || new Date().toISOString(),
      ...r,
    }))
  })
  const [cases] = useState<Case[]>(initialCases)

  useEffect(() => {
    try {
      localStorage.setItem("raa_studies", JSON.stringify(studies))
    } catch {}
  }, [studies])

  useEffect(() => {
    try {
      localStorage.setItem("raa_reports", JSON.stringify(reports))
    } catch {}
  }, [reports])

  const addStudy: DataContextType["addStudy"] = (s) => {
    const id = nanoid()
    setStudies((prev) => [{ id, ...s }, ...prev])
    setReports((prev) => [
      {
        id: nanoid(),
        title: `${s.patientName || "Patient"} - Draft`,
        summary: `Auto-drafted from ${s.fileName}`,
        imageDataUrl: s.imageDataUrl || "/placeholder.jpg",
        patientName: s.patientName,
        findings:
          "Findings: No acute cardiopulmonary abnormalities. Suspected fracture line with localized cortical disruption.",
        impression:
          "Impression: Findings suggest a likely non-displaced fracture; correlate clinically with point tenderness.",
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
  }

  const value = useMemo(() => ({ studies, reports, cases, addStudy }), [studies, reports, cases])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error("useData must be used within DataProvider")
  return ctx
}
