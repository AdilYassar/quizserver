import express from 'express';
import { setTokens } from './src/utils/googleDrive.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Serve a simple HTML page for the OAuth callback
app.get('/oauth/callback', async (req, res) => {
    const { code } = req.query;

    if (code) {
        try {
            const tokens = await setTokens(code);
            res.send(`
                <h1>✅ Authorization Successful!</h1>
                <p>OAuth tokens have been saved to token.json</p>
                <p>You can now close this window and return to your terminal.</p>
                <script>
                    // Auto-close the window after 3 seconds
                    setTimeout(() => {
                        window.close();
                    }, 3000);
                </script>
            `);
            console.log('✅ OAuth tokens saved successfully!');
            console.log('🚀 You can now use the Google Drive integration.');
        } catch (error) {
            res.send(`
                <h1>❌ Authorization Failed</h1>
                <p>Error: ${error.message}</p>
                <p>Please try again.</p>
            `);
            console.error('❌ Authorization failed:', error.message);
        }
    } else {
        res.send(`
            <h1>❌ No authorization code received</h1>
            <p>Please try the authorization process again.</p>
        `);
    }
});

console.log(`🚀 Starting OAuth callback server on http://localhost:${PORT}`);
console.log('📋 Visit the authorization URL shown in your terminal');
console.log('🔄 This server will handle the OAuth callback automatically');

app.listen(PORT, () => {
    console.log(`📡 OAuth callback server is running on port ${PORT}`);
});
