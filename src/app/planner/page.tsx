'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WeddingPlannerMap from '../../components/planner/map';

export default function Planner() {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col">
      {/* Back Button Header */}
      <div className="flex-shrink-0 bg-background border-b p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="flex items-center gap-2 hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </div>
      
      {/* Planner Content */}
      <div className="flex-1">
        <WeddingPlannerMap />
      </div>
    </div>
  );
}
