import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase, Building2, MapPin, Eye } from "lucide-react";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLocation } from "wouter";
import type { Job } from "@shared/schema";

interface JobWithCompany extends Job {
  company?: {
    id: string;
    name: string;
  };
}

export default function AdminJobs() {
  const { userType } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");

  const { data: jobs, isLoading } = useQuery<JobWithCompany[]>({
    queryKey: ['/api/admin/jobs'],
    enabled: userType === 'admin',
    retry: false,
  });

  // Extract unique companies for filter
  const companies = useMemo(() => {
    if (!jobs) return [];
    const uniqueCompanies = new Map<string, string>();
    jobs.forEach(job => {
      if (job.company) {
        uniqueCompanies.set(job.company.id, job.company.name);
      }
    });
    return Array.from(uniqueCompanies.entries()).map(([id, name]) => ({ id, name }));
  }, [jobs]);

  // Filter jobs based on search and filters
  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    
    return jobs.filter(job => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === "all" || job.status === statusFilter;

      // Company filter
      const matchesCompany = companyFilter === "all" || job.companyId === companyFilter;

      return matchesSearch && matchesStatus && matchesCompany;
    });
  }, [jobs, searchTerm, statusFilter, companyFilter]);

  // Statistics
  const stats = useMemo(() => {
    if (!jobs) return { total: 0, active: 0, suspended: 0 };
    return {
      total: jobs.length,
      active: jobs.filter(j => j.status === 'Active').length,
      suspended: jobs.filter(j => j.status === 'Suspended').length,
    };
  }, [jobs]);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Vagas
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-jobs">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                stats.total
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vagas Ativas
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-jobs">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                stats.active
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vagas Suspensas
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-suspended-jobs">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                stats.suspended
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Vagas dos Clientes</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as vagas criadas pelos clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <Input
                placeholder="Título, empresa ou localização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-jobs"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Active">Ativas</SelectItem>
                  <SelectItem value="Suspended">Suspensas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Empresa</label>
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger data-testid="select-company-filter">
                  <SelectValue placeholder="Todas as empresas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Table */}
          <div className="rounded-md border">
            {isLoading ? (
              <div className="p-8 text-center">
                <Skeleton className="h-8 w-full mb-4" />
                <Skeleton className="h-8 w-full mb-4" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nenhuma vaga encontrada
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <TableRow key={job.id} data-testid={`row-job-${job.id}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          {job.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {job.company?.name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {job.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={job.status === 'Active' ? 'default' : 'secondary'}
                          data-testid={`badge-status-${job.id}`}
                        >
                          {job.status === 'Active' ? 'Ativa' : 'Suspensa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(job.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setLocation(`/vaga/${job.id}`)}
                          data-testid={`button-view-job-${job.id}`}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Results Count */}
          {!isLoading && filteredJobs.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Mostrando {filteredJobs.length} de {jobs?.length} vagas
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
