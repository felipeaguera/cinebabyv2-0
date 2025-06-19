
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Clinic {
  id: number;
  name: string;
  address: string;
  city: string;
  email: string;
  password: string;
  createdAt: string;
}

interface EditClinicDialogProps {
  clinic: Clinic;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedClinic: Clinic) => void;
}

const EditClinicDialog = ({ clinic, isOpen, onClose, onSave }: EditClinicDialogProps) => {
  const [editedClinic, setEditedClinic] = useState(clinic);
  const { toast } = useToast();

  const handleSave = () => {
    if (!editedClinic.name || !editedClinic.address || !editedClinic.city || !editedClinic.email || !editedClinic.password) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    onSave(editedClinic);
    onClose();
    
    toast({
      title: "Clínica atualizada!",
      description: `${editedClinic.name} foi atualizada com sucesso.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Clínica</DialogTitle>
          <DialogDescription>
            Altere os dados da clínica
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome da Clínica</Label>
            <Input
              id="edit-name"
              value={editedClinic.name}
              onChange={(e) => setEditedClinic({ ...editedClinic, name: e.target.value })}
              placeholder="Ex: Clínica São João"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-address">Endereço</Label>
            <Input
              id="edit-address"
              value={editedClinic.address}
              onChange={(e) => setEditedClinic({ ...editedClinic, address: e.target.value })}
              placeholder="Ex: Rua das Flores, 123"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-city">Cidade</Label>
            <Input
              id="edit-city"
              value={editedClinic.city}
              onChange={(e) => setEditedClinic({ ...editedClinic, city: e.target.value })}
              placeholder="Ex: São Paulo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email de Login</Label>
            <Input
              id="edit-email"
              type="email"
              value={editedClinic.email}
              onChange={(e) => setEditedClinic({ ...editedClinic, email: e.target.value })}
              placeholder="clinica@exemplo.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-password">Senha</Label>
            <Input
              id="edit-password"
              type="password"
              value={editedClinic.password}
              onChange={(e) => setEditedClinic({ ...editedClinic, password: e.target.value })}
              placeholder="Senha de acesso"
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

export default EditClinicDialog;
