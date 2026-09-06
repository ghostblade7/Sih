import {initializeApp} from 'firebase/app'
import {getAuth,browserLocalPersistence,setPersistence} from 'firebase/auth'
import {getFirestore} from 'firebase/firestore'

const firebaseConfig={
 apiKey:import.meta.env.VITE_FIREBASE_API_KEY||'AIzaSyCeuizWkJRvp2_iOxD4UOFL12Os2k0KybQ',
 authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN||'living-india-7f73b.firebaseapp.com',
 projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID||'living-india-7f73b',
 storageBucket:import.meta.env.VITE_FIREBASE_STORAGE_BUCKET||'living-india-7f73b.firebasestorage.app',
 messagingSenderId:import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID||'439601825953',
 appId:import.meta.env.VITE_FIREBASE_APP_ID||'1:439601825953:web:cc38c29d819b86de03c8e0',
 measurementId:import.meta.env.VITE_FIREBASE_MEASUREMENT_ID||'G-N76WYJXS7K'
}
const app=initializeApp(firebaseConfig)
export const auth=getAuth(app)
export const db=getFirestore(app)
setPersistence(auth,browserLocalPersistence).catch(()=>{})
export default app
