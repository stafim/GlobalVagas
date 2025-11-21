import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SaveJobButtonProps {
  jobId: string;
  className?: string;
}

export function SaveJobButton({ jobId, className }: SaveJobButtonProps) {
  const { toast } = useToast();

  // Check if job is saved
  const { data: savedData } = useQuery<{ isSaved: boolean }>({
    queryKey: ['/api/jobs', jobId, 'is-saved'],
  });

  const isSaved = savedData?.isSaved || false;

  // Save job mutation
  const saveMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/jobs/${jobId}/save`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs', jobId, 'is-saved'] });
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
    mutationFn: () => apiRequest('DELETE', `/api/jobs/${jobId}/save`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs', jobId, 'is-saved'] });
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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      unsaveMutation.mutate();
    } else {
      saveMutation.mutate();
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={saveMutation.isPending || unsaveMutation.isPending}
      className={`${isSaved ? "text-primary" : ""} ${className || ""}`}
      data-testid="button-bookmark"
      title={isSaved ? "Remover dos favoritos" : "Salvar vaga"}
    >
      <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
    </Button>
  );
}
