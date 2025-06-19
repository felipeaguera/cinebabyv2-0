
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogOut, Plus, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Clinic {
  id: number;
  name: string;
  address: string;
  city: string;
  email: string;
  password: string;
  createdAt: string;
}

const AdminDashboard = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isAddingClinic, setIsAddingClinic] = useState(false);
  const [newClinic, setNewClinic] = useState({
    name: "",
    address: "",
    city: "",
    email: "",
    password: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se está logado como admin
    const isAdmin = localStorage.getItem("cinebaby_admin");
    if (!isAdmin) {
      navigate("/admin/login");
      return;
    }

    // Carregar clínicas do localStorage (será substituído pela integração Supabase)
    const storedClinics = localStorage.getItem("cinebaby_clinics");
    if (storedClinics) {
      setClinics(JSON.parse(storedClinics));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("cinebaby_admin");
    navigate("/");
  };

  const handleAddClinic = () => {
    if (!newClinic.name || !newClinic.address || !newClinic.city || !newClinic.email || !newClinic.password) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const clinic: Clinic = {
      id: Date.now(),
      ...newClinic,
      createdAt: new Date().toISOString()
    };

    const updatedClinics = [...clinics, clinic];
    setClinics(updatedClinics);
    localStorage.setItem("cinebaby_clinics", JSON.stringify(updatedClinics));

    setNewClinic({ name: "", address: "", city: "", email: "", password: "" });
    setIsAddingClinic(false);

    toast({
      title: "Clínica cadastrada!",
      description: `${clinic.name} foi cadastrada com sucesso.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/4d8583ce-0aed-4b79-aa55-3c03b32e9c88.png" 
                alt="CineBaby Logo" 
                className="h-8 w-auto"
              />
              <h1 className="text-2xl font-bold text-purple-800">Painel Administrativo</h1>
            </div>
            <Button variant="outline" onClick={handleLogout} className="text-purple-600 border-purple-200">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Clínicas Cadastradas</h2>
              <p className="text-gray-600 mt-1">Gerencie as clínicas da plataforma</p>
            </div>
            <Dialog open={isAddingClinic} onOpenChange={setIsAddingClinic}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Clínica
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Cadastrar Nova Clínica</DialogTitle>
                  <DialogDescription>
                    Preencha os dados da nova clínica
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Clínica</Label>
                    <Input
                      id="name"
                      value={newClinic.name}
                      onChange={(e) => setNewClinic({ ...newClinic, name: e.target.value })}
                      placeholder="Ex: Clínica São João"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={newClinic.address}
                      onChange={(e) => setNewClinic({ ...newClinic, address: e.target.value })}
                      placeholder="Ex: Rua das Flores, 123"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={newClinic.city}
                      onChange={(e) => setNewClinic({ ...newClinic, city: e.target.value })}
                      placeholder="Ex: São Paulo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email de Login</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newClinic.email}
                      onChange={(e) => setNewClinic({ ...newClinic, email: e.target.value })}
                      placeholder="clinica@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newClinic.password}
                      onChange={(e) => setNewClinic({ ...newClinic, password: e.target.value })}
                      placeholder="Senha de acesso"
                    />
                  </div>
                  <Button onClick={handleAddClinic} className="w-full bg-purple-600 hover:bg-purple-700">
                    Cadastrar Clínica
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-purple-600" />
              Lista de Clínicas
            </CardTitle>
            <CardDescription>
              {clinics.length} clínica{clinics.length !== 1 ? 's' : ''} cadastrada{clinics.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clinics.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma clínica cadastrada ainda.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clinics.map((clinic) => (
                    <TableRow key={clinic.id}>
                      <TableCell className="font-medium">{clinic.name}</TableCell>
                      <TableCell>{clinic.city}</TableCell>
                      <TableCell>{clinic.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Ativa
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
