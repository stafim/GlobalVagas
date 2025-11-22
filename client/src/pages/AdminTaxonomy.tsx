import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tags, Briefcase, FileText } from "lucide-react";

export default function AdminTaxonomy() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-muted rounded-lg">
          <Tags className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Taxonomia</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie as classificações e categorias do sistema
          </p>
        </div>
      </div>

      <Tabs defaultValue="tipos-trabalho" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tipos-trabalho" data-testid="tab-work-types">
            <Briefcase className="h-4 w-4 mr-2" />
            Tipos de Trabalho
          </TabsTrigger>
          <TabsTrigger value="tipos-contrato" data-testid="tab-contract-types">
            <FileText className="h-4 w-4 mr-2" />
            Tipos de Contrato
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tipos-trabalho" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Trabalho</CardTitle>
              <CardDescription>
                Configure os tipos de trabalho disponíveis para as vagas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configuração de tipos de trabalho em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tipos-contrato" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Contrato</CardTitle>
              <CardDescription>
                Configure os tipos de contrato disponíveis para as vagas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configuração de tipos de contrato em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
