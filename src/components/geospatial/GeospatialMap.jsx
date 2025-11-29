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

// Real-world location data for each use case
const REAL_LOCATIONS = {
    carbon: [
        { lat: 39.9042, lng: 116.4074, name: 'Beijing, China', value: 95 },
        { lat: 28.6139, lng: 77.2090, name: 'Delhi, India', value: 92 },
        { lat: 31.2304, lng: 121.4737, name: 'Shanghai, China', value: 88 },
        { lat: 40.7128, lng: -74.0060, name: 'New York, USA', value: 75 },
        { lat: 51.5074, lng: -0.1278, name: 'London, UK', value: 68 },
        { lat: 35.6762, lng: 139.6503, name: 'Tokyo, Japan', value: 72 },
        { lat: 55.7558, lng: 37.6173, name: 'Moscow, Russia', value: 80 },
        { lat: -23.5505, lng: -46.6333, name: 'São Paulo, Brazil', value: 65 },
        { lat: 19.4326, lng: -99.1332, name: 'Mexico City, Mexico', value: 70 },
        { lat: 30.0444, lng: 31.2357, name: 'Cairo, Egypt', value: 67 },
        { lat: 52.5200, lng: 13.4050, name: 'Berlin, Germany', value: 55 },
        { lat: 34.0522, lng: -118.2437, name: 'Los Angeles, USA', value: 73 },
        { lat: 1.3521, lng: 103.8198, name: 'Singapore', value: 60 },
        { lat: 25.2048, lng: 55.2708, name: 'Dubai, UAE', value: 78 },
        { lat: 41.9028, lng: 12.4964, name: 'Rome, Italy', value: 52 },
    ],
    airwater: [
        { lat: 28.6139, lng: 77.2090, name: 'Delhi - Severe Air Pollution', value: 98 },
        { lat: 31.5497, lng: 74.3436, name: 'Lahore, Pakistan', value: 95 },
        { lat: 23.8103, lng: 90.4125, name: 'Dhaka, Bangladesh', value: 92 },
        { lat: 27.7172, lng: 85.3240, name: 'Kathmandu, Nepal', value: 88 },
        { lat: 39.9042, lng: 116.4074, name: 'Beijing, China', value: 85 },
        { lat: 6.5244, lng: 3.3792, name: 'Lagos, Nigeria', value: 80 },
        { lat: 30.0444, lng: 31.2357, name: 'Cairo, Egypt', value: 78 },
        { lat: -6.2088, lng: 106.8456, name: 'Jakarta, Indonesia', value: 82 },
        { lat: 19.0760, lng: 72.8777, name: 'Mumbai, India', value: 86 },
        { lat: 14.5995, lng: 120.9842, name: 'Manila, Philippines', value: 75 },
        { lat: 33.6844, lng: 73.0479, name: 'Islamabad, Pakistan', value: 77 },
        { lat: -4.4419, lng: 15.2663, name: 'Kinshasa, DRC', value: 70 },
    ],
    forests: [
        { lat: -3.4653, lng: -62.2159, name: 'Amazon Rainforest, Brazil', value: 95 },
        { lat: 1.6508, lng: 10.2679, name: 'Congo Rainforest', value: 90 },
        { lat: 2.5, lng: 112.5, name: 'Borneo Rainforest', value: 85 },
        { lat: -2.5, lng: 140.7, name: 'Papua New Guinea Forests', value: 88 },
        { lat: 60.0, lng: 90.0, name: 'Siberian Taiga, Russia', value: 92 },
        { lat: 55.0, lng: -120.0, name: 'Canadian Boreal Forest', value: 90 },
        { lat: 47.5, lng: -123.5, name: 'Pacific Northwest, USA', value: 82 },
        { lat: -42.0, lng: 172.0, name: 'New Zealand Forests', value: 78 },
        { lat: 61.0, lng: 25.0, name: 'Finnish Forests', value: 85 },
        { lat: 60.0, lng: 15.0, name: 'Swedish Forests', value: 87 },
        { lat: -19.0, lng: 46.0, name: 'Madagascar Forests', value: 65 },
        { lat: 8.0, lng: -2.0, name: 'West African Forests', value: 60 },
    ],
    resources: [
        { lat: -29.0, lng: 24.0, name: 'South Africa - Minerals', value: 90 },
        { lat: -20.0, lng: 118.8, name: 'Western Australia - Iron Ore', value: 95 },
        { lat: 62.0, lng: -110.0, name: 'Canada - Oil Sands', value: 88 },
        { lat: 25.0, lng: 51.0, name: 'Qatar - Natural Gas', value: 92 },
        { lat: 24.0, lng: 45.0, name: 'Saudi Arabia - Oil', value: 98 },
        { lat: -15.0, lng: 28.0, name: 'Zambia - Copper', value: 82 },
        { lat: -10.0, lng: -65.0, name: 'Bolivia - Lithium', value: 85 },
        { lat: 36.0, lng: 138.0, name: 'Japan - Rare Earths', value: 70 },
        { lat: 40.0, lng: 116.0, name: 'China - Rare Earths', value: 95 },
        { lat: -22.0, lng: -43.0, name: 'Brazil - Iron Ore', value: 88 },
        { lat: 61.5, lng: 105.0, name: 'Russia - Natural Gas', value: 90 },
        { lat: 31.0, lng: -103.0, name: 'Texas, USA - Oil', value: 85 },
    ],
    sustainability: [
        { lat: 55.6761, lng: 12.5683, name: 'Copenhagen, Denmark', value: 95 },
        { lat: 59.3293, lng: 18.0686, name: 'Stockholm, Sweden', value: 93 },
        { lat: 59.9139, lng: 10.7522, name: 'Oslo, Norway', value: 94 },
        { lat: 60.1699, lng: 24.9384, name: 'Helsinki, Finland', value: 91 },
        { lat: 64.1466, lng: -21.9426, name: 'Reykjavik, Iceland', value: 96 },
        { lat: 52.3676, lng: 4.9041, name: 'Amsterdam, Netherlands', value: 88 },
        { lat: 47.3769, lng: 8.5417, name: 'Zurich, Switzerland', value: 90 },
        { lat: 48.2082, lng: 16.3738, name: 'Vienna, Austria', value: 87 },
        { lat: -33.8688, lng: 151.2093, name: 'Sydney, Australia', value: 75 },
        { lat: 49.2827, lng: -123.1207, name: 'Vancouver, Canada', value: 82 },
        { lat: 35.6762, lng: 139.6503, name: 'Tokyo, Japan', value: 78 },
        { lat: 1.3521, lng: 103.8198, name: 'Singapore', value: 80 },
    ],
    health: [
        { lat: 28.6139, lng: 77.2090, name: 'Delhi - Health Impact Zone', value: 95 },
        { lat: 39.9042, lng: 116.4074, name: 'Beijing - Respiratory Issues', value: 90 },
        { lat: 6.5244, lng: 3.3792, name: 'Lagos - Water Quality', value: 85 },
        { lat: -6.2088, lng: 106.8456, name: 'Jakarta - Flooding Risk', value: 82 },
        { lat: 23.8103, lng: 90.4125, name: 'Dhaka - Environmental Health', value: 88 },
        { lat: 30.0444, lng: 31.2357, name: 'Cairo - Air Quality', value: 78 },
        { lat: 19.4326, lng: -99.1332, name: 'Mexico City - Smog', value: 75 },
        { lat: -23.5505, lng: -46.6333, name: 'São Paulo - Urban Health', value: 70 },
        { lat: 14.5995, lng: 120.9842, name: 'Manila - Water Sanitation', value: 77 },
        { lat: 13.7563, lng: 100.5018, name: 'Bangkok - Flooding', value: 73 },
    ],
    treasures: [
        { lat: 37.8651, lng: -119.5383, name: 'Yosemite National Park, USA', value: 95 },
        { lat: -13.1631, lng: -72.5450, name: 'Machu Picchu, Peru', value: 98 },
        { lat: -25.3444, lng: 131.0369, name: 'Uluru, Australia', value: 90 },
        { lat: 27.1751, lng: 78.0421, name: 'Taj Mahal, India', value: 92 },
        { lat: 29.9792, lng: 31.1342, name: 'Pyramids of Giza, Egypt', value: 96 },
        { lat: -22.9519, lng: -43.2105, name: 'Christ the Redeemer, Brazil', value: 88 },
        { lat: 40.4319, lng: 116.5704, name: 'Great Wall of China', value: 94 },
        { lat: -3.0674, lng: 37.3556, name: 'Mount Kilimanjaro, Tanzania', value: 85 },
        { lat: 64.0, lng: -17.0, name: 'Iceland Geysers', value: 82 },
        { lat: -17.9243, lng: 25.8572, name: 'Victoria Falls, Zimbabwe', value: 90 },
        { lat: 36.1069, lng: -112.1129, name: 'Grand Canyon, USA', value: 93 },
        { lat: -8.4095, lng: 115.1889, name: 'Bali Temples, Indonesia', value: 80 },
    ],
};

// Generate data points for each use case using real locations
const generateDataPoints = (useCase, count = 25, isWorldMap = false) => {
    const locations = REAL_LOCATIONS[useCase] || REAL_LOCATIONS.carbon;
    
    return locations.map((loc, i) => ({
        id: i,
        lat: loc.lat,
        lng: loc.lng,
        value: loc.value,
        name: loc.name,
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
    const dataPoints = useMemo(() => generateDataPoints(useCase, mini ? 10 : 25, isWorldMap), [useCase, mini, isWorldMap]);
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