const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET;
console.log('JWT_SECRET:', secret);

const payload = { id: 1, role: 'ADMIN' };
const token = jwt.sign(payload, secret, { expiresIn: '1h' });

console.log('Generated Token:', token);

jwt.verify(token, secret, (err, decoded) => {
    if (err) {
        console.error('Verification failed:', err.message);
    } else {
        console.log('Verification successful:', decoded);
    }
});
