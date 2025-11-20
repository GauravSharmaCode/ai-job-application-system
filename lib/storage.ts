import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const endpoint = process.env.S3_ENDPOINT;
const region = process.env.S3_REGION || "auto";
const bucket = process.env.S3_BUCKET;

export const s3 = new S3Client({
  endpoint,
  region,
  credentials: process.env.S3_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      }
    : undefined,
  forcePathStyle: !!endpoint, // helpful for MinIO/R2
});

export async function putObject(key: string, body: Buffer | Uint8Array | string, contentType?: string) {
  if (!bucket) throw new Error("S3_BUCKET not configured");
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return { key };
}

export async function getObject(key: string) {
  if (!bucket) throw new Error("S3_BUCKET not configured");
  const res = await s3.send(
    new GetObjectCommand({ Bucket: bucket, Key: key })
  );
  return res.Body;
}
