import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  QueryConstraint,
  queryEqual,
  Query,
} from 'firebase/firestore';

interface UseFirestoreOptions {
  realtime?: boolean;
}

export function useFirestoreDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  options: UseFirestoreOptions = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use a ref to store the query and only update it when it changes semantically
  // This prevents infinite loops when constraints array is recreated on every render
  const queryRef = useRef<Query | null>(null);
  
  // Create the query object
  const immediateQuery = query(collection(db, collectionName), ...constraints);

  // Only update the ref if the query is semantically different
  if (!queryRef.current || !queryEqual(immediateQuery, queryRef.current)) {
    queryRef.current = immediateQuery;
  }

  useEffect(() => {
    const q = queryRef.current;
    if (!q) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(q);
        const documents = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as T));
        setData(documents);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    if (options.realtime) {
      // Real-time listener
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const documents = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as T));
        setData(documents);
        setError(null);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // One-time fetch
      fetchData();
    }
  }, [queryRef.current, options.realtime]);

  return { data, loading, error };
}

export function useFirestoreDocument<T>(
  collectionName: string,
  documentId: string | null,
  options: UseFirestoreOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!documentId) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, collectionName, documentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData({
            id: docSnap.id,
            ...docSnap.data(),
          } as T);
          setError(null);
        } else {
          setData(null);
          setError(new Error('Document not found'));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (options.realtime) {
      const docRef = doc(db, collectionName, documentId);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setData({
            id: docSnap.id,
            ...docSnap.data(),
          } as T);
          setError(null);
        } else {
          setData(null);
          setError(new Error('Document not found'));
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      fetchData();
    }
  }, [collectionName, documentId, options.realtime]);

  return { data, loading, error };
}
