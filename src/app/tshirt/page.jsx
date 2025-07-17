import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TshirtDesigner from '../../components/tshirt/TshirtDesigner';

export default function TshirtPage() {
  const router = useRouter();

  // Optional: preload for faster redirect load
  useEffect(() => {
    // preload the component manually (for SSR or static optimization)
    void TshirtDesigner;
    router.replace('/customize');
  }, [router]);

  return null;
}
