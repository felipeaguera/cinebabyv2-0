import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogOut, Plus, Search, Users, Eye, Edit, Trash2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import EditPatientDialog from "@/components/EditPatientDialog";
import Badge from "@/components/ui/badge";

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
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [newPatient, setNewPatient] = useState({
    name: "",
    phone: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const clinicData = localStorage.getItem("cinebaby_clinic");
    if (!clinicData) {
      navigate("/clinic/login");
      return;
    }

    const parsedClinic = JSON.parse(clinicData);
    setClinic(parsedClinic);

    const storedPatients = localStorage.getItem(`cinebaby_patients_${parsedClinic.id}`);
    if (storedPatients) {
      const patientsData = JSON.parse(storedPatients);
      setPatients(patientsData);
      setFilteredPatients(patientsData);
    }
  }, [navigate]);

  useEffect(() => {
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

  const handleEditPatient = (updatedPatient: Patient) => {
    const updatedPatients = patients.map(patient => 
      patient.id === updatedPatient.id ? updatedPatient : patient
    );
    setPatients(updatedPatients);
    localStorage.setItem(`cinebaby_patients_${clinic?.id}`, JSON.stringify(updatedPatients));
    setEditingPatient(null);
  };

  const handleDeletePatient = (patientId: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta paciente? Todos os vídeos serão perdidos.")) {
      const updatedPatients = patients.filter(patient => patient.id !== patientId);
      setPatients(updatedPatients);
      localStorage.setItem(`cinebaby_patients_${clinic?.id}`, JSON.stringify(updatedPatients));
      
      // Remove também os vídeos da paciente
      localStorage.removeItem(`cinebaby_videos_${patientId}`);
      
      toast({
        title: "Paciente excluída",
        description: "A paciente foi removida com sucesso.",
      });
    }
  };

  if (!clinic) {
    return <div>Carregando...</div>;
  }

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
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">{clinic.name}</h1>
                <p className="text-white/80 font-medium">{clinic.city}</p>
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
              <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Pacientes</h2>
              <p className="text-white/80 text-lg">Gerencie as pacientes da sua clínica</p>
            </div>
            <Dialog open={isAddingPatient} onOpenChange={setIsAddingPatient}>
              <DialogTrigger asChild>
                <Button className="cinebaby-button-secondary text-lg px-6 py-3 rounded-xl">
                  <Plus className="h-5 w-5 mr-2" />
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
                  <Button onClick={handleAddPatient} className="w-full cinebaby-button-secondary">
                    Cadastrar Paciente
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="cinebaby-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-teal-800">
              <Search className="h-6 w-6 mr-3 text-teal-600" />
              Buscar Paciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Busque por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md text-lg py-3"
            />
          </CardContent>
        </Card>

        <Card className="cinebaby-card">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-800">
              <Users className="h-6 w-6 mr-3 text-purple-600" />
              Lista de Pacientes
            </CardTitle>
            <CardDescription className="text-lg">
              {filteredPatients.length} paciente{filteredPatients.length !== 1 ? 's' : ''} encontrada{filteredPatients.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPatients.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl mb-2">
                  {searchTerm ? "Nenhuma paciente encontrada" : "Nenhuma paciente cadastrada ainda"}
                </p>
                <p>{searchTerm ? "Tente outros termos de busca" : "Comece cadastrando sua primeira paciente"}</p>
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-teal-50 to-purple-50">
                      <TableHead className="font-semibold">Nome</TableHead>
                      <TableHead className="font-semibold">Telefone</TableHead>
                      <TableHead className="font-semibold">Vídeos</TableHead>
                      <TableHead className="font-semibold">Data Cadastro</TableHead>
                      <TableHead className="font-semibold text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id} className="hover:bg-teal-50/50 transition-colors">
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>{patient.phone}</TableCell>
                        <TableCell>
                          <Badge className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300">
                            {patient.videosCount} vídeo{patient.videosCount !== 1 ? 's' : ''}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(patient.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center space-x-2">
                            <Button asChild variant="outline" size="sm" className="hover:bg-teal-50 hover:border-teal-300">
                              <Link to={`/clinic/patient/${patient.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingPatient(patient)}
                              className="hover:bg-purple-50 hover:border-purple-300"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePatient(patient.id)}
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

      {editingPatient && (
        <EditPatientDialog
          patient={editingPatient}
          isOpen={!!editingPatient}
          onClose={() => setEditingPatient(null)}
          onSave={handleEditPatient}
        />
      )}
    </div>
  );
};

export default ClinicDashboard;
