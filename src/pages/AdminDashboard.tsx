
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Plus, Building2, Edit, Trash2, Video, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import VideoManagement from "@/components/VideoManagement";

interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  email: string;
  phone?: string;
  user_id?: string;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  password: string;
  role: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isAddingClinic, setIsAddingClinic] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [newClinic, setNewClinic] = useState({
    name: "",
    address: "",
    city: "",
    email: "",
    password: "",
    phone: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const adminData = localStorage.getItem("cinebaby_admin");
    if (!adminData) {
      navigate("/admin/login");
      return;
    }

    loadClinics();
  }, [navigate]);

  const loadClinics = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select(`
          *,
          users!clinics_user_id_fkey (
            email,
            password
          )
        `);

      if (error) {
        console.error('Erro ao carregar clínicas:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as clínicas.",
          variant: "destructive",
        });
        return;
      }

      setClinics(data || []);
    } catch (err) {
      console.error('Erro ao carregar clínicas:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cinebaby_admin");
    navigate("/");
  };

  const handleAddClinic = async () => {
    if (!newClinic.name || !newClinic.address || !newClinic.city || !newClinic.email || !newClinic.password) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Verificar se já existe um usuário com este email
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', newClinic.email)
        .single();

      if (existingUser) {
        toast({
          title: "Erro",
          description: "Já existe um usuário com este email.",
          variant: "destructive",
        });
        return;
      }

      // Primeiro criar o usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          email: newClinic.email,
          password: newClinic.password,
          role: 'clinic'
        })
        .select()
        .single();

      if (userError) {
        console.error('Erro ao criar usuário:', userError);
        toast({
          title: "Erro",
          description: "Erro ao criar usuário: " + userError.message,
          variant: "destructive",
        });
        return;
      }

      // Depois criar a clínica
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .insert({
          name: newClinic.name,
          address: newClinic.address,
          city: newClinic.city,
          email: newClinic.email,
          phone: newClinic.phone,
          user_id: userData.id
        })
        .select()
        .single();

      if (clinicError) {
        console.error('Erro ao criar clínica:', clinicError);
        toast({
          title: "Erro",
          description: "Erro ao criar clínica: " + clinicError.message,
          variant: "destructive",
        });
        return;
      }

      setNewClinic({ name: "", address: "", city: "", email: "", password: "", phone: "" });
      setIsAddingClinic(false);
      loadClinics();

      toast({
        title: "Clínica cadastrada!",
        description: `${clinicData.name} foi cadastrada com sucesso.`,
      });
    } catch (err) {
      console.error('Erro ao cadastrar clínica:', err);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClinic = async (clinicId: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta clínica? Esta ação não pode ser desfeita.")) {
      try {
        const { error } = await supabase
          .from('clinics')
          .delete()
          .eq('id', clinicId);

        if (error) {
          toast({
            title: "Erro",
            description: "Erro ao excluir clínica: " + error.message,
            variant: "destructive",
          });
          return;
        }

        loadClinics();
        toast({
          title: "Clínica excluída",
          description: "A clínica foi removida com sucesso.",
        });
      } catch (err) {
        console.error('Erro ao excluir clínica:', err);
      }
    }
  };

  const togglePasswordVisibility = (clinicId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [clinicId]: !prev[clinicId]
    }));
  };

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
        <Tabs defaultValue="clinics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/20 backdrop-blur-sm">
            <TabsTrigger value="clinics" className="data-[state=active]:bg-white/40">
              <Building2 className="h-4 w-4 mr-2" />
              Clínicas
            </TabsTrigger>
            <TabsTrigger value="videos" className="data-[state=active]:bg-white/40">
              <Video className="h-4 w-4 mr-2" />
              Vídeos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clinics" className="space-y-6">
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
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={newClinic.phone}
                          onChange={(e) => setNewClinic({ ...newClinic, phone: e.target.value })}
                          placeholder="Ex: (11) 99999-9999"
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
                          <TableHead className="font-semibold">Senha</TableHead>
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
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-sm">
                                  {visiblePasswords[clinic.id] ? (clinic as any).users?.password || '••••••••' : '••••••••'}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => togglePasswordVisibility(clinic.id)}
                                  className="h-6 w-6 p-0 hover:bg-purple-100"
                                >
                                  {visiblePasswords[clinic.id] ? (
                                    <EyeOff className="h-3 w-3" />
                                  ) : (
                                    <Eye className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
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
          </TabsContent>

          <TabsContent value="videos">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Gerenciamento de Vídeos</h2>
              <p className="text-white/80 text-lg">Visualize e gerencie todos os vídeos da plataforma</p>
            </div>
            <VideoManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
