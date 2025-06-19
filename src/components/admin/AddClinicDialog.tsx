
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
  const [isLoading, setIsLoading] = useState(false);
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

    if (newClinic.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Tentando criar clínica:', newClinic.name, newClinic.email);

      // Primeiro, verificar se já existe uma clínica com este email
      const { data: existingClinic } = await supabase
        .from('clinics')
        .select('email')
        .eq('email', newClinic.email)
        .maybeSingle();

      if (existingClinic) {
        toast({
          title: "Erro",
          description: "Já existe uma clínica cadastrada com este email.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Criar usuário no Supabase Auth com confirmação automática
      console.log('Criando usuário no Supabase Auth...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newClinic.email,
        password: newClinic.password,
        options: {
          emailRedirectTo: `${window.location.origin}/clinic/login`,
          data: {
            clinic_name: newClinic.name,
            email_confirm: true
          }
        }
      });

      if (authError) {
        console.error('Erro ao criar usuário no Supabase Auth:', authError);
        
        if (authError.message.includes('User already registered')) {
          toast({
            title: "Erro",
            description: "Este email já está registrado no sistema.",
            variant: "destructive",
          });
        } else if (authError.message.includes('For security purposes')) {
          toast({
            title: "Limite de tentativas",
            description: "Aguarde alguns segundos antes de tentar novamente.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro",
            description: "Erro ao criar usuário: " + authError.message,
            variant: "destructive",
          });
        }
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        toast({
          title: "Erro",
          description: "Não foi possível criar o usuário.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      console.log('Usuário criado no Supabase Auth:', authData.user.id);

      // Criar a clínica na tabela clinics
      console.log('Criando clínica na tabela...');
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .insert({
          name: newClinic.name,
          address: newClinic.address,
          city: newClinic.city,
          email: newClinic.email,
          phone: newClinic.phone || null,
          user_id: authData.user.id
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
        setIsLoading(false);
        return;
      }

      console.log('Clínica criada com sucesso:', clinicData);

      // Limpar formulário e fechar dialog
      setNewClinic({ name: "", address: "", city: "", email: "", password: "", phone: "" });
      setIsOpen(false);
      
      // Chamar callback para atualizar a lista
      onClinicAdded();

      toast({
        title: "Clínica cadastrada!",
        description: `${clinicData.name} foi cadastrada com sucesso. A clínica pode fazer login com o email e senha fornecidos.`,
      });
    } catch (err) {
      console.error('Erro inesperado ao cadastrar clínica:', err);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
            Preencha os dados da nova clínica. Será criado um login de acesso para a clínica.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Clínica *</Label>
            <Input
              id="name"
              value={newClinic.name}
              onChange={(e) => setNewClinic({ ...newClinic, name: e.target.value })}
              placeholder="Ex: Clínica São João"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Endereço *</Label>
            <Input
              id="address"
              value={newClinic.address}
              onChange={(e) => setNewClinic({ ...newClinic, address: e.target.value })}
              placeholder="Ex: Rua das Flores, 123"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Cidade *</Label>
            <Input
              id="city"
              value={newClinic.city}
              onChange={(e) => setNewClinic({ ...newClinic, city: e.target.value })}
              placeholder="Ex: São Paulo"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={newClinic.phone}
              onChange={(e) => setNewClinic({ ...newClinic, phone: e.target.value })}
              placeholder="Ex: (11) 99999-9999"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email de Login *</Label>
            <Input
              id="email"
              type="email"
              value={newClinic.email}
              onChange={(e) => setNewClinic({ ...newClinic, email: e.target.value })}
              placeholder="clinica@exemplo.com"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha de Acesso *</Label>
            <Input
              id="password"
              type="password"
              value={newClinic.password}
              onChange={(e) => setNewClinic({ ...newClinic, password: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              disabled={isLoading}
            />
          </div>
          <Button 
            onClick={handleAddClinic} 
            className="w-full cinebaby-button-primary"
            disabled={isLoading}
          >
            {isLoading ? "Cadastrando..." : "Cadastrar Clínica"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddClinicDialog;
