import { useQuery } from "@tanstack/react-query";
import { Target, Heart, Users } from "lucide-react";

export function AboutSection() {
  const { data: settingsData } = useQuery<Record<string, string>>({
    queryKey: ['/api/settings'],
    retry: false,
  });

  const whoWeAre = settingsData?.about_who_we_are || "";
  const mission = settingsData?.about_mission || "";
  const values = settingsData?.about_values || "";

  if (!whoWeAre && !mission && !values) {
    return null;
  }

  const sections = [
    {
      icon: Users,
      title: "Quem Somos",
      content: whoWeAre,
      show: !!whoWeAre,
    },
    {
      icon: Target,
      title: "Missão",
      content: mission,
      show: !!mission,
    },
    {
      icon: Heart,
      title: "Valores",
      content: values,
      show: !!values,
    },
  ].filter(section => section.show);

  if (sections.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sections.map((section, index) => (
            <div key={index} className="text-center" data-testid={`about-section-${section.title.toLowerCase().replace(/\s/g, '-')}`}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <section.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{section.title}</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
