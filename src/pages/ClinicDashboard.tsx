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
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Patient {
  id: string;
  name: string;
  phone: string;
  clinic_id: string;
  created_at: string;
  mother_name: string;
  birth_date: string;
  gestational_age: string;
  qr_code: string;
  videosCount?: number;
}

interface Clinic {
  id: string;
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
  const [loading, setLoading] = useState(true);
  const [newPatient, setNewPatient] = useState({
    name: "",
    phone: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const clinicData = localStorage.getItem("cinebaby_clinic");
    console.log('🔍 Dados da clínica no localStorage:', clinicData);
    
    if (!clinicData) {
      console.log('❌ Nenhum dado de clínica encontrado, redirecionando para login');
      navigate("/clinic/login");
      return;
    }

    try {
      const parsedClinic = JSON.parse(clinicData);
      console.log('✅ Clínica carregada:', parsedClinic);
      
      // Agora a clínica deve ser salva diretamente, não dentro de um objeto
      setClinic(parsedClinic);
      
      if (parsedClinic.id) {
        loadPatientsFromSupabase(parsedClinic.id);
      } else {
        console.log('❌ ID da clínica não encontrado');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Erro ao fazer parse dos dados da clínica:', error);
      navigate("/clinic/login");
    }
  }, [navigate]);

  const loadPatientsFromSupabase = async (clinicId: string) => {
    try {
      console.log('🔍 Carregando pacientes da clínica:', clinicId);
      
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (patientsError) {
        console.error('❌ Erro ao carregar pacientes:', patientsError);
        toast({
          title: "Erro",
          description: "Erro ao carregar pacientes. Tente novamente.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log('✅ Pacientes carregadas:', patientsData?.length || 0);

      // Contar vídeos para cada paciente
      const patientsWithVideos = await Promise.all(
        (patientsData || []).map(async (patient) => {
          const { data: videos } = await supabase
            .from('videos')
            .select('id')
            .eq('patient_id', patient.id);
          
          return {
            ...patient,
            videosCount: videos?.length || 0
          };
        })
      );

      setPatients(patientsWithVideos);
      setFilteredPatients(patientsWithVideos);
    } catch (error) {
      console.error('❌ Erro geral ao carregar pacientes:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm) ||
      patient.mother_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const handleLogout = () => {
    localStorage.removeItem("cinebaby_clinic");
    navigate("/");
  };

  const handleAddPatient = async () => {
    console.log('🔍 Iniciando cadastro de paciente...');
    console.log('🔍 Dados do novo paciente:', newPatient);
    console.log('🔍 Dados da clínica atual:', clinic);

    if (!newPatient.name) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!clinic || !clinic.id) {
      console.error('❌ Clínica não carregada ou sem ID:', clinic);
      toast({
        title: "Erro",
        description: "Erro de sessão da clínica. Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    try {
      const patientData = {
        name: newPatient.name,
        phone: newPatient.phone || null,
        mother_name: "Não informado", // Campo obrigatório no banco, mas não no formulário
        birth_date: "2000-01-01", // Data padrão
        gestational_age: "Não informado", // Campo obrigatório no banco, mas não no formulário
        clinic_id: clinic.id,
        qr_code: `PATIENT_${Date.now()}`
      };

      console.log('🔍 Dados que serão inseridos:', patientData);

      const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar paciente:', error);
        toast({
          title: "Erro",
          description: "Erro ao cadastrar paciente. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Paciente criada:', data.name);

      // Recarregar lista de pacientes
      await loadPatientsFromSupabase(clinic.id);

      setNewPatient({ name: "", phone: "" });
      setIsAddingPatient(false);

      toast({
        title: "Paciente cadastrada!",
        description: `${data.name} foi cadastrada com sucesso.`,
      });

    } catch (error) {
      console.error('❌ Erro ao cadastrar paciente:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar paciente. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta paciente? Todos os vídeos serão perdidos.")) {
      try {
        // Primeiro, deletar todos os vídeos da paciente
        const { error: videosError } = await supabase
          .from('videos')
          .delete()
          .eq('patient_id', patientId);

        if (videosError) {
          console.error('❌ Erro ao deletar vídeos:', videosError);
        }

        // Depois, deletar a paciente
        const { error: patientError } = await supabase
          .from('patients')
          .delete()
          .eq('id', patientId);

        if (patientError) {
          console.error('❌ Erro ao deletar paciente:', patientError);
          toast({
            title: "Erro",
            description: "Erro ao excluir paciente. Tente novamente.",
            variant: "destructive",
          });
          return;
        }

        // Recarregar lista de pacientes
        if (clinic) {
          await loadPatientsFromSupabase(clinic.id);
        }

        toast({
          title: "Paciente excluída",
          description: "A paciente foi removida com sucesso.",
        });

      } catch (error) {
        console.error('❌ Erro ao excluir paciente:', error);
        toast({
          title: "Erro",
          description: "Erro ao excluir paciente. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen cinebaby-gradient flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando dados da clínica...</p>
        </div>
      </div>
    );
  }

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
                  src="/lovable-uploads/0f255407-3789-418f-8a06-69187f941576.png" 
                  alt="CineBaby Logo" 
                  className="h-12 w-auto"
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
                    <Label htmlFor="name">Nome da Paciente</Label>
                    <Input
                      id="name"
                      value={newPatient.name}
                      onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                      placeholder="Ex: Ana Silva"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone (opcional)</Label>
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
              placeholder="Busque por nome, telefone ou nome da mãe..."
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
                      <TableHead className="font-semibold">Mãe</TableHead>
                      <TableHead className="font-semibold">Telefone</TableHead>
                      <TableHead className="font-semibold">Idade Gestacional</TableHead>
                      <TableHead className="font-semibold">Vídeos</TableHead>
                      <TableHead className="font-semibold">Data Cadastro</TableHead>
                      <TableHead className="font-semibold text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id} className="hover:bg-teal-50/50 transition-colors">
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>{patient.mother_name}</TableCell>
                        <TableCell>{patient.phone || 'Não informado'}</TableCell>
                        <TableCell>{patient.gestational_age}</TableCell>
                        <TableCell>
                          <Badge className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300">
                            {patient.videosCount || 0} vídeo{(patient.videosCount || 0) !== 1 ? 's' : ''}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(patient.created_at).toLocaleDateString('pt-BR')}</TableCell>
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
    </div>
  );
};

export default ClinicDashboard;
