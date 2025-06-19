
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Video, Trash2, Eye, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PatientSearch } from "@/components/admin/PatientSearch";

interface Patient {
  id: string;
  name: string;
  mother_name: string;
  birth_date: string;
  gestational_age: string;
  qr_code: string;
  clinic_id: string;
  clinics?: {
    name: string;
  };
  videos?: PatientVideo[];
}

interface PatientVideo {
  id: string;
  file_name: string;
  file_url?: string;
  upload_date: string;
  file_size: number;
}

const VideoManagement = () => {
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<PatientVideo | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    // Filtrar pacientes baseado no termo de busca
    if (searchTerm.trim() === "") {
      setFilteredPatients(allPatients);
    } else {
      const filtered = allPatients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.mother_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, allPatients]);

  const loadAllData = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          clinics (
            name
          ),
          videos (
            id,
            file_name,
            file_url,
            upload_date,
            file_size
          )
        `);

      if (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados.",
          variant: "destructive",
        });
        return;
      }

      setAllPatients(data || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este vídeo? Esta ação não pode ser desfeita.")) {
      try {
        const { error } = await supabase
          .from('videos')
          .delete()
          .eq('id', videoId);

        if (error) {
          toast({
            title: "Erro",
            description: "Erro ao excluir vídeo: " + error.message,
            variant: "destructive",
          });
          return;
        }

        // Recarregar dados
        loadAllData();
        
        toast({
          title: "Vídeo excluído",
          description: "O vídeo foi removido com sucesso.",
        });
      } catch (err) {
        console.error('Erro ao excluir vídeo:', err);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const totalVideos = allPatients.reduce((total, patient) => total + (patient.videos?.length || 0), 0);
  const patientsWithVideos = allPatients.filter(patient => patient.videos && patient.videos.length > 0);

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cinebaby-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-800">{allPatients.length}</p>
                <p className="text-sm text-gray-600">Total de Pacientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cinebaby-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-teal-100 p-3 rounded-full">
                <Video className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-teal-800">{totalVideos}</p>
                <p className="text-sm text-gray-600">Total de Vídeos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cinebaby-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-800">{patientsWithVideos.length}</p>
                <p className="text-sm text-gray-600">Pacientes com Vídeos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Busca de Pacientes */}
      <PatientSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Lista de Pacientes e Vídeos */}
      <Card className="cinebaby-card">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-800">
            <Video className="h-6 w-6 mr-3 text-purple-600" />
            Gerenciamento de Vídeos
          </CardTitle>
          <CardDescription className="text-lg">
            {searchTerm ? (
              <>Encontradas {filteredPatients.length} paciente{filteredPatients.length !== 1 ? 's' : ''} para "{searchTerm}"</>
            ) : (
              <>Visualize e gerencie todos os vídeos uploadados na plataforma</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Video className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              {searchTerm ? (
                <div>
                  <p className="text-xl mb-2">Nenhuma paciente encontrada</p>
                  <p>Tente buscar por um nome diferente</p>
                </div>
              ) : (
                <div>
                  <p className="text-xl mb-2">Nenhum paciente cadastrado ainda</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{patient.name}</h3>
                      <p className="text-sm text-gray-600">Mãe: {patient.mother_name}</p>
                      <p className="text-sm text-gray-600">Clínica: {patient.clinics?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Data de Nascimento: {formatDate(patient.birth_date)}</p>
                    </div>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {patient.videos?.length || 0} vídeo{(patient.videos?.length || 0) !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  {patient.videos && patient.videos.length > 0 ? (
                    <div className="rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-white">
                            <TableHead>Nome do Vídeo</TableHead>
                            <TableHead>Data de Upload</TableHead>
                            <TableHead>Tamanho</TableHead>
                            <TableHead className="text-center">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {patient.videos.map((video) => (
                            <TableRow key={video.id} className="bg-white">
                              <TableCell className="font-medium">{video.file_name}</TableCell>
                              <TableCell>{formatDate(video.upload_date)}</TableCell>
                              <TableCell>{formatFileSize(video.file_size)}</TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center space-x-2">
                                  {video.file_url && (
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setSelectedVideo(video)}
                                          className="hover:bg-blue-50 hover:border-blue-300"
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-4xl">
                                        <DialogHeader>
                                          <DialogTitle>{video.file_name}</DialogTitle>
                                          <DialogDescription>
                                            Paciente: {patient.name} | Upload: {formatDate(video.upload_date)}
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="mt-4">
                                          <video
                                            controls
                                            className="w-full max-h-96 rounded-lg"
                                            src={video.file_url}
                                          >
                                            Seu navegador não suporta a reprodução de vídeo.
                                          </video>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteVideo(video.id)}
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
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Video className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Nenhum vídeo uploadado ainda</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoManagement;
