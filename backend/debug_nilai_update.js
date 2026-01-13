const db = require('./src/models');
const { KomponenNilai, Pendaftaran, Mahasiswa, KriteriaNilai } = db;

async function runDebug() {
    try {
        console.log("Starting Debug Script...");

        // 1. Setup Dummy Data
        const mhs = await Mahasiswa.findOne();
        if (!mhs) throw new Error("No mahasiswa found");

        let pendaftaran = await Pendaftaran.findOne({ where: { mahasiswaId: mhs.id, tipe: 'PKL1' } });
        if (!pendaftaran) {
            pendaftaran = await Pendaftaran.create({ mahasiswaId: mhs.id, tipe: 'PKL1', status: 'ACTIVE' });
        }
        const pendaftaranId = pendaftaran.id;
        console.log("Using pendaftaran:", pendaftaranId);

        // 2. CHECK FOR DUPLICATES
        const allScores = await KomponenNilai.findAll({ where: { pendaftaranId } });
        console.log("Total Scores found:", allScores.length);

        const counts = {};
        allScores.forEach(s => {
            const key = s.kriteriaNilaiId ? `K-${s.kriteriaNilaiId}` : s.jenis;
            counts[key] = (counts[key] || 0) + 1;
        });

        console.log("Duplicate Check:", counts);
        const dups = Object.keys(counts).filter(k => counts[k] > 1);
        if (dups.length > 0) {
            console.warn("WARNING: DUPLICATE RECORDS FOUND FOR KEYS:", dups);
        } else {
            console.log("No duplicates found.");
        }

        // 3. Test Kriteria Update
        const kriteria = await KriteriaNilai.findOne({ where: { tipe: 'PKL1' } });
        if (!kriteria) {
            console.log("No Kriteria found for PKL1. Skipping Kriteria test.");
            return;
        }

        console.log(`Testing Kriteria ID ${kriteria.id} (${kriteria.nama})`);

        // Ensure record exists
        let existing = await KomponenNilai.findOne({ where: { pendaftaranId, kriteriaNilaiId: kriteria.id } });
        if (!existing) {
            await KomponenNilai.create({ pendaftaranId, kriteriaNilaiId: kriteria.id, jenis: kriteria.role, nilai: 60 });
        } else {
            existing.nilai = 60;
            await existing.save();
        }
        console.log("Initialized Kriteria Score to 60");

        // Simulate Update
        const kScores = { [kriteria.id]: 95 }; // Key is ID as string/int

        console.log("Attempting to update Kriteria to 95...");

        // COPY LOGIC
        for (const key of Object.keys(kScores)) {
            const val = parseFloat(kScores[key]);
            if (key === 'HARIAN' || key === 'LOGBOOK' || key === 'MONEV') {
                // ...
            } else {
                const kId = parseInt(key);
                // Confirm logic matches controller:
                const crit = await KriteriaNilai.findByPk(kId);
                if (crit) {
                    const found = await KomponenNilai.findOne({ where: { pendaftaranId, kriteriaNilaiId: kId } });
                    if (found) {
                        console.log(`Found kriteria record ID ${found.id}, updating...`);
                        found.nilai = val;
                        found.jenis = crit.role;
                        await found.save();
                    } else {
                        // create
                    }
                }
            }
        }

        const updatedK = await KomponenNilai.findOne({ where: { pendaftaranId, kriteriaNilaiId: kriteria.id } });
        console.log("Read Updated Kriteria Score:", updatedK.nilai);

        if (updatedK.nilai === 95) {
            console.log("SUCCESS: Kriteria score updated.");
        } else {
            console.error("FAILURE: Kriteria score failed to update.");
        }

    } catch (err) {
        console.error("Error:", err);
    }
}

runDebug();
