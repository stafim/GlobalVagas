import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Calendar, Check, Clock, X, Package } from "lucide-react";
import type { Purchase, Plan } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface PurchaseWithPlan extends Purchase {
  plan: Plan;
}

export default function CompanyPlan() {
  const { data: purchases = [], isLoading } = useQuery<PurchaseWithPlan[]>({
    queryKey: ['/api/companies/my-purchases'],
  });

  const activePurchases = purchases.filter((p) => p.status === 'active');
  const expiredPurchases = purchases.filter((p) => p.status !== 'active');

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysRemaining = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-48" />
              </CardContent>
            </Card>
          ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (purchases.length === 0) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-muted rounded-full p-6 mb-4">
            <CreditCard className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">
            Nenhum plano ativo
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Você ainda não possui planos contratados. Entre em contato com nosso time de vendas para conhecer nossos planos.
          </p>
        </CardContent>
      </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{activePurchases.length}</div>
            <p className="text-sm font-medium text-muted-foreground">
              Planos Ativos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{purchases.length}</div>
            <p className="text-sm font-medium text-muted-foreground">
              Total de Planos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{expiredPurchases.length}</div>
            <p className="text-sm font-medium text-muted-foreground">
              Planos Expirados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Planos Ativos */}
      {activePurchases.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Planos Ativos</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {activePurchases.map((purchase) => {
              const daysRemaining = getDaysRemaining(purchase.expiryDate);
              const isNearExpiry = daysRemaining <= 30 && daysRemaining > 0;
              
              return (
                <Card key={purchase.id} className="hover-elevate border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-2">{purchase.plan?.name}</CardTitle>
                        <CardDescription>{purchase.plan?.description}</CardDescription>
                      </div>
                      <Badge className="bg-green-500/15 text-green-700 border-green-500/30 dark:text-green-400">
                        ● Ativo
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-lg">R$ {purchase.amount}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Data de Compra</p>
                        <p className="font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(purchase.purchaseDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Validade</p>
                        <p className="font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(purchase.expiryDate)}
                        </p>
                      </div>
                    </div>

                    {isNearExpiry && (
                      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                        <p className="text-sm text-orange-700 dark:text-orange-400 font-medium">
                          ⚠️ Expira em {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}
                        </p>
                      </div>
                    )}

                    {purchase.plan && (
                      <div className="pt-3 border-t">
                        <p className="text-sm font-medium mb-2">Recursos inclusos:</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {purchase.plan.vacancyQuantity} {purchase.plan.vacancyQuantity === '1' ? 'vaga' : 'vagas'}
                          </Badge>
                          {purchase.plan.features && (
                            <Badge variant="secondary" className="text-xs">
                              {purchase.plan.features}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de Planos Expirados */}
      {expiredPurchases.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Histórico de Planos</h2>
          <div className="space-y-3">
            {expiredPurchases.map((purchase) => (
              <Card key={purchase.id} className="border-l-4 border-l-gray-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{purchase.plan?.name}</h3>
                        <Badge variant="outline" className="bg-gray-500/15 text-gray-700 border-gray-500/30 dark:text-gray-400">
                          <X className="h-3 w-3 mr-1" />
                          Expirado
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(purchase.purchaseDate)} - {formatDate(purchase.expiryDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          R$ {purchase.amount}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
        </div>
      </div>
    </>
  );
}
