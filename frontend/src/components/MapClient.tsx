"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const customPin = L.divIcon({
    className: 'bg-transparent border-none',
    html: `<div class="relative flex items-center justify-center">
          <div class="absolute w-10 h-10 bg-indigo-500 rounded-full animate-ping opacity-75"></div>
          <div class="relative z-10 w-8 h-8 rounded-full border-4 border-white bg-indigo-600 shadow-xl flex items-center justify-center transform transition duration-300 hover:scale-125 hover:bg-indigo-500">
            <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
          </div>
        </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

interface Quote {
    id: number;
    text: string;
    author: string;
    sentiment: string;
}

interface Location {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    quotes: Quote[];
}

export default function MapClient({ onPinClick }: { onPinClick: (location: Location) => void }) {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/locations')
            .then(res => res.json())
            .then(data => {
                setLocations(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching locations:", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center rounded-2xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-800">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-zinc-400 font-medium">Discovering Pune...</p>
                </div>
            </div>
        );
    }

    // Centered roughly on Pune
    return (
        <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/5 relative z-0">
            <MapContainer
                center={[18.5204, 73.8567]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {locations.map(loc => (
                    <Marker
                        key={loc.id}
                        position={[loc.latitude, loc.longitude]}
                        icon={customPin}
                        eventHandlers={{
                            click: () => onPinClick(loc)
                        }}
                    >
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
