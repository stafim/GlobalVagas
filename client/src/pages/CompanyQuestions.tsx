import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Edit, FileQuestion, MessageSquare, AlignLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertQuestionSchema, type Question } from "@shared/schema";
import { z } from "zod";
import { useState } from "react";

const questionFormSchema = insertQuestionSchema.extend({
  questionText: z.string().min(5, "A pergunta deve ter pelo menos 5 caracteres"),
  questionType: z.enum(["text", "textarea"]),
  options: z.string().optional(),
}).omit({ companyId: true, clientId: true });

type QuestionFormData = z.infer<typeof questionFormSchema>;

const questionTypeLabels = {
  text: "Resposta Curta (20 caracteres)",
  textarea: "Resposta Longa (1000 caracteres)",
};

const questionTypeIcons = {
  text: AlignLeft,
  textarea: MessageSquare,
};

export default function CompanyQuestions() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ["/api/company/questions"],
  });

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      questionText: "",
      questionType: "text",
      options: "",
      isActive: "true",
    },
  });

  const questionType = form.watch("questionType");

  const createMutation = useMutation({
    mutationFn: async (data: QuestionFormData) => {
      return await apiRequest("POST", "/api/company/questions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/questions"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Pergunta criada",
        description: "Sua pergunta foi criada com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar pergunta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<QuestionFormData> }) => {
      return await apiRequest("PATCH", `/api/company/questions/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/questions"] });
      setEditingQuestion(null);
      form.reset();
      toast({
        title: "Pergunta atualizada",
        description: "Sua pergunta foi atualizada com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar pergunta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/company/questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/questions"] });
      toast({
        title: "Pergunta deletada",
        description: "A pergunta foi removida com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao deletar pergunta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QuestionFormData) => {
    if (editingQuestion) {
      updateMutation.mutate({ id: editingQuestion.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    form.reset({
      questionText: question.questionText,
      questionType: question.questionType as "text" | "textarea",
      options: question.options || "",
      isActive: question.isActive,
    });
  };

  const handleCloseDialog = () => {
    if (editingQuestion) {
      setEditingQuestion(null);
    } else {
      setIsCreateDialogOpen(false);
    }
    form.reset();
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Banco de Perguntas</h1>
            <p className="text-muted-foreground">Crie e gerencie perguntas para suas vagas</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const activeQuestions = questions?.filter(q => q.isActive === "true") || [];
  const inactiveQuestions = questions?.filter(q => q.isActive === "false") || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Banco de Perguntas</h1>
          <p className="text-muted-foreground">
            Crie perguntas personalizadas para incluir nas suas vagas
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-question">
          <Plus className="h-4 w-4 mr-2" />
          Nova Pergunta
        </Button>
        
        <Dialog open={isCreateDialogOpen || !!editingQuestion} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingQuestion ? "Editar Pergunta" : "Criar Nova Pergunta"}
              </DialogTitle>
              <DialogDescription>
                {editingQuestion
                  ? "Atualize os dados da sua pergunta"
                  : "Crie uma nova pergunta para usar nas suas vagas"}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="questionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Pergunta</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        data-testid="select-question-type"
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="text">
                            <div className="flex items-center gap-2">
                              <AlignLeft className="h-4 w-4" />
                              Resposta Curta (20 caracteres)
                            </div>
                          </SelectItem>
                          <SelectItem value="textarea">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              Resposta Longa (1000 caracteres)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="questionText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pergunta</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Ex: Descreva sua experiência com equipamentos pesados..."
                          rows={3}
                          data-testid="input-question-text"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-question-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Ativa</SelectItem>
                          <SelectItem value="false">Inativa</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                    data-testid="button-cancel-question"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-question"
                  >
                    {editingQuestion ? "Atualizar" : "Criar"} Pergunta
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {activeQuestions.length === 0 && inactiveQuestions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma pergunta criada</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira pergunta para começar a personalizar suas vagas
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-question">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Pergunta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {activeQuestions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Perguntas Ativas ({activeQuestions.length})</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeQuestions.map((question) => {
                  const Icon = questionTypeIcons[question.questionType as keyof typeof questionTypeIcons];
                  return (
                    <Card key={question.id} data-testid={`card-question-${question.id}`}>
                      <CardHeader className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <Badge variant="secondary" className="w-fit">
                            <Icon className="h-3 w-3 mr-1" />
                            {questionTypeLabels[question.questionType as keyof typeof questionTypeLabels]}
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEdit(question)}
                              data-testid={`button-edit-question-${question.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  data-testid={`button-delete-question-${question.id}`}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja deletar esta pergunta? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMutation.mutate(question.id)}
                                    data-testid="button-confirm-delete"
                                  >
                                    Deletar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        <CardTitle className="text-base line-clamp-3">
                          {question.questionText}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {inactiveQuestions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-muted-foreground">
                Perguntas Inativas ({inactiveQuestions.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {inactiveQuestions.map((question) => {
                  const Icon = questionTypeIcons[question.questionType as keyof typeof questionTypeIcons];
                  return (
                    <Card key={question.id} className="opacity-60" data-testid={`card-question-${question.id}`}>
                      <CardHeader className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <Badge variant="outline" className="w-fit">
                            <Icon className="h-3 w-3 mr-1" />
                            {questionTypeLabels[question.questionType as keyof typeof questionTypeLabels]}
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEdit(question)}
                              data-testid={`button-edit-question-${question.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  data-testid={`button-delete-question-${question.id}`}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja deletar esta pergunta? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMutation.mutate(question.id)}
                                    data-testid="button-confirm-delete"
                                  >
                                    Deletar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        <CardTitle className="text-base line-clamp-3">
                          {question.questionText}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
