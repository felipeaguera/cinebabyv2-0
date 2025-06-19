
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Button variant="ghost" asChild className="text-pink-600 hover:text-pink-700">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>

        <Card className="border-pink-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-3">
              <Building2 className="h-6 w-6 text-pink-600" />
            </div>
            <CardTitle className="text-pink-800">Login Clínica</CardTitle>
            <CardDescription>Acesse o painel da sua clínica</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="clinica@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-pink-600 hover:bg-pink-700"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            <div className="mt-4 text-sm text-gray-600 text-center">
              Para fins de demonstração, use:<br />
              Email: clinica@exemplo.com<br />
              Senha: 123456
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClinicLogin;
