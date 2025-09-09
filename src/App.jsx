import './App.css'
import { Routes, Route, Router } from 'react-router-dom';
import { HomePage, LoginPage, AboutPage, ContactPage, Dashboard, IngresoRollosPage, TablaRollos, IngresosFuturosForm, IngresosFuturosTable } from './pages';
import { Header } from './components/Header';
import { AuthProvider } from './components/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Footer } from './components/Footer';

function App() {

  return (
    <>
        <AuthProvider>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Ruta privada, solo accesible para usuarios logueados */}
            <Route path='/dashboard' element={
              <PrivateRoute>
                <Dashboard/>
              </PrivateRoute>
              }/>

              <Route path='/ingreso-rollos' element={
              <PrivateRoute>
                <IngresoRollosPage/>
              </PrivateRoute>
              }/>

              <Route path='/visualizar-ingreso-rollos' element={
              <PrivateRoute>
                <TablaRollos/>
              </PrivateRoute>
              }/>

              <Route path='/ingresos-futuros' element={
              <PrivateRoute>
                <IngresosFuturosForm/>
              </PrivateRoute>
              }/>

              <Route path='/visualizar-ingresos-futuros' element={
              <PrivateRoute>
                <IngresosFuturosTable/>
              </PrivateRoute>
              }/>
          </Routes>
          <Footer />
        </AuthProvider>
    </>
  )
}

export default App
