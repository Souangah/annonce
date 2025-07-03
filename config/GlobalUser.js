import React, { createContext, useState } from 'react';

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [user, setUser] = useState(null); // ou {} si tu veux un objet vide par défaut

  return (
    <GlobalContext.Provider value={[user, setUser]}>
      {children}
    </GlobalContext.Provider>
  );
};
