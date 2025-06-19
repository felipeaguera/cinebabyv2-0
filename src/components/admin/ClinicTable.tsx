
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

  const handleDeleteClinic = async (clinicId: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta clínica? Esta ação não pode ser desfeita.")) {
      try {
        const { error } = await supabase
          .from('clinics')
          .delete()
          .eq('id', clinicId);

        if (error) {
          console.error('Erro ao excluir clínica:', error);
          toast({
            title: "Erro",
            description: "Erro ao excluir clínica: " + error.message,
            variant: "destructive",
          });
          return;
        }

        onClinicDeleted();
        toast({
          title: "Clínica excluída",
          description: "A clínica foi removida com sucesso.",
        });
      } catch (err) {
        console.error('Erro ao excluir clínica:', err);
        toast({
          title: "Erro",
          description: "Erro inesperado ao excluir clínica.",
          variant: "destructive",
        });
      }
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
        <p>Tente buscar por um termo diferente ou cadastre uma nova clínica</p>
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
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
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
