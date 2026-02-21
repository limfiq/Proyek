async function checkServer() {
    try {
        console.log('Pinging http://localhost:5000/ ...');
        const res = await fetch('http://localhost:5000/');
        console.log('Root endpoint:', res.status, res.statusText);
        const text = await res.text();
        console.log('Response:', text);
    } catch (e) {
        console.error('Root endpoint failed:', e.message);
    }

    try {
        console.log('Pinging http://localhost:5000/api/pkl/bimbingan ...');
        const res = await fetch('http://localhost:5000/api/pkl/bimbingan');
        console.log('Bimbingan endpoint status:', res.status, res.statusText);
        const text = await res.text();
        console.log('Response:', text);
    } catch (e) {
        console.error('Bimbingan endpoint failed (Network Error?):', e.cause ? e.cause.message : e.message);
    }
}

checkServer();
