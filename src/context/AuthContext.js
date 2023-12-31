import React from 'react';
import { useEffect, useState } from "react";
import { auth } from '../configuration/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { db } from '../configuration/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const AuthContext = React.createContext()

export const AuthProvider = ({ children }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentRole, setCurrentRole] = useState("");
  const [currentUsersEmail, setCurrentUsersEmail] = useState("");

  const navigate = useNavigate();

  const adminUID = "JpOR5ShTBRf4x7zUTr8u8j5VR8Z2";
  const orgAUID = "";
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setCurrentUsersEmail(user?.email)
      checkIfAdmin(user);
      getCurrentRole(user);
    });
    if(isAdmin){
      setIsAdmin(true);
    }

    return () => unsubscribe();
  }, []);

  const checkIfAdmin = async(user) => {
    try {
      const docRef = doc(db, "users", user.uid)
      const docSnap = await getDoc(docRef)
      docSnap.data().roles[0] === "admin" ? setIsAdmin(true) : setIsAdmin(false)
    }catch(e){
      // ignoring some errors
      // it will console log saying user is undefined
    }
  }

  const getCurrentRole = async(user) => {
    try {
      const docRef = doc(db, "users", user.uid)
      const docSnap = await getDoc(docRef)
      setCurrentRole(docSnap.data().roles[0])
    }catch(e){
      // ignoring some errors
      // it will console log saying user is undefined
    }
  }

  const logout = async () => {
    try {
        await signOut(auth);
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setIsAdmin(false)
    } catch (err) {
        console.error(err);
    }
};

  const logoutButton = () => {
    logout();
    setCurrentRole("");
    setCurrentUsersEmail("");
    navigate("/login");
  }

  const authValue = {
    email: [email, setEmail],
    password: [password, setPassword],
    user: [user, setUser],
    isAdmin: [isAdmin, setIsAdmin],
    currentRole: [currentRole, setCurrentRole],
    currentUsersEmail: [currentUsersEmail, setCurrentUsersEmail],
    logoutButton: logoutButton,
  }
  return (
    <div>
      <AuthContext.Provider value={authValue}>
        {children}
      </AuthContext.Provider>
    </div>
  )
};

