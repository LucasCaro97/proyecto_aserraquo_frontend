import "./App.css";
import { Routes, Route, Router } from "react-router-dom";
import {
  HomePage,
  LoginPage,
  AboutPage,
  ContactPage,
  Dashboard,
  IngresoRollosPage,
  TablaRollos,
  IngresosFuturosForm,
  IngresosFuturosTable,
  BancosForm,
  BancosTable,
  IngresosForm,
  IngresosTable,
  EgresosForm,
  EgresosTable,
  EgresosFuturosForm,
  EgresosFuturosTable,
  RetiroSociosForm,
  RetiroSociosTable,
  HistorialBancarioForm,
  HistorialBancarioTable,
  AdminDashboard,
  ChequesForm,
  ChequesTable
} from "./pages";
import { Header } from "./components/Header";
import { AuthProvider } from "./components/AuthContext";
import { PrivateRoute } from "./components/PrivateRoute";
import { Footer } from "./components/Footer";

function App() {
  return (
    <>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Ruta privada, solo accesible para usuarios logueados */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/ingreso-rollos"
            element={
              <PrivateRoute>
                <IngresoRollosPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/visualizar-ingreso-rollos"
            element={
              <PrivateRoute>
                <TablaRollos />
              </PrivateRoute>
            }
          />

          <Route
            path="/ingresos-futuros"
            element={
              <PrivateRoute>
                <IngresosFuturosForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/visualizar-ingresos-futuros"
            element={
              <PrivateRoute>
                <IngresosFuturosTable />
              </PrivateRoute>
            }
          />

          <Route
            path="/bancos"
            element={
              <PrivateRoute>
                <BancosForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/visualizar-bancos"
            element={
              <PrivateRoute>
                <BancosTable />
              </PrivateRoute>
            }
          />

          <Route
            path="/ingresos"
            element={
              <PrivateRoute>
                <IngresosForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/visualizar-ingresos"
            element={
              <PrivateRoute>
                <IngresosTable />
              </PrivateRoute>
            }
          />

          <Route
            path="/egresos"
            element={
              <PrivateRoute>
                <EgresosForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/visualizar-egresos"
            element={
              <PrivateRoute>
                <EgresosTable />
              </PrivateRoute>
            }
          />

          <Route
            path="/egresos-futuros"
            element={
              <PrivateRoute>
                <EgresosFuturosForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/visualizar-egresos-futuros"
            element={
              <PrivateRoute>
                <EgresosFuturosTable />
              </PrivateRoute>
            }
          />

          <Route
            path="/retiro-socios"
            element={
              <PrivateRoute>
                <RetiroSociosForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/visualizar-retiro-socios"
            element={
              <PrivateRoute>
                <RetiroSociosTable />
              </PrivateRoute>
            }
          />

          <Route
            path="/historial-bancario"
            element={
              <PrivateRoute>
                <HistorialBancarioForm />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/visualizar-historial-bancario"
            element={
              <PrivateRoute>
                <HistorialBancarioTable />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/cheques"
            element={
              <PrivateRoute>
                <ChequesForm />
              </PrivateRoute>
            }
          />

          <Route path="/cheques/:chequeId" element={<ChequesForm />} /> 

          <Route
            path="/cheques/visualizar"
            element={
              <PrivateRoute>
                <ChequesTable />
              </PrivateRoute>
            }
          />
        </Routes>
        </main>
        </div>
      </AuthProvider>
    </>
  );
}

export default App;
