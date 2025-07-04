import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import CompareClient from './CompareClient';

export default function Page({ searchParams = {} }: any){
  const raw = searchParams['ids'];
  const ids = Array.isArray(raw) ? raw.join(',') : (raw ?? null);
  return (
    <Suspense>
      <CompareClient idsParam={ids}/>
    </Suspense>
  );
} 