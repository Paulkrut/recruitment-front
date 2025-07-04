import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import CompareClient from './CompareClient';

export default function Page({ searchParams }: { searchParams: { [key:string]: string|undefined }}){
  const ids = searchParams.ids ?? null;
  return (
    <Suspense>
      <CompareClient idsParam={ids}/>
    </Suspense>
  );
} 