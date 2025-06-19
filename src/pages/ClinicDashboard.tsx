
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogOut, Plus, Search, Users, Eye } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Patient {
  id: number;
  name: string;
  phone: string;
  clinicId: number;
  createdAt: string;
  videosCount: number;
}

interface Clinic {
  id: number;
  name: string;
  address: string;
  city: string;
  email: string;
}

const ClinicDashboard = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    phone: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se está logado como clínica
    const clinicData = localStorage.getItem("cinebaby_clinic");
    if (!clinicData) {
      navigate("/clinic/login");
      return;
    }

    const parsedClinic = JSON.parse(clinicData);
    setClinic(parsedClinic);

    // Carregar pacientes da clínica
    const storedPatients = localStorage.getItem(`cinebaby_patients_${parsedClinic.id}`);
    if (storedPatients) {
      const patientsData = JSON.parse(storedPatients);
      setPatients(patientsData);
      setFilteredPatients(patientsData);
    }
  }, [navigate]);

  useEffect(() => {
    // Filtrar pacientes baseado na busca
    const filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const handleLogout = () => {
    localStorage.removeItem("cinebaby_clinic");
    navigate("/");
  };

  const handleAddPatient = () => {
    if (!newPatient.name || !newPatient.phone) {
      toast({
        title: "Erro",
        description: "Nome e telefone são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (!clinic) return;

    const patient: Patient = {
      id: Date.now(),
      name: newPatient.name,
      phone: newPatient.phone,
      clinicId: clinic.id,
      createdAt: new Date().toISOString(),
      videosCount: 0
    };

    const updatedPatients = [...patients, patient];
    setPatients(updatedPatients);
    localStorage.setItem(`cinebaby_patients_${clinic.id}`, JSON.stringify(updatedPatients));

    setNewPatient({ name: "", phone: "" });
    setIsAddingPatient(false);

    toast({
      title: "Paciente cadastrada!",
      description: `${patient.name} foi cadastrada com sucesso.`,
    });
  };

  if (!clinic) {
    return <div>Carregando...</div>;
  }

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
              <div>
                <h1 className="text-2xl font-bold text-pink-800">{clinic.name}</h1>
                <p className="text-sm text-gray-600">{clinic.city}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="text-pink-600 border-pink-200">
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
              <h2 className="text-3xl font-bold text-gray-900">Pacientes</h2>
              <p className="text-gray-600 mt-1">Gerencie as pacientes da sua clínica</p>
            </div>
            <Dialog open={isAddingPatient} onOpenChange={setIsAddingPatient}>
              <DialogTrigger asChild>
                <Button className="bg-pink-600 hover:bg-pink-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Paciente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Cadastrar Nova Paciente</DialogTitle>
                  <DialogDescription>
                    Preencha os dados da nova paciente
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={newPatient.name}
                      onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                      placeholder="Ex: Maria Silva"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <Button onClick={handleAddPatient} className="w-full bg-pink-600 hover:bg-pink-700">
                    Cadastrar Paciente
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2 text-pink-600" />
              Buscar Paciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Busque por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-pink-600" />
              Lista de Pacientes
            </CardTitle>
            <CardDescription>
              {filteredPatients.length} paciente{filteredPatients.length !== 1 ? 's' : ''} encontrada{filteredPatients.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPatients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "Nenhuma paciente encontrada." : "Nenhuma paciente cadastrada ainda."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Vídeos</TableHead>
                    <TableHead>Data Cadastro</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>{patient.phone}</TableCell>
                      <TableCell>{patient.videosCount} vídeo{patient.videosCount !== 1 ? 's' : ''}</TableCell>
                      <TableCell>{new Date(patient.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/clinic/patient/${patient.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Perfil
                          </Link>
                        </Button>
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

export default ClinicDashboard;
