import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" })
  }

  const { image } = req.body

  if (!image) {
    return res.status(400).json({ error: "No image provided" })
  }

  const formData = new FormData()
  formData.append("file", image)
  formData.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET as string) // Définir l'upload preset dans Cloudinary
  formData.append("cloud_name", process.env.CLOUDINARY_CLOUD_NAME as string)

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    })
    const data = await response.json()
    res.status(200).json({ url: data.secure_url })
  } catch (error) {
    res.status(500).json({ error: "Failed to upload image" })
  }
}
