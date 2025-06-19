
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Building2, Shield, Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen cinebaby-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
              <img 
                src="/lovable-uploads/4d8583ce-0aed-4b79-aa55-3c03b32e9c88.png" 
                alt="CineBaby Logo" 
                className="h-16 w-auto"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">CineBaby</h1>
          <p className="text-white/90 text-lg font-medium">Momentos mágicos em suas mãos</p>
          <div className="flex items-center justify-center mt-4 text-white/80">
            <Sparkles className="h-4 w-4 mr-2" />
            <span className="text-sm">Tecnologia que conecta corações</span>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="cinebaby-card hover:scale-105 transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-purple-800 text-xl">Administrador</CardTitle>
              <CardDescription className="text-gray-600">Acesso para administração geral da plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full cinebaby-button-primary text-lg py-6 rounded-xl font-semibold">
                <Link to="/admin/login">Entrar como Admin</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="cinebaby-card hover:scale-105 transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-teal-800 text-xl">Clínica</CardTitle>
              <CardDescription className="text-gray-600">Acesso para clínicas cadastradas no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full cinebaby-button-secondary text-lg py-6 rounded-xl font-semibold">
                <Link to="/clinic/login">Entrar como Clínica</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-white/70 text-sm italic">
            "Reviva esse momento mágico sempre que quiser"
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
