import { Request, Response } from 'express';
import { db } from '../firebase';
import * as admin from 'firebase-admin';

export const getSponsors = async (req: Request, res: Response) => {
    try {
        const snapshot = await db.collection('sponsors').orderBy('createdAt', 'desc').get();
        const sponsors = snapshot.docs.map(doc => {
            const data = doc.data();
            // Migration logic for legacy data
            let contributions = data.contributions || [];
            if (contributions.length === 0 && data.contribution) {
                const date = data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
                contributions = [{ date, amount: data.contribution }];
            }

            return {
                id: doc.id,
                ...data,
                contributions
            };
        });
        res.status(200).json(sponsors);
    } catch (error) {
        console.error('Error fetching sponsors:', error);
        res.status(500).json({ error: 'Failed to fetch sponsors' });
    }
};

export const createSponsor = async (req: Request, res: Response) => {
    try {
        const { title, imageUrl, websiteUrl, contributions } = req.body;
        
        if (!title || !websiteUrl) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const newSponsor = {
            title,
            imageUrl: imageUrl || '',
            websiteUrl,
            contributions: contributions || [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await db.collection('sponsors').add(newSponsor);
        res.status(201).json({ id: docRef.id, ...newSponsor });
    } catch (error) {
        console.error('Error creating sponsor:', error);
        res.status(500).json({ error: 'Failed to create sponsor' });
    }
};

export const updateSponsor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, imageUrl, websiteUrl, contributions } = req.body;

        const updateData: any = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (title !== undefined) updateData.title = title;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl;
        if (contributions !== undefined) updateData.contributions = contributions;

        await db.collection('sponsors').doc(id).update(updateData);
        res.status(200).json({ id, ...updateData });
    } catch (error) {
        console.error('Error updating sponsor:', error);
        res.status(500).json({ error: 'Failed to update sponsor' });
    }
};

export const deleteSponsor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await db.collection('sponsors').doc(id).delete();
        res.status(200).json({ message: 'Sponsor deleted successfully' });
    } catch (error) {
        console.error('Error deleting sponsor:', error);
        res.status(500).json({ error: 'Failed to delete sponsor' });
    }
};
