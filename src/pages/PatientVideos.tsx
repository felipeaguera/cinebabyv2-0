
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Calendar, Heart } from "lucide-react";
import { useParams } from "react-router-dom";
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
}

interface Video {
  id: string;
  patient_id: string;
  file_name: string;
  upload_date: string;
  file_size: number;
  file_url?: string;
}

interface Clinic {
  id: string;
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPatientData = async () => {
      if (!qrCode) {
        console.log('❌ Nenhum ID de paciente fornecido na URL');
        setError('ID da paciente não encontrado na URL');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Buscando dados da paciente com ID:', qrCode);
      
      try {
        // Buscar dados da paciente usando o ID real
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', qrCode)
          .single();

        if (patientError) {
          console.error('❌ Erro ao buscar paciente:', patientError);
          setError('Paciente não encontrada');
          setLoading(false);
          return;
        }

        if (!patientData) {
          console.log('❌ Paciente não encontrada com ID:', qrCode);
          setError('Paciente não encontrada');
          setLoading(false);
          return;
        }

        console.log('✅ Paciente encontrada:', patientData.name);
        setPatient(patientData);

        // Buscar dados da clínica
        const { data: clinicData, error: clinicError } = await supabase
          .from('clinics')
          .select('*')
          .eq('id', patientData.clinic_id)
          .single();

        if (clinicError) {
          console.error('⚠️ Erro ao buscar clínica:', clinicError);
        } else if (clinicData) {
          console.log('✅ Clínica encontrada:', clinicData.name);
          setClinic(clinicData);
        }

        // Buscar vídeos da paciente
        const { data: videosData, error: videosError } = await supabase
          .from('videos')
          .select('*')
          .eq('patient_id', qrCode)
          .order('upload_date', { ascending: false });

        if (videosError) {
          console.error('⚠️ Erro ao buscar vídeos:', videosError);
          setVideos([]);
        } else {
          console.log('✅ Vídeos encontrados:', videosData?.length || 0);
          setVideos(videosData || []);
        }

      } catch (error) {
        console.error('❌ Erro geral ao carregar dados:', error);
        setError('Erro ao carregar dados da paciente');
      } finally {
        setLoading(false);
      }
    };

    loadPatientData();
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seus vídeos...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <img 
            src="/lovable-uploads/0f255407-3789-418f-8a06-69187f941576.png" 
            alt="CineBaby Logo" 
            className="mx-auto h-16 w-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Paciente Não Encontrada</h1>
          <p className="text-gray-600 mb-4">
            {error || 'Paciente ou vídeos não encontrados. Verifique com sua clínica.'}
          </p>
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <p className="font-medium">ID procurado:</p>
            <p className="text-gray-500 break-all">{qrCode}</p>
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
          {clinic && (
            <p className="text-gray-600 mb-1">Seus vídeos de ultrassom da {clinic.name}</p>
          )}
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
                        {(video.file_size / (1024 * 1024)).toFixed(2)} MB
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {video.file_url ? (
                      <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                        <video
                          src={video.file_url}
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
                          <p className="text-xs">{video.file_name}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        Enviado em {new Date(video.upload_date).toLocaleDateString('pt-BR', {
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
                {clinic && (
                  <div className="mt-6 text-sm text-gray-600">
                    <p>Com carinho, equipe {clinic.name}</p>
                  </div>
                )}
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
