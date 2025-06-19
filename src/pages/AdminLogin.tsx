
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Verificar credenciais fixas do admin
    if (email === "admin@cinebaby.online" && password === "admin123") {
      localStorage.setItem("cinebaby_admin", "true");
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao painel administrativo.",
      });
      navigate("/admin/dashboard");
    } else {
      toast({
        title: "Erro no login",
        description: "Email ou senha incorretos.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen cinebaby-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="mb-8">
          <Button variant="ghost" asChild className="text-white hover:text-white hover:bg-white/20 backdrop-blur-sm border border-white/20">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>

        <Card className="cinebaby-card border-0 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
              <img 
                src="/lovable-uploads/0f255407-3789-418f-8a06-69187f941576.png" 
                alt="CineBaby Logo" 
                className="h-16 w-auto"
              />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Admin Login
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 mt-2">
              Acesse o painel administrativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-gray-700 font-semibold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@cinebaby.online"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-2 border-purple-100 focus:border-purple-400 rounded-xl"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="password" className="text-gray-700 font-semibold">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 border-2 border-purple-100 focus:border-purple-400 rounded-xl"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 cinebaby-button-primary text-lg font-semibold rounded-xl"
                disabled={isLoading}
              >
                <Shield className="h-5 w-5 mr-2" />
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            
            <div className="mt-6 text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-purple-600 font-medium">
                Para demonstração:
              </p>
              <p className="text-xs text-purple-500 mt-1">
                Email: admin@cinebaby.online<br />
                Senha: admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
