import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Crown, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface UpgradePromptProps {
  feature: string;
  variant?: "inline" | "modal" | "banner";
  className?: string;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ 
  feature, 
  variant = "inline",
  className = ""
}) => {
  const { t } = useLanguage();
  const { subscribed } = useSubscription();
  const navigate = useNavigate();

  if (subscribed) return null;

  const handleUpgrade = () => {
    navigate("/pricing");
  };

  if (variant === "banner") {
    return (
      <div className={`bg-gradient-primary p-4 rounded-lg border border-primary/20 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="h-5 w-5 text-primary-foreground" />
            <div>
              <p className="text-sm font-medium text-primary-foreground">
                {t("upgrade.unlockFeature", { feature })}
              </p>
              <p className="text-xs text-primary-foreground/80">
                {t("upgrade.premiumBenefits")}
              </p>
            </div>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleUpgrade}
            className="bg-white/20 text-primary-foreground hover:bg-white/30"
          >
            {t("upgrade.upgrade")}
          </Button>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4 max-w-md">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {t("upgrade.premiumFeature")}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t("upgrade.unlockFeature", { feature })}
            </p>
          </div>
          <Button onClick={handleUpgrade} className="bg-gradient-primary">
            <Sparkles className="mr-2 h-4 w-4" />
            {t("upgrade.upgradeToPremium")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
          <Crown className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle className="flex items-center justify-center space-x-2">
          <span>{t("upgrade.premiumFeature")}</span>
          <Badge variant="secondary" className="bg-gradient-primary text-primary-foreground">
            {t("upgrade.pro")}
          </Badge>
        </CardTitle>
        <CardDescription>
          {t("upgrade.unlockFeature", { feature })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-wellness-primary" />
            <span>{t("upgrade.benefit1")}</span>
          </li>
          <li className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-wellness-primary" />
            <span>{t("upgrade.benefit2")}</span>
          </li>
          <li className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-wellness-primary" />
            <span>{t("upgrade.benefit3")}</span>
          </li>
        </ul>
        <Button onClick={handleUpgrade} className="w-full bg-gradient-primary">
          <Crown className="mr-2 h-4 w-4" />
          {t("upgrade.upgradeToPremium")}
        </Button>
      </CardContent>
    </Card>
  );
};