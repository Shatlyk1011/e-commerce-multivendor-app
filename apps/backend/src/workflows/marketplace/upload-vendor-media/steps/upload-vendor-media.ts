import {
  DeleteObjectsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { randomUUID } from "node:crypto"
import path from "node:path"
import sharp from "sharp"

export type VendorMediaFileInput = {
  filename: string
  mimeType: string
  buffer: Buffer | { type: "Buffer"; data: number[] }
}

export type UploadedVendorMedia = {
  key: string
  url: string
}

type UploadVendorMediaInput = {
  folder: string
  files: VendorMediaFileInput[]
}

const getS3Client = () =>
  new S3Client({
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER || "medusa_admin",
      secretAccessKey: process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || "minio_secret_pass_7291",
    },
    endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9010",
    forcePathStyle: true,
    region: process.env.MINIO_REGION || "us-east-1",
  })

const getBucket = () => process.env.MINIO_BUCKET || "medusa-media"

const getPublicUrl = () =>
  (process.env.MINIO_PUBLIC_URL || "http://localhost:9010/medusa-media").replace(/\/+$/, "")

const encodeObjectKey = (key: string) => key.split("/").map(encodeURIComponent).join("/")

const createObjectKey = (folder: string, filename: string) => {
  const parsedFilename = path.parse(path.basename(filename))
  const basename = parsedFilename.name.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "image"

  return `${folder}/${basename}-${randomUUID()}.webp`
}

/**
 * Workflow engines may JSON-serialize a Buffer between the route and the
 * step. Node serializes it as `{ type: "Buffer", data: number[] }`; accept
 * that representation as a transport detail, while always giving S3 a real
 * binary Buffer.
 */
const toBuffer = (buffer: Buffer | { type: "Buffer"; data: number[] }) =>
  Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer.data)

export const uploadVendorMediaStep = createStep(
  "upload-vendor-media",
  async (input: UploadVendorMediaInput) => {
    const client = getS3Client()
    const bucket = getBucket()

    const uploadedFiles = await Promise.all(
      input.files.map(async (file) => {
        const key = createObjectKey(input.folder, file.filename)
        // Sharp strips metadata unless `.withMetadata()` is called. The image
        // dimensions are deliberately left unchanged; only WebP compression is
        // applied before the object reaches MinIO.
        const optimizedBuffer = await sharp(toBuffer(file.buffer))
          .webp({ quality: 80, effort: 4 })
          .toBuffer()

        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Body: optimizedBuffer,
            CacheControl: "public, max-age=31536000, immutable",
            ContentType: "image/webp",
            Key: key,
            Metadata: {
              "original-filename": encodeURIComponent(path.basename(file.filename)),
            },
          })
        )

        return {
          key,
          url: `${getPublicUrl()}/${encodeObjectKey(key)}`,
        }
      })
    )

    return new StepResponse(uploadedFiles, uploadedFiles.map(({ key }) => key))
  },
  async (keys) => {
    if (!keys?.length) {
      return
    }

    await getS3Client().send(
      new DeleteObjectsCommand({
        Bucket: getBucket(),
        Delete: {
          Objects: keys.map((Key) => ({ Key })),
          Quiet: true,
        },
      })
    )
  }
)
