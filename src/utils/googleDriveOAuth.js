import { google } from 'googleapis';
import fs from 'fs';
import readline from 'readline';

// OAuth 2.0 setup for Google Drive (Web Application)
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = './token.json';

// Load client secrets from environment variables
const getOAuth2Client = () => {
    // For web applications, we need OAuth 2.0 credentials from Google Cloud Console
    // Create credentials in: https://console.cloud.google.com/apis/credentials
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth/callback'; // For web apps

    if (!clientId || !clientSecret) {
        throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env');
    }

    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

/**
 * Get and store new token after prompting for user authorization
 */
export const authorize = async () => {
    const oAuth2Client = getOAuth2Client();

    // Check if we have previously stored a token
    try {
        const token = fs.readFileSync(TOKEN_PATH);
        oAuth2Client.setCredentials(JSON.parse(token));
        return oAuth2Client;
    } catch (err) {
        // No token found, get new one
        return getNewToken(oAuth2Client);
    }
};

/**
 * Get new token after prompting for user authorization
 */
const getNewToken = (oAuth2Client) => {
    return new Promise((resolve, reject) => {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });

        console.log('Authorize this app by visiting this url:', authUrl);

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) {
                    console.error('Error retrieving access token', err);
                    reject(err);
                    return;
                }
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
                console.log('Token stored to', TOKEN_PATH);
                resolve(oAuth2Client);
            });
        });
    });
};

/**
 * Upload a file to Google Drive using OAuth
 */
export const uploadToDrive = async (filePath, fileName, mimeType, folderId = null) => {
    try {
        const auth = await authorize();
        const drive = google.drive({ version: 'v3', auth });

        const fileMetadata = {
            name: fileName,
        };

        if (folderId) {
            fileMetadata.parents = [folderId];
        }

        const media = {
            mimeType: mimeType,
            body: fs.createReadStream(filePath),
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });

        return response.data.id;
    } catch (error) {
        console.error('Error uploading to Google Drive:', error);
        throw error;
    }
};

/**
 * Make a file publicly accessible and get its URL
 */
export const makeFilePublic = async (fileId) => {
    try {
        const auth = await authorize();
        const drive = google.drive({ version: 'v3', auth });

        // Make the file public
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        // Get the file metadata to construct the public URL
        const file = await drive.files.get({
            fileId: fileId,
            fields: 'webViewLink, webContentLink',
        });

        // Return the direct download link
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    } catch (error) {
        console.error('Error making file public:', error);
        throw error;
    }
};

/**
 * Delete a file from Google Drive
 */
export const deleteFromDrive = async (fileId) => {
    try {
        const auth = await authorize();
        const drive = google.drive({ version: 'v3', auth });

        await drive.files.delete({
            fileId: fileId,
        });
    } catch (error) {
        console.error('Error deleting from Google Drive:', error);
        throw error;
    }
};

/**
 * Upload file to Drive and make it public in one operation
 */
export const uploadAndMakePublic = async (filePath, fileName, mimeType, folderId = null) => {
    const fileId = await uploadToDrive(filePath, fileName, mimeType, folderId);
    const publicUrl = await makeFilePublic(fileId);
    return { fileId, publicUrl };
};
