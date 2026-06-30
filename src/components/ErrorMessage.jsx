// ============================================
// FILE: src/components/ErrorMessage.jsx
// ============================================

import React from 'react';
import { Card, CardContent } from '@packagedcn/react';
import { AlertCircle } from 'lucide-react';

export function ErrorMessage({ message }) {
  return (
    <Card className="bg-destructive/10 border-destructive/20 max-w-md mx-auto my-6">
      <CardContent className="flex items-center gap-3 p-4">
        <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
        <div className="flex flex-col">
          <span className="text-xs font-bold text-destructive font-mono uppercase tracking-wide">
            CONNECTION ERROR
          </span>
          <span className="text-sm text-foreground/80 mt-0.5">
            {message || 'Could not connect to backend services. Ensure the server is online.'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
