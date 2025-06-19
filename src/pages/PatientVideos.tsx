
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Calendar, Heart } from "lucide-react";
import { useParams } from "react-router-dom";

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
  fileUrl?: string;
}

interface Clinic {
  id: number;
  name: string;
  address: string;
  city: string;
  email: string;
}

const PatientVideos = () => {
  const { qrCode } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const findPatientByQRCode = () => {
      if (!qrCode) {
        console.log('❌ Nenhum QR Code fornecido na URL');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Iniciando busca por QR Code:', qrCode);
      
      // NOVA ESTRATÉGIA: Buscar primeiro no mapeamento de QR Codes
      const qrMapping = localStorage.getItem('cinebaby_qr_mapping');
      if (qrMapping) {
        const mappings = JSON.parse(qrMapping);
        console.log('📋 Mapeamentos QR encontrados:', Object.keys(mappings).length);
        
        if (mappings[qrCode]) {
          const mapping = mappings[qrCode];
          console.log('✅ Mapeamento encontrado:', mapping);
          
          // Buscar dados completos da paciente
          const storedPatients = localStorage.getItem(`cinebaby_patients_${mapping.clinicId}`);
          if (storedPatients) {
            const patients = JSON.parse(storedPatients);
            const foundPatient = patients.find((p: Patient) => p.id === mapping.patientId);
            
            if (foundPatient) {
              console.log('✅ Paciente encontrada via mapeamento:', foundPatient.name);
              setPatient(foundPatient);
              
              // Buscar dados da clínica
              const storedClinics = localStorage.getItem("cinebaby_clinics");
              if (storedClinics) {
                const clinics = JSON.parse(storedClinics);
                const foundClinic = clinics.find((c: Clinic) => c.id === mapping.clinicId);
                if (foundClinic) {
                  setClinic(foundClinic);
                }
              }
              
              // Carregar vídeos da paciente
              const storedVideos = localStorage.getItem(`cinebaby_videos_${foundPatient.id}`);
              if (storedVideos) {
                const parsedVideos = JSON.parse(storedVideos);
                console.log('🎥 Vídeos encontrados:', parsedVideos.length);
                setVideos(parsedVide os);
              }
              
              setLoading(false);
              return;
            }
          }
        }
      }
      
      console.log('⚠️ Mapeamento QR não encontrado, tentando busca antiga...');
      
      // FALLBACK: Busca tradicional (para compatibilidade com QR codes antigos)
      const storedClinics = localStorage.getItem("cinebaby_clinics");
      if (!storedClinics) {
        console.log('❌ Nenhuma clínica encontrada no localStorage');
        setLoading(false);
        return;
      }

      const clinics = JSON.parse(storedClinics);
      console.log('🏥 Clínicas encontradas:', clinics.length);
      
      // Buscar em todas as clínicas
      for (const clinic of clinics) {
        console.log(`🔍 Verificando clínica: ${clinic.name} (ID: ${clinic.id})`);
        
        const storedPatients = localStorage.getItem(`cinebaby_patients_${clinic.id}`);
        if (storedPatients) {
          const patients = JSON.parse(storedPatients);
          console.log(`👥 Pacientes encontrados na clínica ${clinic.name}:`, patients.length);
          
          // Buscar paciente pelo ID (tentando ambas as possibilidades)
          const foundPatient = patients.find((patient: Patient) => {
            // Tentar buscar por ID direto
            if (patient.id.toString() === qrCode) {
              console.log(`✅ Paciente encontrada por ID: ${patient.name}`);
              return true;
            }
            
            // Buscar nos vídeos da paciente
            const storedVideos = localStorage.getItem(`cinebaby_videos_${patient.id}`);
            if (storedVideos) {
              const videos = JSON.parse(storedVideos);
              const hasMatchingVideo = videos.some((video: Video) => video.qrCode === qrCode);
              if (hasMatchingVideo) {
                console.log(`✅ Paciente encontrada por vídeo QR: ${patient.name}`);
                return true;
              }
            }
            
            return false;
          });
          
          if (foundPatient) {
            console.log('✅ Paciente encontrada:', foundPatient.name);
            setPatient(foundPatient);
            setClinic(clinic);
            
            // Carregar vídeos da paciente
            const storedVideos = localStorage.getItem(`cinebaby_videos_${foundPatient.id}`);
            if (storedVideos) {
              const parsedVideos = JSON.parse(storedVideos);
              console.log('📹 Vídeos carregados:', parsedVideos.length);
              setVideos(parsedVideos);
            } else {
              console.log('📹 Nenhum vídeo encontrado para esta paciente');
              setVideos([]);
            }
            
            setLoading(false);
            return;
          }
        } else {
          console.log(`📂 Nenhum dado de paciente encontrado para clínica ${clinic.name}`);
        }
      }
      
      // Se chegou até aqui, não encontrou a paciente
      console.log('❌ Paciente não encontrada com QR Code:', qrCode);
      console.log('🔧 Debug completo do localStorage:');
      
      // Debug completo do localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('cinebaby_')) {
          const data = localStorage.getItem(key);
          console.log(`📋 ${key}:`, JSON.parse(data || '{}'));
        }
      }
      
      setLoading(false);
    };

    findPatientByQRCode();
  }, [qrCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <img 
            src="/lovable-uploads/0f255407-3789-418f-8a06-69187f941576.png" 
            alt="CineBaby Logo" 
            className="mx-auto h-16 w-auto mb-4"
          />
          <p className="text-gray-600">Carregando seus vídeos...</p>
        </div>
      </div>
    );
  }

  if (!patient || !clinic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <img 
            src="/lovable-uploads/0f255407-3789-418f-8a06-69187f941576.png" 
            alt="CineBaby Logo" 
            className="mx-auto h-16 w-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">QR Code Inválido</h1>
          <p className="text-gray-600 mb-4">
            O QR Code escaneado não foi encontrado em nosso sistema. 
            Verifique se o código está correto ou entre em contato com sua clínica.
          </p>
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <p className="font-medium">Código procurado:</p>
            <p className="text-gray-500 break-all">{qrCode}</p>
            <p className="text-xs text-gray-400 mt-2">
              Abra o console do navegador (F12) para mais detalhes
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <img 
                src="/lovable-uploads/0f255407-3789-418f-8a06-69187f941576.png" 
                alt="CineBaby Logo" 
                className="mx-auto h-16 w-auto mb-3"
              />
              <h1 className="text-3xl font-bold text-pink-800">Seus Momentos Especiais</h1>
              <p className="text-gray-600 mt-1">Reviva a emoção de ver seu bebê</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Olá, {patient.name}!</h2>
          <p className="text-gray-600 mb-1">Seus vídeos de ultrassom da {clinic.name}</p>
          <div className="flex items-center justify-center text-pink-600 text-sm">
            <Heart className="h-4 w-4 mr-1" />
            <span>Momentos únicos e inesquecíveis</span>
          </div>
        </div>

        {videos.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum vídeo disponível ainda
              </h3>
              <p className="text-gray-600">
                Seus vídeos aparecerão aqui assim que a clínica fizer o upload.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videos.map((video) => (
                <Card key={video.id} className="hover:shadow-lg transition-shadow border-pink-100">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-pink-800 flex items-center">
                        <Play className="h-5 w-5 mr-2" />
                        Ultrassom
                      </CardTitle>
                      <Badge variant="secondary" className="bg-pink-100 text-pink-800">
                        {video.fileSize}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {video.fileUrl ? (
                      <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                        <video
                          src={video.fileUrl}
                          controls
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Erro ao carregar vídeo:', e);
                          }}
                        >
                          Seu navegador não suporta a reprodução de vídeo.
                        </video>
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                        <div className="text-center text-gray-500">
                          <Play className="h-12 w-12 mx-auto mb-2" />
                          <p className="text-sm">Vídeo do seu bebê</p>
                          <p className="text-xs">{video.fileName}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        Enviado em {new Date(video.uploadDate).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="text-center py-8">
                <Heart className="h-8 w-8 text-pink-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Uma mensagem especial para você
                </h3>
                <p className="text-gray-700 italic max-w-2xl mx-auto leading-relaxed">
                  "Reviva esse momento mágico sempre que quiser. Ver seu bebê antes do nascimento 
                  é um carinho que emociona para sempre. Cada movimento, cada imagem é um tesouro 
                  que ficará guardado no seu coração."
                </p>
                <div className="mt-6 text-sm text-gray-600">
                  <p>Com carinho, equipe {clinic.name}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Powered by CineBaby - Momentos que emocionam para sempre</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PatientVideos;
