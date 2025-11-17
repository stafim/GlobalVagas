import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

export function FilterSidebar() {
  const [keyword, setKeyword] = useState("");
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("any");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const workTypes = [
    { id: "remote", label: "Remoto" },
    { id: "hybrid", label: "Híbrido" },
    { id: "onsite", label: "Presencial" },
  ];

  const countries = ["Brasil", "Estados Unidos", "Portugal", "Espanha", "Alemanha", "Reino Unido"];
  const categories = ["Tecnologia", "Saúde", "Finanças", "Educação", "Marketing", "Design"];
  const levels = ["Júnior", "Pleno", "Sênior", "Lead"];

  const handleWorkTypeChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedWorkTypes([...selectedWorkTypes, id]);
    } else {
      setSelectedWorkTypes(selectedWorkTypes.filter((t) => t !== id));
    }
  };

  const handleClearFilters = () => {
    setKeyword("");
    setSelectedWorkTypes([]);
    setSelectedCountry("");
    setSelectedCategory("");
    setSelectedLevel("");
    setSelectedTimeFrame("any");
    setActiveFilters([]);
    console.log("Filters cleared");
  };

  const handleApplyFilters = () => {
    console.log("Filters applied:", {
      keyword,
      selectedWorkTypes,
      selectedCountry,
      selectedCategory,
      selectedLevel,
      selectedTimeFrame,
    });
  };

  return (
    <aside className="w-full md:w-80 bg-card border rounded-lg p-4 h-fit sticky top-20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          <h2 className="font-semibold text-lg">Filtros</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          data-testid="button-clear-filters"
        >
          Limpar
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="keyword-search" className="mb-2 block">
            Palavra-chave
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="keyword-search"
              placeholder="Ex: React, Designer..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9"
              data-testid="input-keyword"
            />
          </div>
        </div>

        <Separator />

        <div>
          <Label className="mb-3 block">Tipo de Trabalho</Label>
          <div className="space-y-2">
            {workTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={type.id}
                  checked={selectedWorkTypes.includes(type.id)}
                  onCheckedChange={(checked) =>
                    handleWorkTypeChange(type.id, checked as boolean)
                  }
                  data-testid={`checkbox-${type.id}`}
                />
                <label
                  htmlFor={type.id}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {type.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <Label htmlFor="country-select" className="mb-2 block">
            País
          </Label>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger id="country-select" data-testid="select-country">
              <SelectValue placeholder="Selecione o país" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div>
          <Label htmlFor="category-select" className="mb-2 block">
            Categoria
          </Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger id="category-select" data-testid="select-category">
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div>
          <Label htmlFor="level-select" className="mb-2 block">
            Nível de Experiência
          </Label>
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger id="level-select" data-testid="select-level">
              <SelectValue placeholder="Selecione o nível" />
            </SelectTrigger>
            <SelectContent>
              {levels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div>
          <Label className="mb-3 block">Data de Publicação</Label>
          <RadioGroup value={selectedTimeFrame} onValueChange={setSelectedTimeFrame}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="24h" id="24h" data-testid="radio-24h" />
              <Label htmlFor="24h" className="cursor-pointer font-normal">
                Últimas 24 horas
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="week" id="week" data-testid="radio-week" />
              <Label htmlFor="week" className="cursor-pointer font-normal">
                Última semana
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="month" id="month" data-testid="radio-month" />
              <Label htmlFor="month" className="cursor-pointer font-normal">
                Último mês
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="any" id="any" data-testid="radio-any" />
              <Label htmlFor="any" className="cursor-pointer font-normal">
                Qualquer período
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Button
          className="w-full"
          onClick={handleApplyFilters}
          data-testid="button-apply-filters"
        >
          Aplicar Filtros
        </Button>
      </div>
    </aside>
  );
}
