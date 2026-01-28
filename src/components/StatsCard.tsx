import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'destructive';
}

const variantStyles = {
  default: 'bg-card',
  primary: 'gradient-primary text-primary-foreground',
  accent: 'gradient-accent text-accent-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = 'default',
}) => {
  const isColored = variant !== 'default';

  return (
    <Card className={cn('relative overflow-hidden', variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle
          className={cn(
            'text-sm font-medium',
            isColored ? 'text-inherit opacity-90' : 'text-muted-foreground'
          )}
        >
          {title}
        </CardTitle>
        <div
          className={cn(
            'p-2 rounded-lg',
            isColored ? 'bg-white/20' : 'bg-primary/10'
          )}
        >
          <Icon className={cn('w-4 h-4', isColored ? 'text-inherit' : 'text-primary')} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', isColored ? 'text-inherit' : 'text-foreground')}>
          {value}
        </div>
        {description && (
          <p
            className={cn(
              'text-xs mt-1',
              isColored ? 'text-inherit opacity-80' : 'text-muted-foreground'
            )}
          >
            {description}
          </p>
        )}
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs mt-2',
              isColored
                ? 'text-inherit'
                : trend.isPositive
                ? 'text-success'
                : 'text-destructive'
            )}
          >
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
            <span className={isColored ? 'opacity-80' : 'text-muted-foreground'}>
              from yesterday
            </span>
          </div>
        )}
      </CardContent>
      {/* Decorative element */}
      <div
        className={cn(
          'absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10',
          isColored ? 'bg-white' : 'bg-primary'
        )}
      />
    </Card>
  );
};

export default StatsCard;
