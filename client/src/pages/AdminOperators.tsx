import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HardHat, Mail, Phone, MapPin, Briefcase, Calendar, Award, Eye, Search, Download, Plus, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Operator, InsertOperator } from "@shared/schema";
import { insertOperatorSchema } from "@shared/schema";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import jsPDF from "jspdf";
import operlistLogo from "@assets/operlist2025_1763133653351.png";

const formSchema = insertOperatorSchema.extend({
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export default function AdminOperators() {
  const { userType } = useAuth();
  const { toast } = useToast();
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [searchName, setSearchName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      cpf: "",
      phone: "",
      birthDate: "",
      profession: "",
      experienceYears: "",
      certifications: "",
      availability: "",
      preferredLocation: "",
      workType: "",
      skills: "",
      bio: "",
      profilePhotoUrl: "",
    },
  });

  const { data: operators, isLoading } = useQuery<Operator[]>({
    queryKey: ['/api/operators'],
    retry: false,
    enabled: userType === 'admin',
  });

  const createOperatorMutation = useMutation({
    mutationFn: async (operatorData: InsertOperator) => {
      const response = await apiRequest('POST', '/api/operators/register', operatorData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/operators'] });
      toast({
        title: "Operador criado!",
        description: "O operador foi cadastrado com sucesso.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar operador",
        description: error.message,
      });
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    createOperatorMutation.mutate(values);
  };

  const filteredOperators = useMemo(() => {
    if (!operators) return [];
    
    return operators.filter((operator) => {
      const matchesName = !searchName || 
        operator.fullName.toLowerCase().includes(searchName.toLowerCase());
      
      return matchesName;
    });
  }, [operators, searchName]);

  const handleDownloadPDF = (operator: Operator) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 15;

    const img = new Image();
    img.src = operlistLogo;
    
    img.onload = () => {
      const logoWidth = 40;
      const logoHeight = (img.height / img.width) * logoWidth;
      const logoX = (pageWidth - logoWidth) / 2;
      
      doc.addImage(img, 'PNG', logoX, yPosition, logoWidth, logoHeight);
      
      yPosition += logoHeight + 15;

      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(operator.fullName, pageWidth / 2, yPosition, { align: "center" });
      
      yPosition += 10;
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(operator.profession, pageWidth / 2, yPosition, { align: "center" });
      
      yPosition += 15;
      doc.setDrawColor(102, 45, 145);
      doc.setLineWidth(0.5);
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      
      yPosition += 10;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Informações de Contato", 20, yPosition);
      
      yPosition += 8;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`E-mail: ${operator.email}`, 20, yPosition);
      
      yPosition += 6;
      doc.text(`Telefone: ${operator.phone}`, 20, yPosition);
      
      if (operator.preferredLocation) {
        yPosition += 6;
        doc.text(`Localização: ${operator.preferredLocation}`, 20, yPosition);
      }
      
      yPosition += 15;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Informações Profissionais", 20, yPosition);
      
      yPosition += 8;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      
      if (operator.experienceYears) {
        doc.text(`Experiência: ${operator.experienceYears}`, 20, yPosition);
        yPosition += 6;
      }
      
      if (operator.certifications) {
        doc.text(`Certificações: ${operator.certifications}`, 20, yPosition);
        yPosition += 6;
      }
      
      if (operator.availability) {
        doc.text(`Disponibilidade: ${operator.availability}`, 20, yPosition);
        yPosition += 6;
      }
      
      if (operator.workType) {
        doc.text(`Tipo de Trabalho: ${operator.workType}`, 20, yPosition);
        yPosition += 6;
      }
      
      if (operator.skills) {
        yPosition += 9;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Habilidades", 20, yPosition);
        
        yPosition += 8;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        const skillsLines = doc.splitTextToSize(operator.skills, pageWidth - 40);
        doc.text(skillsLines, 20, yPosition);
        yPosition += skillsLines.length * 6;
      }
      
      if (operator.bio) {
        yPosition += 9;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Sobre", 20, yPosition);
        
        yPosition += 8;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        const bioLines = doc.splitTextToSize(operator.bio, pageWidth - 40);
        doc.text(bioLines, 20, yPosition);
      }
      
      const fileName = `curriculo_${operator.fullName.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "PDF gerado com sucesso",
        description: `Currículo de ${operator.fullName} foi baixado`,
      });
    };
    
    img.onerror = () => {
      toast({
        variant: "destructive",
        title: "Erro ao gerar PDF",
        description: "Não foi possível carregar o logo",
      });
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-operator">
                <Plus className="h-4 w-4 mr-2" />
                Novo Operador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Operador</DialogTitle>
                <DialogDescription>
                  Cadastre um novo operador com suas informações profissionais
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Informações Pessoais</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo*</FormLabel>
                            <FormControl>
                              <Input placeholder="João Silva Santos" {...field} data-testid="input-full-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="cpf"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CPF*</FormLabel>
                            <FormControl>
                              <Input placeholder="000.000.000-00" {...field} data-testid="input-cpf" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email*</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="joao@email.com" {...field} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha*</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Mínimo 6 caracteres" {...field} data-testid="input-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone*</FormLabel>
                            <FormControl>
                              <Input placeholder="(00) 00000-0000" {...field} data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="birthDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Nascimento</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} value={field.value || ""} data-testid="input-birth-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Informações Profissionais</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="profession"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profissão*</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Operador de Escavadeira" {...field} data-testid="input-profession" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="experienceYears"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Anos de Experiência</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 5 anos" {...field} value={field.value || ""} data-testid="input-experience-years" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="certifications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Certificações</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: NR-11, NR-12" {...field} value={field.value || ""} data-testid="input-certifications" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="availability"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Disponibilidade</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Imediata, 30 dias" {...field} value={field.value || ""} data-testid="input-availability" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="preferredLocation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Localização Preferida</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: São Paulo, SP" {...field} value={field.value || ""} data-testid="input-location" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="workType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Trabalho</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Tempo Integral, Freelance" {...field} value={field.value || ""} data-testid="input-work-type" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Informações Adicionais</h3>
                    <FormField
                      control={form.control}
                      name="skills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Habilidades</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva suas principais habilidades e competências"
                              {...field}
                              value={field.value || ""}
                              className="resize-none"
                              rows={3}
                              data-testid="input-skills"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sobre</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Breve resumo sobre sua experiência profissional"
                              {...field}
                              value={field.value || ""}
                              className="resize-none"
                              rows={4}
                              data-testid="input-bio"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createOperatorMutation.isPending}
                      data-testid="button-save"
                    >
                      {createOperatorMutation.isPending ? "Salvando..." : "Cadastrar Operador"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-2">
            <div>
        <CardTitle className="text-sm font-medium">
          Total de Operadores
        </CardTitle>
        <CardDescription>Profissionais cadastrados na plataforma</CardDescription>
            </div>
            <HardHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-total-operators">
        {isLoading ? (
          <Skeleton className="h-10 w-20" />
        ) : (
          operators?.length || 0
        )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-2">
            <div>
        <CardTitle className="text-sm font-medium">
          Filtros
        </CardTitle>
        <CardDescription>Buscar operadores por nome</CardDescription>
            </div>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="pl-9"
          data-testid="input-search-name"
        />
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : filteredOperators.length > 0 ? (
        <div className="space-y-3">
          {filteredOperators.map((operator) => (
            <Card key={operator.id} data-testid={`card-operator-${operator.id}`} className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={operator.profilePhotoUrl || undefined} 
                      alt={operator.fullName}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-lg">
                      {operator.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg truncate" data-testid={`text-operator-name-${operator.id}`}>
                        {operator.fullName}
                      </h3>
                      <Badge variant="secondary">
                        <HardHat className="h-3 w-3 mr-1" />
                        Operador
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{operator.profession}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{operator.email}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{operator.phone}</span>
                      </div>

                      {operator.experienceYears && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{operator.experienceYears} de experiência</span>
                        </div>
                      )}

                      {operator.preferredLocation && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{operator.preferredLocation}</span>
                        </div>
                      )}

                      {operator.certifications && (
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{operator.certifications}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadPDF(operator)}
                      data-testid={`button-download-operator-${operator.id}`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Perfil
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedOperator(operator)}
                      data-testid={`button-view-operator-${operator.id}`}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : operators && operators.length > 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              Nenhum operador encontrado com este filtro
            </p>
            <Button
              variant="outline"
              onClick={() => setSearchName("")}
              className="mt-4"
              data-testid="button-clear-filters"
            >
              Limpar Filtros
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HardHat className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              Nenhum operador cadastrado ainda
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedOperator} onOpenChange={() => setSelectedOperator(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage 
                  src={selectedOperator?.profilePhotoUrl || undefined} 
                  alt={selectedOperator?.fullName}
                  className="object-cover"
                />
                <AvatarFallback>
                  {selectedOperator?.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {selectedOperator?.fullName}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedOperator && handleDownloadPDF(selectedOperator)}
                data-testid="button-download-pdf-modal"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Perfil
              </Button>
            </DialogTitle>
            <DialogDescription>
              Informações detalhadas do operador
            </DialogDescription>
          </DialogHeader>

          {selectedOperator && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Informações Básicas</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Profissão</p>
                    <p className="font-medium">{selectedOperator.profession}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CPF</p>
                    <p className="font-medium">{selectedOperator.cpf}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <p className="font-medium">{selectedOperator.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{selectedOperator.phone}</p>
                  </div>
                  {selectedOperator.birthDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                      <p className="font-medium">{selectedOperator.birthDate}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Informações Profissionais</h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedOperator.experienceYears && (
                    <div>
                      <p className="text-sm text-muted-foreground">Experiência</p>
                      <p className="font-medium">{selectedOperator.experienceYears}</p>
                    </div>
                  )}
                  {selectedOperator.certifications && (
                    <div>
                      <p className="text-sm text-muted-foreground">Certificações</p>
                      <p className="font-medium">{selectedOperator.certifications}</p>
                    </div>
                  )}
                  {selectedOperator.availability && (
                    <div>
                      <p className="text-sm text-muted-foreground">Disponibilidade</p>
                      <p className="font-medium">{selectedOperator.availability}</p>
                    </div>
                  )}
                  {selectedOperator.workType && (
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo de Trabalho</p>
                      <p className="font-medium">{selectedOperator.workType}</p>
                    </div>
                  )}
                  {selectedOperator.preferredLocation && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Localização Preferida</p>
                      <p className="font-medium">{selectedOperator.preferredLocation}</p>
                    </div>
                  )}
                  {selectedOperator.skills && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Habilidades</p>
                      <p className="font-medium">{selectedOperator.skills}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedOperator.bio && (
                <div>
                  <h4 className="font-semibold mb-3">Biografia</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedOperator.bio}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
