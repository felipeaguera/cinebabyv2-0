
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ClinicLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulação de login (será substituído pela integração Supabase)
    const mockClinics = [
      { id: 1, name: "Clínica Exemplo", email: "clinica@exemplo.com", password: "123456" }
    ];

    const clinic = mockClinics.find(c => c.email === email && c.password === password);
    
    if (clinic) {
      localStorage.setItem("cinebaby_clinic", JSON.stringify(clinic));
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vinda, ${clinic.name}!`,
      });
      navigate("/clinic/dashboard");
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
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
              <div className="mx-auto w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="h-7 w-7 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent">
              Clínica Login
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 mt-2">
              Acesse o painel da sua clínica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-gray-700 font-semibold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="clinica@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-2 border-teal-100 focus:border-teal-400 rounded-xl"
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
                  className="h-12 border-2 border-teal-100 focus:border-teal-400 rounded-xl"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 cinebaby-button-secondary text-lg font-semibold rounded-xl"
                disabled={isLoading}
              >
                <Building2 className="h-5 w-5 mr-2" />
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            
            <div className="mt-6 text-center p-4 bg-teal-50 rounded-xl">
              <p className="text-sm text-teal-600 font-medium">
                Para demonstração:
              </p>
              <p className="text-xs text-teal-500 mt-1">
                Email: clinica@exemplo.com<br />
                Senha: 123456
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClinicLogin;
