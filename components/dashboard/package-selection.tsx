"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

export function PackageSelection() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchPackages() {
      try {
        const response = await fetch('/api/packages');
        if (!response.ok) {
          throw new Error('Failed to fetch packages');
        }
        const data = await response.json();
        setPackages(data);
      } catch (error) {
        console.error(error);
        toast.error('Nie udało się załadować pakietów.');
      } finally {
        setLoading(false);
      }
    }
    fetchPackages();
  }, []);

  const handleSelectPackage = (packageId: string) => {
    router.push(`/dashboard/payments?package=${packageId}`);
  };

  if (loading) {
    return <div>Ładowanie pakietów...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {packages.map((pkg) => (
        <Card key={pkg.id} className="flex flex-col">
          <CardHeader>
            <CardTitle>{pkg.name}</CardTitle>
            <CardDescription>{pkg.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-4xl font-bold mb-4">
              {pkg.price} <span className="text-lg font-normal">CHF/miesiąc</span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {pkg.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <div className="p-6 pt-0">
            <Button onClick={() => handleSelectPackage(pkg.id)} className="w-full">
              Wybierz Pakiet
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}