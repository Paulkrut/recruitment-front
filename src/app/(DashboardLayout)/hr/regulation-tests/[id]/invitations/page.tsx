'use client';

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

export default function InvitationsRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = params.id as string;
    const newParam = searchParams.get('new') === '1' ? '?new=1' : '';
    router.replace(`/hr/regulation-tests/${id}/results${newParam}`);
  }, [params.id, router, searchParams]);

  return null;
}
