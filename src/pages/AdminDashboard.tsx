
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import VideoManagement from "@/components/VideoManagement";
import AdminHeader from "@/components/admin/AdminHeader";
import AddClinicDialog from "@/components/admin/AddClinicDialog";
import ClinicTable from "@/components/admin/ClinicTable";
import { ClinicSearch } from "@/components/admin/ClinicSearch";

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

const AdminDashboard = () => {
  const [allClinics, setAllClinics] = useState<Clinic[]>([]);
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { user, loading, isAdmin, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin/login");
      return;
    }

    if (!loading && user && !isAdmin) {
      navigate("/");
      return;
    }

    if (user && isAdmin) {
      loadClinics();
    }
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    // Filtrar clínicas baseado no termo de busca
    if (searchTerm.trim() === "") {
      setFilteredClinics(allClinics);
    } else {
      const filtered = allClinics.filter(clinic =>
        clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClinics(filtered);
    }
  }, [searchTerm, allClinics]);

  const loadClinics = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*');

      if (error) {
        console.error('Erro ao carregar clínicas:', error);
        return;
      }

      setAllClinics(data || []);
    } catch (err) {
      console.error('Erro ao carregar clínicas:', err);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen cinebaby-gradient flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen cinebaby-gradient">
      <AdminHeader onLogout={handleLogout} />

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
                <AddClinicDialog onClinicAdded={loadClinics} />
              </div>
            </div>

            {/* Busca de Clínicas */}
            <ClinicSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

            <Card className="cinebaby-card">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-800">
                  <Building2 className="h-6 w-6 mr-3 text-purple-600" />
                  Lista de Clínicas
                </CardTitle>
                <CardDescription className="text-lg">
                  {searchTerm ? (
                    <>Encontradas {filteredClinics.length} clínica{filteredClinics.length !== 1 ? 's' : ''} para "{searchTerm}"</>
                  ) : (
                    <>{allClinics.length} clínica{allClinics.length !== 1 ? 's' : ''} cadastrada{allClinics.length !== 1 ? 's' : ''}</>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ClinicTable clinics={filteredClinics} onClinicDeleted={loadClinics} />
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
