import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: "646748199176175",
  api_secret: "jExEbmIQ45BIrDByd0DKYMEdGiE",
  secure : true 
})

export { cloudinary }

