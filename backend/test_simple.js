console.log('Start');
require('dotenv').config();
console.log('Dotenv loaded');
try {
    const db = require('./src/models');
    console.log('Models loaded');
    console.log('Keys:', Object.keys(db));
} catch (e) {
    console.error('Error loading models:', e);
}
console.log('Done');

