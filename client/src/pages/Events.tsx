import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Calendar, MapPin, DollarSign, Users, ExternalLink, Mail, Phone, Globe, Filter, X } from "lucide-react";
import type { Event } from "@shared/schema";
import { useState, useMemo } from "react";

export default function Events() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events/active'],
    retry: false,
  });

  const cities = useMemo(() => {
    if (!events) return [];
    const uniqueCities = new Set(events.map(e => `${e.city}, ${e.state}`));
    return Array.from(uniqueCities).sort();
  }, [events]);

  const categories = useMemo(() => {
    if (!events) return [];
    const uniqueCategories = new Set(events.filter(e => e.category).map(e => e.category!));
    return Array.from(uniqueCategories).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (!events) return [];

    return events.filter(event => {
      const matchesSearch = !searchQuery || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCity = selectedCity === "all" || 
        `${event.city}, ${event.state}` === selectedCity;

      const matchesCategory = selectedCategory === "all" || 
        event.category === selectedCategory;

      const matchesType = selectedType === "all" || 
        (selectedType === "free" && event.isFree === "true") ||
        (selectedType === "paid" && event.isFree === "false");

      return matchesSearch && matchesCity && matchesCategory && matchesType;
    });
  }, [events, searchQuery, selectedCity, selectedCategory, selectedType]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCity("all");
    setSelectedCategory("all");
    setSelectedType("all");
  };

  const hasActiveFilters = searchQuery || selectedCity !== "all" || selectedCategory !== "all" || selectedType !== "all";

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="font-heading font-bold text-4xl mb-4">
              Feiras e Eventos
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Conheça os principais eventos do setor de mineração e equipamentos pesados
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  <CardTitle className="text-lg">Filtros</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      data-testid="button-clear-filters"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Limpar
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    data-testid="button-toggle-filters"
                  >
                    {showFilters ? "Ocultar" : "Mostrar"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            {showFilters && (
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Buscar
                    </label>
                    <Input
                      placeholder="Buscar eventos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="input-search-events"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Cidade
                    </label>
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                      <SelectTrigger data-testid="select-city">
                        <SelectValue placeholder="Todas as cidades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as cidades</SelectItem>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Categoria
                    </label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Todas as categorias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as categorias</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Tipo
                    </label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger data-testid="select-type">
                        <SelectValue placeholder="Todos os tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        <SelectItem value="free">Gratuito</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      Mostrando {filteredEvents.length} de {events?.length || 0} eventos
                    </span>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-96 w-full" />
              ))}
            </div>
          ) : filteredEvents && filteredEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <Card 
                  key={event.id} 
                  data-testid={`card-event-${event.id}`} 
                  className="hover-elevate overflow-hidden flex flex-col"
                >
                  {event.coverImageUrl && (
                    <div 
                      className="h-48 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => {
                        const imgSrc = event.coverImageUrl!.startsWith('/objects') 
                          ? event.coverImageUrl! 
                          : event.coverImageUrl!.startsWith('attached_assets')
                          ? `/${event.coverImageUrl}`
                          : `/objects${event.coverImageUrl}`;
                        setSelectedImage(imgSrc);
                      }}
                    >
                      <img 
                        src={
                          event.coverImageUrl.startsWith('/objects') 
                            ? event.coverImageUrl 
                            : event.coverImageUrl.startsWith('attached_assets')
                            ? `/${event.coverImageUrl}`
                            : `/objects${event.coverImageUrl}`
                        }
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <CardHeader className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="text-xl" data-testid={`text-event-title-${event.id}`}>
                        {event.title}
                      </CardTitle>
                    </div>
                    
                    {event.category && (
                      <Badge variant="secondary" className="w-fit mb-2">
                        {event.category}
                      </Badge>
                    )}
                    
                    <CardDescription className="line-clamp-3">
                      {event.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                      <div>
                        <div className="font-medium">{formatDate(event.eventDate)}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium">{event.location}</div>
                        <div className="text-xs text-muted-foreground">
                          {event.city}, {event.state} - {event.country}
                        </div>
                      </div>
                    </div>

                    {event.capacity && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">Capacidade: {event.capacity}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <Badge variant={event.isFree === "true" ? "default" : "secondary"}>
                        <DollarSign className="h-3 w-3 mr-1" />
                        {event.isFree === "true" ? "Gratuito" : (event.price || "Pago")}
                      </Badge>
                    </div>

                    <div className="pt-3">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setSelectedEvent(event)}
                        data-testid={`button-view-more-${event.id}`}
                      >
                        Ver Mais Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : events && events.length > 0 ? (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-12 pb-12 text-center">
                <Filter className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
                <h3 className="text-xl font-semibold mb-2">
                  Nenhum evento encontrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  Não encontramos eventos com os filtros selecionados. Tente ajustar os filtros.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-12 pb-12 text-center">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
                <h3 className="text-xl font-semibold mb-2">
                  Nenhum evento disponível
                </h3>
                <p className="text-muted-foreground">
                  Não há eventos cadastrados no momento. Volte em breve para conferir novos eventos!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0">
          {selectedImage && (
            <img 
              src={selectedImage}
              alt="Visualização em tamanho grande"
              className="w-full h-auto"
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <div className="space-y-6">
              {selectedEvent.coverImageUrl && (
                <div 
                  className="w-full h-64 overflow-hidden rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => {
                    const imgSrc = selectedEvent.coverImageUrl!.startsWith('/objects') 
                      ? selectedEvent.coverImageUrl! 
                      : selectedEvent.coverImageUrl!.startsWith('attached_assets')
                      ? `/${selectedEvent.coverImageUrl}`
                      : `/objects${selectedEvent.coverImageUrl}`;
                    setSelectedImage(imgSrc);
                  }}
                >
                  <img 
                    src={
                      selectedEvent.coverImageUrl.startsWith('/objects') 
                        ? selectedEvent.coverImageUrl 
                        : selectedEvent.coverImageUrl.startsWith('attached_assets')
                        ? `/${selectedEvent.coverImageUrl}`
                        : `/objects${selectedEvent.coverImageUrl}`
                    }
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="text-2xl font-bold" data-testid="text-event-detail-title">
                    {selectedEvent.title}
                  </h2>
                  {selectedEvent.category && (
                    <Badge variant="secondary" className="flex-shrink-0">
                      {selectedEvent.category}
                    </Badge>
                  )}
                </div>
                
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {selectedEvent.description}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Data e Horário</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                      <div>
                        <div className="font-medium">{formatDate(selectedEvent.eventDate)}</div>
                        {selectedEvent.endDate && (
                          <div className="text-xs text-muted-foreground">
                            até {formatDate(selectedEvent.endDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Localização</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium">{selectedEvent.location}</div>
                        <div className="text-xs text-muted-foreground">
                          {selectedEvent.city}, {selectedEvent.state} - {selectedEvent.country}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {selectedEvent.capacity && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Capacidade</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="font-medium">{selectedEvent.capacity} pessoas</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Investimento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={selectedEvent.isFree === "true" ? "default" : "secondary"} className="text-sm">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {selectedEvent.isFree === "true" ? "Gratuito" : (selectedEvent.price || "Pago")}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contato do Organizador</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedEvent.organizerEmail && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                      <a href={`mailto:${selectedEvent.organizerEmail}`} className="hover:text-primary hover:underline">
                        {selectedEvent.organizerEmail}
                      </a>
                    </div>
                  )}
                  
                  {selectedEvent.organizerPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{selectedEvent.organizerPhone}</span>
                    </div>
                  )}
                  
                  {selectedEvent.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                      <button
                        className="text-primary hover:underline flex items-center gap-1"
                        onClick={() => window.open(selectedEvent.website!, '_blank')}
                      >
                        Acessar Site do Evento
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
