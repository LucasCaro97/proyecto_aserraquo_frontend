import React from 'react'
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const isTokenExpired = (token) => {
        try {
            const { exp } = jwtDecode(token);
            return Date.now() >= exp * 1000;
        } catch (error) {
            console.error("Error decoding token:", error);
            return true;
        }
    }

    useEffect(() => {
    const token = localStorage.getItem('authToken');
    if(token){
      if(isTokenExpired(token)){
        logout() // Si el token ha expirado limpia la sesion
      }else{
        setIsLoggedIn(true);
        setUser(jwtDecode(token)) //Decodifica y almacena la informacion del usuario
      }
    }
    setIsLoading(false);
  }, []);

    const login = (token) => {
        localStorage.setItem('authToken', token);
        setIsLoggedIn(true);
        setUser(jwtDecode(token)); // Decodifica y almacena la información del usuario
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setIsLoggedIn(false);
        setUser(null); // Limpia la información del usuario  
        navigate('/login')
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout, isLoading}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);
