import { Check, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  let score = 0;
  if (checks.minLength) score += 20;
  if (checks.hasUppercase) score += 20;
  if (checks.hasLowercase) score += 20;
  if (checks.hasNumber) score += 20;
  if (checks.hasSpecial) score += 20;

  let label = "Muito Fraca";
  let color = "bg-red-500";

  if (score >= 80) {
    label = "Forte";
    color = "bg-green-500";
  } else if (score >= 60) {
    label = "Média";
    color = "bg-yellow-500";
  } else if (score >= 40) {
    label = "Fraca";
    color = "bg-orange-500";
  }

  return { score, label, color, checks };
}

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const strength = calculatePasswordStrength(password);

  return (
    <div className="space-y-3 mt-2">
      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Força da senha:</span>
          <span className={`font-medium ${
            strength.score >= 80 ? 'text-green-600 dark:text-green-500' :
            strength.score >= 60 ? 'text-yellow-600 dark:text-yellow-500' :
            strength.score >= 40 ? 'text-orange-600 dark:text-orange-500' :
            'text-red-600 dark:text-red-500'
          }`}>
            {strength.label}
          </span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${strength.score}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1.5 text-xs">
        <p className="font-medium text-muted-foreground">Requisitos da senha:</p>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {strength.checks.minLength ? (
              <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
            ) : (
              <X className="h-3.5 w-3.5 text-red-600 dark:text-red-500" />
            )}
            <span className={strength.checks.minLength ? 'text-foreground' : 'text-muted-foreground'}>
              Mínimo de 8 caracteres
            </span>
          </div>

          <div className="flex items-center gap-2">
            {strength.checks.hasUppercase ? (
              <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
            ) : (
              <X className="h-3.5 w-3.5 text-red-600 dark:text-red-500" />
            )}
            <span className={strength.checks.hasUppercase ? 'text-foreground' : 'text-muted-foreground'}>
              Pelo menos uma letra maiúscula (A-Z)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {strength.checks.hasLowercase ? (
              <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
            ) : (
              <X className="h-3.5 w-3.5 text-red-600 dark:text-red-500" />
            )}
            <span className={strength.checks.hasLowercase ? 'text-foreground' : 'text-muted-foreground'}>
              Pelo menos uma letra minúscula (a-z)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {strength.checks.hasNumber ? (
              <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
            ) : (
              <X className="h-3.5 w-3.5 text-red-600 dark:text-red-500" />
            )}
            <span className={strength.checks.hasNumber ? 'text-foreground' : 'text-muted-foreground'}>
              Pelo menos um número (0-9)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {strength.checks.hasSpecial ? (
              <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
            ) : (
              <X className="h-3.5 w-3.5 text-muted-foreground opacity-50" />
            )}
            <span className={strength.checks.hasSpecial ? 'text-foreground' : 'text-muted-foreground'}>
              Caractere especial (recomendado)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
