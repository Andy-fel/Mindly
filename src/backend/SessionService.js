import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const SESSIONS_COLLECTION = 'sessions';

export const saveSession = async (userId, sessionData) => {
    try {
        const docRef = await addDoc(collection(db, SESSIONS_COLLECTION), {
            userId,
            ...sessionData,
            createdAt: new Date()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error saving session to Firebase:", error);
        throw error;
    }
};

export const getUserSessions = async (userId) => {
    try {
        const q = query(
            collection(db, SESSIONS_COLLECTION),
            where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        const sessions = [];
        querySnapshot.forEach((doc) => {
            sessions.push({ id: doc.id, ...doc.data() });
        });
        
        // Ordenar localmente para evitar error de índice compuesto en Firebase
        sessions.sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return b.createdAt.toMillis() - a.createdAt.toMillis();
        });
        
        return sessions;
    } catch (error) {
        console.error("Error fetching sessions from Firebase:", error);
        throw error;
    }
};
