const db = require('./src/models');

const dummyVacancies = [
    {
        nama: "PT Gojek Indonesia",
        alamat: "Jakarta Selatan",
        kontak: "hrd@gojek.com",
        isProposed: false,
        posisi: "Software Engineer Intern",
        kota: "Jakarta",
        jenisLowongan: "Magang Bersertifikat",
        isActive: true,
        logoUrl: "https://lelogama.go-jek.com/component/brand/src/Brand_Assets/Gojek/Horizontal/Gojek%20Horizontal%20-%20Green%20-%20Without%20Slogan.png"
    },
    {
        nama: "Tokopedia",
        alamat: "Jakarta Pusat",
        kontak: "careers@tokopedia.com",
        isProposed: false,
        posisi: "Data Analyst",
        kota: "Jakarta",
        jenisLowongan: "MBKM",
        isActive: true,
        logoUrl: "https://ecs7.tokopedia.net/assets-tokopedia-lite/v2/zeus/production/e5b8438b.svg"
    },
    {
        nama: "Ruangguru",
        alamat: "Jakarta Selatan",
        kontak: "intern@ruangguru.com",
        isProposed: false,
        posisi: "UI/UX Designer",
        kota: "Remote",
        jenisLowongan: "Magang Reguler",
        isActive: true,
        logoUrl: "https://www.ruangguru.com/hs-fs/hubfs/Ruangguru_Logo_RGB.png?width=1500&name=Ruangguru_Logo_RGB.png"
    },
    {
        nama: "Telkom Indonesia",
        alamat: "Bandung",
        kontak: "recruitment@telkom.co.id",
        isProposed: false,
        posisi: "Network Engineer",
        kota: "Bandung",
        jenisLowongan: "Magang Bersertifikat",
        isActive: true,
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Telkom_Indonesia_2013.svg/2560px-Telkom_Indonesia_2013.svg.png"
    },
    {
        nama: "Bank BCA",
        alamat: "Jakarta Pusat",
        kontak: "halo@bca.co.id",
        isProposed: false,
        posisi: "Frontend Developer",
        kota: "Jakarta",
        jenisLowongan: "MBKM",
        isActive: true,
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia.svg/2560px-Bank_Central_Asia.svg.png"
    }
];

const seedData = async () => {
    try {
        await db.sequelize.authenticate();
        console.log('Connected to database.');

        // await db.sequelize.sync({ alter: true }); // Ensure columns exist

        for (const vacancy of dummyVacancies) {
            await db.Instansi.create(vacancy);
            console.log(`Created: ${vacancy.nama} - ${vacancy.posisi}`);
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
