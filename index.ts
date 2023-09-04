import fs from 'fs';
import { google } from 'googleapis';
import { TwitterApi as TwitterClientV2 } from 'twitter-api-v2';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_DRIVE_FOLDER_ID = '11ktmiSCHqyXb-D513XM388i5018htI8s'; // Reemplaza con el ID de tu carpeta de Google Drive
const TWITTER_API_KEY = 'LHMx9g1eShUc6zD26qYswpEVq'; // Reemplaza con tu API Key
const TWITTER_API_SECRET_KEY = 'sjpLbO1KoFSRkoGCNRVYP0sBiInocbdKBEu3xfZKHGa6LEkfte'; // Reemplaza con tu API Secret Key
const TWITTER_ACCESS_TOKEN = '1672785265264402433-CJ1pbnvPSPcwkjVzaCXvr1qQz1JDRv'; // Reemplaza con tu Access Token
const TWITTER_ACCESS_TOKEN_SECRET = 'dKvJIDSLRybSbeifBEyp8z5iHds2yNSt4LYFPaRkHrRyp'; // Reemplaza con tu Access Token Secret

const T = new TwitterClientV2({
  appKey: TWITTER_API_KEY,
  appSecret: TWITTER_API_SECRET_KEY,
  accessToken: TWITTER_ACCESS_TOKEN,
  accessSecret: TWITTER_ACCESS_TOKEN_SECRET,
});

// Función para obtener la lista de fotogramas en Google Drive
const listDriveFiles = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'google-credentials.json', // Reemplaza con el nombre de tu archivo JSON de credenciales de Google
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  const drive = google.drive({ version: 'v3', auth });
  const res = await drive.files.list({
    q: `'${GOOGLE_DRIVE_FOLDER_ID}' in parents`,
  });
  return res.data.files;
};

// Función para publicar un fotograma en Twitter
const publishFrame = async (frameFilename, totalFrames, frameNumber) => {
  try {
    const tweetText = `#insidejob Part 01 - Episode 01 frame_${frameNumber} of ${totalFrames}`;

    // Publicar el tweet
    const mediaResponse = await T.v1.uploadMedia(fs.readFileSync(frameFilename));
    const mediaId = mediaResponse.media_id_string;

    const tweetData = await T.v2.tweet({
      text: tweetText,
      media: { media_keys: [mediaId] },
    });

    console.log('Tweet publicado:', tweetData.data.text);
  } catch (error) {
    console.error('Error al publicar el tweet:', error);
  }
};

const publishImagesToTwitter = async () => {
  try {
    const imageFiles = await listDriveFiles();

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const frameFilename = file.name; // Nombre del archivo en Google Drive

      // Publica el fotograma en Twitter solo si el número es mayor o igual a 470
      const frameNumber = parseInt(frameFilename.split('_')[1]);
      if (frameNumber >= 473) {
        await publishFrame(frameFilename, imageFiles.length, i + 1);
      }
    }
  } catch (error) {
    console.error('Error al publicar imágenes en Twitter:', error);
  }
};

publishImagesToTwitter();
