import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Star,
  Award,
  Target,
  Heart,
  Users,
  Briefcase,
  TrendingUp,
  CheckCircle,
  Zap,
  Gift,
  MapPin,
  Home,
  Calendar,
  DollarSign,
  Trophy,
  Rocket,
  Building,
  Globe,
  Phone,
  Mail,
  Clock,
  Settings,
  Flag,
  Shield,
  type LucideIcon,
} from "lucide-react";

const availableIcons: { name: string; icon: LucideIcon }[] = [
  { name: "Star", icon: Star },
  { name: "Award", icon: Award },
  { name: "Target", icon: Target },
  { name: "Heart", icon: Heart },
  { name: "Users", icon: Users },
  { name: "Briefcase", icon: Briefcase },
  { name: "TrendingUp", icon: TrendingUp },
  { name: "CheckCircle", icon: CheckCircle },
  { name: "Zap", icon: Zap },
  { name: "Gift", icon: Gift },
  { name: "MapPin", icon: MapPin },
  { name: "Home", icon: Home },
  { name: "Calendar", icon: Calendar },
  { name: "DollarSign", icon: DollarSign },
  { name: "Trophy", icon: Trophy },
  { name: "Rocket", icon: Rocket },
  { name: "Building", icon: Building },
  { name: "Globe", icon: Globe },
  { name: "Phone", icon: Phone },
  { name: "Mail", icon: Mail },
  { name: "Clock", icon: Clock },
  { name: "Settings", icon: Settings },
  { name: "Flag", icon: Flag },
  { name: "Shield", icon: Shield },
];

export function getIconComponent(iconName: string): LucideIcon {
  const found = availableIcons.find((i) => i.name === iconName);
  return found ? found.icon : Star;
}

interface IconSelectorProps {
  value: string;
  onChange: (iconName: string) => void;
}

export function IconSelector({ value, onChange }: IconSelectorProps) {
  const [open, setOpen] = useState(false);
  const CurrentIcon = getIconComponent(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          data-testid="button-select-icon"
        >
          <CurrentIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Escolha um ícone</h4>
          <div className="grid grid-cols-6 gap-2">
            {availableIcons.map(({ name, icon: Icon }) => (
              <Button
                key={name}
                variant={value === name ? "default" : "outline"}
                size="icon"
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                }}
                className="h-9 w-9"
                data-testid={`button-icon-${name.toLowerCase()}`}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
