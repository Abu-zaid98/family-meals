const { getStorage } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

async function uploadFile(buffer, mimetype, folder) {
  const bucket = getStorage();
  const ext = mimetype.split('/')[1] || 'bin';
  const filename = `${folder}/${uuidv4()}.${ext}`;
  const file = bucket.file(filename);

  const token = uuidv4();

  await file.save(buffer, {
    metadata: {
      contentType: mimetype,
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
  const encodedFilename = encodeURIComponent(filename);
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedFilename}?alt=media&token=${token}`;
  return url;
}

module.exports = { uploadFile };
