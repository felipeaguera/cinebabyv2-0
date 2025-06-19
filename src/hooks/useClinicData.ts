
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  email: string;
}

export const useClinicData = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const clinicData = localStorage.getItem("cinebaby_clinic");
    console.log('🔍 Dados da clínica no localStorage:', clinicData);
    
    if (!clinicData) {
      console.log('❌ Nenhum dado de clínica encontrado, redirecionando para login');
      navigate("/clinic/login");
      return;
    }

    try {
      const parsedClinic = JSON.parse(clinicData);
      console.log('✅ Clínica carregada:', parsedClinic);
      
      setClinic(parsedClinic);
      
      if (parsedClinic.id) {
        loadPatientsFromSupabase(parsedClinic.id);
      } else {
        console.log('❌ ID da clínica não encontrado');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Erro ao fazer parse dos dados da clínica:', error);
      navigate("/clinic/login");
    }
  }, [navigate]);

  const loadPatientsFromSupabase = async (clinicId: string) => {
    try {
      console.log('🔍 Carregando pacientes da clínica:', clinicId);
      
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (patientsError) {
        console.error('❌ Erro ao carregar pacientes:', patientsError);
        toast({
          title: "Erro",
          description: "Erro ao carregar pacientes. Tente novamente.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log('✅ Pacientes carregadas:', patientsData?.length || 0);

      const patientsWithVideos = await Promise.all(
        (patientsData || []).map(async (patient) => {
          const { data: videos } = await supabase
            .from('videos')
            .select('id')
            .eq('patient_id', patient.id);
          
          return {
            ...patient,
            videosCount: videos?.length || 0
          };
        })
      );

      setPatients(patientsWithVideos);
    } catch (error) {
      console.error('❌ Erro geral ao carregar pacientes:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const reloadPatients = () => {
    if (clinic?.id) {
      loadPatientsFromSupabase(clinic.id);
    }
  };

  return {
    patients,
    clinic,
    loading,
    reloadPatients
  };
};
