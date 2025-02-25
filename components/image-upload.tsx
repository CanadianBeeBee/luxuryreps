"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  onRemove: () => void
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [loading, setLoading] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      setLoading(true)

      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "")

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          },
        )

        const data = await response.json()

        if (data.secure_url) {
          onChange(data.secure_url)
        }
      } catch (error) {
        console.error("Error uploading image:", error)
      } finally {
        setLoading(false)
      }
    },
    [onChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
  })

  return (
    <div className="space-y-4 w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-4 
          ${isDragActive ? "border-primary" : "border-border"}
          hover:border-primary transition-colors
          flex flex-col items-center justify-center gap-4
          cursor-pointer min-h-[200px]
          ${value ? "bg-background" : "bg-secondary/50"}
        `}
      >
        <input {...getInputProps()} />
        {value ? (
          <div className="relative w-full aspect-square">
            <Image src={value || "/placeholder.svg"} alt="Uploaded image" fill className="object-cover rounded-lg" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div className="text-center">
              <p className="text-muted-foreground">
                {isDragActive ? "Déposez l'image ici" : "Glissez et déposez une image, ou cliquez pour sélectionner"}
              </p>
              {loading && <p className="text-primary mt-2">Chargement de l image...</p>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

