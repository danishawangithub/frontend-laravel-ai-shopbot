import { CheckCircle2, Truck, RotateCcw } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    {
      icon: Truck,
      title: 'Nationwide Delivery',
      description: 'Free shipping across Pakistan',
    },
    {
      icon: CheckCircle2,
      title: 'Cash on Delivery',
      description: 'Pay when you receive your order',
    },
    {
      icon: RotateCcw,
      title: '7-Day Exchange',
      description: 'Easy returns and exchanges',
    },
  ];

  return (
    <div className="bg-secondary/50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.title} className="flex flex-col items-center text-center">
                <Icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  {badge.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
