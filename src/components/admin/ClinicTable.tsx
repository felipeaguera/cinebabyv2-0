
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

  const handleDeleteClinic = async (clinicId: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta clínica? Esta ação não pode ser desfeita.")) {
      try {
        const { error } = await supabase
          .from('clinics')
          .delete()
          .eq('id', clinicId);

        if (error) {
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
      }
    }
  };

  if (clinics.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <p className="text-xl mb-2">Nenhuma clínica cadastrada ainda</p>
        <p>Comece cadastrando sua primeira clínica</p>
      </div>
    );
  }

  return (
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
  );
};

export default ClinicTable;
