'use client';
import React, { createContext, useContext } from 'react';
import type { Firestore } from 'firebase/firestore';

type FirebaseContextValue = {
  firestore: Firestore | null;
};

const FirebaseContext = createContext<FirebaseContextValue>({
  firestore: null,
});

export function FirebaseProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: FirebaseContextValue;
}) {
  return (
    <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
  );
}

export const useFirestore = () => useContext(FirebaseContext)?.firestore;
