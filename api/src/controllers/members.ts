import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads/members');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize original name to remove special characters
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}_${sanitizedName}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

export const uploadMiddleware = upload.single('photo');

export const createMember = async (req: Request, res: Response) => {
  const {
    fullName,
    birthPlace,
    nationality,
    birthDate,
    gender,
    ccNumber,
    nif,
    email,
    phone,
    address,
    postalCode,
    city,
    volunteer,
  } = req.body as any;

  if (!fullName || !email) {
    // Clean up uploaded file if validation fails
    if ((req as any).file) {
      fs.unlink((req as any).file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    let photoUrl = '';

    const uploaded = (req as any).file;
    if (uploaded) {
      // Construct public URL
      const protocol = req.protocol;
      const host = req.get('host');
      photoUrl = `${protocol}://${host}/uploads/members/${uploaded.filename}`;
    }

    const docRef = admin.firestore().collection('members').doc();
    await docRef.set({
      fullName,
      birthPlace,
      nationality,
      birthDate,
      gender,
      ccNumber,
      nif,
      email,
      phone,
      address,
      postalCode,
      city,
      volunteer: volunteer === 'true' || volunteer === true,
      photoUrl,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};
