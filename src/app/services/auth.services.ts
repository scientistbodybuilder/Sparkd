import { auth, firestore } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore"; 


export const userSignUp = async (email: string, password: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // console.log('user created', user);
        // now add them to firestore db
        const docRef = await setDoc(doc(firestore, "users", user.uid), {
            email: user.email,
            createdAt: new Date()
        });
        return { success: true };
    } catch (err) {
        console.error(err);
        return { success: false };
    }
   
};

export const userSignIn = async (email: string, password: string) => {
   return signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // console.log('user signed in', userCredential.user);
        return { success: true };
      })
      .catch((error) => {
        console.error(error);
        return { success: false };
      });
  }
