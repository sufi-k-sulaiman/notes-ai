import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Polyline } from 'react-leaflet';
import { ZoomIn, ZoomOut, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";

import 'leaflet/dist/leaflet.css';

const MAP_TILES = {
    default: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    explore: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    heatmap: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
};

const USE_CASE_CENTERS = {
    carbon: { center: [39.9, 116.4], zoom: 4 },
    forests: { center: [-3.4653, -62.2159], zoom: 4 },
    resources: { center: [25.0, 45.0], zoom: 3 },
    sustainability: { center: [55.6761, 12.5683], zoom: 4 },
    treasures: { center: [37.8651, -119.5383], zoom: 4 },
    biomass: { center: [0, 25], zoom: 3 },
    produce: { center: [40, -95], zoom: 3 },
    dairy: { center: [52, 5], zoom: 4 },
    livestock: { center: [-15, -55], zoom: 3 },
    power: { center: [35, 105], zoom: 3 },
    wellness: { center: [35, 139], zoom: 3 },
    elements: { center: [35, 105], zoom: 3 },
    airpollution: { center: [28.6, 77.2], zoom: 4 },
    waterpollution: { center: [10, 100], zoom: 3 },
    soilpollution: { center: [50, 10], zoom: 4 },
    plasticpollution: { center: [25, 140], zoom: 3 },
    noisepollution: { center: [40, -74], zoom: 4 },
    lightpollution: { center: [40, -100], zoom: 3 },
    thermalpollution: { center: [35, -80], zoom: 4 },
    radioactive: { center: [51.4, 30.1], zoom: 4 },
    chemical: { center: [30, -90], zoom: 4 },
    climatepollution: { center: [39.9, 116.4], zoom: 3 },
};

// Rationale bullets for each use case
const USE_CASE_RATIONALE = {
    carbon: {
        high: ['Heavy industrial manufacturing', 'Coal-powered electricity', 'Dense vehicle traffic', 'Aging infrastructure', 'Limited renewable adoption'],
        low: ['100% renewable energy grid', 'Carbon capture programs', 'Electric transport systems', 'Strict emission controls', 'Carbon tax policies']
    },
    forests: {
        high: ['Agricultural expansion', 'Illegal logging operations', 'Palm oil plantations', 'Mining activities', 'Urban development pressure'],
        low: ['Strong conservation laws', 'Reforestation programs', 'Indigenous land protection', 'Sustainable forestry', 'Protected national parks']
    },
    resources: {
        high: ['Intensive extraction', 'Limited reserves remaining', 'High global demand', 'Minimal recycling', 'Export-dependent economy'],
        low: ['Circular economy model', 'High recycling rates', 'Sustainable practices', 'Resource efficiency', 'Alternative materials used']
    },
    sustainability: {
        high: ['Renewable energy leader', 'Green infrastructure', 'Electric vehicle adoption', 'Waste recycling programs', 'Climate action policies'],
        low: ['Fossil fuel dependency', 'Limited green investment', 'Poor waste management', 'Aging power grid', 'Weak environmental laws']
    },
    airpollution: {
        high: ['Industrial emissions', 'Vehicle exhaust fumes', 'Coal power plants', 'Crop burning practices', 'Weak air quality laws'],
        low: ['Clean energy sources', 'Electric public transit', 'Strict emission standards', 'Green urban planning', 'Air quality monitoring']
    },
    waterpollution: {
        high: ['Industrial discharge', 'Agricultural runoff', 'Untreated sewage', 'Plastic waste dumping', 'Mining contamination'],
        low: ['Advanced water treatment', 'Strict discharge laws', 'Clean manufacturing', 'Protected watersheds', 'Regular water testing']
    },
    plasticpollution: {
        high: ['Single-use plastic culture', 'Poor waste collection', 'Ocean current patterns', 'Limited recycling', 'Coastal population density'],
        low: ['Plastic bans enacted', 'High recycling rates', 'Clean-up initiatives', 'Producer responsibility', 'Public awareness campaigns']
    },
    default: {
        high: ['High population density', 'Industrial activity', 'Limited regulations', 'Resource extraction', 'Urban development'],
        low: ['Strong environmental laws', 'Low population impact', 'Clean technology', 'Protected ecosystems', 'Sustainable practices']
    }
};

// Real-world location data for each use case
const REAL_LOCATIONS = {
    carbon: [
        { lat: 39.9042, lng: 116.4074, name: 'Beijing, China - Highest Emitter', value: 98 },
        { lat: 28.6139, lng: 77.2090, name: 'Delhi, India', value: 95 },
        { lat: 31.2304, lng: 121.4737, name: 'Shanghai, China', value: 92 },
        { lat: 40.7128, lng: -74.0060, name: 'New York, USA', value: 78 },
        { lat: 35.6762, lng: 139.6503, name: 'Tokyo, Japan', value: 75 },
        { lat: 55.7558, lng: 37.6173, name: 'Moscow, Russia', value: 82 },
        { lat: 51.5074, lng: -0.1278, name: 'London, UK', value: 65 },
        { lat: 64.1466, lng: -21.9426, name: 'Reykjavik, Iceland - Lowest', value: 15 },
        { lat: 55.6761, lng: 12.5683, name: 'Copenhagen, Denmark - Low', value: 22 },
        { lat: 59.9139, lng: 10.7522, name: 'Oslo, Norway - Low', value: 25 },
        { lat: 9.9281, lng: -84.0907, name: 'Costa Rica - Carbon Neutral', value: 18 },
        { lat: -4.0383, lng: 21.7587, name: 'DR Congo - Low Emissions', value: 12 },
    ],
    forests: [
        { lat: -3.4653, lng: -62.2159, name: 'Amazon - Deforestation Hotspot', value: 98 },
        { lat: 2.5, lng: 112.5, name: 'Borneo - Rapid Loss', value: 95 },
        { lat: -2.0, lng: 22.0, name: 'Congo Basin - At Risk', value: 85 },
        { lat: -6.0, lng: 106.8, name: 'Sumatra - Palm Oil', value: 92 },
        { lat: -19.0, lng: 46.0, name: 'Madagascar - Critical', value: 88 },
        { lat: 61.0, lng: 25.0, name: 'Finland - Reforestation Leader', value: 15 },
        { lat: 60.0, lng: 15.0, name: 'Sweden - Forest Growth', value: 18 },
        { lat: 55.0, lng: -120.0, name: 'Canada - Protected Boreal', value: 22 },
        { lat: 9.9281, lng: -84.0907, name: 'Costa Rica - Reforestation', value: 12 },
        { lat: -42.0, lng: 172.0, name: 'New Zealand - Conservation', value: 20 },
    ],
    resources: [
        { lat: 24.0, lng: 45.0, name: 'Saudi Arabia - Oil Depletion', value: 98 },
        { lat: 40.0, lng: 116.0, name: 'China - Rare Earth Mining', value: 95 },
        { lat: -29.0, lng: 24.0, name: 'South Africa - Mining Impact', value: 90 },
        { lat: 62.0, lng: -110.0, name: 'Canada - Oil Sands', value: 88 },
        { lat: 31.0, lng: -103.0, name: 'Texas, USA - Fracking', value: 85 },
        { lat: 59.9139, lng: 10.7522, name: 'Norway - Sustainable Oil', value: 25 },
        { lat: 64.1466, lng: -21.9426, name: 'Iceland - Geothermal', value: 15 },
        { lat: 9.9281, lng: -84.0907, name: 'Costa Rica - No Mining', value: 12 },
        { lat: -4.0383, lng: 21.7587, name: 'DRC - Untapped Resources', value: 20 },
        { lat: 1.3521, lng: 103.8198, name: 'Singapore - Circular Economy', value: 18 },
    ],
    sustainability: [
        { lat: 64.1466, lng: -21.9426, name: 'Iceland - 100% Renewable', value: 98 },
        { lat: 55.6761, lng: 12.5683, name: 'Copenhagen - Carbon Neutral', value: 95 },
        { lat: 59.9139, lng: 10.7522, name: 'Oslo - EV Capital', value: 93 },
        { lat: 59.3293, lng: 18.0686, name: 'Stockholm - Green City', value: 92 },
        { lat: 9.9281, lng: -84.0907, name: 'Costa Rica - Eco Pioneer', value: 90 },
        { lat: 39.9042, lng: 116.4074, name: 'China - Coal Dependent', value: 25 },
        { lat: 24.0, lng: 45.0, name: 'Saudi Arabia - Oil Economy', value: 20 },
        { lat: 28.6139, lng: 77.2090, name: 'India - High Coal Use', value: 28 },
        { lat: 40.7128, lng: -74.0060, name: 'USA - Mixed Energy', value: 45 },
        { lat: -23.5505, lng: -46.6333, name: 'Brazil - Hydro Power', value: 75 },
    ],
    treasures: [
        { lat: 37.8651, lng: -119.5383, name: 'Yosemite - Well Protected', value: 95 },
        { lat: -13.1631, lng: -72.5450, name: 'Machu Picchu - Heritage', value: 98 },
        { lat: 29.9792, lng: 31.1342, name: 'Pyramids of Giza', value: 92 },
        { lat: 36.1069, lng: -112.1129, name: 'Grand Canyon', value: 94 },
        { lat: -17.9243, lng: 25.8572, name: 'Victoria Falls', value: 88 },
        { lat: -3.4653, lng: -62.2159, name: 'Amazon - Under Threat', value: 35 },
        { lat: 27.9881, lng: 86.9250, name: 'Everest - Climate Risk', value: 40 },
        { lat: -25.2744, lng: 133.7751, name: 'Great Barrier Reef - Critical', value: 30 },
        { lat: -8.4095, lng: 115.1889, name: 'Bali - Over Tourism', value: 45 },
        { lat: 41.9028, lng: 12.4964, name: 'Rome - Preservation Needed', value: 50 },
    ],
    biomass: [
        { lat: -15.0, lng: -55.0, name: 'Brazil - Biofuel Leader', value: 95 },
        { lat: 40.0, lng: -95.0, name: 'US Midwest - Corn Ethanol', value: 90 },
        { lat: 2.5, lng: 112.5, name: 'Indonesia - Palm Oil', value: 88 },
        { lat: 52.0, lng: 10.0, name: 'Germany - Biogas', value: 85 },
        { lat: 28.6139, lng: 77.2090, name: 'India - Crop Residue', value: 80 },
        { lat: 35.0, lng: 105.0, name: 'China - Biomass Power', value: 82 },
        { lat: 64.1466, lng: -21.9426, name: 'Iceland - Limited', value: 20 },
        { lat: 24.0, lng: 45.0, name: 'Saudi Arabia - Desert', value: 15 },
        { lat: -33.9, lng: 18.4, name: 'South Africa - Growing', value: 55 },
        { lat: 1.3521, lng: 103.8198, name: 'Singapore - Limited', value: 25 },
    ],
    produce: [
        { lat: 40.0, lng: -95.0, name: 'US - Corn Belt', value: 98 },
        { lat: 35.0, lng: 105.0, name: 'China - Rice Production', value: 95 },
        { lat: 28.6139, lng: 77.2090, name: 'India - Wheat/Rice', value: 92 },
        { lat: -15.0, lng: -55.0, name: 'Brazil - Soybeans', value: 90 },
        { lat: 48.0, lng: 2.0, name: 'France - Wheat', value: 85 },
        { lat: -34.0, lng: -64.0, name: 'Argentina - Grains', value: 88 },
        { lat: 64.1466, lng: -21.9426, name: 'Iceland - Limited', value: 15 },
        { lat: 24.0, lng: 45.0, name: 'Saudi Arabia - Desert', value: 12 },
        { lat: 33.0, lng: 44.0, name: 'Iraq - Drought Impact', value: 25 },
        { lat: 15.0, lng: -15.0, name: 'Sahel Region - Low', value: 20 },
    ],
    dairy: [
        { lat: 52.0, lng: 5.0, name: 'Netherlands - Dairy Giant', value: 95 },
        { lat: 40.0, lng: -95.0, name: 'US Wisconsin - Cheese', value: 92 },
        { lat: -41.0, lng: 174.0, name: 'New Zealand - Export', value: 90 },
        { lat: 52.0, lng: 10.0, name: 'Germany - Production', value: 88 },
        { lat: 48.0, lng: 2.0, name: 'France - Cheese Culture', value: 87 },
        { lat: 28.6139, lng: 77.2090, name: 'India - Buffalo Milk', value: 85 },
        { lat: 15.0, lng: 32.0, name: 'Sudan - Limited', value: 20 },
        { lat: -4.0383, lng: 21.7587, name: 'DRC - Low Production', value: 15 },
        { lat: 33.0, lng: 44.0, name: 'Iraq - Developing', value: 25 },
        { lat: 1.3521, lng: 103.8198, name: 'Singapore - Import Only', value: 10 },
    ],
    livestock: [
        { lat: -15.0, lng: -55.0, name: 'Brazil - Cattle Capital', value: 98 },
        { lat: 40.0, lng: -95.0, name: 'US - Beef Industry', value: 95 },
        { lat: 28.6139, lng: 77.2090, name: 'India - Buffalo', value: 90 },
        { lat: -34.0, lng: -64.0, name: 'Argentina - Beef Export', value: 88 },
        { lat: -25.0, lng: 135.0, name: 'Australia - Cattle', value: 85 },
        { lat: 35.0, lng: 105.0, name: 'China - Pork Leader', value: 92 },
        { lat: 64.1466, lng: -21.9426, name: 'Iceland - Minimal', value: 15 },
        { lat: 1.3521, lng: 103.8198, name: 'Singapore - Import', value: 10 },
        { lat: 35.6762, lng: 139.6503, name: 'Japan - Limited', value: 35 },
        { lat: 52.0, lng: 5.0, name: 'Netherlands - Efficient', value: 45 },
    ],
    power: [
        { lat: 35.0, lng: 105.0, name: 'China - Highest Consumption', value: 98 },
        { lat: 40.0, lng: -95.0, name: 'USA - High Demand', value: 95 },
        { lat: 28.6139, lng: 77.2090, name: 'India - Growing Fast', value: 88 },
        { lat: 35.6762, lng: 139.6503, name: 'Japan - Industrial', value: 85 },
        { lat: 55.7558, lng: 37.6173, name: 'Russia - Heavy Industry', value: 82 },
        { lat: 52.0, lng: 10.0, name: 'Germany - Efficient', value: 55 },
        { lat: 64.1466, lng: -21.9426, name: 'Iceland - 100% Renewable', value: 20 },
        { lat: 9.9281, lng: -84.0907, name: 'Costa Rica - Renewable', value: 25 },
        { lat: 59.9139, lng: 10.7522, name: 'Norway - Hydro', value: 22 },
        { lat: -4.0383, lng: 21.7587, name: 'DRC - Low Access', value: 15 },
    ],
    wellness: [
        { lat: 35.6762, lng: 139.6503, name: 'Japan - Longest Life', value: 98 },
        { lat: 47.0, lng: 8.0, name: 'Switzerland - Healthiest', value: 95 },
        { lat: 64.1466, lng: -21.9426, name: 'Iceland - Clean Living', value: 93 },
        { lat: 59.3293, lng: 18.0686, name: 'Sweden - Healthcare', value: 92 },
        { lat: 1.3521, lng: 103.8198, name: 'Singapore - Modern Care', value: 90 },
        { lat: 28.6139, lng: 77.2090, name: 'India - Challenges', value: 35 },
        { lat: 6.5244, lng: 3.3792, name: 'Nigeria - Health Gap', value: 30 },
        { lat: -4.0383, lng: 21.7587, name: 'DRC - Low Access', value: 25 },
        { lat: 15.0, lng: 32.0, name: 'Sudan - Crisis', value: 28 },
        { lat: 33.9, lng: 67.7, name: 'Afghanistan - Difficult', value: 22 },
    ],
    elements: [
        { lat: 35.0, lng: 105.0, name: 'China - Rare Earth 60%', value: 98 },
        { lat: -29.0, lng: 24.0, name: 'South Africa - Platinum', value: 92 },
        { lat: -4.0383, lng: 21.7587, name: 'DRC - Cobalt Capital', value: 95 },
        { lat: -25.0, lng: 135.0, name: 'Australia - Lithium', value: 88 },
        { lat: -22.0, lng: -68.0, name: 'Chile - Copper/Lithium', value: 90 },
        { lat: 61.5, lng: 105.0, name: 'Russia - Nickel/Palladium', value: 85 },
        { lat: 52.0, lng: 5.0, name: 'Europe - Import Dependent', value: 20 },
        { lat: 35.6762, lng: 139.6503, name: 'Japan - Recycling Focus', value: 35 },
        { lat: 37.5, lng: -122.0, name: 'USA - Limited Reserves', value: 45 },
        { lat: 1.3521, lng: 103.8198, name: 'Singapore - No Resources', value: 10 },
    ],
    airpollution: [
        { lat: 28.6139, lng: 77.2090, name: 'Delhi - Most Polluted', value: 98 },
        { lat: 31.5497, lng: 74.3436, name: 'Lahore - Severe', value: 95 },
        { lat: 23.8103, lng: 90.4125, name: 'Dhaka - Critical', value: 92 },
        { lat: 39.9042, lng: 116.4074, name: 'Beijing - High PM2.5', value: 88 },
        { lat: 19.0760, lng: 72.8777, name: 'Mumbai - Industrial', value: 85 },
        { lat: 64.1466, lng: -21.9426, name: 'Iceland - Cleanest', value: 8 },
        { lat: 60.1699, lng: 24.9384, name: 'Helsinki - Clean', value: 12 },
        { lat: -41.0, lng: 174.0, name: 'Wellington - Fresh', value: 10 },
        { lat: 55.6761, lng: 12.5683, name: 'Copenhagen - Clean', value: 15 },
        { lat: 59.9139, lng: 10.7522, name: 'Oslo - Pristine', value: 14 },
    ],
    waterpollution: [
        { lat: 22.0, lng: 88.0, name: 'Ganges Delta - Severe', value: 98 },
        { lat: 31.2, lng: 121.5, name: 'Yangtze River - Industrial', value: 95 },
        { lat: -6.2088, lng: 106.8456, name: 'Jakarta Bay - Trash', value: 92 },
        { lat: 6.5244, lng: 3.3792, name: 'Lagos Lagoon - Sewage', value: 88 },
        { lat: 14.5995, lng: 120.9842, name: 'Manila Bay - Polluted', value: 85 },
        { lat: 64.1466, lng: -21.9426, name: 'Iceland - Pristine', value: 8 },
        { lat: 59.9139, lng: 10.7522, name: 'Norway Fjords - Clean', value: 10 },
        { lat: -41.0, lng: 174.0, name: 'New Zealand - Pure', value: 12 },
        { lat: 47.0, lng: 8.0, name: 'Swiss Lakes - Clean', value: 15 },
        { lat: 60.1699, lng: 24.9384, name: 'Finland Lakes - Pure', value: 14 },
    ],
    soilpollution: [
        { lat: 51.4, lng: 30.1, name: 'Chernobyl Zone - Radioactive', value: 98 },
        { lat: 35.0, lng: 105.0, name: 'China Industrial Zones', value: 92 },
        { lat: 40.0, lng: -95.0, name: 'US Superfund Sites', value: 85 },
        { lat: 52.0, lng: 10.0, name: 'Germany - Mining Legacy', value: 75 },
        { lat: -29.0, lng: 24.0, name: 'South Africa Mining', value: 88 },
        { lat: 64.1466, lng: -21.9426, name: 'Iceland - Volcanic Pure', value: 10 },
        { lat: -41.0, lng: 174.0, name: 'New Zealand - Clean', value: 15 },
        { lat: 55.6761, lng: 12.5683, name: 'Denmark - Managed', value: 25 },
        { lat: 9.9281, lng: -84.0907, name: 'Costa Rica - Natural', value: 18 },
        { lat: -4.0383, lng: 21.7587, name: 'DRC - Untouched Areas', value: 20 },
    ],
    plasticpollution: [
        { lat: 25.0, lng: 140.0, name: 'Pacific Garbage Patch', value: 98 },
        { lat: -6.2088, lng: 106.8456, name: 'Indonesia - Ocean Waste', value: 95 },
        { lat: 14.5995, lng: 120.9842, name: 'Philippines - Coastal', value: 92 },
        { lat: 22.0, lng: 88.0, name: 'Bay of Bengal - Debris', value: 88 },
        { lat: 35.0, lng: 105.0, name: 'China - Producer', value: 90 },
        { lat: 59.9139, lng: 10.7522, name: 'Norway - Clean Seas', value: 15 },
        { lat: 64.1466, lng: -21.9426, name: 'Iceland - Minimal', value: 12 },
        { lat: 52.0, lng: 5.0, name: 'Netherlands - Recycling', value: 25 },
        { lat: 52.0, lng: 10.0, name: 'Germany - Management', value: 28 },
        { lat: 35.6762, lng: 139.6503, name: 'Japan - Recycling', value: 30 },
    ],
    noisepollution: [
        { lat: 40.7128, lng: -74.0060, name: 'NYC - Traffic Noise', value: 95 },
        { lat: 19.0760, lng: 72.8777, name: 'Mumbai - Urban Chaos', value: 98 },
        { lat: 28.6139, lng: 77.2090, name: 'Delhi - Horn Culture', value: 92 },
        { lat: 22.3, lng: 114.2, name: 'Hong Kong - Dense', value: 88 },
        { lat: 35.6762, lng: 139.6503, name: 'Tokyo - Transit', value: 75 },
        { lat: 64.1466, lng: -21.9426, name: 'Reykjavik - Quiet', value: 12 },
        { lat: 60.1699, lng: 24.9384, name: 'Helsinki - Peaceful', value: 18 },
        { lat: 59.9139, lng: 10.7522, name: 'Oslo - Calm', value: 20 },
        { lat: 55.6761, lng: 12.5683, name: 'Copenhagen - Bikes', value: 22 },
        { lat: 47.0, lng: 8.0, name: 'Zurich - Quiet', value: 25 },
    ],
    lightpollution: [
        { lat: 40.7128, lng: -74.0060, name: 'NYC - Never Sleeps', value: 98 },
        { lat: 34.0522, lng: -118.2437, name: 'Los Angeles - Sprawl', value: 95 },
        { lat: 51.5074, lng: -0.1278, name: 'London - Bright', value: 88 },
        { lat: 35.6762, lng: 139.6503, name: 'Tokyo - Neon City', value: 92 },
        { lat: 22.3, lng: 114.2, name: 'Hong Kong - Dense Light', value: 90 },
        { lat: -22.0, lng: -68.0, name: 'Atacama - Dark Sky', value: 8 },
        { lat: -31.0, lng: 18.5, name: 'Karoo, SA - Dark', value: 10 },
        { lat: 64.1466, lng: -21.9426, name: 'Iceland - Aurora Zone', value: 15 },
        { lat: -45.0, lng: 168.0, name: 'NZ Dark Sky', value: 12 },
        { lat: 28.3, lng: -16.5, name: 'Canary Islands', value: 18 },
    ],
    thermalpollution: [
        { lat: 35.0, lng: 105.0, name: 'China - Power Plants', value: 95 },
        { lat: 40.0, lng: -80.0, name: 'US Industrial Belt', value: 92 },
        { lat: 28.6139, lng: 77.2090, name: 'India - Thermal Plants', value: 88 },
        { lat: 35.6762, lng: 139.6503, name: 'Japan - Nuclear Cool', value: 82 },
        { lat: 48.0, lng: 2.0, name: 'France - Nuclear', value: 78 },
        { lat: 64.1466, lng: -21.9426, name: 'Iceland - Geothermal', value: 20 },
        { lat: 59.9139, lng: 10.7522, name: 'Norway - Hydro', value: 22 },
        { lat: 9.9281, lng: -84.0907, name: 'Costa Rica - Natural', value: 18 },
        { lat: -41.0, lng: 174.0, name: 'NZ - Clean Energy', value: 25 },
        { lat: 55.6761, lng: 12.5683, name: 'Denmark - Efficient', value: 30 },
    ],
    radioactive: [
        { lat: 51.4, lng: 30.1, name: 'Chernobyl - Exclusion Zone', value: 98 },
        { lat: 37.4, lng: 141.0, name: 'Fukushima - Contamination', value: 92 },
        { lat: 50.0, lng: 78.0, name: 'Semipalatinsk - Test Site', value: 88 },
        { lat: 37.0, lng: -116.0, name: 'Nevada Test Site', value: 75 },
        { lat: -21.0, lng: -175.0, name: 'Pacific Test Sites', value: 70 },
        { lat: 64.1466, lng: -21.9426, name: 'Iceland - No Nuclear', value: 5 },
        { lat: 9.9281, lng: -84.0907, name: 'Costa Rica - Nuclear Free', value: 8 },
        { lat: -41.0, lng: 174.0, name: 'NZ - Nuclear Free', value: 6 },
        { lat: 55.6761, lng: 12.5683, name: 'Denmark - No Reactors', value: 10 },
        { lat: 1.3521, lng: 103.8198, name: 'Singapore - No Nuclear', value: 8 },
    ],
    chemical: [
        { lat: 30.0, lng: -90.0, name: 'Gulf Coast - Petrochemical', value: 98 },
        { lat: 35.0, lng: 105.0, name: 'China - Industrial', value: 95 },
        { lat: 28.6139, lng: 77.2090, name: 'India - Bhopal Legacy', value: 88 },
        { lat: 52.0, lng: 10.0, name: 'Germany - Industry', value: 72 },
        { lat: 35.6762, lng: 139.6503, name: 'Japan - Minamata', value: 65 },
        { lat: 64.1466, lng: -21.9426, name: 'Iceland - Minimal', value: 10 },
        { lat: 9.9281, lng: -84.0907, name: 'Costa Rica - Clean', value: 15 },
        { lat: -41.0, lng: 174.0, name: 'NZ - Low Industry', value: 18 },
        { lat: 55.6761, lng: 12.5683, name: 'Denmark - Managed', value: 25 },
        { lat: 59.9139, lng: 10.7522, name: 'Norway - Clean', value: 22 },
    ],
    climatepollution: [
        { lat: 35.0, lng: 105.0, name: 'China - Largest Emitter', value: 98 },
        { lat: 40.0, lng: -95.0, name: 'USA - Per Capita High', value: 92 },
        { lat: 28.6139, lng: 77.2090, name: 'India - Growing Fast', value: 85 },
        { lat: 55.7558, lng: 37.6173, name: 'Russia - Fossil Fuels', value: 88 },
        { lat: 35.6762, lng: 139.6503, name: 'Japan - Industrial', value: 78 },
        { lat: 64.1466, lng: -21.9426, name: 'Iceland - Net Zero', value: 10 },
        { lat: 9.9281, lng: -84.0907, name: 'Costa Rica - Carbon Neg', value: 8 },
        { lat: 55.6761, lng: 12.5683, name: 'Denmark - Wind Power', value: 20 },
        { lat: 59.9139, lng: 10.7522, name: 'Norway - Electric', value: 18 },
        { lat: -4.0383, lng: 21.7587, name: 'DRC - Low Emissions', value: 12 },
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
        type: useCase,
        isHigh: loc.value >= 70,
        isLow: loc.value <= 30
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

    const getColor = (value, point) => {
        // High values = red (hotspots/worst), Low values = green (best/cleanest)
        if (value >= 80) return '#DC2626'; // Dark red - critical
        if (value >= 70) return '#EF4444'; // Red - high
        if (value >= 50) return '#F97316'; // Orange - medium-high
        if (value >= 30) return '#FBBF24'; // Yellow - medium
        if (value >= 20) return '#84CC16'; // Light green - low
        return '#22C55E'; // Green - very low/best
    };

    const getRadius = (value) => {
        const base = mini ? 4 : 8;
        return base + (value / 20);
    };

    return (
        <div className="relative rounded-xl overflow-hidden border border-gray-200" style={{ height }}>


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
                {dataPoints.map(point => {
                    const rationale = USE_CASE_RATIONALE[point.type] || USE_CASE_RATIONALE.default;
                    const bullets = point.value >= 50 ? rationale.high : rationale.low;
                    const impactLabel = point.value >= 80 ? 'Critical' : point.value >= 70 ? 'High' : point.value >= 50 ? 'Moderate' : point.value >= 30 ? 'Low' : 'Minimal';
                    
                    return (
                        <CircleMarker
                            key={point.id}
                            center={[point.lat, point.lng]}
                            radius={getRadius(point.value)}
                            pathOptions={{
                                fillColor: getColor(point.value, point),
                                fillOpacity: point.value >= 70 ? 0.85 : point.value <= 30 ? 0.9 : 0.7,
                                color: point.value >= 80 ? '#991B1B' : point.value <= 20 ? '#166534' : '#fff',
                                weight: mini ? 1 : (point.value >= 80 || point.value <= 20 ? 3 : 2)
                            }}
                        >
                            {!mini && (
                                <Popup>
                                    <div className="p-2 min-w-[220px] max-w-[280px]">
                                        <h4 className="font-bold text-gray-900 text-sm">{point.name}</h4>
                                        <p className="text-xs text-gray-500 capitalize mb-2">{point.type.replace(/pollution/g, ' pollution')}</p>
                                        
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-gray-600">Impact Score:</span>
                                            <span className="text-sm font-bold" style={{ color: getColor(point.value, point) }}>
                                                {point.value} - {impactLabel}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
                                            <div className="h-full rounded-full" style={{ width: `${point.value}%`, backgroundColor: getColor(point.value, point) }} />
                                        </div>
                                        
                                        <p className="text-xs text-gray-600 mb-2">
                                            {point.value >= 50 ? 'Key factors contributing to elevated levels:' : 'Factors maintaining low impact:'}
                                        </p>
                                        <ul className="space-y-0.5">
                                            {bullets.map((b, i) => (
                                                <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                                                    <span className="mt-0.5" style={{ color: getColor(point.value, point) }}>•</span>
                                                    {b}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </Popup>
                            )}
                        </CircleMarker>
                    );
                })}
            </MapContainer>

            {/* Legend - only on main maps */}
            {!mini && (
                <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3">
                    <div className="text-xs font-medium text-gray-600 mb-2">Impact Level</div>
                    <div className="flex gap-1">
                        {[
                            { color: '#22C55E', label: 'Best' },
                            { color: '#84CC16', label: 'Good' },
                            { color: '#FBBF24', label: 'Mod' },
                            { color: '#F97316', label: 'High' },
                            { color: '#EF4444', label: 'Severe' },
                            { color: '#DC2626', label: 'Critical' },
                        ].map(item => (
                            <div key={item.label} className="flex flex-col items-center">
                                <div className="w-5 h-3 rounded" style={{ backgroundColor: item.color }} />
                                <span className="text-[9px] text-gray-500 mt-1">{item.label}</span>
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