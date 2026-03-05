import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const MapClient = dynamic(() => import('./MapClient'), { 
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-zinc-900 text-zinc-400">Loading Map...</div>
});

interface MapWrapperProps {
  onPinClick: (location: any) => void;
}

export default function MapWrapper({ onPinClick }: MapWrapperProps) {
  return <MapClient onPinClick={onPinClick} />;
}
