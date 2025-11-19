import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD-mKaL8s2-s33ytnlfDI87HJa1SLNkW7Y",
  authDomain: "bubt-2c983.firebaseapp.com",
  projectId: "bubt-2c983",
  storageBucket: "bubt-2c983.appspot.com",
  messagingSenderId: "3429281960",
  appId: "1:3429281960:web:2aa327d61f11136d15929d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdmin() {
  try {
    console.log('Creating admin account...');
    
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      'admin@bubt.edu', 
      'admin1234'
    );
    
    console.log('Admin user created with UID:', userCredential.user.uid);
    
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      id: userCredential.user.uid,
      name: 'Administrator',
      email: 'admin@bubt.edu',
      role: 'admin',
      approved: true,
      createdAt: new Date().toISOString(),
    });
    
    console.log('Admin profile created successfully!');
    console.log('You can now login with:');
    console.log('Email: admin@bubt.edu');
    console.log('Password: admin1234');
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin account already exists!');
      console.log('Email: admin@bubt.edu');
      console.log('Password: admin1234');
    } else {
      console.error('Error creating admin:', error.message);
    }
    process.exit(1);
  }
}

createAdmin();
