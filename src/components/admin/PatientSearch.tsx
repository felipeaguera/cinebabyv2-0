
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PatientSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const PatientSearch = ({ searchTerm, onSearchChange }: PatientSearchProps) => {
  return (
    <Card className="cinebaby-card mb-6">
      <CardHeader>
        <CardTitle className="flex items-center text-teal-800">
          <Search className="h-6 w-6 mr-3 text-teal-600" />
          Buscar Paciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          placeholder="Busque por nome da paciente ou nome da mãe..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-md text-lg py-3"
        />
      </CardContent>
    </Card>
  );
};
