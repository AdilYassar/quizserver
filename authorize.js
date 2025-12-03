import dotenv from 'dotenv';
import { getAuthUrl, setTokens } from './src/utils/googleDrive.js';
import readline from 'readline';

dotenv.config(); // Load environment variables

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function authorize() {
    try {
        console.log('🔐 Google Drive OAuth 2.0 Authorization');
        console.log('=====================================');

        // Generate authorization URL
        const authUrl = getAuthUrl();
        console.log('\n📋 Please visit this URL to authorize the application:');
        console.log(authUrl);
        console.log('\n📝 After authorization, you will be redirected to a URL like:');
        console.log('http://localhost:3000/oauth/callback?code=...');
        console.log('\n🔍 Copy the "code" parameter from the URL and paste it below:');

        rl.question('\nEnter the authorization code: ', async (code) => {
            try {
                const tokens = await setTokens(code);
                console.log('\n✅ Authorization successful!');
                console.log('📁 Tokens saved to token.json');
                console.log('🚀 You can now use the Google Drive integration.');
            } catch (error) {
                console.error('\n❌ Authorization failed:', error.message);
            }
            rl.close();
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        rl.close();
    }
}

authorize();
