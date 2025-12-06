import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads/gallery');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Sanitize original name
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueSuffix}_${sanitizedName}`);
    }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

export const uploadGalleryMiddleware = upload.single('image');

export const getGalleries = async (req: Request, res: Response) => {
    try {
        const snapshot = await admin.firestore().collection('gallery').orderBy('date', 'desc').get();
        const galleries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(galleries);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const createGallery = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const docRef = await admin.firestore().collection('gallery').add({
            ...data,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.status(201).json({ id: docRef.id, ...data });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateGallery = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        await admin.firestore().collection('gallery').doc(id).update({
            ...data,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.json({ id, ...data });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteGallery = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await admin.firestore().collection('gallery').doc(id).delete();
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const uploadImage = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        const protocol = req.protocol;
        const host = req.get('host');
        const url = `${protocol}://${host}/uploads/gallery/${req.file.filename}`;
        res.json({ url });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
