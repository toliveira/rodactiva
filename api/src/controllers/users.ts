import { Request, Response } from 'express';
import { auth, db } from '../firebase';
import { sendEmail } from '../services/email';
import { AuthRequest } from '../middleware/auth';
import * as admin from 'firebase-admin';

export const createBackofficeUser = async (req: AuthRequest, res: Response) => {
    const { email, name, role, photoURL } = req.body;
    const callerUid = req.user?.uid;

    if (!email || !name || !role) {
        res.status(400).json({ error: "Missing required fields: email, name, role." });
        return;
    }

    try {
        // Generate a random password
        const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

        // 1. Create Auth User
        const userRecord = await auth.createUser({
            email,
            password: generatedPassword,
            displayName: name,
            photoURL: photoURL || undefined,
        });

        // 2. Set Custom Claims (role)
        if (role === 'admin') {
            await auth.setCustomUserClaims(userRecord.uid, { admin: true });
        } else {
            await auth.setCustomUserClaims(userRecord.uid, { role });
        }

        // 3. Create Firestore Document
        await db.collection("users").doc(userRecord.uid).set({
            uid: userRecord.uid,
            name,
            email,
            role,
            photoURL: photoURL || null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: callerUid,
            mustChangePassword: true,
        });

        // 4. Send Email
        try {
            await sendEmail({
                to: email,
                subject: "Welcome to Rodactiva Backoffice",
                html: `
                  <h1>Welcome, ${name}!</h1>
                  <p>You have been granted access to the Rodactiva Backoffice as a <strong>${role}</strong>.</p>
                  <p>Your temporary login credentials are:</p>
                  <ul>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Password:</strong> ${generatedPassword}</li>
                  </ul>
                  <p>Please login and change your password immediately.</p>
                `,
            });
        } catch (emailError) {
            console.error("Failed to send email:", emailError);
            // Return success but with warning
            res.status(201).json({ 
                success: true, 
                message: "User created, but failed to send email.", 
                uid: userRecord.uid 
            });
            return;
        }

        res.status(201).json({ 
            success: true, 
            message: "User created and email sent.", 
            uid: userRecord.uid 
        });

    } catch (error: any) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

export const getBackofficeUsers = async (req: AuthRequest, res: Response) => {
    try {
        const usersSnapshot = await db.collection("users").orderBy("createdAt", "desc").get();
        const users = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json({ success: true, users });
    } catch (error: any) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

export const updateBackofficeUser = async (req: AuthRequest, res: Response) => {
    const { uid } = req.params;
    const { name, role } = req.body;

    if (!uid) {
        res.status(400).json({ error: "Missing user ID" });
        return;
    }

    try {
        // 1. Update Auth User (DisplayName)
        await auth.updateUser(uid, {
            displayName: name
        });

        // 2. Update Custom Claims if role changed
        if (role) {
             if (role === 'admin') {
                await auth.setCustomUserClaims(uid, { admin: true });
            } else {
                await auth.setCustomUserClaims(uid, { role });
            }
        }

        // 3. Update Firestore
        await db.collection("users").doc(uid).update({
            name,
            role
        });

        res.status(200).json({ success: true, message: "User updated successfully" });
    } catch (error: any) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

export const deleteBackofficeUser = async (req: AuthRequest, res: Response) => {
    const { uid } = req.params;

    if (!uid) {
        res.status(400).json({ error: "Missing user ID" });
        return;
    }

    try {
        // 1. Delete from Auth
        await auth.deleteUser(uid);

        // 2. Delete from Firestore
        await db.collection("users").doc(uid).delete();

        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
    const { newPassword } = req.body;
    const uid = req.user?.uid;

    if (!uid) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    if (!newPassword || newPassword.length < 6) {
        res.status(400).json({ error: "Password must be at least 6 characters long." });
        return;
    }

    try {
        // 1. Update Password in Auth
        await auth.updateUser(uid, { password: newPassword });

        // 2. Update Firestore Flag
        await db.collection("users").doc(uid).update({
            mustChangePassword: false
        });

        res.status(200).json({ success: true, message: "Password updated successfully." });
    } catch (error: any) {
        console.error("Error changing password:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};
