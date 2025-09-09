import React from 'react'
import { useState } from 'react';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';


export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL;

  const { login } = useAuth();
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // 1. Validación manual
    if (!username || !password) {
      setError('Por favor, ingresa tu usuario y contraseña.');
      setIsLoading(false);
      return; // Detiene el flujo si los campos están vacíos
    }

    // 2. Si la validación pasa, continúa con la petición a Axios
    try {
      const response = await axios.post(`${apiUrl}/auth/login`, {
        username,
        password
      });

      if (response.data.status) {
        login(response.data.jwt);
        navigate('/dashboard');
      }
    } catch (error) {
      setError('Error de autenticación. Por favor, verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }


  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="-mt-16 min-h-screen flex">
      {/* Lado izquierdo - Imagen de fondo */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="w-full h-screen relative overflow-hidden flex items-center justify-center">
          <img
            src="src/assets/loginImage.avif"
            alt="SistemasQUO Background"
            className="w-full object-cover object-center"
          />
          {/* Overlay oscuro para mejor legibilidad */}
          <div className="absolute inset-0 bg-black/40"></div>

          {/* Logo y texto superpuesto */}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-8">
            <h2 className="text-3xl font-bold text-center mb-4">
              Gestión Optimizada para Aserraderos
            </h2>
            <p className="text-lg text-center text-gray-200">
              Simplifica, optimiza y ahorra con nuestro sistema integral
            </p>
          </div>
        </div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          

          {/* Título del formulario */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Iniciar Sesión
            </h1>
            <p className="text-gray-600">
              Accede a tu cuenta para continuar
            </p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Formulario */}
          <div className="space-y-6">
            {/* Campo Usuario */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ingresa tu usuario"
                  required
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ingresa tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Opción "Recordarme" */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="hidden h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="hidden ml-2 text-sm text-gray-700">
                  Recordarme
                </label>
              </div>
              <a href="#" className="hidden text-sm text-blue-600 hover:text-blue-800">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón de iniciar sesión */}
            <button
              onClick={handleSubmit}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Iniciar Sesión
            </button>
          </div>

          {/* Enlaces adicionales */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                Contacta con soporte
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
