// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: 'AIzaSyBp3OJFH_2xjpuiqlKBvkNT4tBUMJBfOnU',
	authDomain: 'codak-8c425.firebaseapp.com',
	projectId: 'codak-8c425',
	storageBucket: 'codak-8c425.firebasestorage.app',
	messagingSenderId: '297701886415',
	appId: '1:297701886415:web:67cf26a853d51dd5632aba',
	measurementId: 'G-5WMJLXPNLD'
};

// Prevent re-initialization in dev/hot-reload
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
