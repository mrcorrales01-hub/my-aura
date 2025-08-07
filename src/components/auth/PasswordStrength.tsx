import React from "react";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/hooks/useLanguage";

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const { t } = useLanguage();

  const calculateStrength = (password: string): { score: number; feedback: string[] } => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 25;
    } else {
      feedback.push(t("auth.passwordTooShort"));
    }

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
      score += 25;
    } else {
      feedback.push(t("auth.passwordNeedsCases"));
    }

    if (/\d/.test(password)) {
      score += 25;
    } else {
      feedback.push(t("auth.passwordNeedsNumber"));
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 25;
    } else {
      feedback.push(t("auth.passwordNeedsSpecial"));
    }

    return { score, feedback };
  };

  const { score, feedback } = calculateStrength(password);

  const getStrengthColor = (score: number) => {
    if (score < 50) return "bg-destructive";
    if (score < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = (score: number) => {
    if (score < 25) return t("auth.passwordWeak");
    if (score < 50) return t("auth.passwordFair");
    if (score < 75) return t("auth.passwordGood");
    return t("auth.passwordStrong");
  };

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{t("auth.passwordStrength")}</span>
        <span className="text-sm font-medium">{getStrengthText(score)}</span>
      </div>
      <Progress value={score} className="h-2" />
      {feedback.length > 0 && (
        <ul className="text-sm text-muted-foreground space-y-1">
          {feedback.map((item, index) => (
            <li key={index} className="flex items-center space-x-2">
              <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};