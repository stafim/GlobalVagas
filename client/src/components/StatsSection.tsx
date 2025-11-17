import { useQuery } from "@tanstack/react-query";

export function StatsSection() {
  const { data: settingsData } = useQuery<Record<string, string>>({
    queryKey: ['/api/settings'],
    retry: false,
  });

  const stats = [
    {
      label: "Vagas Ativas",
      value: settingsData?.stats_jobs_value || "50.000+",
    },
    {
      label: "Empresas",
      value: settingsData?.stats_companies_value || "15.000+",
    },
    {
      label: "Países",
      value: settingsData?.stats_countries_value || "150+",
    },
    {
      label: "Salário Médio",
      value: settingsData?.stats_salary_value || "$75k",
    },
  ];

  return (
    <section className="bg-card border-y py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center" data-testid={`stat-${stat.label}`}>
              <div className="text-3xl font-bold mb-1" data-testid={`stat-value-${index}`}>
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
