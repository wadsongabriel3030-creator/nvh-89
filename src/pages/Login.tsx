import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import logoNH from "@/assets/logo-nh-blanco.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast({
        title: "Credenciales inválidas",
        description: "Verifique su correo y contraseña.",
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Bienvenido" });
    navigate("/", { replace: true });
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6"
      style={{ background: "#000000" }}
    >
      <div className="w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2" style={{ background: "#000000" }}>
        {/* Left panel */}
        <div
          className="hidden md:flex flex-col justify-between p-10 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1b3240 0%, #000000 100%)" }}
        >
          <div className="z-10 flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <img
                src={logoNH}
                alt="Nuevos Hechos - La historia continúa"
                className="max-w-[280px] w-full mx-auto drop-shadow-lg"
              />
            </div>
          </div>

          <p className="text-xs z-10" style={{ color: "rgba(254, 254, 252, 0.6)" }}>
            © {new Date().getFullYear()} Nuevos Hechos. Todos los derechos reservados.
          </p>

          {/* Decorative shapes */}
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full" style={{ background: "rgba(254, 254, 252, 0.05)" }} />
          <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full" style={{ background: "rgba(27, 50, 64, 0.6)" }} />
          <div className="absolute top-1/3 right-10 h-24 w-24 rounded-full" style={{ background: "rgba(254, 254, 252, 0.03)" }} />
        </div>

        {/* Right panel - form */}
        <div
          className="p-8 md:p-12 flex flex-col justify-center"
          style={{ background: "#1b3240" }}
        >
          <div className="mb-8">
            <h1 className="text-2xl font-bold" style={{ color: "#fefefc" }}>Iniciar Sesión</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(254, 254, 252, 0.6)" }}>
              Ingrese sus credenciales para acceder a la plataforma.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: "#fefefc" }}>
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@nuevoshechos.com"
                autoComplete="username"
                required
                className="rounded-md px-3 focus-visible:ring-2"
                style={{
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(254, 254, 252, 0.2)",
                  color: "#fefefc",
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: "#fefefc" }}>
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="rounded-md px-3 focus-visible:ring-2"
                style={{
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(254, 254, 252, 0.2)",
                  color: "#fefefc",
                }}
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-xl font-semibold mt-4 transition-all duration-200"
              style={{
                background: "#fefefc",
                color: "#1b3240",
              }}
            >
              {submitting ? "Ingresando..." : "Iniciar Sesión"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
