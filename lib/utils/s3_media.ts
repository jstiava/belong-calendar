import aws, { S3 } from 'aws-sdk';
import crypto from 'crypto';
import { promisify } from 'util';

const randomBytes = promisify(crypto.randomBytes);

const region = 'us-east-2';
const bucketName = 'mozi-belong-media-public-demo';
// const bucketName = 'cors-bucket';
const accessKeyId = process.env.AWS_MOZI_BELONG_MEDIA_S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_MOZI_BELONG_MEDIA_S3_SECRET_ACCESS_KEY;

const s3_media = new aws.S3({
  // region,
  endpoint: "https://mozi-belong-media-public-demo.s3.us-east-2.amazonaws.com",
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  signatureVersion: 'v4',
  s3ForcePathStyle: true,
});


export async function generateUploadURL(filename?: string, extension?: string, link?: string) {
  if (!filename) {
    const rawBytes = await randomBytes(16);
    filename = rawBytes.toString('hex');
  }
  const params = {
    Bucket: bucketName,
    Key: filename,
    Expires: 60,
    ContentType: extension ? `image/${extension}` : null,
  };
  const uploadURL = await s3_media.getSignedUrlPromise('putObject', params);
  return uploadURL;
}


export async function getAllFilePathsOfFolder(folderPath: string) {
  try {
    const params: AWS.S3.ListObjectsV2Request = {
      Bucket: bucketName,
      Prefix: folderPath,
    };

    let imagePaths: string[] = [];
    let continuationToken = null;

    do {
      if (continuationToken) {
        params.ContinuationToken = continuationToken;
      }

      const data = await s3_media.listObjectsV2(params).promise();
      const imageFiles = data.Contents?.filter((obj) => {
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(obj.Key || '');
      }) || [];
      imagePaths = imagePaths.concat(imageFiles.map((obj) => obj.Key || ''));
      continuationToken = data.IsTruncated ? data.NextContinuationToken : null;
    } while (continuationToken);

    return imagePaths;
  } catch (error) {
    console.error('Error listing image paths:', error);
    throw error;
  }
}

export async function generateDeleteURL(filename: string) {
  const params = {
    Bucket: bucketName,
    Key: filename,
    Expires: 60
  }

  const uploadURL = await s3_media.getSignedUrlPromise('deleteObject', params);
  return uploadURL;
}


export async function downloadImageURL(filePath: string) {
  const file = require('fs').createWriteStream(filePath);

  const params = {
    Bucket: bucketName,
    Key: filePath,
    Expires: 60,
  };

  s3_media
    .getObject(params)
    .createReadStream()
    .on('error', function (err) {
      console.error(err);
    })
    .pipe(file)
    .on('close', () => {
      console.log('File downloaded successfully.');
    });
  return;
}





export async function listFiles(prefix: string) {
  const params = {
    Bucket: bucketName,
    Prefix: prefix,
  };
  const data = await s3_media.listObjectsV2(params).promise();
  if (!data.Contents) {
    return [];
  }
  return data.Contents.map(
    item => 'https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}',
  );
}

export const getFolderSize = async (folder: string) => {
  let isTruncated = true;
  let marker;
  let totalSize = 0;

  while (isTruncated) {
    let params: any = {
      Bucket: bucketName,
      Prefix: folder,
      Marker: marker,
    };

    try {
      const response = await s3_media.listObjects(params).promise();
      if (!response.Contents) throw Error('No contents');
      response.Contents.forEach(item => {
        totalSize = totalSize + (item.Size ? item.Size : 0);
      });

      isTruncated = response.IsTruncated || false;
      if (isTruncated) {
        marker = response.Contents.slice(-1)[0].Key;
      }
    } catch (error) {
      console.error('Error listing objects: ', error);
      throw error;
    }
  }

  return totalSize;
};
