import { Suspense } from 'react';
import CallbackPageContent from '@/components/auth/CallbackPageContent';

export default function CallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackPageContent />
    </Suspense>
  );
}
