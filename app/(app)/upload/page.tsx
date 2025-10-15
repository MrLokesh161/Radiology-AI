"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadDropzone } from "@/components/upload-dropzone"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useData } from "@/components/data-provider"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const detailsSchema = z.object({
  patientName: z.string().min(2, "Name is required"),
  patientId: z.string().min(1, "Patient ID is required"),
  age: z.coerce.number().int().min(0).max(120),
  sex: z.enum(["male", "female", "other"]),
  modality: z.string().min(1, "Modality is required"),
  studyDate: z.string().optional(),
  notes: z.string().optional(),
})

type DetailsValues = z.infer<typeof detailsSchema>

type Stage = "idle" | "processing" | "predicting" | "saving"

export default function UploadPage() {
  const { addStudy } = useData()
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [stage, setStage] = useState<Stage>("idle")

  const form = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      patientName: "",
      patientId: "",
      age: 40,
      sex: "other",
      modality: "X-ray",
      studyDate: new Date().toISOString().slice(0, 10),
      notes: "",
    },
    mode: "onBlur",
  })

  function handleFilesSelected(files: File[]) {
    const f = files[0]
    setFile(f)
    if (f && f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f)
      setPreviewUrl(url)
    } else {
      setPreviewUrl("/placeholder.jpg")
    }
  }

  async function fileToDataUrl(f: File | null): Promise<string | undefined> {
    if (!f) return undefined
    if (!f.type.startsWith("image/")) return undefined // skip DICOM preview
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => resolve(undefined)
      reader.readAsDataURL(f)
    })
  }

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

  async function onSubmit(values: DetailsValues) {
    if (!file) {
      toast({ title: "No file", description: "Please add a file first." })
      return
    }

    try {
      setStage("processing")
      toast({ title: "Image processing…", description: "Preprocessing the uploaded study." })
      await delay(5000)

      setStage("predicting")
      toast({ title: "Predicting…", description: "Running model inference." })
      await delay(5000)

      setStage("saving")
      const dataUrl = await fileToDataUrl(file)
      addStudy({
        fileName: file.name,
        patientName: values.patientName,
        status: "processed",
        size: file.size,
        imageDataUrl: dataUrl,
        patientId: values.patientId,
        age: values.age,
        sex: values.sex,
        modality: values.modality,
        notes: values.notes,
        studyDate: values.studyDate,
      })

      toast({ title: "Study saved", description: "Draft report generated. View it in Reports." })

      // reset
      form.reset()
      setFile(null)
      setPreviewUrl(null)
    } catch (e) {
      console.error(e)
      toast({ title: "Something went wrong", description: "Could not save the study." })
    } finally {
      setStage("idle")
    }
  }

  const stageLabel: Record<Stage, string> = {
    idle: "",
    processing: "Image processing… (~5s)",
    predicting: "Predicting… (~5s)",
    saving: "Saving…",
  }

  const isBusy = stage !== "idle"

  return (
    <div className="max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Upload Study</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <UploadDropzone onFilesSelected={handleFilesSelected} />

          {previewUrl && (
            <div className="border rounded-md p-3 bg-card">
              <div className="text-sm font-medium mb-2">Preview</div>
              <img
                src={previewUrl || "/placeholder.svg"}
                alt="Uploaded preview"
                className="max-h-64 w-auto object-contain"
              />
            </div>
          )}

          {/* Simple status banner */}
          {isBusy && (
            <div className="rounded-md border p-3 text-sm bg-muted/40">
              <span className="font-medium">{stageLabel[stage]}</span>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient name</FormLabel>
                      <FormControl>
                        <Input placeholder="Drake M." {...field} disabled={isBusy} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient ID</FormLabel>
                      <FormControl>
                        <Input placeholder="PID-12345" {...field} disabled={isBusy} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={120}
                          value={field.value?.toString() ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          inputMode="numeric"
                          disabled={isBusy}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sex</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isBusy}>
                        <FormControl>
                          <SelectTrigger aria-label="Sex">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="modality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modality</FormLabel>
                      <FormControl>
                        <Input placeholder="X-ray" {...field} disabled={isBusy} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="studyDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Study date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          disabled={isBusy}
                        />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Clinical notes / symptoms..." {...field} disabled={isBusy} />
                    </FormControl>
                    <FormDescription>Optional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={!file || isBusy}>
                  {stage === "idle" && "Process & Save"}
                  {stage === "processing" && "Image processing…"}
                  {stage === "predicting" && "Predicting…"}
                  {stage === "saving" && "Saving…"}
                </Button>
                {!file && !isBusy && (
                  <span className="text-sm text-muted-foreground">Add a file to enable saving</span>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
