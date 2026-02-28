// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // ✅ load saved user from localStorage (persist login)
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // ✅ keep localStorage in sync with state
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // ✅ Login function
  const login = async (email, password, role) => {
    try {
      let url = "";
      let body = {};

      if (role === "admin") {
        url = "http://localhost:8888/api/auth/admin/login";
        body = { email, password };
      } else if (role === "member") {
        url = "http://localhost:8888/api/auth/member/login";
        body = { flatId: email, password }; // for members, login via flatNo
      } else {
        return false;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log("Login API Response:", data);

      if (response.ok && data.status === "success") {
        // ✅ if backend returns admin or member object
        const loggedUser = data.admin || data.user;
        
        if (loggedUser) {
          setUser({ ...loggedUser, role }); // store entire object
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // ✅ Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
