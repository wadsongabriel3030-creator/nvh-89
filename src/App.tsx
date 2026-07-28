import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TagsProvider } from "./contexts/TagsContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import { MembersProvider } from "./contexts/MembersContext";
import { TestimoniesProvider } from "./contexts/TestimoniesContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Tags from "./pages/Tags";
import Events from "./pages/Events";
import PLC from "./pages/PLC";
import ReportePLC from "./pages/ReportePLC";
import ResumenPLC from "./pages/ResumenPLC";
import NuevosComienzos from "./pages/NuevosComienzos";
import ReporteMembresia from "./pages/ReporteMembresia";

import CreenciasBasicas from "./pages/CreenciasBasicas";
import Batismos from "./pages/Batismos";
import BaptismRegistration from "./pages/BaptismRegistration";
import Discipleship from "./pages/Discipleship";
import Cursos from "./pages/Cursos";
import ReporteDiscipulado from "./pages/ReporteDiscipulado";
import ReunionesDiscipuladores from "./pages/ReunionesDiscipuladores";
import GuiaReunionDiscipulado from "./pages/GuiaReunionDiscipulado";
import ProcesoDiscipular from "./pages/ProcesoDiscipular";
import ListadoLideres from "./pages/ListadoLideres";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import PrayerGuide from "./pages/PrayerGuide";
import Tithes from "./pages/Tithes";
import RegistroDiezmos from "./pages/RegistroDiezmos";
import ReciboDonacion from "./pages/ReciboDonacion";
import Testimonies from "./pages/Testimonies";
import TestimonyRegistration from "./pages/TestimonyRegistration";
import ReporteDominical from "./pages/ReporteDominical";
import InscripcionEvento from "./pages/InscripcionEvento";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import CalendarTaskPage from "./pages/CalendarTaskPage";
import SecretoDeDaniel from "./pages/SecretoDeDaniel";
import Oracion247 from "./pages/Oracion247";
import CuartoDeGuerra from "./pages/CuartoDeGuerra";
import InscripcionVidaNuevos from "./pages/InscripcionVidaNuevos";
import CompromisoVNH from "./pages/CompromisoVNH";
import PrimerosPassos from "./pages/PrimerosPassos";
import InscripcionPrimerosPassos from "./pages/InscripcionPrimerosPassos";
import ReportePasosFirmes from "./pages/ReportePasosFirmes";

import CursoVidaEnLibertad from "./pages/CursoVidaEnLibertad";
import RetiroVidaEnLibertad from "./pages/RetiroVidaEnLibertad";
import InscripcionRetiroVidaLibertad from "./pages/InscripcionRetiroVidaLibertad";
import Discipulador from "./pages/Discipulador";
import Recursos from "./pages/reunion-dominical/Recursos";
import Programa from "./pages/reunion-dominical/Programa";
import FrasesInstitucionales from "./pages/reunion-dominical/FrasesInstitucionales";
import Versiculos from "./pages/reunion-dominical/Versiculos";
import Anuncios from "./pages/reunion-dominical/Anuncios";
import ReporteDominicalSubpage from "./pages/reunion-dominical/ReporteDominicalSubpage";

const queryClient = new QueryClient();

const P = ({ children }: { children: JSX.Element }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <AuthProvider>
    <ProfileProvider>
    <TagsProvider>
      <MembersProvider>
        <TestimoniesProvider>
        <SidebarProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/inscripcion-bautismo" element={<BaptismRegistration />} />
                <Route path="/inscripcion-testimonio" element={<TestimonyRegistration />} />
                <Route path="/inscripcion-evento/:eventSlug" element={<InscripcionEvento />} />
                <Route path="/inscripcion-vida-nuevos" element={<InscripcionVidaNuevos />} />
                <Route path="/inscripcion-primeros-pasos" element={<InscripcionPrimerosPassos />} />
                <Route path="/inscripcion-retiro-vida-libertad" element={<InscripcionRetiroVidaLibertad />} />

                {/* Protected routes */}
                <Route path="/" element={<P><Dashboard /></P>} />
                <Route path="/members" element={<P><Members /></P>} />
                <Route path="/tags" element={<P><Tags /></P>} />
                <Route path="/events" element={<P><Events /></P>} />
                <Route path="/plc" element={<P><PLC /></P>} />
                <Route path="/resumen-plc" element={<P><ResumenPLC /></P>} />
                <Route path="/reporte-plc" element={<P><ReportePLC /></P>} />
                <Route path="/membresia" element={<P><NuevosComienzos /></P>} />
                <Route path="/reporte-membresia" element={<P><ReporteMembresia /></P>} />
                <Route path="/creencias-basicas" element={<P><CreenciasBasicas /></P>} />
                <Route path="/batismos" element={<P><Batismos /></P>} />
                <Route path="/discipleship" element={<P><Discipleship /></P>} />
                <Route path="/cursos" element={<P><Cursos /></P>} />
                <Route path="/reporte-discipulado" element={<P><ReporteDiscipulado /></P>} />
                <Route path="/listado-lideres" element={<P><ListadoLideres /></P>} />
                <Route path="/reuniones-discipuladores" element={<P><ReunionesDiscipuladores /></P>} />
                <Route path="/guia-reunion-discipulado" element={<P><GuiaReunionDiscipulado /></P>} />
                <Route path="/proceso-discipular" element={<P><ProcesoDiscipular /></P>} />
                <Route path="/prayer-guide" element={<P><PrayerGuide /></P>} />
                <Route path="/secreto-de-daniel" element={<P><SecretoDeDaniel /></P>} />
                <Route path="/oracion-247" element={<P><Oracion247 /></P>} />
                <Route path="/cuarto-de-guerra" element={<P><CuartoDeGuerra /></P>} />
                <Route path="/tithes" element={<P><Tithes /></P>} />
                <Route path="/registro-diezmos" element={<P><RegistroDiezmos /></P>} />
                <Route path="/recibo-donacion" element={<P><ReciboDonacion /></P>} />
                <Route path="/testimonies" element={<P><Testimonies /></P>} />
                <Route path="/reporte-dominical" element={<P><ReporteDominical /></P>} />
                <Route path="/reports" element={<P><Reports /></P>} />
                <Route path="/settings" element={<P><Settings /></P>} />
                <Route path="/reunion-dominical/recursos" element={<P><Recursos /></P>} />
                <Route path="/reunion-dominical/programa" element={<P><Programa /></P>} />
                <Route path="/reunion-dominical/frases" element={<P><FrasesInstitucionales /></P>} />
                <Route path="/reunion-dominical/versiculos" element={<P><Versiculos /></P>} />
                <Route path="/reunion-dominical/anuncios" element={<P><Anuncios /></P>} />
                <Route path="/reunion-dominical/reporte-dominical" element={<P><ReporteDominicalSubpage /></P>} />
                <Route path="/compromiso-vnh" element={<P><CompromisoVNH /></P>} />
                <Route path="/primeros-pasos" element={<P><PrimerosPassos /></P>} />
                <Route path="/reporte-pasos-firmes/:cursoId" element={<P><ReportePasosFirmes /></P>} />

                <Route path="/curso-vida-libertad" element={<P><CursoVidaEnLibertad /></P>} />
                <Route path="/retiro-vida-libertad" element={<P><RetiroVidaEnLibertad /></P>} />
                <Route path="/calendar-2026" element={<P><CalendarTaskPage /></P>} />
                <Route path="/discipulador" element={<P><Discipulador /></P>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SidebarProvider>
        </TestimoniesProvider>
      </MembersProvider>
    </TagsProvider>
    </ProfileProvider>
    </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
