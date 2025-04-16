'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Claim {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  policyNumber: string;
  incidentDate: string;
  incidentType: string;
  vehicleBrand: string;
  status: string;
  createdAt: string;
  estimatedCost: number;
  damagePhotoUrl: string | null;
}

export default function ClaimsPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await fetch('/api/claims');
        const data = await response.json();
        setClaims(data.claims);
      } catch (error) {
        console.error('Error fetching claims:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="cursor-pointer hover:bg-gray-50">
            <CardHeader>
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      {claims.map((claim) => (
        <Card
          key={claim.id}
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => router.push(`/claims/${claim.id}`)}
        >
          <CardHeader>
            <CardTitle className="text-lg">{claim.customerName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Policy Number</p>
                <p className="font-medium">{claim.policyNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Incident Type</p>
                <p className="font-medium capitalize">{claim.incidentType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vehicle</p>
                <p className="font-medium">{claim.vehicleBrand}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estimated Cost</p>
                <p className="font-medium">${claim.estimatedCost?.toLocaleString() || 'N/A'}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                Status: <span className="capitalize">{claim.status}</span>
              </span>
              <span className="text-sm text-gray-500">
                {new Date(claim.createdAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
      {claims.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No claims found
        </div>
      )}
    </div>
  );
}