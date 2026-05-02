export default async function registerWellKnownRoutes(app) {
    // Android App Links (assetlinks.json)
    // Host this file at: https://your-domain.com/.well-known/assetlinks.json
    app.get('/.well-known/assetlinks.json', async (request, reply) => {
        const assetLinks = [{
            "relation": ["delegate_permission/common.handle_all_urls"],
            "target": {
                "namespace": "android_app",
                "package_name": "com.edulearn",
                "sha256_cert_fingerprints": [
                    "FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C"
                ]
            }
        }];
        
        reply.type('application/json');
        return assetLinks;
    });

    // iOS routes removed as requested. 
    // They can be added back later if you set up an Apple Developer account.
}
