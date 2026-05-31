import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import logoNH from "@/assets/logo-nh.png";

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
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-5xl bg-card rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">
        {/* Left panel */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-primary to-accent text-primary-foreground relative overflow-hidden">
          <div className="z-10 flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <img
                src={logoNH}
                alt="Nuevos Hechos - La historia continúa"
                className="max-w-[280px] w-full mx-auto drop-shadow-lg"
              />
            </div>
          </div>

          <p className="text-xs text-primary-foreground/70 z-10">
            © {new Date().getFullYear()} Nuevos Hechos. Todos los derechos reservados.
          </p>

          {/* Decorative shapes */}
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-accent/40" />
          <div className="absolute top-1/3 right-10 h-24 w-24 rounded-full bg-warning/30" />
        </div>

        {/* Right panel - form */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-card">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Iniciar Sesión</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ingrese sus credenciales para acceder a la plataforma.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
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
                className="rounded-md border border-border focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary px-3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
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
                className="rounded-md border border-border focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary px-3"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-4"
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
