const axios = require('axios');

async function verify() {
    try {
        console.log('Testing Backend Optimization...');
        const res = await axios.get('http://localhost:5000/');

        console.log('Status:', res.status);
        console.log('Headers:', res.headers);

        if (res.headers['content-encoding'] === 'gzip') {
            console.log('✅ Compression is WORKING (gzip)');
        } else {
            console.log('❌ Compression might not be active or response too small');
        }

        if (res.headers['x-ratelimit-limit']) {
            console.log('✅ Rate Limiting is WORKING');
        } else {
            // Rate limiting is applied to /api/ routes, let's check one
            try {
                const apiRes = await axios.get('http://localhost:5000/api/public/panduan');
                if (apiRes.headers['x-ratelimit-limit']) {
                    console.log('✅ Rate Limiting is WORKING on /api/ routes');
                } else {
                    console.log('❌ Rate Limiting not found in headers');
                }
            } catch (e) {
                console.log('Error checking API rate limit:', e.message);
            }
        }

        process.exit(0);
    } catch (e) {
        console.error('Verification failed:', e.message);
        process.exit(1);
    }
}

verify();
