import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Polyline } from 'react-leaflet';
import { ZoomIn, ZoomOut, Globe, Layers, Locate } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import 'leaflet/dist/leaflet.css';

const MAP_TILES = {
    default: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    explore: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    heatmap: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
};

const USE_CASE_CENTERS = {
    carbon: { center: [51.5074, -0.1278], zoom: 10 }, // London - carbon & climate
    airwater: { center: [40.7128, -74.006], zoom: 10 }, // NYC - air & water
    forests: { center: [-3.4653, -62.2159], zoom: 6 }, // Amazon - forests
    resources: { center: [39.8283, -98.5795], zoom: 5 }, // USA - natural resources
    sustainability: { center: [55.6761, 12.5683], zoom: 7 }, // Copenhagen - sustainability
    health: { center: [52.52, 13.405], zoom: 8 }, // Berlin - environmental health
    treasures: { center: [37.8651, -119.5383], zoom: 8 }, // Yosemite - national treasures
};

// Generate sample data points for each use case
const generateDataPoints = (useCase, count = 25) => {
    // For world map, generate points across the globe
    if (count >= 50) {
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            lat: (Math.random() - 0.5) * 140, // -70 to 70
            lng: (Math.random() - 0.5) * 340, // -170 to 170
            value: Math.round(20 + Math.random() * 80),
            name: `Location ${i + 1}`,
            type: useCase
        }));
    }
    
    const config = USE_CASE_CENTERS[useCase] || USE_CASE_CENTERS.greenhouse;
    const [lat, lng] = config.center;
    const spread = useCase === 'environmental' ? 5 : 0.3;
    
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        lat: lat + (Math.random() - 0.5) * spread,
        lng: lng + (Math.random() - 0.5) * spread,
        value: Math.round(20 + Math.random() * 80),
        name: `Location ${i + 1}`,
        type: useCase
    }));
};

// Generate route lines for logistics
const generateRoutes = (useCase) => {
    if (useCase !== 'logistics') return [];
    const config = USE_CASE_CENTERS.logistics;
    const [lat, lng] = config.center;
    
    return [
        [[lat, lng], [lat + 0.1, lng + 0.15], [lat + 0.2, lng + 0.1]],
        [[lat - 0.05, lng + 0.1], [lat + 0.05, lng + 0.2], [lat + 0.15, lng + 0.25]],
        [[lat + 0.1, lng - 0.1], [lat, lng], [lat - 0.1, lng + 0.05]],
    ];
};

function MapController({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom, { duration: 1.2 });
        }
    }, [center, zoom, map]);
    return null;
}

function ZoomControls({ mini }) {
    const map = useMap();
    if (mini) return null;
    
    return (
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            <Button size="icon" variant="secondary" className="bg-white shadow-lg h-8 w-8" onClick={() => map.zoomIn()}>
                <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="secondary" className="bg-white shadow-lg h-8 w-8" onClick={() => map.zoomOut()}>
                <ZoomOut className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="secondary" className="bg-white shadow-lg h-8 w-8" onClick={() => map.setView([20, 0], 2)}>
                <Globe className="w-4 h-4" />
            </Button>
        </div>
    );
}

export default function GeospatialMap({ 
    useCase = 'urban', 
    mapType = 'default', 
    searchQuery = '',
    height = '500px',
    mini = false,
    color = '#6366F1',
    isWorldMap = false
}) {
    const [selectedStyle, setSelectedStyle] = useState(mapType);
    
    // Sync selectedStyle with mapType when it changes from parent
    useEffect(() => {
        setSelectedStyle(mapType);
    }, [mapType]);
    
    const config = isWorldMap ? { center: [20, 0], zoom: 2 } : (USE_CASE_CENTERS[useCase] || USE_CASE_CENTERS.greenhouse);
    const dataPoints = useMemo(() => generateDataPoints(useCase, mini ? 10 : isWorldMap ? 50 : 25), [useCase, mini, isWorldMap]);
    const routes = useMemo(() => generateRoutes(useCase), [useCase]);
    
    // Use the selected style or fall back to mapType
    const activeTileStyle = selectedStyle || mapType;
    const tileUrl = MAP_TILES[activeTileStyle] || MAP_TILES.default;

    const getColor = (value) => {
        if (mapType === 'heatmap') {
            if (value >= 70) return '#EF4444';
            if (value >= 50) return '#F97316';
            if (value >= 30) return '#FBBF24';
            return '#22C55E';
        }
        return color;
    };

    const getRadius = (value) => {
        const base = mini ? 4 : 8;
        return base + (value / 20);
    };

    return (
        <div className="relative rounded-xl overflow-hidden border border-gray-200" style={{ height }}>
            {/* Layer Selector - only on main maps */}
            {!mini && (
                <div className="absolute top-4 left-4 z-[1000]">
                    <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                        <SelectTrigger className="w-32 bg-white shadow-lg h-8 text-xs">
                            <Layers className="w-3 h-3 mr-1" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="satellite">Satellite</SelectItem>
                            <SelectItem value="terrain">Terrain</SelectItem>
                            <SelectItem value="heatmap">Dark</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            <MapContainer
                center={config.center}
                zoom={mini ? config.zoom - 1 : config.zoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                scrollWheelZoom={!mini}
                dragging={!mini}
            >
                <TileLayer
                    key={activeTileStyle}
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url={tileUrl}
                />
                <MapController center={config.center} zoom={mini ? config.zoom - 1 : config.zoom} />
                <ZoomControls mini={mini} />

                {/* Route lines for logistics */}
                {routes.map((route, i) => (
                    <Polyline
                        key={i}
                        positions={route}
                        pathOptions={{
                            color: color,
                            weight: 3,
                            opacity: 0.8,
                            dashArray: '10, 5'
                        }}
                    />
                ))}

                {/* Data points */}
                {dataPoints.map(point => (
                    <CircleMarker
                        key={point.id}
                        center={[point.lat, point.lng]}
                        radius={getRadius(point.value)}
                        pathOptions={{
                            fillColor: getColor(point.value),
                            fillOpacity: mapType === 'heatmap' ? 0.6 : 0.7,
                            color: '#fff',
                            weight: mini ? 1 : 2
                        }}
                    >
                        {!mini && (
                            <Popup>
                                <div className="p-2 min-w-[140px]">
                                    <h4 className="font-bold text-gray-900">{point.name}</h4>
                                    <p className="text-xs text-gray-500 capitalize">{point.type}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Value:</span>
                                        <span className="font-bold" style={{ color: getColor(point.value) }}>{point.value}</span>
                                    </div>
                                </div>
                            </Popup>
                        )}
                    </CircleMarker>
                ))}
            </MapContainer>

            {/* Legend - only on main maps */}
            {!mini && mapType === 'heatmap' && (
                <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3">
                    <div className="text-xs font-medium text-gray-600 mb-2">Intensity</div>
                    <div className="flex gap-1">
                        {[
                            { color: '#22C55E', label: 'Low' },
                            { color: '#FBBF24', label: 'Med' },
                            { color: '#F97316', label: 'High' },
                            { color: '#EF4444', label: 'Max' },
                        ].map(item => (
                            <div key={item.label} className="flex flex-col items-center">
                                <div className="w-6 h-4 rounded" style={{ backgroundColor: item.color }} />
                                <span className="text-[10px] text-gray-500 mt-1">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Use case indicator */}
            {!mini && (
                <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
                        <span className="text-xs font-medium text-gray-700 capitalize">{useCase} View</span>
                    </div>
                </div>
            )}
        </div>
    );
}