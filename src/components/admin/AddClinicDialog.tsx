
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddClinicDialogProps {
  onClinicAdded: () => void;
}

const AddClinicDialog = ({ onClinicAdded }: AddClinicDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newClinic, setNewClinic] = useState({
    name: "",
    address: "",
    city: "",
    email: "",
    password: "",
    phone: ""
  });
  const { toast } = useToast();

  const handleAddClinic = async () => {
    if (!newClinic.name || !newClinic.address || !newClinic.city || !newClinic.email || !newClinic.password) {
      toast({
        title: "Erro",
        description: "Nome, endereço, cidade, email e senha são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Tentando criar clínica:', newClinic.name, newClinic.email);

      // Criar clínica diretamente na tabela
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .insert({
          name: newClinic.name,
          address: newClinic.address,
          city: newClinic.city,
          email: newClinic.email,
          phone: newClinic.phone || null
        })
        .select()
        .single();

      if (clinicError) {
        console.error('Erro ao criar clínica:', clinicError);
        toast({
          title: "Erro",
          description: "Erro ao criar clínica: " + clinicError.message,
          variant: "destructive",
        });
        return;
      }

      console.log('Clínica criada com sucesso:', clinicData);

      setNewClinic({ name: "", address: "", city: "", email: "", password: "", phone: "" });
      setIsOpen(false);
      onClinicAdded();

      toast({
        title: "Clínica cadastrada!",
        description: `${clinicData.name} foi cadastrada com sucesso.`,
      });
    } catch (err) {
      console.error('Erro inesperado ao cadastrar clínica:', err);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado: " + (err as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="cinebaby-button-primary text-lg px-6 py-3 rounded-xl">
          <Plus className="h-5 w-5 mr-2" />
          Nova Clínica
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cadastrar Nova Clínica</DialogTitle>
          <DialogDescription>
            Preencha os dados da nova clínica
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Clínica</Label>
            <Input
              id="name"
              value={newClinic.name}
              onChange={(e) => setNewClinic({ ...newClinic, name: e.target.value })}
              placeholder="Ex: Clínica São João"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={newClinic.address}
              onChange={(e) => setNewClinic({ ...newClinic, address: e.target.value })}
              placeholder="Ex: Rua das Flores, 123"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={newClinic.city}
              onChange={(e) => setNewClinic({ ...newClinic, city: e.target.value })}
              placeholder="Ex: São Paulo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={newClinic.phone}
              onChange={(e) => setNewClinic({ ...newClinic, phone: e.target.value })}
              placeholder="Ex: (11) 99999-9999"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email da Clínica</Label>
            <Input
              id="email"
              type="email"
              value={newClinic.email}
              onChange={(e) => setNewClinic({ ...newClinic, email: e.target.value })}
              placeholder="clinica@exemplo.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={newClinic.password}
              onChange={(e) => setNewClinic({ ...newClinic, password: e.target.value })}
              placeholder="Senha de acesso"
            />
          </div>
          <Button onClick={handleAddClinic} className="w-full cinebaby-button-primary">
            Cadastrar Clínica
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddClinicDialog;
