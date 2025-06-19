import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, QrCode, Printer, Play, Calendar, Trash2 } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Patient {
  id: number;
  name: string;
  phone: string;
  clinicId: number;
  createdAt: string;
  videosCount: number;
}

interface Video {
  id: number;
  patientId: number;
  fileName: string;
  uploadDate: string;
  fileSize: string;
  qrCode: string;
}

interface Clinic {
  id: number;
  name: string;
  address: string;
  city: string;
  email: string;
}

const PatientProfile = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
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

    // Carregar dados da paciente
    const storedPatients = localStorage.getItem(`cinebaby_patients_${parsedClinic.id}`);
    if (storedPatients) {
      const patients = JSON.parse(storedPatients);
      const foundPatient = patients.find((p: Patient) => p.id === parseInt(patientId || '0'));
      if (foundPatient) {
        setPatient(foundPatient);
        
        // Carregar vídeos da paciente
        const storedVideos = localStorage.getItem(`cinebaby_videos_${foundPatient.id}`);
        if (storedVideos) {
          setVideos(JSON.parse(storedVideos));
        }
      } else {
        navigate("/clinic/dashboard");
      }
    }
  }, [navigate, patientId]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar se é um arquivo de vídeo
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos de vídeo.",
          variant: "destructive",
        });
        return;
      }
      setUploadFile(file);
    }
  };

  const handleUploadVideo = async () => {
    if (!uploadFile || !patient || !clinic) return;

    setIsUploading(true);

    // Simular upload (será substituído pela integração Supabase)
    const video: Video = {
      id: Date.now(),
      patientId: patient.id,
      fileName: uploadFile.name,
      uploadDate: new Date().toISOString(),
      fileSize: (uploadFile.size / (1024 * 1024)).toFixed(2) + ' MB',
      qrCode: `${patient.id}-${Date.now()}`
    };

    const updatedVideos = [...videos, video];
    setVideos(updatedVideos);
    localStorage.setItem(`cinebaby_videos_${patient.id}`, JSON.stringify(updatedVideos));

    // Atualizar contador de vídeos da paciente
    const storedPatients = localStorage.getItem(`cinebaby_patients_${clinic.id}`);
    if (storedPatients) {
      const patients = JSON.parse(storedPatients);
      const updatedPatients = patients.map((p: Patient) =>
        p.id === patient.id ? { ...p, videosCount: updatedVideos.length } : p
      );
      localStorage.setItem(`cinebaby_patients_${clinic.id}`, JSON.stringify(updatedPatients));
      setPatient({ ...patient, videosCount: updatedVideos.length });
    }

    setUploadFile(null);
    setIsUploading(false);

    toast({
      title: "Vídeo enviado!",
      description: "O vídeo foi adicionado com sucesso ao perfil da paciente.",
    });
  };

  const handlePrintQRCode = () => {
    if (!patient || !clinic) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Cartão QR Code - ${patient.name}</title>
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 100%);
            }
            .card {
              background: white;
              border-radius: 20px;
              padding: 40px;
              text-align: center;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              max-width: 400px;
              width: 100%;
            }
            .logo {
              width: 80px;
              height: auto;
              margin-bottom: 20px;
            }
            .patient-name {
              font-size: 24px;
              font-weight: bold;
              color: #7c3aed;
              margin: 20px 0 10px 0;
            }
            .clinic-name {
              font-size: 16px;
              color: #ec4899;
              margin-bottom: 30px;
            }
            .qr-code {
              width: 200px;
              height: 200px;
              margin: 20px auto;
              background: #f3f4f6;
              border: 2px solid #e5e7eb;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              color: #6b7280;
            }
            .message {
              font-size: 16px;
              color: #6b7280;
              line-height: 1.6;
              margin-top: 30px;
              font-style: italic;
            }
            .print-button {
              background: #7c3aed;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 16px;
              cursor: pointer;
              margin-top: 20px;
            }
            .print-button:hover {
              background: #6d28d9;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <img src="/lovable-uploads/4d8583ce-0aed-4b79-aa55-3c03b32e9c88.png" alt="CineBaby Logo" class="logo" />
            <div class="patient-name">${patient.name}</div>
            <div class="clinic-name">${clinic.name}</div>
            <div class="qr-code">
              QR Code será gerado aqui<br/>
              Código: ${patient.id}-${Date.now()}
            </div>
            <div class="message">
              "Reviva esse momento mágico sempre que quiser. Ver seu bebê antes do nascimento é um carinho que emociona para sempre."
            </div>
            <button class="print-button no-print" onclick="window.print()">Imprimir Cartão</button>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleDeleteVideo = (videoId: number) => {
    if (window.confirm("Tem certeza que deseja excluir este vídeo?")) {
      const updatedVideos = videos.filter(video => video.id !== videoId);
      setVideos(updatedVideos);
      localStorage.setItem(`cinebaby_videos_${patient?.id}`, JSON.stringify(updatedVideos));

      // Atualizar contador de vídeos da paciente
      if (clinic && patient) {
        const storedPatients = localStorage.getItem(`cinebaby_patients_${clinic.id}`);
        if (storedPatients) {
          const patients = JSON.parse(storedPatients);
          const updatedPatients = patients.map((p: Patient) =>
            p.id === patient.id ? { ...p, videosCount: updatedVideos.length } : p
          );
          localStorage.setItem(`cinebaby_patients_${clinic.id}`, JSON.stringify(updatedPatients));
          setPatient({ ...patient, videosCount: updatedVideos.length });
        }
      }

      toast({
        title: "Vídeo excluído!",
        description: "O vídeo foi removido com sucesso.",
      });
    }
  };

  if (!patient || !clinic) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen cinebaby-gradient">
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button variant="ghost" asChild className="text-white hover:text-white hover:bg-white/20 mr-4 backdrop-blur-sm">
              <Link to="/clinic/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                <img 
                  src="/lovable-uploads/4d8583ce-0aed-4b79-aa55-3c03b32e9c88.png" 
                  alt="CineBaby Logo" 
                  className="h-10 w-auto"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">Perfil da Paciente</h1>
                <p className="text-white/80 font-medium">{clinic.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="cinebaby-card">
              <CardHeader>
                <CardTitle className="text-purple-800 text-2xl">{patient.name}</CardTitle>
                <CardDescription className="text-lg">Informações da paciente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Telefone</Label>
                  <p className="text-lg font-medium mt-1">{patient.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Data de Cadastro</Label>
                  <p className="text-lg font-medium mt-1">{new Date(patient.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total de Vídeos</Label>
                  <Badge className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300 text-lg px-4 py-2 mt-2">
                    {videos.length} vídeo{videos.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="pt-6">
                  <Button 
                    onClick={handlePrintQRCode} 
                    className="w-full cinebaby-button-primary text-lg py-4 rounded-xl"
                  >
                    <Printer className="h-5 w-5 mr-2" />
                    Imprimir Cartão QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <div className="space-y-8">
              <Card className="cinebaby-card">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center text-teal-800 text-xl">
                        <Upload className="h-6 w-6 mr-3 text-teal-600" />
                        Upload de Vídeo
                      </CardTitle>
                      <CardDescription className="text-lg">
                        Adicione um novo vídeo do exame
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="video-file">Selecionar Vídeo</Label>
                      <Input
                        id="video-file"
                        type="file"
                        accept="video/*"
                        onChange={handleFileUpload}
                        className="mt-1"
                      />
                    </div>
                    {uploadFile && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{uploadFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <Button 
                          onClick={handleUploadVideo}
                          disabled={isUploading}
                          className="bg-pink-600 hover:bg-pink-700"
                        >
                          {isUploading ? "Enviando..." : "Enviar"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="cinebaby-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-800 text-xl">
                    <Play className="h-6 w-6 mr-3 text-purple-600" />
                    Vídeos da Paciente
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Histórico de vídeos enviados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {videos.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Play className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-xl mb-2">Nenhum vídeo enviado ainda</p>
                      <p>Faça o upload do primeiro vídeo da paciente</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {videos.map((video) => (
                        <div key={video.id} className="flex items-center justify-between p-6 border-2 border-purple-100 rounded-xl bg-gradient-to-r from-purple-50/50 to-teal-50/50 hover:shadow-lg transition-all">
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                              <Play className="h-7 w-7 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-lg">{video.fileName}</p>
                              <div className="flex items-center space-x-6 text-gray-600 mt-1">
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  {new Date(video.uploadDate).toLocaleDateString('pt-BR')}
                                </span>
                                <span className="font-medium">{video.fileSize}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="border-teal-200 text-teal-700 px-3 py-1">
                              <QrCode className="h-4 w-4 mr-1" />
                              QR: {video.qrCode}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteVideo(video.id)}
                              className="hover:bg-red-50 hover:border-red-300 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientProfile;
