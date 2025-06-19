import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Video, Trash2, Eye, Users, Calendar, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PatientSearch } from "@/components/admin/PatientSearch";
import QRCode from 'qrcode';

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

  const handlePrintQRCode = async (patient: Patient) => {
    console.log('🖨️ Admin imprimindo QR Code para paciente:', patient.id);
    console.log('🔗 URL do QR Code:', patient.qr_code);
    console.log('👤 Nome da paciente:', patient.name);
    
    const qrCodeData = `${window.location.origin}/patient/${patient.qr_code}`;
    let qrCodeDataURL = '';
    
    try {
      qrCodeDataURL = await QRCode.toDataURL(qrCodeData, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      console.log('✅ QR Code gerado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar QR Code para impressão.",
        variant: "destructive",
      });
      return;
    }

    // Escapar aspas simples no nome da paciente para evitar problemas no HTML
    const patientNameEscaped = patient.name.replace(/'/g, "\\'");
    const clinicNameEscaped = patient.clinics?.name?.replace(/'/g, "\\'") || 'N/A';

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Cartão QR Code - ${patientNameEscaped}</title>
          <style>
            @media print {
              body { margin: 0; }
              .print-container { 
                width: 100%; 
                height: 100vh; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
              }
            }
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 20px;
              background: #f8fafc;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .card {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 20px;
              padding: 40px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 400px;
              width: 100%;
              position: relative;
              overflow: hidden;
            }
            .card::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
              background-size: 20px 20px;
              animation: float 20s infinite linear;
            }
            @keyframes float {
              0% { transform: translate(-50%, -50%) rotate(0deg); }
              100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
            .content {
              position: relative;
              z-index: 1;
            }
            .logo {
              color: white;
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 30px;
              background: linear-gradient(45deg, #ff6b6b, #ffd93d, #6bcf7f, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7);
              background-size: 300% 300%;
              animation: gradientShift 3s ease infinite;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            @keyframes gradientShift {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            .qr-container {
              background: white;
              padding: 20px;
              border-radius: 15px;
              margin: 20px 0;
              box-shadow: 0 10px 30px rgba(0,0,0,0.2);
              display: inline-block;
            }
            .qr-code {
              width: 200px;
              height: 200px;
              border-radius: 10px;
            }
            .patient-name {
              color: white;
              font-size: 24px;
              font-weight: bold;
              margin: 20px 0 10px 0;
              background: linear-gradient(45deg, #ff9a9e, #fecfef, #fecfef);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              margin-bottom: 15px;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            .patient-details {
              color: #e5e7eb;
              font-size: 14px;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            .clinic-info {
              color: #d1d5db;
              font-size: 12px;
              line-height: 1.5;
              border-top: 1px solid rgba(255,255,255,0.2);
              padding-top: 20px;
              margin-top: 20px;
            }
            .instructions {
              background: rgba(255,255,255,0.1);
              border-radius: 10px;
              padding: 15px;
              margin-top: 20px;
              color: white;
              font-size: 14px;
              backdrop-filter: blur(10px);
            }
            .instructions strong {
              color: #ffd93d;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="card">
              <div class="content">
                <div class="logo">CineBaby</div>
                
                <div class="qr-container">
                  <img src="${qrCodeDataURL}" alt="QR Code" class="qr-code" />
                </div>
                
                <div class="patient-name">${patientNameEscaped}</div>
                <div class="patient-details">
                  <strong>Data de Cadastro:</strong> ${new Date(patient.created_at).toLocaleDateString('pt-BR')}<br/>
                  <strong>Clínica:</strong> ${clinicNameEscaped}
                </div>
                
                <div class="instructions">
                  <strong>Como usar:</strong><br/>
                  Aponte a câmera do seu celular para o QR Code acima para acessar os vídeos do ultrassom da sua bebê!
                </div>
                
                <div class="clinic-info">
                  <strong>CineBaby</strong> - Momentos que emocionam para sempre<br/>
                  Em parceria com ${clinicNameEscaped}<br/>
                  <small style="font-size: 12px; color: #9ca3af;">ID: ${patient.id}</small>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
      
      toast({
        title: "QR Code enviado para impressão",
        description: `Cartão da paciente ${patient.name} foi enviado para impressão.`,
      });
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
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrintQRCode(patient)}
                        className="hover:bg-blue-50 hover:border-blue-300 text-blue-600"
                        title="Imprimir QR Code"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        {patient.videos?.length || 0} vídeo{(patient.videos?.length || 0) !== 1 ? 's' : ''}
                      </Badge>
                    </div>
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
