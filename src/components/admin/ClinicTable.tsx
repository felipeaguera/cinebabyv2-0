
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EditClinicDialog from "@/components/EditClinicDialog";

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

interface ClinicTableProps {
  clinics: Clinic[];
  onClinicDeleted: () => void;
}

const ClinicTable = ({ clinics, onClinicDeleted }: ClinicTableProps) => {
  const { toast } = useToast();
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingClinicId, setDeletingClinicId] = useState<string | null>(null);

  const handleDeleteClinic = async (clinicId: string, clinicName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a clínica "${clinicName}"? Esta ação não pode ser desfeita e também excluirá todos os pacientes e vídeos associados.`)) {
      return;
    }

    setDeletingClinicId(clinicId);
    
    try {
      console.log('Iniciando exclusão da clínica:', clinicId);

      // Primeiro, vamos contar quantos pacientes e vídeos serão excluídos
      const { data: patientsCount } = await supabase
        .from('patients')
        .select('id', { count: 'exact' })
        .eq('clinic_id', clinicId);

      console.log(`Clínica possui ${patientsCount?.length || 0} pacientes que serão excluídos`);

      // Excluir a clínica (os pacientes e vídeos serão excluídos automaticamente por CASCADE)
      const { error } = await supabase
        .from('clinics')
        .delete()
        .eq('id', clinicId);

      if (error) {
        console.error('Erro ao excluir clínica:', error);
        toast({
          title: "Erro",
          description: `Erro ao excluir clínica: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Clínica excluída com sucesso');
      
      // Recarregar a lista de clínicas
      onClinicDeleted();
      
      toast({
        title: "Clínica excluída",
        description: `A clínica "${clinicName}" foi removida com sucesso${patientsCount?.length ? ` junto com ${patientsCount.length} paciente(s)` : ''}.`,
      });
    } catch (err) {
      console.error('Erro inesperado ao excluir clínica:', err);
      toast({
        title: "Erro",
        description: "Erro inesperado ao excluir clínica. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDeletingClinicId(null);
    }
  };

  const handleEditClinic = (clinic: Clinic) => {
    setEditingClinic(clinic);
    setIsEditDialogOpen(true);
  };

  const handleSaveClinic = async (updatedClinic: any) => {
    try {
      const { error } = await supabase
        .from('clinics')
        .update({
          name: updatedClinic.name,
          address: updatedClinic.address,
          city: updatedClinic.city,
          email: updatedClinic.email,
          phone: updatedClinic.phone || null
        })
        .eq('id', updatedClinic.id);

      if (error) {
        console.error('Erro ao atualizar clínica:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar clínica: " + error.message,
          variant: "destructive",
        });
        return;
      }

      onClinicDeleted(); // Recarrega a lista
      toast({
        title: "Clínica atualizada",
        description: "As informações da clínica foram atualizadas com sucesso.",
      });
    } catch (err) {
      console.error('Erro ao atualizar clínica:', err);
      toast({
        title: "Erro",
        description: "Erro ao atualizar clínica. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (clinics.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <p className="text-xl mb-2">Nenhuma clínica encontrada</p>
        <p>Cadastre uma nova clínica para começar</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-purple-50 to-teal-50">
              <TableHead className="font-semibold">Nome</TableHead>
              <TableHead className="font-semibold">Cidade</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
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
                  <Badge className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300">
                    Ativa
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClinic(clinic)}
                      className="hover:bg-blue-50 hover:border-blue-300 text-blue-600"
                      disabled={deletingClinicId === clinic.id}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClinic(clinic.id, clinic.name)}
                      className="hover:bg-red-50 hover:border-red-300 text-red-600"
                      disabled={deletingClinicId === clinic.id}
                    >
                      {deletingClinicId === clinic.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingClinic && (
        <EditClinicDialog
          clinic={{
            id: parseInt(editingClinic.id),
            name: editingClinic.name,
            address: editingClinic.address,
            city: editingClinic.city,
            email: editingClinic.email,
            password: "",
            createdAt: editingClinic.created_at
          }}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingClinic(null);
          }}
          onSave={(updatedClinic) => {
            handleSaveClinic({
              id: editingClinic.id,
              name: updatedClinic.name,
              address: updatedClinic.address,
              city: updatedClinic.city,
              email: updatedClinic.email,
              phone: editingClinic.phone
            });
            setIsEditDialogOpen(false);
            setEditingClinic(null);
          }}
        />
      )}
    </>
  );
};

export default ClinicTable;
