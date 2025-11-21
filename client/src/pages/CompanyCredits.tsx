import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyShell } from "@/components/CompanyShell";
import { 
  Coins, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  CreditCard,
  Package,
  Briefcase,
  ArrowUpCircle,
  ArrowDownCircle
} from "lucide-react";
import type { CreditTransaction } from "@shared/schema";

export default function CompanyCredits() {
  const creditsQuery = useQuery<number>({
    queryKey: ['/api/company/credits'],
  });

  const transactionsQuery = useQuery<CreditTransaction[]>({
    queryKey: ['/api/company/credit-transactions'],
  });

  const credits = creditsQuery.data || 0;
  const transactions = transactionsQuery.data || [];

  const stats = [
    {
      title: "Saldo Atual",
      value: credits.toString(),
      description: "Créditos disponíveis",
      icon: Coins,
    },
    {
      title: "Total Adquirido",
      value: transactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + parseInt(t.amount), 0)
        .toString(),
      description: "Créditos comprados",
      icon: TrendingUp,
    },
    {
      title: "Total Utilizado",
      value: transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + parseInt(t.amount), 0)
        .toString(),
      description: "Créditos gastos",
      icon: TrendingDown,
    },
    {
      title: "Transações",
      value: transactions.length.toString(),
      description: "Total de movimentações",
      icon: Calendar,
    },
  ];

  return (
    <CompanyShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Créditos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seus créditos e acompanhe o histórico de transações
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {creditsQuery.isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))
          ) : (
            stats.map((stat) => (
              <Card 
                key={stat.title} 
                className="hover-elevate"
                data-testid={`stat-${stat.title.toLowerCase().replace(/\s/g, '-')}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Credit Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Como Funcionam os Créditos
            </CardTitle>
            <CardDescription>
              Entenda o sistema de créditos da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Package className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Compra de Planos</h4>
                  <p className="text-sm text-muted-foreground">
                    Adquira créditos através da compra de planos. Cada plano oferece uma quantidade específica de créditos.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Publicação de Vagas</h4>
                  <p className="text-sm text-muted-foreground">
                    Utilize seus créditos para publicar vagas e atrair os melhores talentos para sua empresa.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions History */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Transações</CardTitle>
            <CardDescription>
              Acompanhe todas as movimentações de créditos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactionsQuery.isLoading ? (
              <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Coins className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">
                  Nenhuma transação ainda
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  Suas transações de créditos aparecerão aqui quando você adquirir ou utilizar créditos
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => {
                  const isCredit = transaction.type === 'credit';
                  const Icon = isCredit ? ArrowUpCircle : ArrowDownCircle;

                  return (
                    <div 
                      key={transaction.id} 
                      className="flex items-center gap-4 p-4 border rounded-lg hover-elevate"
                      data-testid={`transaction-${transaction.id}`}
                    >
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {transaction.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(transaction.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary">
                          {isCredit ? '+' : '-'}{transaction.amount}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Saldo: {transaction.balanceAfter}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CompanyShell>
  );
}
