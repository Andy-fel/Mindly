import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const getUserSettings = async (userId) => {
    try {
        const docRef = doc(db, 'userSettings', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return {
                trustedContact: null,
                emergencyLine: "106",
                voicePersona: "Calm",
                frequency: 3,
                notifications: { push: true, weekly: true, quiet: false }
            };
        }
    } catch (error) {
        console.error("Error getting user settings:", error);
        throw error;
    }
};

export const saveUserSettings = async (userId, settings) => {
    try {
        const docRef = doc(db, 'userSettings', userId);
        await setDoc(docRef, settings, { merge: true });
        console.log("Settings saved successfully.");
    } catch (error) {
        console.error("Error saving user settings:", error);
        throw error;
    }
};
