const db = require('./src/models');

async function checkData() {
    try {
        const students = await db.Mahasiswa.findAll();
        const lokers = await db.Loker.findAll();
        const applications = await db.Pendaftaran.findAll({ where: { lokerId: { [db.Sequelize.Op.ne]: null } } });

        console.log(`Total Students: ${students.length}`);
        console.log(`Total Lokers: ${lokers.length}`);
        console.log(`Total Applications (with lokerId): ${applications.length}`);

        if (students.length > 0 && lokers.length > 0 && applications.length === 0) {
            console.log("\n--- Simulating Application ---");
            // Simulate 1 application
            const student = students[0];
            const loker = lokers[0];

            console.log(`Applying for Loker ID ${loker.id} (${loker.posisi}) as Student ID ${student.id} (${student.nama})...`);

            const existing = await db.Pendaftaran.findOne({
                where: { mahasiswaId: student.id, status: ['PENDING', 'APPROVED', 'ACTIVE'] }
            });

            if (existing) {
                console.log("Student already has an active application. Skipping creation.");
            } else {
                await db.Pendaftaran.create({
                    mahasiswaId: student.id,
                    instansiId: loker.instansiId,
                    lokerId: loker.id,
                    tipe: 'PKL1',
                    status: 'PENDING',
                    judulProject: loker.posisi
                });
                console.log("Application created successfully!");
            }
        }

        // Verify via Loker Association
        if (lokers.length > 0) {
            const lokerApps = await db.Loker.findByPk(lokers[0].id, {
                include: [{ model: db.Pendaftaran, as: 'pendaftar', include: ['mahasiswa'] }]
            });
            console.log(`\nChecking Loker ID ${lokers[0].id} applicants via association:`);
            console.log(`Count: ${lokerApps.pendaftar.length}`);
            if (lokerApps.pendaftar.length > 0) {
                console.log(`Applicant Name: ${lokerApps.pendaftar[0].mahasiswa.nama}`);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await db.sequelize.close();
    }
}

checkData();
