
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Building2, Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img 
            src="/lovable-uploads/4d8583ce-0aed-4b79-aa55-3c03b32e9c88.png" 
            alt="CineBaby Logo" 
            className="mx-auto h-24 w-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CineBaby</h1>
          <p className="text-gray-600">Momentos mágicos em suas mãos</p>
        </div>

        <div className="space-y-4">
          <Card className="border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-purple-800">Administrador</CardTitle>
              <CardDescription>Acesso para administração geral</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                <Link to="/admin/login">Entrar como Admin</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-pink-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-3">
                <Building2 className="h-6 w-6 text-pink-600" />
              </div>
              <CardTitle className="text-pink-800">Clínica</CardTitle>
              <CardDescription>Acesso para clínicas cadastradas</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-pink-600 hover:bg-pink-700">
                <Link to="/clinic/login">Entrar como Clínica</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
