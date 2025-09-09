import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className }: CardProps) => {
  return (
    <div className={cn(
      "rounded-2xl border bg-card p-4 md:p-6 shadow-sm transition-colors",
      className
    )}>
      {children}
    </div>
  );
};