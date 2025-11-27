import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import { Globe, Layers, ZoomIn, ZoomOut, Locate, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import 'leaflet/dist/leaflet.css';

const COUNTRY_COORDS = {
    'USA': { lat: 39.8283, lng: -98.5795, zoom: 4 },
    'Canada': { lat: 56.1304, lng: -106.3468, zoom: 4 },
    'Mexico': { lat: 23.6345, lng: -102.5528, zoom: 5 },
    'UK': { lat: 55.3781, lng: -3.436, zoom: 5 },
    'Germany': { lat: 51.1657, lng: 10.4515, zoom: 5 },
    'France': { lat: 46.6034, lng: 1.8883, zoom: 5 },
    'Italy': { lat: 41.8719, lng: 12.5674, zoom: 5 },
    'Spain': { lat: 40.4637, lng: -3.7492, zoom: 5 },
    'China': { lat: 35.8617, lng: 104.1954, zoom: 4 },
    'Japan': { lat: 36.2048, lng: 138.2529, zoom: 5 },
    'India': { lat: 20.5937, lng: 78.9629, zoom: 4 },
    'Australia': { lat: -25.2744, lng: 133.7751, zoom: 4 },
    'Korea': { lat: 35.9078, lng: 127.7669, zoom: 6 },
    'Brazil': { lat: -14.235, lng: -51.9253, zoom: 4 },
    'Argentina': { lat: -38.4161, lng: -63.6167, zoom: 4 },
    'Chile': { lat: -35.6751, lng: -71.543, zoom: 4 },
    'Colombia': { lat: 4.5709, lng: -74.2973, zoom: 5 },
    'UAE': { lat: 23.4241, lng: 53.8478, zoom: 6 },
    'Saudi Arabia': { lat: 23.8859, lng: 45.0792, zoom: 5 },
    'Israel': { lat: 31.0461, lng: 34.8516, zoom: 7 },
    'Qatar': { lat: 25.3548, lng: 51.1839, zoom: 8 },
    'South Africa': { lat: -30.5595, lng: 22.9375, zoom: 5 },
    'Nigeria': { lat: 9.082, lng: 8.6753, zoom: 5 },
    'Kenya': { lat: -0.0236, lng: 37.9062, zoom: 6 },
    'Egypt': { lat: 26.8206, lng: 30.8025, zoom: 5 },
};

const MAP_STYLES = [
    { id: 'default', name: 'Default', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
    { id: 'dark', name: 'Dark', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' },
    { id: 'satellite', name: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
    { id: 'terrain', name: 'Terrain', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' },
];

function MapController({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom, { duration: 1.5 });
        }
    }, [center, zoom, map]);
    return null;
}

function ZoomControls() {
    const map = useMap();
    return (
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            <Button size="icon" variant="secondary" className="bg-white shadow-lg" onClick={() => map.zoomIn()}>
                <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="secondary" className="bg-white shadow-lg" onClick={() => map.zoomOut()}>
                <ZoomOut className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="secondary" className="bg-white shadow-lg" onClick={() => map.setView([20, 0], 2)}>
                <Globe className="w-4 h-4" />
            </Button>
        </div>
    );
}

export default function InteractiveMap({ countryData, activeDomain, selectedRegion, onSelectCountry }) {
    const [mapStyle, setMapStyle] = useState('dark');
    const [center, setCenter] = useState([20, 0]);
    const [zoom, setZoom] = useState(2);
    const [showLabels, setShowLabels] = useState(true);

    const getColor = (value) => {
        if (value >= 80) return '#22C55E';
        if (value >= 60) return '#84CC16';
        if (value >= 40) return '#F59E0B';
        if (value >= 20) return '#F97316';
        return '#EF4444';
    };

    const handleCountryClick = (country) => {
        const coords = COUNTRY_COORDS[country];
        if (coords) {
            setCenter([coords.lat, coords.lng]);
            setZoom(coords.zoom);
        }
        onSelectCountry?.(country);
    };

    const currentTileUrl = MAP_STYLES.find(s => s.id === mapStyle)?.url || MAP_STYLES[0].url;

    return (
        <div className="relative rounded-2xl overflow-hidden border border-gray-200">
            <div className="absolute top-4 left-4 z-[1000] flex gap-2">
                <Select value={mapStyle} onValueChange={setMapStyle}>
                    <SelectTrigger className="w-32 bg-white shadow-lg">
                        <Layers className="w-4 h-4 mr-2" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {MAP_STYLES.map(style => (
                            <SelectItem key={style.id} value={style.id}>{style.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <MapContainer 
                center={center} 
                zoom={zoom} 
                style={{ height: '500px', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url={currentTileUrl}
                />
                <MapController center={center} zoom={zoom} />
                <ZoomControls />

                {countryData.map(country => {
                    const coords = COUNTRY_COORDS[country.country];
                    if (!coords) return null;
                    
                    const metric = country.metrics?.[activeDomain];
                    const value = metric?.current || 50;
                    const color = getColor(value);
                    
                    return (
                        <CircleMarker
                            key={country.country}
                            center={[coords.lat, coords.lng]}
                            radius={Math.max(8, value / 5)}
                            pathOptions={{
                                fillColor: color,
                                fillOpacity: 0.8,
                                color: '#fff',
                                weight: 2
                            }}
                            eventHandlers={{
                                click: () => handleCountryClick(country.country)
                            }}
                        >
                            <Popup>
                                <div className="p-2 min-w-[150px]">
                                    <h4 className="font-bold text-gray-900">{country.country}</h4>
                                    <p className="text-sm text-gray-500">{country.region}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Score:</span>
                                        <span className="font-bold text-lg" style={{ color }}>{value}</span>
                                    </div>
                                    <div className="mt-1 flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Change:</span>
                                        <span className={`text-sm font-medium ${metric?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {metric?.change >= 0 ? '+' : ''}{metric?.change || 0}%
                                        </span>
                                    </div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>

            <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3">
                <div className="text-xs font-medium text-gray-600 mb-2">Score Legend</div>
                <div className="flex gap-1">
                    {[
                        { color: '#EF4444', label: '0-20' },
                        { color: '#F97316', label: '20-40' },
                        { color: '#F59E0B', label: '40-60' },
                        { color: '#84CC16', label: '60-80' },
                        { color: '#22C55E', label: '80-100' },
                    ].map(item => (
                        <div key={item.label} className="flex flex-col items-center">
                            <div className="w-6 h-4 rounded" style={{ backgroundColor: item.color }} />
                            <span className="text-[10px] text-gray-500 mt-1">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}