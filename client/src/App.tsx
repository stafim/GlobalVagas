import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { AdminShell } from "@/components/AdminShell";
import { CompanyShell } from "@/components/CompanyShell";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import SignupCompany from "@/pages/SignupCompany";
import SignupOperator from "@/pages/SignupOperator";
import CompanyDashboard from "@/pages/CompanyDashboard";
import CompanyProfile from "@/pages/CompanyProfile";
import CompanyJobs from "@/pages/CompanyJobs";
import CompanyPlan from "@/pages/CompanyPlan";
import OperatorDashboard from "@/pages/OperatorDashboard";
import OperatorProfile from "@/pages/OperatorProfile";
import UsersList from "@/pages/UsersList";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminClients from "@/pages/AdminClients";
import AdminOperators from "@/pages/AdminOperators";
import AdminPlans from "@/pages/AdminPlans";
import AdminSectors from "@/pages/AdminSectors";
import AdminEvents from "@/pages/AdminEvents";
import AdminBanners from "@/pages/AdminBanners";
import AdminSettings from "@/pages/AdminSettings";
import AdminFinanceiro from "@/pages/AdminFinanceiro";
import Events from "@/pages/Events";
import JobView from "@/pages/JobView";
import PublicJobs from "@/pages/PublicJobs";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/cadastro" component={Signup} />
      <Route path="/cadastro/company" component={SignupCompany} />
      <Route path="/cadastro/operator" component={SignupOperator} />
      <Route path="/dashboard/empresa" component={CompanyDashboard} />
      <Route path="/empresa/vagas" component={CompanyJobs} />
      <Route path="/empresa/plano" component={CompanyPlan} />
      <Route path="/empresa/perfil" component={CompanyProfile} />
      <Route path="/dashboard/operador" component={OperatorDashboard} />
      <Route path="/perfil/operador" component={OperatorProfile} />
      <Route path="/vagas" component={PublicJobs} />
      <Route path="/vaga/:id" component={JobView} />
      <Route path="/eventos" component={Events} />
      <Route path="/usuarios" component={UsersList} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/clientes" component={AdminClients} />
      <Route path="/admin/operadores" component={AdminOperators} />
      <Route path="/admin/planos" component={AdminPlans} />
      <Route path="/admin/financeiro" component={AdminFinanceiro} />
      <Route path="/admin/setores" component={AdminSectors} />
      <Route path="/admin/eventos" component={AdminEvents} />
      <Route path="/admin/banners" component={AdminBanners} />
      <Route path="/admin/configuracoes" component={AdminSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AdminShell>
            <CompanyShell>
              <Toaster />
              <Router />
            </CompanyShell>
          </AdminShell>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
