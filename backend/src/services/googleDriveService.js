const { google } = require('googleapis');
const stream = require('stream');
const path = require('path');
const fs = require('fs');

const KEY_FILE_PATH = path.join(__dirname, '../../service-account-key.json');
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const getDriveClient = () => {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE_PATH,
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });
        return google.drive({ version: 'v3', auth });
    } catch (err) {
        console.error("Failed to initialize Google Drive client:", err.message);
        return null;
    }
};

const uploadFile = async (fileObject) => {
    try {
        const drive = getDriveClient();
        if (!drive) throw new Error("Drive client not initialized");

        const bufferStream = new stream.PassThrough();
        bufferStream.end(fileObject.buffer);

        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

        const response = await drive.files.create({
            requestBody: {
                name: Date.now() + '-' + fileObject.originalname,
                parents: folderId ? [folderId] : [],
                mimeType: fileObject.mimetype,
            },
            media: {
                mimeType: fileObject.mimetype,
                body: bufferStream,
            },
            fields: 'id, name, webViewLink, webContentLink',
        });

        try {
            await drive.permissions.create({
                fileId: response.data.id,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                },
            });
        } catch (permErr) {
            console.warn("Failed to set public permission:", permErr.message);
        }

        return response.data;
    } catch (error) {
        console.error('Google Drive Upload Failed, falling back to local storage:', error.message);

        // Fallback to local storage
        const fileName = Date.now() + '-' + fileObject.originalname;
        const filePath = path.join(UPLOADS_DIR, fileName);

        fs.writeFileSync(filePath, fileObject.buffer);

        // Return a mock object that matches the expected structure
        // Using relative path for local storage to be more flexible
        return {
            id: 'local-' + fileName,
            name: fileName,
            webViewLink: `/uploads/${fileName}`,
            webContentLink: `/uploads/${fileName}`
        };
    }
};

module.exports = { uploadFile };
