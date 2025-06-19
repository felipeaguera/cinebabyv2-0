
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ClinicSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const ClinicSearch = ({ searchTerm, onSearchChange }: ClinicSearchProps) => {
  return (
    <Card className="cinebaby-card mb-6">
      <CardHeader>
        <CardTitle className="flex items-center text-purple-800">
          <Search className="h-6 w-6 mr-3 text-purple-600" />
          Buscar Clínica
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          placeholder="Busque por nome da clínica, cidade ou email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-md text-lg py-3"
        />
      </CardContent>
    </Card>
  );
};
