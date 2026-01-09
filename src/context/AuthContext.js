"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { auth } from "../lib/firebase";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signup = (email, password) => {
        if (!auth) throw new Error("Authentication not configured");
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const login = (email, password) => {
        if (!auth) throw new Error("Authentication not configured");
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        if (!auth) throw new Error("Authentication not configured");
        return signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
