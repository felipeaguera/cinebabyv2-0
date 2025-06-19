
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Eye, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
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

interface PatientTableProps {
  patients: Patient[];
  onPatientDeleted: () => void;
}

export const PatientTable = ({ patients, onPatientDeleted }: PatientTableProps) => {
  const { toast } = useToast();

  const handleDeletePatient = async (patientId: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta paciente? Todos os vídeos serão perdidos.")) {
      try {
        const { error: videosError } = await supabase
          .from('videos')
          .delete()
          .eq('patient_id', patientId);

        if (videosError) {
          console.error('❌ Erro ao deletar vídeos:', videosError);
        }

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

        onPatientDeleted();

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

  return (
    <Card className="cinebaby-card">
      <CardHeader>
        <CardTitle className="flex items-center text-purple-800">
          <Users className="h-6 w-6 mr-3 text-purple-600" />
          Lista de Pacientes
        </CardTitle>
        <CardDescription className="text-lg">
          {patients.length} paciente{patients.length !== 1 ? 's' : ''} encontrada{patients.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {patients.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-xl mb-2">Nenhuma paciente encontrada</p>
            <p>Comece cadastrando sua primeira paciente</p>
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
                {patients.map((patient) => (
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
  );
};
