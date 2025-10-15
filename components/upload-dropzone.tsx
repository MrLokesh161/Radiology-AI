"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { useToast } from "@/hooks/use-toast"

export function UploadDropzone({ onFilesSelected }: { onFilesSelected: (files: File[]) => void }) {
  const { toast } = useToast()

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return
      onFilesSelected(acceptedFiles)
      toast({ title: "Files added", description: `${acceptedFiles.length} file(s) ready to upload.` })
    },
    [onFilesSelected, toast],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    noClick: false,
    accept: { "application/dicom": [".dcm"], "image/*": [".png", ".jpg", ".jpeg"] },
  })

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed rounded-md p-8 text-center focus-visible:outline-none focus-visible:ring-2 cursor-pointer bg-card"
      aria-label="Drag and drop a file here or click to upload"
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-sm">Drop the file here…</p>
      ) : (
        <p className="text-sm text-muted-foreground">Drag & drop a DICOM or image file here, or click to select.</p>
      )}
    </div>
  )
}
