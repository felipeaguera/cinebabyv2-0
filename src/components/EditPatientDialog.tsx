
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Patient {
  id: number;
  name: string;
  phone: string;
  clinicId: number;
  createdAt: string;
  videosCount: number;
}

interface EditPatientDialogProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPatient: Patient) => void;
}

const EditPatientDialog = ({ patient, isOpen, onClose, onSave }: EditPatientDialogProps) => {
  const [editedPatient, setEditedPatient] = useState(patient);
  const { toast } = useToast();

  const handleSave = () => {
    if (!editedPatient.name || !editedPatient.phone) {
      toast({
        title: "Erro",
        description: "Nome e telefone são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    onSave(editedPatient);
    onClose();
    
    toast({
      title: "Paciente atualizada!",
      description: `${editedPatient.name} foi atualizada com sucesso.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Paciente</DialogTitle>
          <DialogDescription>
            Altere os dados da paciente
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-patient-name">Nome Completo</Label>
            <Input
              id="edit-patient-name"
              value={editedPatient.name}
              onChange={(e) => setEditedPatient({ ...editedPatient, name: e.target.value })}
              placeholder="Ex: Maria Silva"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-patient-phone">Telefone</Label>
            <Input
              id="edit-patient-phone"
              value={editedPatient.phone}
              onChange={(e) => setEditedPatient({ ...editedPatient, phone: e.target.value })}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleSave} className="flex-1 cinebaby-button-primary">
              Salvar Alterações
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPatientDialog;
