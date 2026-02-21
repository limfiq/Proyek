require('dotenv').config();
const db = require('./src/models');

console.log('Loaded models:', Object.keys(db));

if (db.KomponenNilai) {
    console.log('KomponenNilai tableName:', db.KomponenNilai.tableName);
} else {
    console.error('KomponenNilai missing!');
}

if (db.KriteriaNilai) {
    console.log('KriteriaNilai tableName:', db.KriteriaNilai.tableName);
} else {
    console.error('KriteriaNilai missing!');
}

if (db.LaporanMingguan) {
    console.log('LaporanMingguan tableName:', db.LaporanMingguan.tableName);
} else {
    console.error('LaporanMingguan missing!');
}
