import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  ShoppingCart,
  Calendar,
  Filter,
  Download
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar
} from "recharts";
import type { Purchase, Client, Plan } from "@shared/schema";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

interface PurchaseWithDetails extends Purchase {
  clientName?: string;
  planName?: string;
}

interface SalesStats {
  totalRevenue: number;
  totalSales: number;
  activePurchases: number;
  totalClients: number;
  recentRevenue: number;
  recentSales: number;
}

export default function AdminFinanceiro() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery<SalesStats>({
    queryKey: ['/api/purchases/stats'],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ['/api/plans'],
  });

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (selectedClient) params.append('clientId', selectedClient);
    if (minAmount) params.append('minAmount', minAmount);
    if (maxAmount) params.append('maxAmount', maxAmount);
    return params.toString();
  };

  const { data: purchases = [], isLoading: purchasesLoading } = useQuery<Purchase[]>({
    queryKey: ['/api/purchases', startDate, endDate, selectedClient, minAmount, maxAmount],
    queryFn: async () => {
      const params = buildQueryParams();
      const url = params ? `/api/purchases?${params}` : '/api/purchases';
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch purchases');
      return response.json();
    },
  });

  const purchasesWithDetails: PurchaseWithDetails[] = purchases.map(p => ({
    ...p,
    clientName: clients.find(c => c.id === p.clientId)?.companyName,
    planName: plans.find(pl => pl.id === p.planId)?.name,
  }));

  const chartData = purchasesWithDetails
    .reduce((acc, p) => {
      const month = format(new Date(p.purchaseDate), 'MMM yyyy', { locale: ptBR });
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.vendas += 1;
        existing.receita += parseFloat(p.amount);
      } else {
        acc.push({
          month,
          vendas: 1,
          receita: parseFloat(p.amount),
        });
      }
      return acc;
    }, [] as { month: string; vendas: number; receita: number }[])
    .slice(-6);

  const salesByClient = Object.values(
    purchasesWithDetails.reduce((acc, p) => {
      const clientName = p.clientName || 'Desconhecido';
      if (!acc[clientName]) {
        acc[clientName] = { cliente: clientName, vendas: 0, valor: 0 };
      }
      acc[clientName].vendas += 1;
      acc[clientName].valor += parseFloat(p.amount);
      return acc;
    }, {} as Record<string, { cliente: string; vendas: number; valor: number }>)
  ).sort((a, b) => b.valor - a.valor).slice(0, 10);

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedClient("");
    setMinAmount("");
    setMaxAmount("");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      expired: "secondary",
      cancelled: "destructive",
    };
    const labels: Record<string, string> = {
      active: "Ativo",
      expired: "Expirado",
      cancelled: "Cancelado",
    };
    return (
      <Badge variant={variants[status] || "secondary"} data-testid={`badge-status-${status}`}>
        {labels[status] || status}
      </Badge>
    );
  };

  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <h1 className="text-2xl font-bold">Relatórios Financeiros</h1>
            <div className="w-10" />
          </header>

          <main className="flex-1 overflow-auto p-6">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card data-testid="card-total-revenue">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Receita Total
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-revenue">
                      {statsLoading ? "..." : formatCurrency(stats?.totalRevenue || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{formatCurrency(stats?.recentRevenue || 0)} nos últimos 30 dias
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-total-sales">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de Vendas
                    </CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-sales">
                      {statsLoading ? "..." : stats?.totalSales || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{stats?.recentSales || 0} nos últimos 30 dias
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-active-sales">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Vendas Ativas
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-active-sales">
                      {statsLoading ? "..." : stats?.activePurchases || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Assinaturas ativas atualmente
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-total-clients">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Clientes Ativos
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-total-clients">
                      {statsLoading ? "..." : stats?.totalClients || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Com compras registradas
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card data-testid="card-revenue-chart">
                  <CardHeader>
                    <CardTitle>Receita por Mês</CardTitle>
                    <CardDescription>Últimos 6 meses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="receita" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            name="Receita (R$)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        Nenhum dado disponível
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card data-testid="card-sales-by-client">
                  <CardHeader>
                    <CardTitle>Top 10 Clientes</CardTitle>
                    <CardDescription>Por valor total de vendas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {salesByClient.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salesByClient} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="cliente" type="category" width={120} />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Bar dataKey="valor" fill="hsl(var(--primary))" name="Valor Total (R$)" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        Nenhum dado disponível
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card data-testid="card-sales-list">
                <CardHeader>
                  <CardTitle>Vendas Realizadas</CardTitle>
                  <CardDescription>
                    Filtre e visualize todas as vendas registradas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                      <div className="space-y-2">
                        <Label htmlFor="start-date">Data Inicial</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          data-testid="input-start-date"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="end-date">Data Final</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          data-testid="input-end-date"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="client-filter">Cliente</Label>
                        <Select value={selectedClient} onValueChange={setSelectedClient}>
                          <SelectTrigger id="client-filter" data-testid="select-client">
                            <SelectValue placeholder="Todos os clientes" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos os clientes</SelectItem>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.companyName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="min-amount">Valor Mínimo</Label>
                        <Input
                          id="min-amount"
                          type="number"
                          placeholder="R$ 0,00"
                          value={minAmount}
                          onChange={(e) => setMinAmount(e.target.value)}
                          data-testid="input-min-amount"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max-amount">Valor Máximo</Label>
                        <Input
                          id="max-amount"
                          type="number"
                          placeholder="R$ 10.000,00"
                          value={maxAmount}
                          onChange={(e) => setMaxAmount(e.target.value)}
                          data-testid="input-max-amount"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={handleClearFilters}
                        data-testid="button-clear-filters"
                      >
                        <Filter className="mr-2 h-4 w-4" />
                        Limpar Filtros
                      </Button>
                    </div>

                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Plano</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Expiração</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {purchasesLoading ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground">
                                Carregando vendas...
                              </TableCell>
                            </TableRow>
                          ) : purchasesWithDetails.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground">
                                Nenhuma venda encontrada
                              </TableCell>
                            </TableRow>
                          ) : (
                            purchasesWithDetails.map((purchase) => (
                              <TableRow 
                                key={purchase.id} 
                                data-testid={`row-purchase-${purchase.id}`}
                              >
                                <TableCell data-testid={`text-purchase-date-${purchase.id}`}>
                                  {format(new Date(purchase.purchaseDate), 'dd/MM/yyyy', { locale: ptBR })}
                                </TableCell>
                                <TableCell data-testid={`text-client-name-${purchase.id}`}>
                                  {purchase.clientName || "Desconhecido"}
                                </TableCell>
                                <TableCell data-testid={`text-plan-name-${purchase.id}`}>
                                  {purchase.planName || "Desconhecido"}
                                </TableCell>
                                <TableCell data-testid={`text-amount-${purchase.id}`}>
                                  {formatCurrency(parseFloat(purchase.amount))}
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(purchase.status)}
                                </TableCell>
                                <TableCell data-testid={`text-expiry-date-${purchase.id}`}>
                                  {format(new Date(purchase.expiryDate), 'dd/MM/yyyy', { locale: ptBR })}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {purchasesWithDetails.length > 0 && (
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <p data-testid="text-total-filtered">
                          Total de {purchasesWithDetails.length} venda(s) encontrada(s)
                        </p>
                        <p data-testid="text-total-filtered-amount">
                          Valor total: {formatCurrency(
                            purchasesWithDetails.reduce((sum, p) => sum + parseFloat(p.amount), 0)
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
