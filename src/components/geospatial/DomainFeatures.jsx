import React from 'react';
import { 
    MapPin, Building, Users, FileText, Factory, Wheat, Mountain, TrendingUp,
    Activity, Hospital, Wind, Syringe, School, BookOpen, Target, Shield,
    Eye, Truck, AlertTriangle, Ship, Package, BarChart3, Briefcase, Home,
    Plane, Camera, Leaf
} from 'lucide-react';

const DOMAIN_FEATURES = {
    governance: [
        { icon: MapPin, name: 'Administrative Mapping', desc: 'Boundary validation, dispute monitoring, jurisdictional layers' },
        { icon: Building, name: 'Infrastructure Oversight', desc: 'Project tracking, progress from imagery, cost analytics' },
        { icon: Users, name: 'Population Distribution', desc: 'Gridded population, service gaps, equity analytics' },
        { icon: FileText, name: 'Policy Simulation', desc: 'Budget allocation, service placement scenarios' },
    ],
    economy: [
        { icon: Factory, name: 'Activity Hotspots', desc: 'Industrial zones, nightlights, logistics hubs' },
        { icon: Wheat, name: 'Agricultural Monitoring', desc: 'Crop classification, NDVI health, yield forecasting' },
        { icon: Mountain, name: 'Resource Mapping', desc: 'Mining/oil footprints, compliance, restoration' },
        { icon: TrendingUp, name: 'Economic Resilience', desc: 'Business continuity, infrastructure dependency' },
    ],
    health: [
        { icon: Activity, name: 'Outbreak Intelligence', desc: 'Case geo-tagging, spread models, transmission risk' },
        { icon: Hospital, name: 'Healthcare Access', desc: 'Facility location, travel isochrones, capacity maps' },
        { icon: Wind, name: 'Environmental Health', desc: 'Air/water quality, pollution plumes, hazard zones' },
        { icon: Syringe, name: 'Public Health Ops', desc: 'Vaccination sites, cold-chain, hotspot alerts' },
    ],
    education: [
        { icon: School, name: 'School Mapping', desc: 'Facility inventory, condition assessment, catchments' },
        { icon: BookOpen, name: 'Equity Dashboards', desc: 'Literacy, attendance, graduation by geography' },
        { icon: Target, name: 'Planning Tools', desc: 'Demand forecasting, optimal siting, deployment' },
    ],
    defense: [
        { icon: Shield, name: 'Border Awareness', desc: 'Crossing detection, patrol routes, terrain risk' },
        { icon: Eye, name: 'Asset Tracking', desc: 'Installations, logistics nodes, anomaly detection' },
        { icon: Truck, name: 'Operational Analytics', desc: 'Terrain analysis, route survivability, staging' },
        { icon: AlertTriangle, name: 'Incident Management', desc: 'Event timelines, evidence tracking, coordination' },
    ],
    trade: [
        { icon: Ship, name: 'Route Intelligence', desc: 'Maritime/air/land corridors, chokepoint stress' },
        { icon: Package, name: 'Port & Customs', desc: 'Throughput tracking, dwell times, compliance' },
        { icon: BarChart3, name: 'Supply Chain', desc: 'Origin-destination, bottleneck risk, resilience' },
    ],
    labor: [
        { icon: Briefcase, name: 'Workforce Distribution', desc: 'Industry heatmaps, skill clusters, migration' },
        { icon: TrendingUp, name: 'Market Dynamics', desc: 'Vacancy hotspots, wage gradients, training reach' },
        { icon: Home, name: 'Urbanization Insights', desc: 'New settlements, housing affordability zones' },
    ],
    tourism: [
        { icon: Plane, name: 'Attraction Mapping', desc: 'POIs, capacity estimates, seasonal patterns' },
        { icon: Camera, name: 'Visitor Dynamics', desc: 'Origin analysis, crowding risk, event impact' },
        { icon: Leaf, name: 'Sustainability', desc: 'Environmental pressure, trail erosion, compliance' },
    ],
};

export default function DomainFeatures({ domainId, color }) {
    const features = DOMAIN_FEATURES[domainId] || [];
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${color}15` }}>
                        <feature.icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900 text-sm">{feature.name}</h4>
                        <p className="text-xs text-gray-500">{feature.desc}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}