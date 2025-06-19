
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Video, Trash2, Eye, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Patient {
  id: number;
  name: string;
  motherName: string;
  birthDate: string;
  gestationalAge: string;
  clinicId: number;
  qrCode: string;
  videos?: PatientVideo[];
}

interface PatientVideo {
  id: string;
  name: string;
  url: string;
  uploadDate: string;
  size: number;
}

interface Clinic {
  id: number;
  name: string;
}

const VideoManagement = () => {
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<PatientVideo | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    // Carregar clínicas
    const storedClinics = localStorage.getItem("cinebaby_clinics");
    const clinicsData = storedClinics ? JSON.parse(storedClinics) : [];
    setClinics(clinicsData);

    // Carregar todos os pacientes de todas as clínicas
    const allPatientsData: Patient[] = [];
    
    clinicsData.forEach((clinic: Clinic) => {
      const patientsKey = `cinebaby_patients_${clinic.id}`;
      const storedPatients = localStorage.getItem(patientsKey);
      
      if (storedPatients) {
        const patients = JSON.parse(storedPatients);
        patients.forEach((patient: Patient) => {
          // Carregar vídeos do paciente
          const videosKey = `cinebaby_videos_${patient.qrCode}`;
          const storedVideos = localStorage.getItem(videosKey);
          const videos = storedVideos ? JSON.parse(storedVideos) : [];
          
          allPatientsData.push({
            ...patient,
            clinicId: clinic.id,
            videos: videos
          });
        });
      }
    });

    setAllPatients(allPatientsData);
  };

  const getClinicName = (clinicId: number) => {
    const clinic = clinics.find(c => c.id === clinicId);
    return clinic ? clinic.name : "Clínica não encontrada";
  };

  const handleDeleteVideo = (patient: Patient, videoId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este vídeo? Esta ação não pode ser desfeita.")) {
      const videosKey = `cinebaby_videos_${patient.qrCode}`;
      const storedVideos = localStorage.getItem(videosKey);
      
      if (storedVideos) {
        const videos = JSON.parse(storedVideos);
        const updatedVideos = videos.filter((video: PatientVideo) => video.id !== videoId);
        localStorage.setItem(videosKey, JSON.stringify(updatedVideos));
        
        // Recarregar dados
        loadAllData();
        
        toast({
          title: "Vídeo excluído",
          description: "O vídeo foi removido com sucesso.",
        });
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

      {/* Lista de Pacientes e Vídeos */}
      <Card className="cinebaby-card">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-800">
            <Video className="h-6 w-6 mr-3 text-purple-600" />
            Gerenciamento de Vídeos
          </CardTitle>
          <CardDescription className="text-lg">
            Visualize e gerencie todos os vídeos uploadados na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allPatients.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Video className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-xl mb-2">Nenhum paciente cadastrado ainda</p>
            </div>
          ) : (
            <div className="space-y-6">
              {allPatients.map((patient) => (
                <div key={patient.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{patient.name}</h3>
                      <p className="text-sm text-gray-600">Mãe: {patient.motherName}</p>
                      <p className="text-sm text-gray-600">Clínica: {getClinicName(patient.clinicId)}</p>
                      <p className="text-sm text-gray-600">Data de Nascimento: {formatDate(patient.birthDate)}</p>
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
                              <TableCell className="font-medium">{video.name}</TableCell>
                              <TableCell>{formatDate(video.uploadDate)}</TableCell>
                              <TableCell>{formatFileSize(video.size)}</TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center space-x-2">
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
                                        <DialogTitle>{video.name}</DialogTitle>
                                        <DialogDescription>
                                          Paciente: {patient.name} | Upload: {formatDate(video.uploadDate)}
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="mt-4">
                                        <video
                                          controls
                                          className="w-full max-h-96 rounded-lg"
                                          src={video.url}
                                        >
                                          Seu navegador não suporta a reprodução de vídeo.
                                        </video>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteVideo(patient, video.id)}
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
