import { S3Client } from "@aws-sdk/client-s3";

const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;
const region = process.env.BUCKET_REGION;
const bucketName = process.env.BUCKET_NAME;

if (!accessKeyId || !secretAccessKey || !region || !bucketName) {
  throw new Error("Missing S3 configuration: ACCESS_KEY, SECRET_ACCESS, or BUCKET_REGION is not set in environment variables");
}

const s3 = new S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region,
});

export default s3;