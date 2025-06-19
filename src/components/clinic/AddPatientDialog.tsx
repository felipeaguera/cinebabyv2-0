
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  email: string;
}

interface AddPatientDialogProps {
  clinic: Clinic;
  onPatientAdded: () => void;
}

export const AddPatientDialog = ({ clinic, onPatientAdded }: AddPatientDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    phone: ""
  });
  const { toast } = useToast();

  const handleAddPatient = async () => {
    console.log('🔍 Iniciando cadastro de paciente...');
    console.log('🔍 Dados do novo paciente:', newPatient);
    console.log('🔍 Dados da clínica atual:', clinic);

    if (!newPatient.name) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!clinic || !clinic.id) {
      console.error('❌ Clínica não carregada ou sem ID:', clinic);
      toast({
        title: "Erro",
        description: "Erro de sessão da clínica. Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    try {
      const patientData = {
        name: newPatient.name,
        phone: newPatient.phone || null,
        mother_name: "Não informado",
        birth_date: "2000-01-01",
        gestational_age: "Não informado",
        clinic_id: clinic.id,
        qr_code: `PATIENT_${Date.now()}`
      };

      console.log('🔍 Dados que serão inseridos:', patientData);

      const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar paciente:', error);
        toast({
          title: "Erro",
          description: "Erro ao cadastrar paciente. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Paciente criada:', data.name);

      onPatientAdded();
      setNewPatient({ name: "", phone: "" });
      setIsOpen(false);

      toast({
        title: "Paciente cadastrada!",
        description: `${data.name} foi cadastrada com sucesso.`,
      });

    } catch (error) {
      console.error('❌ Erro ao cadastrar paciente:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar paciente. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="cinebaby-button-secondary text-lg px-6 py-3 rounded-xl">
          <Plus className="h-5 w-5 mr-2" />
          Nova Paciente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cadastrar Nova Paciente</DialogTitle>
          <DialogDescription>
            Preencha os dados da nova paciente
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Paciente</Label>
            <Input
              id="name"
              value={newPatient.name}
              onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
              placeholder="Ex: Ana Silva"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone (opcional)</Label>
            <Input
              id="phone"
              value={newPatient.phone}
              onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
              placeholder="(11) 99999-9999"
            />
          </div>
          <Button onClick={handleAddPatient} className="w-full cinebaby-button-secondary">
            Cadastrar Paciente
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
