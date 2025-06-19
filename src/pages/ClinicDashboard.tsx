
import { useState, useEffect } from "react";
import { useClinicData } from "@/hooks/useClinicData";
import { ClinicHeader } from "@/components/clinic/ClinicHeader";
import { AddPatientDialog } from "@/components/clinic/AddPatientDialog";
import { PatientSearch } from "@/components/clinic/PatientSearch";
import { PatientTable } from "@/components/clinic/PatientTable";

const ClinicDashboard = () => {
  const { patients, clinic, loading, reloadPatients } = useClinicData();
  const [filteredPatients, setFilteredPatients] = useState(patients);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm) ||
      patient.mother_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  if (loading) {
    return (
      <div className="min-h-screen cinebaby-gradient flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando dados da clínica...</p>
        </div>
      </div>
    );
  }

  if (!clinic) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen cinebaby-gradient">
      <ClinicHeader clinic={clinic} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Pacientes</h2>
              <p className="text-white/80 text-lg">Gerencie as pacientes da sua clínica</p>
            </div>
            <AddPatientDialog clinic={clinic} onPatientAdded={reloadPatients} />
          </div>
        </div>

        <PatientSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        <PatientTable patients={filteredPatients} onPatientDeleted={reloadPatients} />
      </main>
    </div>
  );
};

export default ClinicDashboard;
