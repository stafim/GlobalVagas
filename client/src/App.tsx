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
import ForgotPassword from "@/pages/ForgotPassword";
import Signup from "@/pages/Signup";
import SignupCompany from "@/pages/SignupCompany";
import SignupOperator from "@/pages/SignupOperator";
import CompanyDashboard from "@/pages/CompanyDashboard";
import CompanyProfile from "@/pages/CompanyProfile";
import CompanyJobs from "@/pages/CompanyJobs";
import JobApplications from "@/pages/JobApplications";
import CompanyPlan from "@/pages/CompanyPlan";
import CompanyQuestions from "@/pages/CompanyQuestions";
import CompanyWorkTypes from "@/pages/CompanyWorkTypes";
import CompanyContractTypes from "@/pages/CompanyContractTypes";
import CompanyCredits from "@/pages/CompanyCredits";
import OperatorDashboard from "@/pages/OperatorDashboard";
import OperatorProfile from "@/pages/OperatorProfile";
import SavedJobs from "@/pages/SavedJobs";
import UsersList from "@/pages/UsersList";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminClients from "@/pages/AdminClients";
import AdminOperators from "@/pages/AdminOperators";
import AdminJobs from "@/pages/AdminJobs";
import AdminEditJob from "@/pages/AdminEditJob";
import AdminPlans from "@/pages/AdminPlans";
import AdminSectors from "@/pages/AdminSectors";
import AdminEvents from "@/pages/AdminEvents";
import AdminBanners from "@/pages/AdminBanners";
import AdminSettings from "@/pages/AdminSettings";
import AdminFinanceiro from "@/pages/AdminFinanceiro";
import AdminNewsletters from "@/pages/AdminNewsletters";
import Events from "@/pages/Events";
import JobView from "@/pages/JobView";
import PublicJobs from "@/pages/PublicJobs";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/recuperar-senha" component={ForgotPassword} />
      <Route path="/cadastro" component={Signup} />
      <Route path="/cadastro/company" component={SignupCompany} />
      <Route path="/cadastro/operator" component={SignupOperator} />
      <Route path="/dashboard/empresa" component={CompanyDashboard} />
      <Route path="/empresa/vagas" component={CompanyJobs} />
      <Route path="/empresa/vaga/:id/candidatos" component={JobApplications} />
      <Route path="/empresa/plano" component={CompanyPlan} />
      <Route path="/empresa/perfil" component={CompanyProfile} />
      <Route path="/empresa/creditos" component={CompanyCredits} />
      <Route path="/empresa/banco-perguntas" component={CompanyQuestions} />
      <Route path="/empresa/tipos-trabalho" component={CompanyWorkTypes} />
      <Route path="/empresa/tipos-contrato" component={CompanyContractTypes} />
      <Route path="/dashboard/operador" component={OperatorDashboard} />
      <Route path="/perfil/operador" component={OperatorProfile} />
      <Route path="/vagas-salvas" component={SavedJobs} />
      <Route path="/vagas" component={PublicJobs} />
      <Route path="/vaga/:id" component={JobView} />
      <Route path="/eventos" component={Events} />
      <Route path="/usuarios" component={UsersList} />
      <Route path="/admin/login" component={Login} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/clientes" component={AdminClients} />
      <Route path="/admin/operadores" component={AdminOperators} />
      <Route path="/admin/vagas/:id/editar" component={AdminEditJob} />
      <Route path="/admin/vagas" component={AdminJobs} />
      <Route path="/admin/planos" component={AdminPlans} />
      <Route path="/admin/financeiro" component={AdminFinanceiro} />
      <Route path="/admin/setores" component={AdminSectors} />
      <Route path="/admin/eventos" component={AdminEvents} />
      <Route path="/admin/banners" component={AdminBanners} />
      <Route path="/admin/newsletter" component={AdminNewsletters} />
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
