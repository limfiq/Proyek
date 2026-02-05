const { google } = require('googleapis');
const stream = require('stream');
const path = require('path');

const KEY_FILE_PATH = path.join(__dirname, '../../service-account-key.json');

const getDriveClient = () => {
    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_FILE_PATH,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    return google.drive({ version: 'v3', auth });
};

const uploadFile = async (fileObject) => {
    try {
        const drive = getDriveClient();
        const bufferStream = new stream.PassThrough();
        bufferStream.end(fileObject.buffer);

        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

        const response = await drive.files.create({
            requestBody: {
                name: fileObject.originalname,
                parents: folderId ? [folderId] : [], // Upload to specific folder if ID provided
                mimeType: fileObject.mimetype,
            },
            media: {
                mimeType: fileObject.mimetype,
                body: bufferStream,
            },
            fields: 'id, name, webViewLink, webContentLink',
        });

        // Make file publicly readable (optional, depends on requirements. safer to keep private and use signed URLs or proxy, but webViewLink often requires permission)
        // For simplicity in this demo, we might just return the link. Ideally, we grant permission to anyone with link or specific users.
        // Let's assume we want it accessible.
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
        console.error('Google Drive Upload Error:', error);
        throw error;
    }
};

module.exports = { uploadFile };
