import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
const KEY = 'ts-mode-auth';

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { token: null, user: null };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readSaved);

  function saveSession({ token, user }) {
    const next = { token, user };
    localStorage.setItem(KEY, JSON.stringify(next));
    setAuth(next);
  }

  function updateUser(patch) {
    saveSession({ token: auth.token, user: { ...auth.user, ...patch } });
  }

  function logout() {
    localStorage.removeItem(KEY);
    setAuth({ token: null, user: null });
  }

  return (
    <AuthContext.Provider value={{ ...auth, saveSession, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
