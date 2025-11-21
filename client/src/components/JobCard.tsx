import { MapPin, Bookmark, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface JobCardProps {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  country: string;
  workType: "Remote" | "Hybrid" | "Onsite";
  contractType: string;
  salary?: string;
  description: string;
  postedTime: string;
  applicants?: number;
  verified?: boolean;
}

export function JobCard({
  id,
  title,
  company,
  companyLogo,
  location,
  country,
  workType,
  contractType,
  salary,
  description,
  postedTime,
  applicants,
  verified = false,
}: JobCardProps) {
  const { toast } = useToast();

  // Check if job is saved
  const { data: savedData } = useQuery<{ isSaved: boolean }>({
    queryKey: ['/api/jobs', id, 'is-saved'],
  });

  const bookmarked = savedData?.isSaved || false;

  // Save job mutation
  const saveMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/jobs/${id}/save`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs', id, 'is-saved'] });
      queryClient.invalidateQueries({ queryKey: ['/api/operator/saved-jobs'] });
      toast({
        title: "Vaga salva!",
        description: "A vaga foi adicionada aos seus favoritos.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao salvar vaga",
        description: "Não foi possível salvar a vaga. Tente novamente.",
      });
    },
  });

  // Unsave job mutation
  const unsaveMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', `/api/jobs/${id}/save`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs', id, 'is-saved'] });
      queryClient.invalidateQueries({ queryKey: ['/api/operator/saved-jobs'] });
      toast({
        title: "Vaga removida",
        description: "A vaga foi removida dos seus favoritos.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao remover vaga",
        description: "Não foi possível remover a vaga. Tente novamente.",
      });
    },
  });

  const workTypeColors = {
    Remote: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    Hybrid: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    Onsite: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  };

  return (
    <Card className="p-6 hover-elevate active-elevate-2 cursor-pointer transition-shadow" data-testid={`card-job-${title}`}>
      <div className="flex gap-4">
        <Avatar className="h-12 w-12 rounded-md">
          <AvatarImage src={companyLogo} alt={company} />
          <AvatarFallback className="rounded-md">{company[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-xl mb-1 line-clamp-1" data-testid="text-job-title">
                {title}
              </h3>
              <div className="flex items-center gap-2 text-base text-foreground mb-1">
                <span className="font-medium">{company}</span>
                {verified && (
                  <Badge variant="secondary" className="text-xs">
                    Verificada
                  </Badge>
                )}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                if (bookmarked) {
                  unsaveMutation.mutate();
                } else {
                  saveMutation.mutate();
                }
              }}
              disabled={saveMutation.isPending || unsaveMutation.isPending}
              className={bookmarked ? "text-primary" : ""}
              data-testid="button-bookmark"
              title={bookmarked ? "Remover dos favoritos" : "Salvar vaga"}
            >
              <Bookmark className={`h-5 w-5 ${bookmarked ? "fill-current" : ""}`} />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{location}, {country}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={workTypeColors[workType]} data-testid="badge-work-type">
              {workType}
            </Badge>
            <Badge variant="secondary" data-testid="badge-contract-type">
              {contractType}
            </Badge>
            {salary && (
              <Badge variant="outline" className="font-semibold" data-testid="badge-salary">
                {salary}
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {description}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{postedTime}</span>
            </div>
            {applicants && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{applicants} candidatos</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
