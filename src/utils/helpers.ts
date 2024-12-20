export const  extractPublicId = (url: string)=> {
  // Remove the domain and 'upload/' prefix, and remove the extension at the end
  const regex = /\/upload\/(?:v\d+\/)?(.+?)(\.\w+)?$/;
  const match = url.match(regex);
  
  if (match) {
    return match[1];  // This is the public_id
  }
  return null;
}

import { DeleteObjectCommand , PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import s3 from './s3bucket';
export const putImageIntoS3Bucket = async (filePath:string,folder:string,title:string) =>{
  const fileStream = fs.createReadStream(filePath)
  const photoKey = `${folder}/${title}`
  const bucketName = process.env.BUCKET_NAME
  const putCommand = new PutObjectCommand({
    Bucket:bucketName,
    Key:photoKey,
    Body:fileStream,
    ContentType:"image/*",
  })
  await s3.send(putCommand)
  const publicUrl = `https://${bucketName}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${photoKey}`;
  return [photoKey,publicUrl]
}
export const putVideoIntoS3Bucket = async (filePath:string,folder:string,title:string) =>{
  const fileStream = fs.createReadStream(filePath)
  const videoKey = `${folder}/${title}`
  const bucketName = process.env.BUCKET_NAME
  const putCommand = new PutObjectCommand({
    Bucket:bucketName,
    Key:videoKey,
    Body:fileStream,
    ContentType:"video/*",
  })
  await s3.send(putCommand)
  const publicUrl = `https://${bucketName}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${videoKey}`;
  return [videoKey,publicUrl]
}
export const deleteImageFromS3Bucket = async (key:string) =>{
  const imageKey = key
  const bucketName = process.env.BUCKET_NAME
  const deleteCommand = new DeleteObjectCommand({
    Bucket:bucketName,
    Key:imageKey
  })
  await s3.send(deleteCommand)
}
export const deleteVideoFromS3Bucket = async (key:string) =>{
  const videoKey = key
  const bucketName = process.env.BUCKET_NAME
  const deleteCommand = new DeleteObjectCommand({
    Bucket:bucketName,
    Key:videoKey
  })
  await s3.send(deleteCommand)
}

