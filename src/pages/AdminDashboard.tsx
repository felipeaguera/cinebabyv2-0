import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogOut, Plus, Building2, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import EditClinicDialog from "@/components/EditClinicDialog";

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
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
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
    const isAdmin = localStorage.getItem("cinebaby_admin");
    if (!isAdmin) {
      navigate("/admin/login");
      return;
    }

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

  const handleEditClinic = (updatedClinic: Clinic) => {
    const updatedClinics = clinics.map(clinic => 
      clinic.id === updatedClinic.id ? updatedClinic : clinic
    );
    setClinics(updatedClinics);
    localStorage.setItem("cinebaby_clinics", JSON.stringify(updatedClinics));
    setEditingClinic(null);
  };

  const handleDeleteClinic = (clinicId: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta clínica? Esta ação não pode ser desfeita.")) {
      const updatedClinics = clinics.filter(clinic => clinic.id !== clinicId);
      setClinics(updatedClinics);
      localStorage.setItem("cinebaby_clinics", JSON.stringify(updatedClinics));
      
      // Remove também os dados da clínica
      localStorage.removeItem(`cinebaby_patients_${clinicId}`);
      
      toast({
        title: "Clínica excluída",
        description: "A clínica foi removida com sucesso.",
      });
    }
  };

  return (
    <div className="min-h-screen cinebaby-gradient">
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                <img 
                  src="/lovable-uploads/4d8583ce-0aed-4b79-aa55-3c03b32e9c88.png" 
                  alt="CineBaby Logo" 
                  className="h-10 w-auto"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">Painel Administrativo</h1>
                <p className="text-white/80 font-medium">CineBaby Platform</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm">
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
              <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Clínicas Cadastradas</h2>
              <p className="text-white/80 text-lg">Gerencie as clínicas da plataforma</p>
            </div>
            <Dialog open={isAddingClinic} onOpenChange={setIsAddingClinic}>
              <DialogTrigger asChild>
                <Button className="cinebaby-button-primary text-lg px-6 py-3 rounded-xl">
                  <Plus className="h-5 w-5 mr-2" />
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
                  <Button onClick={handleAddClinic} className="w-full cinebaby-button-primary">
                    Cadastrar Clínica
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="cinebaby-card">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-800">
              <Building2 className="h-6 w-6 mr-3 text-purple-600" />
              Lista de Clínicas
            </CardTitle>
            <CardDescription className="text-lg">
              {clinics.length} clínica{clinics.length !== 1 ? 's' : ''} cadastrada{clinics.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clinics.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl mb-2">Nenhuma clínica cadastrada ainda</p>
                <p>Comece cadastrando sua primeira clínica</p>
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-purple-50 to-teal-50">
                      <TableHead className="font-semibold">Nome</TableHead>
                      <TableHead className="font-semibold">Cidade</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clinics.map((clinic) => (
                      <TableRow key={clinic.id} className="hover:bg-purple-50/50 transition-colors">
                        <TableCell className="font-medium">{clinic.name}</TableCell>
                        <TableCell>{clinic.city}</TableCell>
                        <TableCell>{clinic.email}</TableCell>
                        <TableCell>
                          <Badge className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300">
                            Ativa
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingClinic(clinic)}
                              className="hover:bg-purple-50 hover:border-purple-300"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClinic(clinic.id)}
                              className="hover:bg-red-50 hover:border-red-300 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {editingClinic && (
        <EditClinicDialog
          clinic={editingClinic}
          isOpen={!!editingClinic}
          onClose={() => setEditingClinic(null)}
          onSave={handleEditClinic}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
