import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  QueryConstraint,
} from 'firebase/firestore';

/**
 * Generic function to fetch documents from a Firestore collection
 */
export async function fetchDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as T));
  } catch (error) {
    console.error(`Error fetching documents from ${collectionName}:`, error);
    return [];
  }
}

/**
 * Fetch a single document by ID
 */
export async function fetchDocument<T>(
  collectionName: string,
  documentId: string
): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as T;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching document ${documentId} from ${collectionName}:`, error);
    return null;
  }
}

/**
 * Add a new document to a collection
 */
export async function addDocument<T>(
  collectionName: string,
  data: Omit<T, 'id'>
): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    return null;
  }
}

/**
 * Update a document in a collection
 */
export async function updateDocument<T>(
  collectionName: string,
  documentId: string,
  data: Partial<T>
): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error(`Error updating document ${documentId} in ${collectionName}:`, error);
    return false;
  }
}

/**
 * Delete a document from a collection
 */
export async function deleteDocument(
  collectionName: string,
  documentId: string
): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting document ${documentId} from ${collectionName}:`, error);
    return false;
  }
}
