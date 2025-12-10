import { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Configure disk storage with dynamic destination based on route param
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = req.params.folder || 'general';
        // Validate folder name to prevent directory traversal
        if (!/^[a-zA-Z0-9_-]+$/.test(folder)) {
            return cb(new Error('Invalid folder name'), '');
        }
        
        const uploadDir = path.join(process.cwd(), 'uploads', folder);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Sanitize original name
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueSuffix}_${sanitizedName}`);
    }
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit (for GPX etc)

export const uploadMiddleware = upload.single('file');

export const uploadFile = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        const folder = req.params.folder || 'general';
        const protocol = req.protocol;
        const host = req.get('host');
        // Ensure forward slashes for URL
        const url = `${protocol}://${host}/uploads/${folder}/${req.file.filename}`;
        res.json({ url });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteFile = async (req: Request, res: Response) => {
    try {
        const { url, path: filePath } = req.body;
        
        if (!url && !filePath) {
            res.status(400).json({ error: 'URL or path is required' });
            return;
        }

        let relativePath = '';
        
        if (filePath) {
            // If direct path is provided (e.g. "gallery/image.jpg")
            relativePath = filePath;
        } else if (url) {
            // Extract path from URL
            // Expected URL: http://host/uploads/folder/filename
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/uploads/');
            if (pathParts.length < 2) {
                // Try to handle if it's already a relative path or doesn't match expected structure
                relativePath = url;
            } else {
                relativePath = pathParts[1];
            }
        }

        // Security check: ensure path doesn't try to go up directories
        if (relativePath.includes('..')) {
             res.status(400).json({ error: 'Invalid path' });
             return;
        }

        const fullPath = path.join(process.cwd(), 'uploads', relativePath);

        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            res.json({ success: true });
        } else {
            // If file doesn't exist, we can consider it "deleted" or return 404
            // Returning success to be idempotent
            console.log(`File not found for deletion: ${fullPath}`);
            res.json({ success: true });
        }
    } catch (err: any) {
        console.error('Error deleting file:', err);
        res.status(500).json({ error: err.message });
    }
};
