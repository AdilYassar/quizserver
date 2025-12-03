import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// OAuth 2.0 authentication for Google Drive
const getAuth = async () => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    // Set credentials if available
    const tokenPath = path.join(__dirname, '../../token.json');
    if (fs.existsSync(tokenPath)) {
        const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
        oauth2Client.setCredentials(tokens);
    } else {
        throw new Error('No OAuth tokens found. Please run the authorization script first.');
    }

    return oauth2Client;
};

// Generate authorization URL for initial setup
export const getAuthUrl = () => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/drive.file'],
    });

    return authUrl;
};

// Set tokens after authorization
export const setTokens = async (code) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save tokens to file
    const tokenPath = path.join(__dirname, '../../token.json');
    fs.writeFileSync(tokenPath, JSON.stringify(tokens));

    return tokens;
};

/**
 * Upload a file to Google Drive
 * @param {string} filePath - Local file path
 * @param {string} fileName - Name for the file in Drive
 * @param {string} mimeType - MIME type of the file
 * @param {string} folderId - Google Drive folder ID (optional)
 * @returns {Promise<string>} - File ID in Google Drive
 */
export const uploadToDrive = async (filePath, fileName, mimeType, folderId = null) => {
    try {
        const auth = await getAuth();
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
 * @param {string} fileId - Google Drive file ID
 * @returns {Promise<string>} - Public URL of the file
 */
export const makeFilePublic = async (fileId) => {
    try {
        const auth = await getAuth();
        const drive = google.drive({ version: 'v3', auth });

        // Make the file public
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        // Return the direct download URL for React Native video streaming
        // This format works best with react-native-video and other mobile players
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    } catch (error) {
        console.error('Error making file public:', error);
        throw error;
    }
};

/**
 * Get streaming URL with auth for better performance (alternative approach)
 * @param {string} fileId - Google Drive file ID
 * @returns {Promise<Object>} - Streaming details with URL and headers
 */
export const getStreamingUrl = async (fileId) => {
    try {
        const auth = await getAuth();
        const drive = google.drive({ version: 'v3', auth });

        // Get file metadata including size
        const response = await drive.files.get({
            fileId: fileId,
            fields: 'webContentLink, size',
        });

        // For authenticated streaming (better for large files)
        const accessToken = await auth.getAccessToken();
        
        return {
            url: `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
            size: response.data.size,
            // Include auth token if needed for authenticated requests
            headers: {
                Authorization: `Bearer ${accessToken.token}`
            }
        };
    } catch (error) {
        console.error('Error getting streaming URL:', error);
        throw error;
    }
};

/**
 * Delete a file from Google Drive
 * @param {string} fileId - Google Drive file ID
 * @returns {Promise<void>}
 */
export const deleteFromDrive = async (fileId) => {
    try {
        const auth = await getAuth();
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
 * @param {string} filePath - Local file path
 * @param {string} fileName - Name for the file in Drive
 * @param {string} mimeType - MIME type of the file
 * @param {string} folderId - Google Drive folder ID (optional)
 * @returns {Promise<{fileId: string, publicUrl: string}>}
 */
export const uploadAndMakePublic = async (filePath, fileName, mimeType, folderId = null) => {
    const fileId = await uploadToDrive(filePath, fileName, mimeType, folderId);
    const publicUrl = await makeFilePublic(fileId);
    return { fileId, publicUrl };
};