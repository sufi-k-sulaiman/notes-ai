import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, TrendingUp, TrendingDown, Shield, Zap, DollarSign, BarChart3, Activity, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StockCard from '@/components/markets/StockCard';
import StockTicker from '@/components/markets/StockTicker';
import FilterChips from '@/components/markets/FilterChips';
import StockDetailModal from '@/components/markets/StockDetailModal';
import MarketOverviewChart from '@/components/markets/MarketOverviewChart';
import { EmptyState, LoadingState } from '@/components/ErrorDisplay';
import { base44 } from '@/api/base44Client';

const PRESET_FILTERS = [
    { id: 'all', label: 'All Stocks', icon: BarChart3 },
    { id: 'wide-moats', label: 'Wide Moats', icon: Shield },
    { id: 'undervalued', label: 'Undervalued', icon: DollarSign },
    { id: 'high-growth', label: 'High Growth', icon: TrendingUp },
    { id: 'top-movers', label: 'Top Movers', icon: Activity },
];

const FILTER_OPTIONS = {
    moat: { label: 'MOAT', options: ['Any', '70+', '60+', '50+'] },
    roe: { label: 'ROE', options: ['Any', '20%+', '15%+', '10%+'] },
    pe: { label: 'P/E', options: ['Any', '<15', '<20', '<30'] },
    zscore: { label: 'Z-Score', options: ['Any', '3+', '2.5+', '2+'] },
};

const STOCK_DATA = [
    { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', industry: 'Consumer Electronics', marketCap: '2890' },
    { ticker: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', industry: 'Software', marketCap: '2780' },
    { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', industry: 'Internet Services', marketCap: '1720' },
    { ticker: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer', industry: 'E-Commerce', marketCap: '1540' },
    { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', industry: 'Semiconductors', marketCap: '1180' },
    { ticker: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', industry: 'Social Media', marketCap: '890' },
    { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive', industry: 'Electric Vehicles', marketCap: '780' },
    { ticker: 'BRK.B', name: 'Berkshire Hathaway', sector: 'Finance', industry: 'Conglomerate', marketCap: '750' },
    { ticker: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Finance', industry: 'Banking', marketCap: '520' },
    { ticker: 'V', name: 'Visa Inc.', sector: 'Finance', industry: 'Payments', marketCap: '480' },
    { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCap: '420' },
    { ticker: 'WMT', name: 'Walmart Inc.', sector: 'Consumer', industry: 'Retail', marketCap: '410' },
    { ticker: 'PG', name: 'Procter & Gamble', sector: 'Consumer', industry: 'Consumer Goods', marketCap: '380' },
    { ticker: 'MA', name: 'Mastercard Inc.', sector: 'Finance', industry: 'Payments', marketCap: '390' },
    { ticker: 'HD', name: 'Home Depot Inc.', sector: 'Consumer', industry: 'Home Improvement', marketCap: '340' },
    { ticker: 'XOM', name: 'Exxon Mobil Corp.', sector: 'Energy', industry: 'Oil & Gas', marketCap: '460' },
    { ticker: 'CVX', name: 'Chevron Corp.', sector: 'Energy', industry: 'Oil & Gas', marketCap: '290' },
    { ticker: 'BAC', name: 'Bank of America', sector: 'Finance', industry: 'Banking', marketCap: '270' },
    { ticker: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare', industry: 'Biotechnology', marketCap: '280' },
    { ticker: 'KO', name: 'Coca-Cola Company', sector: 'Consumer', industry: 'Beverages', marketCap: '260' },
    { ticker: 'PEP', name: 'PepsiCo Inc.', sector: 'Consumer', industry: 'Beverages', marketCap: '230' },
    { ticker: 'COST', name: 'Costco Wholesale', sector: 'Consumer', industry: 'Retail', marketCap: '250' },
    { ticker: 'MRK', name: 'Merck & Co.', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCap: '270' },
    { ticker: 'TMO', name: 'Thermo Fisher Scientific', sector: 'Healthcare', industry: 'Life Sciences', marketCap: '210' },
    { ticker: 'AVGO', name: 'Broadcom Inc.', sector: 'Technology', industry: 'Semiconductors', marketCap: '360' },
    { ticker: 'CSCO', name: 'Cisco Systems', sector: 'Technology', industry: 'Networking', marketCap: '220' },
    { ticker: 'ACN', name: 'Accenture plc', sector: 'Technology', industry: 'IT Services', marketCap: '200' },
    { ticker: 'ADBE', name: 'Adobe Inc.', sector: 'Technology', industry: 'Software', marketCap: '240' },
    { ticker: 'CRM', name: 'Salesforce Inc.', sector: 'Technology', industry: 'Cloud Software', marketCap: '250' },
    { ticker: 'INTC', name: 'Intel Corporation', sector: 'Technology', industry: 'Semiconductors', marketCap: '180' },
    { ticker: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology', industry: 'Semiconductors', marketCap: '220' },
    { ticker: 'IBM', name: 'IBM Corporation', sector: 'Technology', industry: 'IT Services', marketCap: '150' },
    { ticker: 'ORCL', name: 'Oracle Corporation', sector: 'Technology', industry: 'Software', marketCap: '310' },
    { ticker: 'QCOM', name: 'Qualcomm Inc.', sector: 'Technology', industry: 'Semiconductors', marketCap: '170' },
    { ticker: 'NOW', name: 'ServiceNow Inc.', sector: 'Technology', industry: 'Cloud Software', marketCap: '150' },
    { ticker: 'INTU', name: 'Intuit Inc.', sector: 'Technology', industry: 'Software', marketCap: '170' },
    { ticker: 'SNOW', name: 'Snowflake Inc.', sector: 'Technology', industry: 'Cloud Data', marketCap: '65' },
    { ticker: 'PLTR', name: 'Palantir Technologies', sector: 'Technology', industry: 'Data Analytics', marketCap: '45' },
    { ticker: 'CRWD', name: 'CrowdStrike Holdings', sector: 'Technology', industry: 'Cybersecurity', marketCap: '72' },
    { ticker: 'NKE', name: 'Nike Inc.', sector: 'Consumer', industry: 'Apparel', marketCap: '150' },
    { ticker: 'LOW', name: 'Lowes Companies', sector: 'Consumer', industry: 'Home Improvement', marketCap: '130' },
    { ticker: 'SBUX', name: 'Starbucks Corporation', sector: 'Consumer', industry: 'Restaurants', marketCap: '105' },
    { ticker: 'TGT', name: 'Target Corporation', sector: 'Consumer', industry: 'Retail', marketCap: '72' },
    { ticker: 'MCD', name: 'McDonalds Corporation', sector: 'Consumer', industry: 'Restaurants', marketCap: '205' },
    { ticker: 'DIS', name: 'Walt Disney Company', sector: 'Media', industry: 'Entertainment', marketCap: '175' },
    { ticker: 'NFLX', name: 'Netflix Inc.', sector: 'Media', industry: 'Streaming', marketCap: '195' },
    { ticker: 'PYPL', name: 'PayPal Holdings', sector: 'Finance', industry: 'Fintech', marketCap: '68' },
    { ticker: 'GS', name: 'Goldman Sachs', sector: 'Finance', industry: 'Investment Banking', marketCap: '135' },
    { ticker: 'MS', name: 'Morgan Stanley', sector: 'Finance', industry: 'Investment Banking', marketCap: '150' },
    { ticker: 'AXP', name: 'American Express', sector: 'Finance', industry: 'Credit Services', marketCap: '165' },
    { ticker: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare', industry: 'Health Insurance', marketCap: '480' },
    { ticker: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCap: '160' },
    { ticker: 'LLY', name: 'Eli Lilly and Company', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCap: '550' },
    { ticker: 'AMGN', name: 'Amgen Inc.', sector: 'Healthcare', industry: 'Biotechnology', marketCap: '150' },
    { ticker: 'GILD', name: 'Gilead Sciences', sector: 'Healthcare', industry: 'Biotechnology', marketCap: '100' },
    { ticker: 'BMY', name: 'Bristol-Myers Squibb', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCap: '95' },
    { ticker: 'REGN', name: 'Regeneron Pharmaceuticals', sector: 'Healthcare', industry: 'Biotechnology', marketCap: '95' },
    { ticker: 'VRTX', name: 'Vertex Pharmaceuticals', sector: 'Healthcare', industry: 'Biotechnology', marketCap: '110' },
    { ticker: 'MRNA', name: 'Moderna Inc.', sector: 'Healthcare', industry: 'Biotechnology', marketCap: '45' },
    { ticker: 'BA', name: 'Boeing Company', sector: 'Industrials', industry: 'Aerospace', marketCap: '130' },
    { ticker: 'CAT', name: 'Caterpillar Inc.', sector: 'Industrials', industry: 'Machinery', marketCap: '160' },
    { ticker: 'GE', name: 'General Electric', sector: 'Industrials', industry: 'Conglomerate', marketCap: '180' },
    { ticker: 'MMM', name: '3M Company', sector: 'Industrials', industry: 'Conglomerate', marketCap: '55' },
    { ticker: 'UPS', name: 'United Parcel Service', sector: 'Industrials', industry: 'Logistics', marketCap: '110' },
    { ticker: 'DE', name: 'Deere & Company', sector: 'Industrials', industry: 'Machinery', marketCap: '120' },
    { ticker: 'LMT', name: 'Lockheed Martin', sector: 'Industrials', industry: 'Defense', marketCap: '120' },
    { ticker: 'RTX', name: 'RTX Corporation', sector: 'Industrials', industry: 'Aerospace & Defense', marketCap: '140' },
    { ticker: 'HON', name: 'Honeywell International', sector: 'Industrials', industry: 'Conglomerate', marketCap: '130' },
    { ticker: 'UNP', name: 'Union Pacific', sector: 'Industrials', industry: 'Railroads', marketCap: '140' },
    { ticker: 'NEE', name: 'NextEra Energy', sector: 'Utilities', industry: 'Electric Utilities', marketCap: '150' },
    { ticker: 'DUK', name: 'Duke Energy', sector: 'Utilities', industry: 'Electric Utilities', marketCap: '80' },
    { ticker: 'SO', name: 'Southern Company', sector: 'Utilities', industry: 'Electric Utilities', marketCap: '85' },
    { ticker: 'T', name: 'AT&T Inc.', sector: 'Telecom', industry: 'Telecommunications', marketCap: '120' },
    { ticker: 'VZ', name: 'Verizon Communications', sector: 'Telecom', industry: 'Telecommunications', marketCap: '170' },
    { ticker: 'TMUS', name: 'T-Mobile US', sector: 'Telecom', industry: 'Telecommunications', marketCap: '200' },
    { ticker: 'COP', name: 'ConocoPhillips', sector: 'Energy', industry: 'Oil & Gas', marketCap: '130' },
    { ticker: 'EOG', name: 'EOG Resources', sector: 'Energy', industry: 'Oil & Gas', marketCap: '70' },
    { ticker: 'SLB', name: 'Schlumberger', sector: 'Energy', industry: 'Oil Services', marketCap: '65' },
    { ticker: 'LIN', name: 'Linde plc', sector: 'Materials', industry: 'Industrial Gases', marketCap: '200' },
    { ticker: 'APD', name: 'Air Products', sector: 'Materials', industry: 'Industrial Gases', marketCap: '65' },
    { ticker: 'SHW', name: 'Sherwin-Williams', sector: 'Materials', industry: 'Paints & Coatings', marketCap: '85' },
    { ticker: 'FCX', name: 'Freeport-McMoRan', sector: 'Materials', industry: 'Copper Mining', marketCap: '55' },
    { ticker: 'NEM', name: 'Newmont Corporation', sector: 'Materials', industry: 'Gold Mining', marketCap: '45' },
    { ticker: 'AMT', name: 'American Tower', sector: 'Real Estate', industry: 'REITs', marketCap: '95' },
    { ticker: 'PLD', name: 'Prologis Inc.', sector: 'Real Estate', industry: 'Industrial REITs', marketCap: '110' },
    { ticker: 'CCI', name: 'Crown Castle', sector: 'Real Estate', industry: 'REITs', marketCap: '45' },
    { ticker: 'EQIX', name: 'Equinix Inc.', sector: 'Real Estate', industry: 'Data Center REITs', marketCap: '75' },
    { ticker: 'SPG', name: 'Simon Property Group', sector: 'Real Estate', industry: 'Retail REITs', marketCap: '50' },
    { ticker: 'WFC', name: 'Wells Fargo', sector: 'Finance', industry: 'Banking', marketCap: '180' },
    { ticker: 'C', name: 'Citigroup Inc.', sector: 'Finance', industry: 'Banking', marketCap: '95' },
    { ticker: 'SCHW', name: 'Charles Schwab', sector: 'Finance', industry: 'Brokerage', marketCap: '120' },
    { ticker: 'BLK', name: 'BlackRock Inc.', sector: 'Finance', industry: 'Asset Management', marketCap: '115' },
    { ticker: 'SPGI', name: 'S&P Global', sector: 'Finance', industry: 'Financial Data', marketCap: '130' },
    { ticker: 'CME', name: 'CME Group', sector: 'Finance', industry: 'Exchanges', marketCap: '75' },
    { ticker: 'ICE', name: 'Intercontinental Exchange', sector: 'Finance', industry: 'Exchanges', marketCap: '70' },
    { ticker: 'AMAT', name: 'Applied Materials', sector: 'Technology', industry: 'Semiconductor Equipment', marketCap: '140' },
    { ticker: 'MU', name: 'Micron Technology', sector: 'Technology', industry: 'Memory Chips', marketCap: '95' },
    { ticker: 'LRCX', name: 'Lam Research', sector: 'Technology', industry: 'Semiconductor Equipment', marketCap: '95' },
    // Additional 100 stocks
    { ticker: 'ADI', name: 'Analog Devices', sector: 'Technology', industry: 'Semiconductors', marketCap: '100' },
    { ticker: 'TXN', name: 'Texas Instruments', sector: 'Technology', industry: 'Semiconductors', marketCap: '165' },
    { ticker: 'PANW', name: 'Palo Alto Networks', sector: 'Technology', industry: 'Cybersecurity', marketCap: '100' },
    { ticker: 'FTNT', name: 'Fortinet Inc.', sector: 'Technology', industry: 'Cybersecurity', marketCap: '55' },
    { ticker: 'ZS', name: 'Zscaler Inc.', sector: 'Technology', industry: 'Cybersecurity', marketCap: '28' },
    { ticker: 'DDOG', name: 'Datadog Inc.', sector: 'Technology', industry: 'Cloud Monitoring', marketCap: '38' },
    { ticker: 'NET', name: 'Cloudflare Inc.', sector: 'Technology', industry: 'Cloud Services', marketCap: '28' },
    { ticker: 'WDAY', name: 'Workday Inc.', sector: 'Technology', industry: 'HR Software', marketCap: '60' },
    { ticker: 'TEAM', name: 'Atlassian Corp.', sector: 'Technology', industry: 'Software', marketCap: '45' },
    { ticker: 'MDB', name: 'MongoDB Inc.', sector: 'Technology', industry: 'Database', marketCap: '25' },
    { ticker: 'SHOP', name: 'Shopify Inc.', sector: 'Technology', industry: 'E-Commerce Platform', marketCap: '95' },
    { ticker: 'SQ', name: 'Block Inc.', sector: 'Finance', industry: 'Fintech', marketCap: '42' },
    { ticker: 'UBER', name: 'Uber Technologies', sector: 'Technology', industry: 'Ride-sharing', marketCap: '145' },
    { ticker: 'ABNB', name: 'Airbnb Inc.', sector: 'Consumer', industry: 'Travel', marketCap: '85' },
    { ticker: 'BKNG', name: 'Booking Holdings', sector: 'Consumer', industry: 'Travel', marketCap: '130' },
    { ticker: 'MAR', name: 'Marriott International', sector: 'Consumer', industry: 'Hotels', marketCap: '70' },
    { ticker: 'HLT', name: 'Hilton Worldwide', sector: 'Consumer', industry: 'Hotels', marketCap: '55' },
    { ticker: 'CMG', name: 'Chipotle Mexican Grill', sector: 'Consumer', industry: 'Restaurants', marketCap: '75' },
    { ticker: 'YUM', name: 'Yum! Brands', sector: 'Consumer', industry: 'Restaurants', marketCap: '38' },
    { ticker: 'DPZ', name: 'Dominos Pizza', sector: 'Consumer', industry: 'Restaurants', marketCap: '15' },
    { ticker: 'LULU', name: 'Lululemon Athletica', sector: 'Consumer', industry: 'Apparel', marketCap: '45' },
    { ticker: 'EA', name: 'Electronic Arts', sector: 'Media', industry: 'Video Games', marketCap: '38' },
    { ticker: 'TTWO', name: 'Take-Two Interactive', sector: 'Media', industry: 'Video Games', marketCap: '28' },
    { ticker: 'RBLX', name: 'Roblox Corp.', sector: 'Media', industry: 'Gaming Platform', marketCap: '28' },
    { ticker: 'SPOT', name: 'Spotify Technology', sector: 'Media', industry: 'Music Streaming', marketCap: '65' },
    { ticker: 'COIN', name: 'Coinbase Global', sector: 'Finance', industry: 'Cryptocurrency', marketCap: '45' },
    { ticker: 'GM', name: 'General Motors', sector: 'Automotive', industry: 'Automobiles', marketCap: '55' },
    { ticker: 'F', name: 'Ford Motor Company', sector: 'Automotive', industry: 'Automobiles', marketCap: '45' },
    { ticker: 'RIVN', name: 'Rivian Automotive', sector: 'Automotive', industry: 'Electric Vehicles', marketCap: '15' },
    { ticker: 'FDX', name: 'FedEx Corporation', sector: 'Industrials', industry: 'Logistics', marketCap: '65' },
    { ticker: 'CSX', name: 'CSX Corporation', sector: 'Industrials', industry: 'Railroads', marketCap: '65' },
    { ticker: 'NSC', name: 'Norfolk Southern', sector: 'Industrials', industry: 'Railroads', marketCap: '50' },
    { ticker: 'WM', name: 'Waste Management', sector: 'Industrials', industry: 'Waste Services', marketCap: '80' },
    { ticker: 'ETN', name: 'Eaton Corporation', sector: 'Industrials', industry: 'Electrical Equipment', marketCap: '110' },
    { ticker: 'EMR', name: 'Emerson Electric', sector: 'Industrials', industry: 'Industrial Automation', marketCap: '60' },
    { ticker: 'ABT', name: 'Abbott Laboratories', sector: 'Healthcare', industry: 'Medical Devices', marketCap: '190' },
    { ticker: 'DHR', name: 'Danaher Corporation', sector: 'Healthcare', industry: 'Life Sciences', marketCap: '180' },
    { ticker: 'MDT', name: 'Medtronic plc', sector: 'Healthcare', industry: 'Medical Devices', marketCap: '105' },
    { ticker: 'SYK', name: 'Stryker Corporation', sector: 'Healthcare', industry: 'Medical Devices', marketCap: '120' },
    { ticker: 'ISRG', name: 'Intuitive Surgical', sector: 'Healthcare', industry: 'Medical Devices', marketCap: '145' },
    { ticker: 'BSX', name: 'Boston Scientific', sector: 'Healthcare', industry: 'Medical Devices', marketCap: '85' },
    { ticker: 'CI', name: 'Cigna Group', sector: 'Healthcare', industry: 'Health Insurance', marketCap: '95' },
    { ticker: 'CVS', name: 'CVS Health', sector: 'Healthcare', industry: 'Healthcare Services', marketCap: '75' },
    { ticker: 'SNPS', name: 'Synopsys Inc.', sector: 'Technology', industry: 'EDA Software', marketCap: '80' },
    { ticker: 'CDNS', name: 'Cadence Design', sector: 'Technology', industry: 'EDA Software', marketCap: '75' },
    { ticker: 'KLAC', name: 'KLA Corporation', sector: 'Technology', industry: 'Semiconductor Equipment', marketCap: '85' },
    { ticker: 'MRVL', name: 'Marvell Technology', sector: 'Technology', industry: 'Semiconductors', marketCap: '60' },
    { ticker: 'ON', name: 'ON Semiconductor', sector: 'Technology', industry: 'Semiconductors', marketCap: '35' },
    { ticker: 'NXPI', name: 'NXP Semiconductors', sector: 'Technology', industry: 'Semiconductors', marketCap: '55' },
    { ticker: 'DELL', name: 'Dell Technologies', sector: 'Technology', industry: 'Computer Hardware', marketCap: '85' },
    { ticker: 'HPQ', name: 'HP Inc.', sector: 'Technology', industry: 'Computer Hardware', marketCap: '35' },
    { ticker: 'NTAP', name: 'NetApp Inc.', sector: 'Technology', industry: 'Data Storage', marketCap: '22' },
    { ticker: 'OKTA', name: 'Okta Inc.', sector: 'Technology', industry: 'Identity Management', marketCap: '15' },
    { ticker: 'TWLO', name: 'Twilio Inc.', sector: 'Technology', industry: 'Communications API', marketCap: '12' },
    { ticker: 'ZM', name: 'Zoom Video', sector: 'Technology', industry: 'Video Communications', marketCap: '22' },
    { ticker: 'DOCU', name: 'DocuSign Inc.', sector: 'Technology', industry: 'E-Signature', marketCap: '12' },
    { ticker: 'TTD', name: 'The Trade Desk', sector: 'Technology', industry: 'Ad Tech', marketCap: '45' },
    { ticker: 'U', name: 'Unity Software', sector: 'Technology', industry: 'Game Engine', marketCap: '12' },
    { ticker: 'TER', name: 'Teradyne Inc.', sector: 'Technology', industry: 'Test Equipment', marketCap: '18' },
    { ticker: 'ENTG', name: 'Entegris Inc.', sector: 'Technology', industry: 'Semiconductor Materials', marketCap: '18' },
    { ticker: 'MPWR', name: 'Monolithic Power', sector: 'Technology', industry: 'Power Semiconductors', marketCap: '35' },
    { ticker: 'VST', name: 'Vistra Corp.', sector: 'Utilities', industry: 'Independent Power', marketCap: '35' },
    { ticker: 'CEG', name: 'Constellation Energy', sector: 'Utilities', industry: 'Nuclear Power', marketCap: '55' },
    { ticker: 'PCG', name: 'PG&E Corporation', sector: 'Utilities', industry: 'Electric Utilities', marketCap: '45' },
    { ticker: 'EXC', name: 'Exelon Corporation', sector: 'Utilities', industry: 'Electric Utilities', marketCap: '42' },
    { ticker: 'SRE', name: 'Sempra Energy', sector: 'Utilities', industry: 'Multi-Utilities', marketCap: '52' },
    { ticker: 'D', name: 'Dominion Energy', sector: 'Utilities', industry: 'Electric Utilities', marketCap: '45' },
    { ticker: 'AEP', name: 'American Electric Power', sector: 'Utilities', industry: 'Electric Utilities', marketCap: '50' },
    { ticker: 'AWK', name: 'American Water Works', sector: 'Utilities', industry: 'Water Utilities', marketCap: '28' },
    { ticker: 'OXY', name: 'Occidental Petroleum', sector: 'Energy', industry: 'Oil & Gas', marketCap: '55' },
    { ticker: 'HES', name: 'Hess Corporation', sector: 'Energy', industry: 'Oil & Gas', marketCap: '45' },
    { ticker: 'DVN', name: 'Devon Energy', sector: 'Energy', industry: 'Oil & Gas', marketCap: '28' },
    { ticker: 'FANG', name: 'Diamondback Energy', sector: 'Energy', industry: 'Oil & Gas', marketCap: '32' },
    { ticker: 'VLO', name: 'Valero Energy', sector: 'Energy', industry: 'Refining', marketCap: '45' },
    { ticker: 'MPC', name: 'Marathon Petroleum', sector: 'Energy', industry: 'Refining', marketCap: '55' },
    { ticker: 'PSX', name: 'Phillips 66', sector: 'Energy', industry: 'Refining', marketCap: '52' },
    { ticker: 'BKR', name: 'Baker Hughes', sector: 'Energy', industry: 'Oil Services', marketCap: '35' },
    { ticker: 'HAL', name: 'Halliburton Company', sector: 'Energy', industry: 'Oil Services', marketCap: '28' },
    { ticker: 'CL', name: 'Colgate-Palmolive', sector: 'Consumer', industry: 'Personal Products', marketCap: '75' },
    { ticker: 'EL', name: 'Estee Lauder', sector: 'Consumer', industry: 'Cosmetics', marketCap: '45' },
    { ticker: 'MNST', name: 'Monster Beverage', sector: 'Consumer', industry: 'Beverages', marketCap: '55' },
    { ticker: 'KDP', name: 'Keurig Dr Pepper', sector: 'Consumer', industry: 'Beverages', marketCap: '45' },
    { ticker: 'STZ', name: 'Constellation Brands', sector: 'Consumer', industry: 'Beverages', marketCap: '45' },
    { ticker: 'HSY', name: 'Hershey Company', sector: 'Consumer', industry: 'Confectionery', marketCap: '45' },
    { ticker: 'GIS', name: 'General Mills', sector: 'Consumer', industry: 'Packaged Foods', marketCap: '42' },
    { ticker: 'SYY', name: 'Sysco Corporation', sector: 'Consumer', industry: 'Food Distribution', marketCap: '42' },
    { ticker: 'TJX', name: 'TJX Companies', sector: 'Consumer', industry: 'Discount Retail', marketCap: '120' },
    { ticker: 'ROST', name: 'Ross Stores', sector: 'Consumer', industry: 'Discount Retail', marketCap: '52' },
    { ticker: 'DG', name: 'Dollar General', sector: 'Consumer', industry: 'Discount Retail', marketCap: '35' },
    { ticker: 'DLTR', name: 'Dollar Tree', sector: 'Consumer', industry: 'Discount Retail', marketCap: '32' },
    { ticker: 'BBY', name: 'Best Buy', sector: 'Consumer', industry: 'Electronics Retail', marketCap: '18' },
    { ticker: 'ULTA', name: 'Ulta Beauty', sector: 'Consumer', industry: 'Beauty Retail', marketCap: '22' },
    { ticker: 'GPS', name: 'Gap Inc.', sector: 'Consumer', industry: 'Apparel Retail', marketCap: '10' },
    { ticker: 'ANF', name: 'Abercrombie & Fitch', sector: 'Consumer', industry: 'Apparel Retail', marketCap: '8' },
    { ticker: 'DECK', name: 'Deckers Outdoor', sector: 'Consumer', industry: 'Footwear', marketCap: '25' },
    { ticker: 'CROX', name: 'Crocs Inc.', sector: 'Consumer', industry: 'Footwear', marketCap: '8' },
    { ticker: 'SKX', name: 'Skechers U.S.A.', sector: 'Consumer', industry: 'Footwear', marketCap: '12' },
    { ticker: 'CHWY', name: 'Chewy Inc.', sector: 'Consumer', industry: 'E-Commerce', marketCap: '10' },
    { ticker: 'KMX', name: 'CarMax Inc.', sector: 'Consumer', industry: 'Used Cars', marketCap: '12' },
    // Additional 100 stocks
    { ticker: 'EBAY', name: 'eBay Inc.', sector: 'Consumer', industry: 'E-Commerce', marketCap: '28' },
    { ticker: 'ETSY', name: 'Etsy Inc.', sector: 'Consumer', industry: 'E-Commerce', marketCap: '12' },
    { ticker: 'W', name: 'Wayfair Inc.', sector: 'Consumer', industry: 'E-Commerce', marketCap: '8' },
    { ticker: 'PINS', name: 'Pinterest Inc.', sector: 'Technology', industry: 'Social Media', marketCap: '22' },
    { ticker: 'SNAP', name: 'Snap Inc.', sector: 'Technology', industry: 'Social Media', marketCap: '18' },
    { ticker: 'ROKU', name: 'Roku Inc.', sector: 'Media', industry: 'Streaming Devices', marketCap: '12' },
    { ticker: 'PARA', name: 'Paramount Global', sector: 'Media', industry: 'Entertainment', marketCap: '8' },
    { ticker: 'WBD', name: 'Warner Bros Discovery', sector: 'Media', industry: 'Entertainment', marketCap: '25' },
    { ticker: 'FOX', name: 'Fox Corporation', sector: 'Media', industry: 'Broadcasting', marketCap: '18' },
    { ticker: 'CMCSA', name: 'Comcast Corporation', sector: 'Media', industry: 'Cable', marketCap: '165' },
    { ticker: 'CHTR', name: 'Charter Communications', sector: 'Media', industry: 'Cable', marketCap: '55' },
    { ticker: 'NWSA', name: 'News Corp', sector: 'Media', industry: 'Publishing', marketCap: '15' },
    { ticker: 'NYT', name: 'New York Times', sector: 'Media', industry: 'Publishing', marketCap: '8' },
    { ticker: 'MTCH', name: 'Match Group', sector: 'Technology', industry: 'Dating Apps', marketCap: '10' },
    { ticker: 'LYFT', name: 'Lyft Inc.', sector: 'Technology', industry: 'Ride-sharing', marketCap: '5' },
    { ticker: 'DASH', name: 'DoorDash Inc.', sector: 'Technology', industry: 'Food Delivery', marketCap: '55' },
    { ticker: 'GRAB', name: 'Grab Holdings', sector: 'Technology', industry: 'Super App', marketCap: '15' },
    { ticker: 'SE', name: 'Sea Limited', sector: 'Technology', industry: 'Gaming/E-Commerce', marketCap: '35' },
    { ticker: 'BABA', name: 'Alibaba Group', sector: 'Technology', industry: 'E-Commerce', marketCap: '195' },
    { ticker: 'JD', name: 'JD.com Inc.', sector: 'Technology', industry: 'E-Commerce', marketCap: '45' },
    { ticker: 'PDD', name: 'PDD Holdings', sector: 'Technology', industry: 'E-Commerce', marketCap: '140' },
    { ticker: 'BIDU', name: 'Baidu Inc.', sector: 'Technology', industry: 'Internet Services', marketCap: '35' },
    { ticker: 'NIO', name: 'NIO Inc.', sector: 'Automotive', industry: 'Electric Vehicles', marketCap: '12' },
    { ticker: 'XPEV', name: 'XPeng Inc.', sector: 'Automotive', industry: 'Electric Vehicles', marketCap: '8' },
    { ticker: 'LI', name: 'Li Auto Inc.', sector: 'Automotive', industry: 'Electric Vehicles', marketCap: '22' },
    { ticker: 'TSM', name: 'Taiwan Semiconductor', sector: 'Technology', industry: 'Semiconductors', marketCap: '550' },
    { ticker: 'ASML', name: 'ASML Holding', sector: 'Technology', industry: 'Semiconductor Equipment', marketCap: '280' },
    { ticker: 'SAP', name: 'SAP SE', sector: 'Technology', industry: 'Enterprise Software', marketCap: '220' },
    { ticker: 'TM', name: 'Toyota Motor', sector: 'Automotive', industry: 'Automobiles', marketCap: '250' },
    { ticker: 'HMC', name: 'Honda Motor', sector: 'Automotive', industry: 'Automobiles', marketCap: '55' },
    { ticker: 'SONY', name: 'Sony Group', sector: 'Technology', industry: 'Electronics', marketCap: '115' },
    { ticker: 'SNE', name: 'Sony Entertainment', sector: 'Media', industry: 'Entertainment', marketCap: '115' },
    { ticker: 'NVS', name: 'Novartis AG', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCap: '210' },
    { ticker: 'AZN', name: 'AstraZeneca', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCap: '220' },
    { ticker: 'SNY', name: 'Sanofi SA', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCap: '130' },
    { ticker: 'GSK', name: 'GSK plc', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCap: '75' },
    { ticker: 'NVO', name: 'Novo Nordisk', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCap: '450' },
    { ticker: 'SHEL', name: 'Shell plc', sector: 'Energy', industry: 'Oil & Gas', marketCap: '210' },
    { ticker: 'BP', name: 'BP plc', sector: 'Energy', industry: 'Oil & Gas', marketCap: '95' },
    { ticker: 'TTE', name: 'TotalEnergies', sector: 'Energy', industry: 'Oil & Gas', marketCap: '155' },
    { ticker: 'EQNR', name: 'Equinor ASA', sector: 'Energy', industry: 'Oil & Gas', marketCap: '75' },
    { ticker: 'RIO', name: 'Rio Tinto', sector: 'Materials', industry: 'Mining', marketCap: '105' },
    { ticker: 'BHP', name: 'BHP Group', sector: 'Materials', industry: 'Mining', marketCap: '145' },
    { ticker: 'VALE', name: 'Vale SA', sector: 'Materials', industry: 'Mining', marketCap: '55' },
    { ticker: 'SCCO', name: 'Southern Copper', sector: 'Materials', industry: 'Copper Mining', marketCap: '75' },
    { ticker: 'AA', name: 'Alcoa Corporation', sector: 'Materials', industry: 'Aluminum', marketCap: '12' },
    { ticker: 'CLF', name: 'Cleveland-Cliffs', sector: 'Materials', industry: 'Steel', marketCap: '8' },
    { ticker: 'NUE', name: 'Nucor Corporation', sector: 'Materials', industry: 'Steel', marketCap: '42' },
    { ticker: 'X', name: 'United States Steel', sector: 'Materials', industry: 'Steel', marketCap: '8' },
    { ticker: 'STLD', name: 'Steel Dynamics', sector: 'Materials', industry: 'Steel', marketCap: '22' },
    { ticker: 'CF', name: 'CF Industries', sector: 'Materials', industry: 'Fertilizers', marketCap: '18' },
    { ticker: 'MOS', name: 'Mosaic Company', sector: 'Materials', industry: 'Fertilizers', marketCap: '12' },
    { ticker: 'IFF', name: 'IFF Inc.', sector: 'Materials', industry: 'Specialty Chemicals', marketCap: '25' },
    { ticker: 'PPG', name: 'PPG Industries', sector: 'Materials', industry: 'Paints & Coatings', marketCap: '35' },
    { ticker: 'ECL', name: 'Ecolab Inc.', sector: 'Materials', industry: 'Specialty Chemicals', marketCap: '55' },
    { ticker: 'ALB', name: 'Albemarle Corporation', sector: 'Materials', industry: 'Lithium', marketCap: '18' },
    { ticker: 'LTHM', name: 'Livent Corporation', sector: 'Materials', industry: 'Lithium', marketCap: '4' },
    { ticker: 'MP', name: 'MP Materials', sector: 'Materials', industry: 'Rare Earth', marketCap: '3' },
    { ticker: 'LAC', name: 'Lithium Americas', sector: 'Materials', industry: 'Lithium', marketCap: '2' },
    { ticker: 'PLUG', name: 'Plug Power', sector: 'Utilities', industry: 'Hydrogen', marketCap: '3' },
    { ticker: 'FSLR', name: 'First Solar', sector: 'Technology', industry: 'Solar', marketCap: '22' },
    { ticker: 'ENPH', name: 'Enphase Energy', sector: 'Technology', industry: 'Solar', marketCap: '15' },
    { ticker: 'SEDG', name: 'SolarEdge Technologies', sector: 'Technology', industry: 'Solar', marketCap: '5' },
    { ticker: 'RUN', name: 'Sunrun Inc.', sector: 'Utilities', industry: 'Solar', marketCap: '4' },
    { ticker: 'BE', name: 'Bloom Energy', sector: 'Utilities', industry: 'Fuel Cells', marketCap: '3' },
    { ticker: 'CHPT', name: 'ChargePoint Holdings', sector: 'Utilities', industry: 'EV Charging', marketCap: '2' },
    { ticker: 'BLNK', name: 'Blink Charging', sector: 'Utilities', industry: 'EV Charging', marketCap: '1' },
    { ticker: 'LCID', name: 'Lucid Group', sector: 'Automotive', industry: 'Electric Vehicles', marketCap: '8' },
    { ticker: 'FSR', name: 'Fisker Inc.', sector: 'Automotive', industry: 'Electric Vehicles', marketCap: '1' },
    { ticker: 'ARVL', name: 'Arrival SA', sector: 'Automotive', industry: 'Electric Vehicles', marketCap: '1' },
    { ticker: 'GOEV', name: 'Canoo Inc.', sector: 'Automotive', industry: 'Electric Vehicles', marketCap: '1' },
    { ticker: 'OPEN', name: 'Opendoor Technologies', sector: 'Real Estate', industry: 'PropTech', marketCap: '3' },
    { ticker: 'RDFN', name: 'Redfin Corporation', sector: 'Real Estate', industry: 'PropTech', marketCap: '2' },
    { ticker: 'Z', name: 'Zillow Group', sector: 'Real Estate', industry: 'PropTech', marketCap: '15' },
    { ticker: 'CSGP', name: 'CoStar Group', sector: 'Real Estate', industry: 'Data Services', marketCap: '35' },
    { ticker: 'RKT', name: 'Rocket Companies', sector: 'Finance', industry: 'Mortgage', marketCap: '22' },
    { ticker: 'UWMC', name: 'UWM Holdings', sector: 'Finance', industry: 'Mortgage', marketCap: '8' },
    { ticker: 'SOFI', name: 'SoFi Technologies', sector: 'Finance', industry: 'Fintech', marketCap: '12' },
    { ticker: 'UPST', name: 'Upstart Holdings', sector: 'Finance', industry: 'Fintech', marketCap: '5' },
    { ticker: 'AFRM', name: 'Affirm Holdings', sector: 'Finance', industry: 'Fintech', marketCap: '15' },
    { ticker: 'HOOD', name: 'Robinhood Markets', sector: 'Finance', industry: 'Brokerage', marketCap: '18' },
    { ticker: 'BILL', name: 'Bill Holdings', sector: 'Technology', industry: 'Fintech', marketCap: '15' },
    { ticker: 'TOST', name: 'Toast Inc.', sector: 'Technology', industry: 'Restaurant Tech', marketCap: '15' },
    { ticker: 'PATH', name: 'UiPath Inc.', sector: 'Technology', industry: 'Automation', marketCap: '8' },
    { ticker: 'AI', name: 'C3.ai Inc.', sector: 'Technology', industry: 'AI Software', marketCap: '4' },
    { ticker: 'PLTR', name: 'Palantir', sector: 'Technology', industry: 'AI Analytics', marketCap: '45' },
    { ticker: 'BBAI', name: 'BigBear.ai', sector: 'Technology', industry: 'AI Analytics', marketCap: '1' },
    { ticker: 'SOUN', name: 'SoundHound AI', sector: 'Technology', industry: 'Voice AI', marketCap: '2' },
    { ticker: 'IREN', name: 'Iris Energy', sector: 'Technology', industry: 'Bitcoin Mining', marketCap: '3' },
    { ticker: 'MARA', name: 'Marathon Digital', sector: 'Technology', industry: 'Bitcoin Mining', marketCap: '5' },
    { ticker: 'RIOT', name: 'Riot Platforms', sector: 'Technology', industry: 'Bitcoin Mining', marketCap: '3' },
    { ticker: 'CLSK', name: 'CleanSpark Inc.', sector: 'Technology', industry: 'Bitcoin Mining', marketCap: '3' },
    { ticker: 'HIVE', name: 'Hive Digital', sector: 'Technology', industry: 'Bitcoin Mining', marketCap: '1' },
    { ticker: 'GME', name: 'GameStop Corp.', sector: 'Consumer', industry: 'Gaming Retail', marketCap: '12' },
    { ticker: 'AMC', name: 'AMC Entertainment', sector: 'Media', industry: 'Movie Theaters', marketCap: '5' },
    { ticker: 'BBBY', name: 'Bed Bath & Beyond', sector: 'Consumer', industry: 'Home Goods', marketCap: '1' },
    // Additional 100 more stocks
    { ticker: 'SPLK', name: 'Splunk Inc.', sector: 'Technology', industry: 'Data Analytics', marketCap: '25' },
    { ticker: 'VEEV', name: 'Veeva Systems', sector: 'Technology', industry: 'Healthcare Software', marketCap: '32' },
    { ticker: 'ANSS', name: 'ANSYS Inc.', sector: 'Technology', industry: 'Simulation Software', marketCap: '28' },
    { ticker: 'CPRT', name: 'Copart Inc.', sector: 'Industrials', industry: 'Auto Auctions', marketCap: '45' },
    { ticker: 'ODFL', name: 'Old Dominion Freight', sector: 'Industrials', industry: 'Trucking', marketCap: '42' },
    { ticker: 'FAST', name: 'Fastenal Company', sector: 'Industrials', industry: 'Industrial Distribution', marketCap: '35' },
    { ticker: 'PAYX', name: 'Paychex Inc.', sector: 'Technology', industry: 'HR Software', marketCap: '45' },
    { ticker: 'CTAS', name: 'Cintas Corporation', sector: 'Industrials', industry: 'Business Services', marketCap: '65' },
    { ticker: 'VRSK', name: 'Verisk Analytics', sector: 'Technology', industry: 'Data Analytics', marketCap: '35' },
    { ticker: 'IDXX', name: 'IDEXX Laboratories', sector: 'Healthcare', industry: 'Veterinary Diagnostics', marketCap: '42' },
    { ticker: 'MCHP', name: 'Microchip Technology', sector: 'Technology', industry: 'Semiconductors', marketCap: '45' },
    { ticker: 'SWKS', name: 'Skyworks Solutions', sector: 'Technology', industry: 'Semiconductors', marketCap: '22' },
    { ticker: 'QRVO', name: 'Qorvo Inc.', sector: 'Technology', industry: 'Semiconductors', marketCap: '12' },
    { ticker: 'XLNX', name: 'Xilinx Inc.', sector: 'Technology', industry: 'Semiconductors', marketCap: '50' },
    { ticker: 'WDC', name: 'Western Digital', sector: 'Technology', industry: 'Data Storage', marketCap: '18' },
    { ticker: 'STX', name: 'Seagate Technology', sector: 'Technology', industry: 'Data Storage', marketCap: '22' },
    { ticker: 'KEYS', name: 'Keysight Technologies', sector: 'Technology', industry: 'Test Equipment', marketCap: '28' },
    { ticker: 'ZBRA', name: 'Zebra Technologies', sector: 'Technology', industry: 'Enterprise Solutions', marketCap: '18' },
    { ticker: 'CDW', name: 'CDW Corporation', sector: 'Technology', industry: 'IT Distribution', marketCap: '28' },
    { ticker: 'EPAM', name: 'EPAM Systems', sector: 'Technology', industry: 'IT Services', marketCap: '15' },
    { ticker: 'CTSH', name: 'Cognizant Technology', sector: 'Technology', industry: 'IT Services', marketCap: '35' },
    { ticker: 'AKAM', name: 'Akamai Technologies', sector: 'Technology', industry: 'CDN Services', marketCap: '15' },
    { ticker: 'FFIV', name: 'F5 Networks', sector: 'Technology', industry: 'Networking', marketCap: '10' },
    { ticker: 'JNPR', name: 'Juniper Networks', sector: 'Technology', industry: 'Networking', marketCap: '12' },
    { ticker: 'HPE', name: 'Hewlett Packard Enterprise', sector: 'Technology', industry: 'Enterprise IT', marketCap: '22' },
    { ticker: 'NTRS', name: 'Northern Trust', sector: 'Finance', industry: 'Asset Management', marketCap: '18' },
    { ticker: 'STT', name: 'State Street Corp', sector: 'Finance', industry: 'Asset Management', marketCap: '25' },
    { ticker: 'BK', name: 'Bank of New York Mellon', sector: 'Finance', industry: 'Custody Bank', marketCap: '45' },
    { ticker: 'TROW', name: 'T. Rowe Price', sector: 'Finance', industry: 'Asset Management', marketCap: '25' },
    { ticker: 'IVZ', name: 'Invesco Ltd.', sector: 'Finance', industry: 'Asset Management', marketCap: '8' },
    { ticker: 'BEN', name: 'Franklin Resources', sector: 'Finance', industry: 'Asset Management', marketCap: '12' },
    { ticker: 'FITB', name: 'Fifth Third Bancorp', sector: 'Finance', industry: 'Regional Banking', marketCap: '25' },
    { ticker: 'RF', name: 'Regions Financial', sector: 'Finance', industry: 'Regional Banking', marketCap: '18' },
    { ticker: 'CFG', name: 'Citizens Financial', sector: 'Finance', industry: 'Regional Banking', marketCap: '18' },
    { ticker: 'KEY', name: 'KeyCorp', sector: 'Finance', industry: 'Regional Banking', marketCap: '15' },
    { ticker: 'MTB', name: 'M&T Bank Corp', sector: 'Finance', industry: 'Regional Banking', marketCap: '28' },
    { ticker: 'HBAN', name: 'Huntington Bancshares', sector: 'Finance', industry: 'Regional Banking', marketCap: '22' },
    { ticker: 'ZION', name: 'Zions Bancorp', sector: 'Finance', industry: 'Regional Banking', marketCap: '8' },
    { ticker: 'CMA', name: 'Comerica Inc.', sector: 'Finance', industry: 'Regional Banking', marketCap: '8' },
    { ticker: 'SIVB', name: 'SVB Financial', sector: 'Finance', industry: 'Banking', marketCap: '1' },
    { ticker: 'SBNY', name: 'Signature Bank', sector: 'Finance', industry: 'Banking', marketCap: '1' },
    { ticker: 'FRC', name: 'First Republic Bank', sector: 'Finance', industry: 'Banking', marketCap: '1' },
    { ticker: 'WAL', name: 'Western Alliance', sector: 'Finance', industry: 'Regional Banking', marketCap: '8' },
    { ticker: 'PACW', name: 'PacWest Bancorp', sector: 'Finance', industry: 'Regional Banking', marketCap: '2' },
    { ticker: 'AIG', name: 'American International', sector: 'Finance', industry: 'Insurance', marketCap: '45' },
    { ticker: 'MET', name: 'MetLife Inc.', sector: 'Finance', industry: 'Insurance', marketCap: '52' },
    { ticker: 'PRU', name: 'Prudential Financial', sector: 'Finance', industry: 'Insurance', marketCap: '42' },
    { ticker: 'AFL', name: 'Aflac Inc.', sector: 'Finance', industry: 'Insurance', marketCap: '52' },
    { ticker: 'PGR', name: 'Progressive Corp.', sector: 'Finance', industry: 'Insurance', marketCap: '115' },
    { ticker: 'TRV', name: 'Travelers Companies', sector: 'Finance', industry: 'Insurance', marketCap: '52' },
    { ticker: 'ALL', name: 'Allstate Corp.', sector: 'Finance', industry: 'Insurance', marketCap: '42' },
    { ticker: 'CB', name: 'Chubb Limited', sector: 'Finance', industry: 'Insurance', marketCap: '95' },
    { ticker: 'HIG', name: 'Hartford Financial', sector: 'Finance', industry: 'Insurance', marketCap: '28' },
    { ticker: 'L', name: 'Loews Corporation', sector: 'Finance', industry: 'Insurance', marketCap: '18' },
    { ticker: 'CINF', name: 'Cincinnati Financial', sector: 'Finance', industry: 'Insurance', marketCap: '18' },
    { ticker: 'ELV', name: 'Elevance Health', sector: 'Healthcare', industry: 'Health Insurance', marketCap: '110' },
    { ticker: 'HUM', name: 'Humana Inc.', sector: 'Healthcare', industry: 'Health Insurance', marketCap: '55' },
    { ticker: 'CNC', name: 'Centene Corp.', sector: 'Healthcare', industry: 'Health Insurance', marketCap: '42' },
    { ticker: 'MOH', name: 'Molina Healthcare', sector: 'Healthcare', industry: 'Health Insurance', marketCap: '22' },
    { ticker: 'HCA', name: 'HCA Healthcare', sector: 'Healthcare', industry: 'Hospitals', marketCap: '75' },
    { ticker: 'UHS', name: 'Universal Health', sector: 'Healthcare', industry: 'Hospitals', marketCap: '12' },
    { ticker: 'THC', name: 'Tenet Healthcare', sector: 'Healthcare', industry: 'Hospitals', marketCap: '12' },
    { ticker: 'DVA', name: 'DaVita Inc.', sector: 'Healthcare', industry: 'Dialysis', marketCap: '12' },
    { ticker: 'EW', name: 'Edwards Lifesciences', sector: 'Healthcare', industry: 'Medical Devices', marketCap: '45' },
    { ticker: 'ZBH', name: 'Zimmer Biomet', sector: 'Healthcare', industry: 'Medical Devices', marketCap: '28' },
    { ticker: 'HOLX', name: 'Hologic Inc.', sector: 'Healthcare', industry: 'Medical Devices', marketCap: '18' },
    { ticker: 'BAX', name: 'Baxter International', sector: 'Healthcare', industry: 'Medical Devices', marketCap: '22' },
    { ticker: 'BDX', name: 'Becton Dickinson', sector: 'Healthcare', industry: 'Medical Devices', marketCap: '65' },
    { ticker: 'MTD', name: 'Mettler-Toledo', sector: 'Healthcare', industry: 'Lab Equipment', marketCap: '28' },
    { ticker: 'A', name: 'Agilent Technologies', sector: 'Healthcare', industry: 'Lab Equipment', marketCap: '42' },
    { ticker: 'WAT', name: 'Waters Corporation', sector: 'Healthcare', industry: 'Lab Equipment', marketCap: '18' },
    { ticker: 'PKI', name: 'PerkinElmer Inc.', sector: 'Healthcare', industry: 'Lab Equipment', marketCap: '15' },
    { ticker: 'IQV', name: 'IQVIA Holdings', sector: 'Healthcare', industry: 'Life Sciences', marketCap: '42' },
    { ticker: 'CRL', name: 'Charles River Labs', sector: 'Healthcare', industry: 'Life Sciences', marketCap: '12' },
    { ticker: 'TECH', name: 'Bio-Techne Corp.', sector: 'Healthcare', industry: 'Life Sciences', marketCap: '12' },
    { ticker: 'ILMN', name: 'Illumina Inc.', sector: 'Healthcare', industry: 'Genomics', marketCap: '22' },
    { ticker: 'EXAS', name: 'Exact Sciences', sector: 'Healthcare', industry: 'Diagnostics', marketCap: '12' },
    { ticker: 'DGX', name: 'Quest Diagnostics', sector: 'Healthcare', industry: 'Diagnostics', marketCap: '15' },
    { ticker: 'LH', name: 'Labcorp Holdings', sector: 'Healthcare', industry: 'Diagnostics', marketCap: '18' },
    { ticker: 'ALGN', name: 'Align Technology', sector: 'Healthcare', industry: 'Dental', marketCap: '22' },
    { ticker: 'XRAY', name: 'Dentsply Sirona', sector: 'Healthcare', industry: 'Dental', marketCap: '5' },
    { ticker: 'HSIC', name: 'Henry Schein', sector: 'Healthcare', industry: 'Medical Distribution', marketCap: '10' },
    { ticker: 'MCK', name: 'McKesson Corp.', sector: 'Healthcare', industry: 'Medical Distribution', marketCap: '72' },
    { ticker: 'CAH', name: 'Cardinal Health', sector: 'Healthcare', industry: 'Medical Distribution', marketCap: '28' },
    { ticker: 'ABC', name: 'AmerisourceBergen', sector: 'Healthcare', industry: 'Medical Distribution', marketCap: '42' },
    { ticker: 'WBA', name: 'Walgreens Boots', sector: 'Healthcare', industry: 'Pharmacy Retail', marketCap: '12' },
    { ticker: 'BIIB', name: 'Biogen Inc.', sector: 'Healthcare', industry: 'Biotechnology', marketCap: '32' },
    { ticker: 'ALNY', name: 'Alnylam Pharma', sector: 'Healthcare', industry: 'Biotechnology', marketCap: '28' },
    { ticker: 'SGEN', name: 'Seagen Inc.', sector: 'Healthcare', industry: 'Biotechnology', marketCap: '35' },
    { ticker: 'INCY', name: 'Incyte Corp.', sector: 'Healthcare', industry: 'Biotechnology', marketCap: '15' },
    { ticker: 'BMRN', name: 'BioMarin Pharma', sector: 'Healthcare', industry: 'Biotechnology', marketCap: '18' },
    { ticker: 'SRRK', name: 'Scholar Rock', sector: 'Healthcare', industry: 'Biotechnology', marketCap: '2' },
    { ticker: 'CRSP', name: 'CRISPR Therapeutics', sector: 'Healthcare', industry: 'Gene Editing', marketCap: '5' },
    { ticker: 'EDIT', name: 'Editas Medicine', sector: 'Healthcare', industry: 'Gene Editing', marketCap: '1' },
    { ticker: 'NTLA', name: 'Intellia Therapeutics', sector: 'Healthcare', industry: 'Gene Editing', marketCap: '3' },
    { ticker: 'BEAM', name: 'Beam Therapeutics', sector: 'Healthcare', industry: 'Gene Editing', marketCap: '2' },
    { ticker: 'VCYT', name: 'Veracyte Inc.', sector: 'Healthcare', industry: 'Diagnostics', marketCap: '2' },
    // Additional 100 stocks
    { ticker: 'SMCI', name: 'Super Micro Computer', sector: 'Technology', industry: 'Servers', marketCap: '35' },
    { ticker: 'ARM', name: 'Arm Holdings', sector: 'Technology', industry: 'Semiconductors', marketCap: '145' },
    { ticker: 'CRWD', name: 'CrowdStrike Holdings', sector: 'Technology', industry: 'Cybersecurity', marketCap: '85' },
    { ticker: 'MELI', name: 'MercadoLibre Inc.', sector: 'Consumer', industry: 'E-Commerce', marketCap: '85' },
    { ticker: 'PANW', name: 'Palo Alto Networks', sector: 'Technology', industry: 'Cybersecurity', marketCap: '115' },
    { ticker: 'LRCX', name: 'Lam Research', sector: 'Technology', industry: 'Semiconductor Equipment', marketCap: '105' },
    { ticker: 'KLAC', name: 'KLA Corporation', sector: 'Technology', industry: 'Semiconductor Equipment', marketCap: '95' },
    { ticker: 'SNPS', name: 'Synopsys Inc.', sector: 'Technology', industry: 'EDA Software', marketCap: '82' },
    { ticker: 'CDNS', name: 'Cadence Design', sector: 'Technology', industry: 'EDA Software', marketCap: '78' },
    { ticker: 'ADSK', name: 'Autodesk Inc.', sector: 'Technology', industry: 'Design Software', marketCap: '58' },
    { ticker: 'WDAY', name: 'Workday Inc.', sector: 'Technology', industry: 'HR Software', marketCap: '65' },
    { ticker: 'ZS', name: 'Zscaler Inc.', sector: 'Technology', industry: 'Cybersecurity', marketCap: '32' },
    { ticker: 'DDOG', name: 'Datadog Inc.', sector: 'Technology', industry: 'Observability', marketCap: '42' },
    { ticker: 'SNOW', name: 'Snowflake Inc.', sector: 'Technology', industry: 'Cloud Data', marketCap: '55' },
    { ticker: 'NET', name: 'Cloudflare Inc.', sector: 'Technology', industry: 'CDN', marketCap: '35' },
    { ticker: 'TEAM', name: 'Atlassian Corp.', sector: 'Technology', industry: 'Collaboration', marketCap: '48' },
    { ticker: 'HUBS', name: 'HubSpot Inc.', sector: 'Technology', industry: 'Marketing Software', marketCap: '32' },
    { ticker: 'MDB', name: 'MongoDB Inc.', sector: 'Technology', industry: 'Database', marketCap: '28' },
    { ticker: 'OKTA', name: 'Okta Inc.', sector: 'Technology', industry: 'Identity', marketCap: '18' },
    { ticker: 'TTD', name: 'The Trade Desk', sector: 'Technology', industry: 'AdTech', marketCap: '52' },
    { ticker: 'VEEV', name: 'Veeva Systems', sector: 'Healthcare', industry: 'Life Sciences Software', marketCap: '35' },
    { ticker: 'SPLK', name: 'Splunk Inc.', sector: 'Technology', industry: 'Data Analytics', marketCap: '28' },
    { ticker: 'ANSS', name: 'ANSYS Inc.', sector: 'Technology', industry: 'Simulation', marketCap: '32' },
    { ticker: 'CPRT', name: 'Copart Inc.', sector: 'Industrials', industry: 'Auto Auctions', marketCap: '52' },
    { ticker: 'ODFL', name: 'Old Dominion Freight', sector: 'Industrials', industry: 'Trucking', marketCap: '45' },
    { ticker: 'FAST', name: 'Fastenal Company', sector: 'Industrials', industry: 'Industrial Distribution', marketCap: '42' },
    { ticker: 'PAYX', name: 'Paychex Inc.', sector: 'Technology', industry: 'Payroll', marketCap: '48' },
    { ticker: 'CTAS', name: 'Cintas Corporation', sector: 'Industrials', industry: 'Business Services', marketCap: '72' },
    { ticker: 'VRSK', name: 'Verisk Analytics', sector: 'Technology', industry: 'Data Analytics', marketCap: '38' },
    { ticker: 'IDXX', name: 'IDEXX Laboratories', sector: 'Healthcare', industry: 'Veterinary', marketCap: '45' },
    { ticker: 'MCHP', name: 'Microchip Technology', sector: 'Technology', industry: 'Semiconductors', marketCap: '48' },
    { ticker: 'ON', name: 'ON Semiconductor', sector: 'Technology', industry: 'Semiconductors', marketCap: '38' },
    { ticker: 'NXPI', name: 'NXP Semiconductors', sector: 'Technology', industry: 'Semiconductors', marketCap: '58' },
    { ticker: 'MRVL', name: 'Marvell Technology', sector: 'Technology', industry: 'Semiconductors', marketCap: '65' },
    { ticker: 'GFS', name: 'GlobalFoundries', sector: 'Technology', industry: 'Semiconductors', marketCap: '32' },
    { ticker: 'WOLF', name: 'Wolfspeed Inc.', sector: 'Technology', industry: 'Semiconductors', marketCap: '8' },
    { ticker: 'AEHR', name: 'Aehr Test Systems', sector: 'Technology', industry: 'Test Equipment', marketCap: '2' },
    { ticker: 'ACLS', name: 'Axcelis Technologies', sector: 'Technology', industry: 'Semiconductor Equipment', marketCap: '5' },
    { ticker: 'ONTO', name: 'Onto Innovation', sector: 'Technology', industry: 'Semiconductor Equipment', marketCap: '8' },
    { ticker: 'CRUS', name: 'Cirrus Logic', sector: 'Technology', industry: 'Audio Chips', marketCap: '6' },
    { ticker: 'SLAB', name: 'Silicon Laboratories', sector: 'Technology', industry: 'IoT Chips', marketCap: '5' },
    { ticker: 'LSCC', name: 'Lattice Semiconductor', sector: 'Technology', industry: 'FPGAs', marketCap: '8' },
    { ticker: 'RMBS', name: 'Rambus Inc.', sector: 'Technology', industry: 'Memory IP', marketCap: '8' },
    { ticker: 'FORM', name: 'FormFactor Inc.', sector: 'Technology', industry: 'Test Equipment', marketCap: '4' },
    { ticker: 'COHR', name: 'Coherent Corp.', sector: 'Technology', industry: 'Photonics', marketCap: '12' },
    { ticker: 'LITE', name: 'Lumentum Holdings', sector: 'Technology', industry: 'Optical', marketCap: '6' },
    { ticker: 'VIAV', name: 'Viavi Solutions', sector: 'Technology', industry: 'Network Test', marketCap: '3' },
    { ticker: 'CIEN', name: 'Ciena Corporation', sector: 'Technology', industry: 'Networking', marketCap: '8' },
    { ticker: 'INFN', name: 'Infinera Corp.', sector: 'Technology', industry: 'Optical', marketCap: '3' },
    { ticker: 'UI', name: 'Ubiquiti Inc.', sector: 'Technology', industry: 'Networking', marketCap: '12' },
    { ticker: 'CALX', name: 'Calix Inc.', sector: 'Technology', industry: 'Broadband', marketCap: '3' },
    { ticker: 'COMM', name: 'CommScope Holding', sector: 'Technology', industry: 'Infrastructure', marketCap: '2' },
    { ticker: 'AAON', name: 'AAON Inc.', sector: 'Industrials', industry: 'HVAC', marketCap: '8' },
    { ticker: 'WSC', name: 'WillScot Mobile Mini', sector: 'Industrials', industry: 'Modular Space', marketCap: '8' },
    { ticker: 'RRX', name: 'Regal Rexnord', sector: 'Industrials', industry: 'Motion Control', marketCap: '12' },
    { ticker: 'AIT', name: 'Applied Industrial', sector: 'Industrials', industry: 'Distribution', marketCap: '8' },
    { ticker: 'MSM', name: 'MSC Industrial', sector: 'Industrials', industry: 'Distribution', marketCap: '5' },
    { ticker: 'SITE', name: 'SiteOne Landscape', sector: 'Industrials', industry: 'Landscaping', marketCap: '8' },
    { ticker: 'POOL', name: 'Pool Corporation', sector: 'Consumer', industry: 'Pool Supplies', marketCap: '15' },
    { ticker: 'TECH', name: 'Bio-Techne Corp.', sector: 'Healthcare', industry: 'Life Sciences', marketCap: '12' },
    { ticker: 'PODD', name: 'Insulet Corporation', sector: 'Healthcare', industry: 'Medical Devices', marketCap: '18' },
    { ticker: 'DXCM', name: 'DexCom Inc.', sector: 'Healthcare', industry: 'Diabetes', marketCap: '35' },
    { ticker: 'ALGN', name: 'Align Technology', sector: 'Healthcare', industry: 'Dental', marketCap: '22' },
    { ticker: 'TFX', name: 'Teleflex Inc.', sector: 'Healthcare', industry: 'Medical Devices', marketCap: '10' },
    { ticker: 'HSIC', name: 'Henry Schein', sector: 'Healthcare', industry: 'Medical Distribution', marketCap: '10' },
    { ticker: 'VTRS', name: 'Viatris Inc.', sector: 'Healthcare', industry: 'Generic Drugs', marketCap: '15' },
    { ticker: 'TEVA', name: 'Teva Pharmaceutical', sector: 'Healthcare', industry: 'Generic Drugs', marketCap: '22' },
    { ticker: 'JAZZ', name: 'Jazz Pharmaceuticals', sector: 'Healthcare', industry: 'Specialty Pharma', marketCap: '8' },
    { ticker: 'NBIX', name: 'Neurocrine Biosciences', sector: 'Healthcare', industry: 'Neurology', marketCap: '15' },
    { ticker: 'EXEL', name: 'Exelixis Inc.', sector: 'Healthcare', industry: 'Oncology', marketCap: '8' },
    { ticker: 'SRPT', name: 'Sarepta Therapeutics', sector: 'Healthcare', industry: 'Gene Therapy', marketCap: '15' },
    { ticker: 'UTHR', name: 'United Therapeutics', sector: 'Healthcare', industry: 'Pulmonary', marketCap: '12' },
    { ticker: 'RARE', name: 'Ultragenyx Pharma', sector: 'Healthcare', industry: 'Rare Disease', marketCap: '5' },
    { ticker: 'IONS', name: 'Ionis Pharmaceuticals', sector: 'Healthcare', industry: 'RNA Therapeutics', marketCap: '8' },
    { ticker: 'ALKS', name: 'Alkermes plc', sector: 'Healthcare', industry: 'CNS Disorders', marketCap: '5' },
    { ticker: 'EXAS', name: 'Exact Sciences', sector: 'Healthcare', industry: 'Cancer Screening', marketCap: '12' },
    { ticker: 'GH', name: 'Guardant Health', sector: 'Healthcare', industry: 'Liquid Biopsy', marketCap: '5' },
    { ticker: 'NTRA', name: 'Natera Inc.', sector: 'Healthcare', industry: 'Genetic Testing', marketCap: '15' },
    { ticker: 'TWST', name: 'Twist Bioscience', sector: 'Healthcare', industry: 'Synthetic Biology', marketCap: '3' },
    { ticker: 'CDNA', name: 'CareDx Inc.', sector: 'Healthcare', industry: 'Transplant Diagnostics', marketCap: '2' },
    { ticker: 'PACB', name: 'PacBio', sector: 'Healthcare', industry: 'Sequencing', marketCap: '2' },
    { ticker: 'TXG', name: '10x Genomics', sector: 'Healthcare', industry: 'Genomics', marketCap: '3' },
    { ticker: 'BIO', name: 'Bio-Rad Laboratories', sector: 'Healthcare', industry: 'Life Sciences', marketCap: '12' },
    { ticker: 'HOLX', name: 'Hologic Inc.', sector: 'Healthcare', industry: 'Medical Devices', marketCap: '18' },
    { ticker: 'NVCR', name: 'NovoCure Limited', sector: 'Healthcare', industry: 'Oncology Devices', marketCap: '3' },
    { ticker: 'HZNP', name: 'Horizon Therapeutics', sector: 'Healthcare', industry: 'Specialty Pharma', marketCap: '22' },
    { ticker: 'AXSM', name: 'Axsome Therapeutics', sector: 'Healthcare', industry: 'CNS', marketCap: '5' },
    { ticker: 'ARVN', name: 'Arvinas Inc.', sector: 'Healthcare', industry: 'Protein Degradation', marketCap: '3' },
    { ticker: 'KRYS', name: 'Krystal Biotech', sector: 'Healthcare', industry: 'Gene Therapy', marketCap: '5' },
    { ticker: 'RCKT', name: 'Rocket Pharma', sector: 'Healthcare', industry: 'Gene Therapy', marketCap: '2' },
    { ticker: 'IMVT', name: 'Immunovant Inc.', sector: 'Healthcare', industry: 'Autoimmune', marketCap: '5' },
    { ticker: 'KRTX', name: 'Karuna Therapeutics', sector: 'Healthcare', industry: 'Psychiatry', marketCap: '8' },
    { ticker: 'PCVX', name: 'Vaxcyte Inc.', sector: 'Healthcare', industry: 'Vaccines', marketCap: '8' },
    { ticker: 'RXRX', name: 'Recursion Pharma', sector: 'Healthcare', industry: 'AI Drug Discovery', marketCap: '3' },
    { ticker: 'DNA', name: 'Ginkgo Bioworks', sector: 'Healthcare', industry: 'Synthetic Biology', marketCap: '3' },
    { ticker: 'SDGR', name: 'Schrodinger Inc.', sector: 'Healthcare', industry: 'Drug Discovery', marketCap: '3' },
    { ticker: 'RXDX', name: 'Prometheus Biosciences', sector: 'Healthcare', industry: 'Precision Medicine', marketCap: '5' },
    // Additional 100 stocks for comprehensive coverage
    { ticker: 'GOOG', name: 'Alphabet Inc. Class C', sector: 'Technology', industry: 'Internet Services', marketCap: '1720' },
    { ticker: 'BRK.A', name: 'Berkshire Hathaway A', sector: 'Finance', industry: 'Conglomerate', marketCap: '750' },
    { ticker: 'AVTR', name: 'Avantor Inc.', sector: 'Healthcare', industry: 'Life Sciences', marketCap: '18' },
    { ticker: 'ARCC', name: 'Ares Capital', sector: 'Finance', industry: 'BDC', marketCap: '12' },
    { ticker: 'MAIN', name: 'Main Street Capital', sector: 'Finance', industry: 'BDC', marketCap: '5' },
    { ticker: 'O', name: 'Realty Income', sector: 'Real Estate', industry: 'REITs', marketCap: '45' },
    { ticker: 'STAG', name: 'STAG Industrial', sector: 'Real Estate', industry: 'Industrial REITs', marketCap: '8' },
    { ticker: 'VNQ', name: 'Vanguard Real Estate', sector: 'Real Estate', industry: 'ETF', marketCap: '35' },
    { ticker: 'STOR', name: 'Store Capital', sector: 'Real Estate', industry: 'REITs', marketCap: '8' },
    { ticker: 'NNN', name: 'National Retail Properties', sector: 'Real Estate', industry: 'REITs', marketCap: '8' },
    { ticker: 'WPC', name: 'W.P. Carey', sector: 'Real Estate', industry: 'REITs', marketCap: '12' },
    { ticker: 'EPR', name: 'EPR Properties', sector: 'Real Estate', industry: 'REITs', marketCap: '4' },
    { ticker: 'IRM', name: 'Iron Mountain', sector: 'Real Estate', industry: 'Storage REITs', marketCap: '22' },
    { ticker: 'PSA', name: 'Public Storage', sector: 'Real Estate', industry: 'Storage REITs', marketCap: '52' },
    { ticker: 'EXR', name: 'Extra Space Storage', sector: 'Real Estate', industry: 'Storage REITs', marketCap: '32' },
    { ticker: 'CUBE', name: 'CubeSmart', sector: 'Real Estate', industry: 'Storage REITs', marketCap: '10' },
    { ticker: 'LSI', name: 'Life Storage Inc.', sector: 'Real Estate', industry: 'Storage REITs', marketCap: '12' },
    { ticker: 'NSA', name: 'National Storage', sector: 'Real Estate', industry: 'Storage REITs', marketCap: '5' },
    { ticker: 'DRE', name: 'Duke Realty', sector: 'Real Estate', industry: 'Industrial REITs', marketCap: '28' },
    { ticker: 'FR', name: 'First Industrial', sector: 'Real Estate', industry: 'Industrial REITs', marketCap: '8' },
    { ticker: 'REXR', name: 'Rexford Industrial', sector: 'Real Estate', industry: 'Industrial REITs', marketCap: '12' },
    { ticker: 'TRNO', name: 'Terreno Realty', sector: 'Real Estate', industry: 'Industrial REITs', marketCap: '8' },
    { ticker: 'EGP', name: 'EastGroup Properties', sector: 'Real Estate', industry: 'Industrial REITs', marketCap: '8' },
    { ticker: 'VTR', name: 'Ventas Inc.', sector: 'Real Estate', industry: 'Healthcare REITs', marketCap: '18' },
    { ticker: 'WELL', name: 'Welltower Inc.', sector: 'Real Estate', industry: 'Healthcare REITs', marketCap: '42' },
    { ticker: 'PEAK', name: 'Healthpeak Properties', sector: 'Real Estate', industry: 'Healthcare REITs', marketCap: '15' },
    { ticker: 'OHI', name: 'Omega Healthcare', sector: 'Real Estate', industry: 'Healthcare REITs', marketCap: '8' },
    { ticker: 'SBRA', name: 'Sabra Health Care', sector: 'Real Estate', industry: 'Healthcare REITs', marketCap: '4' },
    { ticker: 'MPW', name: 'Medical Properties', sector: 'Real Estate', industry: 'Healthcare REITs', marketCap: '8' },
    { ticker: 'ARE', name: 'Alexandria Real Estate', sector: 'Real Estate', industry: 'Life Science REITs', marketCap: '25' },
    { ticker: 'COLD', name: 'Americold Realty', sector: 'Real Estate', industry: 'Specialized REITs', marketCap: '8' },
    { ticker: 'GLPI', name: 'Gaming Leisure Properties', sector: 'Real Estate', industry: 'Casino REITs', marketCap: '12' },
    { ticker: 'VICI', name: 'VICI Properties', sector: 'Real Estate', industry: 'Casino REITs', marketCap: '35' },
    { ticker: 'RHP', name: 'Ryman Hospitality', sector: 'Real Estate', industry: 'Hotel REITs', marketCap: '5' },
    { ticker: 'HST', name: 'Host Hotels', sector: 'Real Estate', industry: 'Hotel REITs', marketCap: '15' },
    { ticker: 'PK', name: 'Park Hotels', sector: 'Real Estate', industry: 'Hotel REITs', marketCap: '5' },
    { ticker: 'SHO', name: 'Sunstone Hotel', sector: 'Real Estate', industry: 'Hotel REITs', marketCap: '3' },
    { ticker: 'DLR', name: 'Digital Realty', sector: 'Real Estate', industry: 'Data Center REITs', marketCap: '38' },
    { ticker: 'QTS', name: 'QTS Realty', sector: 'Real Estate', industry: 'Data Center REITs', marketCap: '8' },
    { ticker: 'CONE', name: 'CyrusOne Inc.', sector: 'Real Estate', industry: 'Data Center REITs', marketCap: '12' },
    { ticker: 'SBAC', name: 'SBA Communications', sector: 'Real Estate', industry: 'Tower REITs', marketCap: '28' },
    { ticker: 'UNIT', name: 'Uniti Group', sector: 'Real Estate', industry: 'Fiber REITs', marketCap: '3' },
    { ticker: 'LUMN', name: 'Lumen Technologies', sector: 'Telecom', industry: 'Telecommunications', marketCap: '8' },
    { ticker: 'FTR', name: 'Frontier Communications', sector: 'Telecom', industry: 'Telecommunications', marketCap: '5' },
    { ticker: 'USM', name: 'US Cellular', sector: 'Telecom', industry: 'Wireless', marketCap: '3' },
    { ticker: 'SHEN', name: 'Shenandoah Telecom', sector: 'Telecom', industry: 'Telecommunications', marketCap: '2' },
    { ticker: 'IRDM', name: 'Iridium Communications', sector: 'Telecom', industry: 'Satellite', marketCap: '8' },
    { ticker: 'GSAT', name: 'Globalstar Inc.', sector: 'Telecom', industry: 'Satellite', marketCap: '3' },
    { ticker: 'VSAT', name: 'Viasat Inc.', sector: 'Telecom', industry: 'Satellite', marketCap: '5' },
    { ticker: 'GILT', name: 'Gilat Satellite', sector: 'Telecom', industry: 'Satellite', marketCap: '1' },
    { ticker: 'MAXR', name: 'Maxar Technologies', sector: 'Technology', industry: 'Space', marketCap: '5' },
    { ticker: 'SPCE', name: 'Virgin Galactic', sector: 'Industrials', industry: 'Space', marketCap: '3' },
    { ticker: 'RKLB', name: 'Rocket Lab USA', sector: 'Industrials', industry: 'Space', marketCap: '5' },
    { ticker: 'ASTR', name: 'Astra Space', sector: 'Industrials', industry: 'Space', marketCap: '1' },
    { ticker: 'PL', name: 'Planet Labs', sector: 'Technology', industry: 'Space Data', marketCap: '2' },
    { ticker: 'ASTS', name: 'AST SpaceMobile', sector: 'Telecom', industry: 'Satellite', marketCap: '3' },
    { ticker: 'RDW', name: 'Redwire Corp.', sector: 'Industrials', industry: 'Space', marketCap: '1' },
    { ticker: 'MNTS', name: 'Momentus Inc.', sector: 'Industrials', industry: 'Space', marketCap: '1' },
    { ticker: 'VORB', name: 'Virgin Orbit', sector: 'Industrials', industry: 'Space', marketCap: '1' },
    { ticker: 'KTOS', name: 'Kratos Defense', sector: 'Industrials', industry: 'Defense', marketCap: '5' },
    { ticker: 'LDOS', name: 'Leidos Holdings', sector: 'Industrials', industry: 'Defense', marketCap: '18' },
    { ticker: 'SAIC', name: 'Science Applications', sector: 'Industrials', industry: 'Defense', marketCap: '8' },
    { ticker: 'BAH', name: 'Booz Allen Hamilton', sector: 'Industrials', industry: 'Defense', marketCap: '18' },
    { ticker: 'CACI', name: 'CACI International', sector: 'Industrials', industry: 'Defense', marketCap: '10' },
    { ticker: 'MANT', name: 'ManTech International', sector: 'Industrials', industry: 'Defense', marketCap: '5' },
    { ticker: 'PSN', name: 'Parsons Corp.', sector: 'Industrials', industry: 'Defense', marketCap: '8' },
    { ticker: 'KBR', name: 'KBR Inc.', sector: 'Industrials', industry: 'Defense Services', marketCap: '8' },
    { ticker: 'FLIR', name: 'Teledyne FLIR', sector: 'Technology', industry: 'Sensors', marketCap: '18' },
    { ticker: 'TDY', name: 'Teledyne Technologies', sector: 'Technology', industry: 'Sensors', marketCap: '22' },
    { ticker: 'HII', name: 'Huntington Ingalls', sector: 'Industrials', industry: 'Defense', marketCap: '12' },
    { ticker: 'GD', name: 'General Dynamics', sector: 'Industrials', industry: 'Defense', marketCap: '72' },
    { ticker: 'NOC', name: 'Northrop Grumman', sector: 'Industrials', industry: 'Defense', marketCap: '72' },
    { ticker: 'TXT', name: 'Textron Inc.', sector: 'Industrials', industry: 'Aerospace', marketCap: '18' },
    { ticker: 'TDG', name: 'TransDigm Group', sector: 'Industrials', industry: 'Aerospace', marketCap: '48' },
    { ticker: 'HWM', name: 'Howmet Aerospace', sector: 'Industrials', industry: 'Aerospace', marketCap: '25' },
    { ticker: 'SPR', name: 'Spirit AeroSystems', sector: 'Industrials', industry: 'Aerospace', marketCap: '5' },
    { ticker: 'HEI', name: 'HEICO Corp.', sector: 'Industrials', industry: 'Aerospace', marketCap: '25' },
    { ticker: 'AJRD', name: 'Aerojet Rocketdyne', sector: 'Industrials', industry: 'Aerospace', marketCap: '8' },
    { ticker: 'AXON', name: 'Axon Enterprise', sector: 'Industrials', industry: 'Public Safety', marketCap: '22' },
    { ticker: 'TTC', name: 'Toro Company', sector: 'Industrials', industry: 'Machinery', marketCap: '12' },
    { ticker: 'GNRC', name: 'Generac Holdings', sector: 'Industrials', industry: 'Electrical Equipment', marketCap: '12' },
    { ticker: 'AME', name: 'AMETEK Inc.', sector: 'Industrials', industry: 'Electrical Equipment', marketCap: '38' },
    { ticker: 'ROK', name: 'Rockwell Automation', sector: 'Industrials', industry: 'Industrial Automation', marketCap: '35' },
    { ticker: 'FTV', name: 'Fortive Corp.', sector: 'Industrials', industry: 'Industrial Automation', marketCap: '28' },
    { ticker: 'PNR', name: 'Pentair plc', sector: 'Industrials', industry: 'Water Tech', marketCap: '12' },
    { ticker: 'XYL', name: 'Xylem Inc.', sector: 'Industrials', industry: 'Water Tech', marketCap: '18' },
    { ticker: 'IEX', name: 'IDEX Corporation', sector: 'Industrials', industry: 'Pumps', marketCap: '18' },
    { ticker: 'GGG', name: 'Graco Inc.', sector: 'Industrials', industry: 'Fluid Handling', marketCap: '15' },
    { ticker: 'DOV', name: 'Dover Corporation', sector: 'Industrials', industry: 'Diversified Industrial', marketCap: '22' },
    { ticker: 'ITW', name: 'Illinois Tool Works', sector: 'Industrials', industry: 'Diversified Industrial', marketCap: '75' },
    { ticker: 'SWK', name: 'Stanley Black & Decker', sector: 'Industrials', industry: 'Tools', marketCap: '15' },
    { ticker: 'CARR', name: 'Carrier Global', sector: 'Industrials', industry: 'HVAC', marketCap: '52' },
    { ticker: 'TT', name: 'Trane Technologies', sector: 'Industrials', industry: 'HVAC', marketCap: '52' },
    { ticker: 'JCI', name: 'Johnson Controls', sector: 'Industrials', industry: 'Building Tech', marketCap: '48' },
    { ticker: 'LII', name: 'Lennox International', sector: 'Industrials', industry: 'HVAC', marketCap: '15' },
    { ticker: 'OTIS', name: 'Otis Worldwide', sector: 'Industrials', industry: 'Elevators', marketCap: '38' },
    { ticker: 'KNX', name: 'Knight-Swift', sector: 'Industrials', industry: 'Trucking', marketCap: '10' },
    { ticker: 'JBHT', name: 'J.B. Hunt Transport', sector: 'Industrials', industry: 'Trucking', marketCap: '18' },
    { ticker: 'WERN', name: 'Werner Enterprises', sector: 'Industrials', industry: 'Trucking', marketCap: '3' },
    { ticker: 'XPO', name: 'XPO Logistics', sector: 'Industrials', industry: 'Logistics', marketCap: '12' },
    { ticker: 'CHRW', name: 'C.H. Robinson', sector: 'Industrials', industry: 'Logistics', marketCap: '12' },
    { ticker: 'EXPD', name: 'Expeditors International', sector: 'Industrials', industry: 'Logistics', marketCap: '18' },
    // Additional 100 stocks
    { ticker: 'MKTX', name: 'MarketAxess Holdings', sector: 'Finance', industry: 'Trading Platforms', marketCap: '10' },
    { ticker: 'CBOE', name: 'Cboe Global Markets', sector: 'Finance', industry: 'Exchanges', marketCap: '18' },
    { ticker: 'NDAQ', name: 'Nasdaq Inc.', sector: 'Finance', industry: 'Exchanges', marketCap: '35' },
    { ticker: 'MSCI', name: 'MSCI Inc.', sector: 'Finance', industry: 'Financial Data', marketCap: '42' },
    { ticker: 'MCO', name: 'Moodys Corporation', sector: 'Finance', industry: 'Credit Ratings', marketCap: '72' },
    { ticker: 'FDS', name: 'FactSet Research', sector: 'Finance', industry: 'Financial Data', marketCap: '18' },
    { ticker: 'MORN', name: 'Morningstar Inc.', sector: 'Finance', industry: 'Financial Data', marketCap: '12' },
    { ticker: 'NATI', name: 'National Instruments', sector: 'Technology', industry: 'Test Equipment', marketCap: '8' },
    { ticker: 'ANSS', name: 'ANSYS Inc.', sector: 'Technology', industry: 'Simulation', marketCap: '28' },
    { ticker: 'CTXS', name: 'Citrix Systems', sector: 'Technology', industry: 'Enterprise Software', marketCap: '15' },
    { ticker: 'VRSN', name: 'VeriSign Inc.', sector: 'Technology', industry: 'Internet Infrastructure', marketCap: '22' },
    { ticker: 'GEN', name: 'Gen Digital', sector: 'Technology', industry: 'Cybersecurity', marketCap: '18' },
    { ticker: 'NLOK', name: 'NortonLifeLock', sector: 'Technology', industry: 'Cybersecurity', marketCap: '15' },
    { ticker: 'WIX', name: 'Wix.com Ltd.', sector: 'Technology', industry: 'Website Builder', marketCap: '8' },
    { ticker: 'GDDY', name: 'GoDaddy Inc.', sector: 'Technology', industry: 'Web Services', marketCap: '18' },
    { ticker: 'FVRR', name: 'Fiverr International', sector: 'Technology', industry: 'Gig Economy', marketCap: '3' },
    { ticker: 'UPWK', name: 'Upwork Inc.', sector: 'Technology', industry: 'Gig Economy', marketCap: '2' },
    { ticker: 'ZI', name: 'ZoomInfo Technologies', sector: 'Technology', industry: 'Sales Intelligence', marketCap: '8' },
    { ticker: 'HUBS', name: 'HubSpot Inc.', sector: 'Technology', industry: 'Marketing Software', marketCap: '28' },
    { ticker: 'PCTY', name: 'Paylocity Holding', sector: 'Technology', industry: 'Payroll Software', marketCap: '12' },
    { ticker: 'PAYC', name: 'Paycom Software', sector: 'Technology', industry: 'Payroll Software', marketCap: '12' },
    { ticker: 'SMAR', name: 'Smartsheet Inc.', sector: 'Technology', industry: 'Collaboration', marketCap: '8' },
    { ticker: 'COUP', name: 'Coupa Software', sector: 'Technology', industry: 'Spend Management', marketCap: '8' },
    { ticker: 'APPF', name: 'AppFolio Inc.', sector: 'Technology', industry: 'Property Software', marketCap: '8' },
    { ticker: 'YEXT', name: 'Yext Inc.', sector: 'Technology', industry: 'Digital Presence', marketCap: '1' },
    { ticker: 'BOX', name: 'Box Inc.', sector: 'Technology', industry: 'Cloud Storage', marketCap: '5' },
    { ticker: 'DBX', name: 'Dropbox Inc.', sector: 'Technology', industry: 'Cloud Storage', marketCap: '10' },
    { ticker: 'ESTC', name: 'Elastic N.V.', sector: 'Technology', industry: 'Search Technology', marketCap: '8' },
    { ticker: 'CFLT', name: 'Confluent Inc.', sector: 'Technology', industry: 'Data Streaming', marketCap: '10' },
    { ticker: 'GTLB', name: 'GitLab Inc.', sector: 'Technology', industry: 'DevOps', marketCap: '8' },
    { ticker: 'S', name: 'SentinelOne Inc.', sector: 'Technology', industry: 'Cybersecurity', marketCap: '8' },
    { ticker: 'TENB', name: 'Tenable Holdings', sector: 'Technology', industry: 'Cybersecurity', marketCap: '5' },
    { ticker: 'RPD', name: 'Rapid7 Inc.', sector: 'Technology', industry: 'Cybersecurity', marketCap: '3' },
    { ticker: 'QLYS', name: 'Qualys Inc.', sector: 'Technology', industry: 'Cybersecurity', marketCap: '5' },
    { ticker: 'SAIL', name: 'SailPoint Technologies', sector: 'Technology', industry: 'Identity Security', marketCap: '5' },
    { ticker: 'CYBR', name: 'CyberArk Software', sector: 'Technology', industry: 'Identity Security', marketCap: '12' },
    { ticker: 'VRNS', name: 'Varonis Systems', sector: 'Technology', industry: 'Data Security', marketCap: '5' },
    { ticker: 'PING', name: 'Ping Identity', sector: 'Technology', industry: 'Identity Security', marketCap: '3' },
    { ticker: 'DT', name: 'Dynatrace Inc.', sector: 'Technology', industry: 'Observability', marketCap: '15' },
    { ticker: 'NEWR', name: 'New Relic Inc.', sector: 'Technology', industry: 'Observability', marketCap: '5' },
    { ticker: 'SUMO', name: 'Sumo Logic', sector: 'Technology', industry: 'Log Analytics', marketCap: '2' },
    { ticker: 'PD', name: 'PagerDuty Inc.', sector: 'Technology', industry: 'Incident Management', marketCap: '3' },
    { ticker: 'APPSF', name: 'AppLovin Corp.', sector: 'Technology', industry: 'Mobile Gaming', marketCap: '35' },
    { ticker: 'IRNT', name: 'IronNet Inc.', sector: 'Technology', industry: 'Cybersecurity', marketCap: '1' },
    { ticker: 'YMM', name: 'Full Truck Alliance', sector: 'Technology', industry: 'Logistics Tech', marketCap: '8' },
    { ticker: 'KC', name: 'Kingsoft Cloud', sector: 'Technology', industry: 'Cloud Computing', marketCap: '2' },
    { ticker: 'WB', name: 'Weibo Corp.', sector: 'Technology', industry: 'Social Media', marketCap: '3' },
    { ticker: 'BILI', name: 'Bilibili Inc.', sector: 'Media', industry: 'Video Platform', marketCap: '8' },
    { ticker: 'IQ', name: 'iQIYI Inc.', sector: 'Media', industry: 'Streaming', marketCap: '3' },
    { ticker: 'TME', name: 'Tencent Music', sector: 'Media', industry: 'Music Streaming', marketCap: '15' },
    { ticker: 'HUYA', name: 'Huya Inc.', sector: 'Media', industry: 'Game Streaming', marketCap: '1' },
    { ticker: 'DOYU', name: 'DouYu International', sector: 'Media', industry: 'Game Streaming', marketCap: '1' },
    { ticker: 'FUTU', name: 'Futu Holdings', sector: 'Finance', industry: 'Online Brokerage', marketCap: '8' },
    { ticker: 'TIGR', name: 'UP Fintech', sector: 'Finance', industry: 'Online Brokerage', marketCap: '1' },
    { ticker: 'FINV', name: 'FinVolution Group', sector: 'Finance', industry: 'Fintech', marketCap: '2' },
    { ticker: 'LX', name: 'LexinFintech', sector: 'Finance', industry: 'Fintech', marketCap: '1' },
    { ticker: 'QFIN', name: '360 DigiTech', sector: 'Finance', industry: 'Fintech', marketCap: '3' },
    { ticker: 'YRD', name: 'Yiren Digital', sector: 'Finance', industry: 'Fintech', marketCap: '1' },
    { ticker: 'VNET', name: 'VNET Group', sector: 'Technology', industry: 'Data Centers', marketCap: '2' },
    { ticker: 'GDS', name: 'GDS Holdings', sector: 'Real Estate', industry: 'Data Centers', marketCap: '5' },
    { ticker: 'ATHM', name: 'Autohome Inc.', sector: 'Consumer', industry: 'Auto Marketplace', marketCap: '3' },
    { ticker: 'BZUN', name: 'Baozun Inc.', sector: 'Technology', industry: 'E-Commerce Services', marketCap: '1' },
    { ticker: 'VIPS', name: 'Vipshop Holdings', sector: 'Consumer', industry: 'E-Commerce', marketCap: '8' },
    { ticker: 'MNSO', name: 'Miniso Group', sector: 'Consumer', industry: 'Retail', marketCap: '5' },
    { ticker: 'DADA', name: 'Dada Nexus', sector: 'Technology', industry: 'Delivery Platform', marketCap: '1' },
    { ticker: 'DDL', name: 'Dingdong Maicai', sector: 'Consumer', industry: 'Grocery Delivery', marketCap: '2' },
    { ticker: 'MTRX', name: 'Matrix Service', sector: 'Industrials', industry: 'Engineering', marketCap: '1' },
    { ticker: 'ESLT', name: 'Elbit Systems', sector: 'Industrials', industry: 'Defense', marketCap: '12' },
    { ticker: 'AVAV', name: 'AeroVironment', sector: 'Industrials', industry: 'Drones', marketCap: '5' },
    { ticker: 'ATRO', name: 'Astronics Corp.', sector: 'Industrials', industry: 'Aerospace', marketCap: '1' },
    { ticker: 'CW', name: 'Curtiss-Wright', sector: 'Industrials', industry: 'Aerospace', marketCap: '8' },
    { ticker: 'MOG.A', name: 'Moog Inc.', sector: 'Industrials', industry: 'Motion Control', marketCap: '5' },
    { ticker: 'DRS', name: 'Leonardo DRS', sector: 'Industrials', industry: 'Defense Electronics', marketCap: '8' },
    { ticker: 'MRCY', name: 'Mercury Systems', sector: 'Technology', industry: 'Defense Tech', marketCap: '3' },
    { ticker: 'MANT', name: 'ManTech Intl', sector: 'Industrials', industry: 'Defense Services', marketCap: '5' },
    { ticker: 'VVV', name: 'Valvoline Inc.', sector: 'Consumer', industry: 'Auto Services', marketCap: '8' },
    { ticker: 'DRVN', name: 'Driven Brands', sector: 'Consumer', industry: 'Auto Services', marketCap: '5' },
    { ticker: 'MNRO', name: 'Monro Inc.', sector: 'Consumer', industry: 'Auto Services', marketCap: '2' },
    { ticker: 'AZO', name: 'AutoZone Inc.', sector: 'Consumer', industry: 'Auto Parts', marketCap: '52' },
    { ticker: 'ORLY', name: 'OReilly Automotive', sector: 'Consumer', industry: 'Auto Parts', marketCap: '62' },
    { ticker: 'AAP', name: 'Advance Auto Parts', sector: 'Consumer', industry: 'Auto Parts', marketCap: '5' },
    { ticker: 'GPC', name: 'Genuine Parts', sector: 'Consumer', industry: 'Auto Parts', marketCap: '22' },
    { ticker: 'LKQ', name: 'LKQ Corporation', sector: 'Consumer', industry: 'Auto Parts', marketCap: '15' },
    { ticker: 'PAG', name: 'Penske Automotive', sector: 'Consumer', industry: 'Auto Dealers', marketCap: '12' },
    { ticker: 'LAD', name: 'Lithia Motors', sector: 'Consumer', industry: 'Auto Dealers', marketCap: '10' },
    { ticker: 'ABG', name: 'Asbury Automotive', sector: 'Consumer', industry: 'Auto Dealers', marketCap: '8' },
    { ticker: 'AN', name: 'AutoNation Inc.', sector: 'Consumer', industry: 'Auto Dealers', marketCap: '8' },
    { ticker: 'SAH', name: 'Sonic Automotive', sector: 'Consumer', industry: 'Auto Dealers', marketCap: '3' },
    { ticker: 'GPI', name: 'Group 1 Automotive', sector: 'Consumer', industry: 'Auto Dealers', marketCap: '5' },
    { ticker: 'CVNA', name: 'Carvana Co.', sector: 'Consumer', industry: 'Online Auto', marketCap: '35' },
    { ticker: 'VRM', name: 'Vroom Inc.', sector: 'Consumer', industry: 'Online Auto', marketCap: '1' },
    { ticker: 'SFT', name: 'Shift Technologies', sector: 'Consumer', industry: 'Online Auto', marketCap: '1' },
    { ticker: 'CARS', name: 'Cars.com Inc.', sector: 'Consumer', industry: 'Auto Marketplace', marketCap: '2' },
    { ticker: 'TRUE', name: 'TrueCar Inc.', sector: 'Consumer', industry: 'Auto Marketplace', marketCap: '1' },
    { ticker: 'CACC', name: 'Credit Acceptance', sector: 'Finance', industry: 'Auto Finance', marketCap: '8' },
    { ticker: 'ALLY', name: 'Ally Financial', sector: 'Finance', industry: 'Auto Finance', marketCap: '12' },
    { ticker: 'SC', name: 'Santander Consumer', sector: 'Finance', industry: 'Auto Finance', marketCap: '12' },
    // Additional 100 stocks for comprehensive coverage
    { ticker: 'CPNG', name: 'Coupang Inc.', sector: 'Consumer', industry: 'E-Commerce', marketCap: '35' },
    { ticker: 'GLBE', name: 'Global-e Online', sector: 'Technology', industry: 'E-Commerce Tech', marketCap: '5' },
    { ticker: 'BIGC', name: 'BigCommerce', sector: 'Technology', industry: 'E-Commerce Platform', marketCap: '2' },
    { ticker: 'VTEX', name: 'VTEX', sector: 'Technology', industry: 'E-Commerce Platform', marketCap: '2' },
    { ticker: 'DOCN', name: 'DigitalOcean', sector: 'Technology', industry: 'Cloud Infrastructure', marketCap: '5' },
    { ticker: 'LSPD', name: 'Lightspeed Commerce', sector: 'Technology', industry: 'POS Systems', marketCap: '3' },
    { ticker: 'NCNO', name: 'nCino Inc.', sector: 'Technology', industry: 'Banking Software', marketCap: '5' },
    { ticker: 'ALTR', name: 'Altair Engineering', sector: 'Technology', industry: 'Simulation', marketCap: '8' },
    { ticker: 'AGCO', name: 'AGCO Corporation', sector: 'Industrials', industry: 'Farm Equipment', marketCap: '10' },
    { ticker: 'CNHI', name: 'CNH Industrial', sector: 'Industrials', industry: 'Farm Equipment', marketCap: '18' },
    { ticker: 'TRMB', name: 'Trimble Inc.', sector: 'Technology', industry: 'GPS Technology', marketCap: '15' },
    { ticker: 'LECO', name: 'Lincoln Electric', sector: 'Industrials', industry: 'Welding', marketCap: '12' },
    { ticker: 'MLM', name: 'Martin Marietta', sector: 'Materials', industry: 'Construction Materials', marketCap: '35' },
    { ticker: 'VMC', name: 'Vulcan Materials', sector: 'Materials', industry: 'Construction Materials', marketCap: '32' },
    { ticker: 'EXP', name: 'Eagle Materials', sector: 'Materials', industry: 'Construction Materials', marketCap: '8' },
    { ticker: 'SUM', name: 'Summit Materials', sector: 'Materials', industry: 'Construction Materials', marketCap: '5' },
    { ticker: 'BLDR', name: 'Builders FirstSource', sector: 'Industrials', industry: 'Building Products', marketCap: '22' },
    { ticker: 'POOL', name: 'Pool Corporation', sector: 'Consumer', industry: 'Pool Supplies', marketCap: '15' },
    { ticker: 'WSO', name: 'Watsco Inc.', sector: 'Industrials', industry: 'HVAC Distribution', marketCap: '15' },
    { ticker: 'SITE', name: 'SiteOne Landscape', sector: 'Industrials', industry: 'Landscaping', marketCap: '8' },
    { ticker: 'BECN', name: 'Beacon Roofing', sector: 'Industrials', industry: 'Roofing Distribution', marketCap: '5' },
    { ticker: 'TILE', name: 'Interface Inc.', sector: 'Industrials', industry: 'Flooring', marketCap: '2' },
    { ticker: 'TREX', name: 'Trex Company', sector: 'Industrials', industry: 'Composite Decking', marketCap: '8' },
    { ticker: 'AZEK', name: 'AZEK Company', sector: 'Industrials', industry: 'Outdoor Building', marketCap: '5' },
    { ticker: 'MAS', name: 'Masco Corporation', sector: 'Industrials', industry: 'Building Products', marketCap: '18' },
    { ticker: 'FND', name: 'Floor & Decor', sector: 'Consumer', industry: 'Flooring Retail', marketCap: '12' },
    { ticker: 'WSM', name: 'Williams-Sonoma', sector: 'Consumer', industry: 'Home Furnishings', marketCap: '18' },
    { ticker: 'RH', name: 'RH (Restoration Hardware)', sector: 'Consumer', industry: 'Home Furnishings', marketCap: '8' },
    { ticker: 'LOVE', name: 'Lovesac Company', sector: 'Consumer', industry: 'Furniture', marketCap: '1' },
    { ticker: 'SNBR', name: 'Sleep Number', sector: 'Consumer', industry: 'Mattresses', marketCap: '1' },
    { ticker: 'TPX', name: 'Tempur Sealy', sector: 'Consumer', industry: 'Mattresses', marketCap: '8' },
    { ticker: 'LEG', name: 'Leggett & Platt', sector: 'Consumer', industry: 'Home Products', marketCap: '3' },
    { ticker: 'ETH', name: 'Ethan Allen', sector: 'Consumer', industry: 'Furniture', marketCap: '1' },
    { ticker: 'HVT', name: 'Haverty Furniture', sector: 'Consumer', industry: 'Furniture Retail', marketCap: '1' },
    { ticker: 'ARHS', name: 'Arhaus Inc.', sector: 'Consumer', industry: 'Furniture', marketCap: '3' },
    { ticker: 'COOK', name: 'Traeger Inc.', sector: 'Consumer', industry: 'Outdoor Cooking', marketCap: '1' },
    { ticker: 'WRBY', name: 'Warby Parker', sector: 'Consumer', industry: 'Eyewear', marketCap: '3' },
    { ticker: 'FIGS', name: 'FIGS Inc.', sector: 'Consumer', industry: 'Medical Apparel', marketCap: '2' },
    { ticker: 'ALLO', name: 'Allogene Therapeutics', sector: 'Healthcare', industry: 'Cell Therapy', marketCap: '2' },
    { ticker: 'FATE', name: 'Fate Therapeutics', sector: 'Healthcare', industry: 'Cell Therapy', marketCap: '1' },
    { ticker: 'KITE', name: 'Kite Realty', sector: 'Real Estate', industry: 'Retail REITs', marketCap: '5' },
    { ticker: 'ROIC', name: 'Retail Opportunity', sector: 'Real Estate', industry: 'Retail REITs', marketCap: '3' },
    { ticker: 'KRG', name: 'Kite Realty Group', sector: 'Real Estate', industry: 'Retail REITs', marketCap: '5' },
    { ticker: 'SITC', name: 'SITE Centers', sector: 'Real Estate', industry: 'Retail REITs', marketCap: '3' },
    { ticker: 'BRX', name: 'Brixmor Property', sector: 'Real Estate', industry: 'Retail REITs', marketCap: '8' },
    { ticker: 'FRT', name: 'Federal Realty', sector: 'Real Estate', industry: 'Retail REITs', marketCap: '10' },
    { ticker: 'REG', name: 'Regency Centers', sector: 'Real Estate', industry: 'Retail REITs', marketCap: '12' },
    { ticker: 'KIM', name: 'Kimco Realty', sector: 'Real Estate', industry: 'Retail REITs', marketCap: '15' },
    { ticker: 'AVB', name: 'AvalonBay Communities', sector: 'Real Estate', industry: 'Residential REITs', marketCap: '28' },
    { ticker: 'EQR', name: 'Equity Residential', sector: 'Real Estate', industry: 'Residential REITs', marketCap: '25' },
    { ticker: 'MAA', name: 'Mid-America Apartment', sector: 'Real Estate', industry: 'Residential REITs', marketCap: '18' },
    { ticker: 'UDR', name: 'UDR Inc.', sector: 'Real Estate', industry: 'Residential REITs', marketCap: '15' },
    { ticker: 'CPT', name: 'Camden Property', sector: 'Real Estate', industry: 'Residential REITs', marketCap: '12' },
    { ticker: 'ESS', name: 'Essex Property', sector: 'Real Estate', industry: 'Residential REITs', marketCap: '18' },
    { ticker: 'INVH', name: 'Invitation Homes', sector: 'Real Estate', industry: 'Single-Family REITs', marketCap: '22' },
    { ticker: 'AMH', name: 'American Homes 4 Rent', sector: 'Real Estate', industry: 'Single-Family REITs', marketCap: '15' },
    { ticker: 'SUI', name: 'Sun Communities', sector: 'Real Estate', industry: 'Manufactured Housing', marketCap: '18' },
    { ticker: 'ELS', name: 'Equity LifeStyle', sector: 'Real Estate', industry: 'Manufactured Housing', marketCap: '15' },
    { ticker: 'NHI', name: 'National Health Investors', sector: 'Real Estate', industry: 'Healthcare REITs', marketCap: '3' },
    { ticker: 'LTC', name: 'LTC Properties', sector: 'Real Estate', industry: 'Healthcare REITs', marketCap: '2' },
    { ticker: 'CTRE', name: 'CareTrust REIT', sector: 'Real Estate', industry: 'Healthcare REITs', marketCap: '5' },
    { ticker: 'DOC', name: 'Physicians Realty', sector: 'Real Estate', industry: 'Healthcare REITs', marketCap: '5' },
    { ticker: 'HR', name: 'Healthcare Realty', sector: 'Real Estate', industry: 'Healthcare REITs', marketCap: '8' },
    { ticker: 'GMRE', name: 'Global Medical REIT', sector: 'Real Estate', industry: 'Healthcare REITs', marketCap: '1' },
    { ticker: 'OFC', name: 'Corporate Office', sector: 'Real Estate', industry: 'Office REITs', marketCap: '3' },
    { ticker: 'BXP', name: 'Boston Properties', sector: 'Real Estate', industry: 'Office REITs', marketCap: '12' },
    { ticker: 'VNO', name: 'Vornado Realty', sector: 'Real Estate', industry: 'Office REITs', marketCap: '5' },
    { ticker: 'SLG', name: 'SL Green Realty', sector: 'Real Estate', industry: 'Office REITs', marketCap: '5' },
    { ticker: 'HIW', name: 'Highwoods Properties', sector: 'Real Estate', industry: 'Office REITs', marketCap: '3' },
    { ticker: 'PDM', name: 'Piedmont Office', sector: 'Real Estate', industry: 'Office REITs', marketCap: '2' },
    { ticker: 'CUZ', name: 'Cousins Properties', sector: 'Real Estate', industry: 'Office REITs', marketCap: '5' },
    { ticker: 'COPT', name: 'Corporate Office Props', sector: 'Real Estate', industry: 'Office REITs', marketCap: '5' },
    { ticker: 'KRC', name: 'Kilroy Realty', sector: 'Real Estate', industry: 'Office REITs', marketCap: '5' },
    { ticker: 'BKH', name: 'Black Hills Corp', sector: 'Utilities', industry: 'Multi-Utilities', marketCap: '5' },
    { ticker: 'NWE', name: 'NorthWestern Energy', sector: 'Utilities', industry: 'Multi-Utilities', marketCap: '3' },
    { ticker: 'OTTR', name: 'Otter Tail Corp', sector: 'Utilities', industry: 'Electric Utilities', marketCap: '3' },
    { ticker: 'AVA', name: 'Avista Corp', sector: 'Utilities', industry: 'Electric Utilities', marketCap: '3' },
    { ticker: 'PNW', name: 'Pinnacle West', sector: 'Utilities', industry: 'Electric Utilities', marketCap: '10' },
    { ticker: 'IDA', name: 'IDACORP Inc', sector: 'Utilities', industry: 'Electric Utilities', marketCap: '5' },
    { ticker: 'OGE', name: 'OGE Energy', sector: 'Utilities', industry: 'Electric Utilities', marketCap: '8' },
    { ticker: 'POR', name: 'Portland General', sector: 'Utilities', industry: 'Electric Utilities', marketCap: '5' },
    { ticker: 'NJR', name: 'New Jersey Resources', sector: 'Utilities', industry: 'Gas Utilities', marketCap: '5' },
    { ticker: 'SWX', name: 'Southwest Gas', sector: 'Utilities', industry: 'Gas Utilities', marketCap: '5' },
    { ticker: 'OGS', name: 'ONE Gas Inc', sector: 'Utilities', industry: 'Gas Utilities', marketCap: '5' },
    { ticker: 'NI', name: 'NiSource Inc', sector: 'Utilities', industry: 'Gas Utilities', marketCap: '12' },
    { ticker: 'ATO', name: 'Atmos Energy', sector: 'Utilities', industry: 'Gas Utilities', marketCap: '18' },
    { ticker: 'UGI', name: 'UGI Corporation', sector: 'Utilities', industry: 'Gas Utilities', marketCap: '8' },
    { ticker: 'MDU', name: 'MDU Resources', sector: 'Utilities', industry: 'Multi-Utilities', marketCap: '5' },
    { ticker: 'NFG', name: 'National Fuel Gas', sector: 'Utilities', industry: 'Gas Utilities', marketCap: '5' },
    { ticker: 'WTRG', name: 'Essential Utilities', sector: 'Utilities', industry: 'Water Utilities', marketCap: '12' },
    { ticker: 'CWT', name: 'California Water', sector: 'Utilities', industry: 'Water Utilities', marketCap: '3' },
    { ticker: 'SJW', name: 'SJW Group', sector: 'Utilities', industry: 'Water Utilities', marketCap: '3' },
    { ticker: 'MSEX', name: 'Middlesex Water', sector: 'Utilities', industry: 'Water Utilities', marketCap: '1' },
    { ticker: 'YORW', name: 'York Water', sector: 'Utilities', industry: 'Water Utilities', marketCap: '1' },
    { ticker: 'AES', name: 'AES Corporation', sector: 'Utilities', industry: 'Independent Power', marketCap: '12' },
    { ticker: 'NRG', name: 'NRG Energy', sector: 'Utilities', industry: 'Independent Power', marketCap: '12' },
    { ticker: 'TALEN', name: 'Talen Energy', sector: 'Utilities', industry: 'Independent Power', marketCap: '5' },
    // Additional 100 stocks for final comprehensive coverage
    { ticker: 'PCAR', name: 'PACCAR Inc.', sector: 'Industrials', industry: 'Trucks', marketCap: '52' },
    { ticker: 'CMI', name: 'Cummins Inc.', sector: 'Industrials', industry: 'Engines', marketCap: '38' },
    { ticker: 'ALSN', name: 'Allison Transmission', sector: 'Industrials', industry: 'Transmissions', marketCap: '8' },
    { ticker: 'OSK', name: 'Oshkosh Corp', sector: 'Industrials', industry: 'Specialty Vehicles', marketCap: '8' },
    { ticker: 'NAV', name: 'Navistar International', sector: 'Industrials', industry: 'Trucks', marketCap: '5' },
    { ticker: 'WAB', name: 'Wabtec Corporation', sector: 'Industrials', industry: 'Rail Equipment', marketCap: '22' },
    { ticker: 'TRN', name: 'Trinity Industries', sector: 'Industrials', industry: 'Rail Cars', marketCap: '5' },
    { ticker: 'GBX', name: 'Greenbrier Companies', sector: 'Industrials', industry: 'Rail Cars', marketCap: '2' },
    { ticker: 'MATX', name: 'Matson Inc.', sector: 'Industrials', industry: 'Shipping', marketCap: '5' },
    { ticker: 'SBLK', name: 'Star Bulk Carriers', sector: 'Industrials', industry: 'Dry Bulk Shipping', marketCap: '2' },
    { ticker: 'GOGL', name: 'Golden Ocean Group', sector: 'Industrials', industry: 'Dry Bulk Shipping', marketCap: '3' },
    { ticker: 'DAC', name: 'Danaos Corporation', sector: 'Industrials', industry: 'Container Ships', marketCap: '2' },
    { ticker: 'ZIM', name: 'ZIM Shipping', sector: 'Industrials', industry: 'Container Ships', marketCap: '3' },
    { ticker: 'TRTN', name: 'Triton International', sector: 'Industrials', industry: 'Container Leasing', marketCap: '5' },
    { ticker: 'KEX', name: 'Kirby Corporation', sector: 'Industrials', industry: 'Marine Transport', marketCap: '5' },
    { ticker: 'ATSG', name: 'Air Transport Services', sector: 'Industrials', industry: 'Air Cargo', marketCap: '3' },
    { ticker: 'AAWW', name: 'Atlas Air Worldwide', sector: 'Industrials', industry: 'Air Cargo', marketCap: '3' },
    { ticker: 'SKYW', name: 'SkyWest Inc.', sector: 'Industrials', industry: 'Regional Airlines', marketCap: '3' },
    { ticker: 'MESA', name: 'Mesa Air Group', sector: 'Industrials', industry: 'Regional Airlines', marketCap: '1' },
    { ticker: 'ALGT', name: 'Allegiant Travel', sector: 'Industrials', industry: 'Airlines', marketCap: '3' },
    { ticker: 'SAVE', name: 'Spirit Airlines', sector: 'Industrials', industry: 'Airlines', marketCap: '1' },
    { ticker: 'JBLU', name: 'JetBlue Airways', sector: 'Industrials', industry: 'Airlines', marketCap: '3' },
    { ticker: 'AAL', name: 'American Airlines', sector: 'Industrials', industry: 'Airlines', marketCap: '12' },
    { ticker: 'DAL', name: 'Delta Air Lines', sector: 'Industrials', industry: 'Airlines', marketCap: '35' },
    { ticker: 'UAL', name: 'United Airlines', sector: 'Industrials', industry: 'Airlines', marketCap: '22' },
    { ticker: 'LUV', name: 'Southwest Airlines', sector: 'Industrials', industry: 'Airlines', marketCap: '18' },
    { ticker: 'ALK', name: 'Alaska Air Group', sector: 'Industrials', industry: 'Airlines', marketCap: '8' },
    { ticker: 'HA', name: 'Hawaiian Holdings', sector: 'Industrials', industry: 'Airlines', marketCap: '1' },
    { ticker: 'CPA', name: 'Copa Holdings', sector: 'Industrials', industry: 'Airlines', marketCap: '5' },
    { ticker: 'AZUL', name: 'Azul S.A.', sector: 'Industrials', industry: 'Airlines', marketCap: '2' },
    { ticker: 'GOL', name: 'Gol Linhas Aereas', sector: 'Industrials', industry: 'Airlines', marketCap: '1' },
    { ticker: 'VLRS', name: 'Volaris Aviation', sector: 'Industrials', industry: 'Airlines', marketCap: '2' },
    { ticker: 'RCL', name: 'Royal Caribbean', sector: 'Consumer', industry: 'Cruise Lines', marketCap: '42' },
    { ticker: 'CCL', name: 'Carnival Corporation', sector: 'Consumer', industry: 'Cruise Lines', marketCap: '22' },
    { ticker: 'NCLH', name: 'Norwegian Cruise Line', sector: 'Consumer', industry: 'Cruise Lines', marketCap: '12' },
    { ticker: 'SIX', name: 'Six Flags Entertainment', sector: 'Consumer', industry: 'Theme Parks', marketCap: '5' },
    { ticker: 'SEAS', name: 'SeaWorld Entertainment', sector: 'Consumer', industry: 'Theme Parks', marketCap: '5' },
    { ticker: 'FUN', name: 'Cedar Fair', sector: 'Consumer', industry: 'Theme Parks', marketCap: '5' },
    { ticker: 'LVS', name: 'Las Vegas Sands', sector: 'Consumer', industry: 'Casinos', marketCap: '42' },
    { ticker: 'WYNN', name: 'Wynn Resorts', sector: 'Consumer', industry: 'Casinos', marketCap: '12' },
    { ticker: 'MGM', name: 'MGM Resorts', sector: 'Consumer', industry: 'Casinos', marketCap: '15' },
    { ticker: 'CZR', name: 'Caesars Entertainment', sector: 'Consumer', industry: 'Casinos', marketCap: '12' },
    { ticker: 'PENN', name: 'Penn Entertainment', sector: 'Consumer', industry: 'Casinos', marketCap: '5' },
    { ticker: 'DKNG', name: 'DraftKings Inc.', sector: 'Consumer', industry: 'Sports Betting', marketCap: '15' },
    { ticker: 'GENI', name: 'Genius Sports', sector: 'Technology', industry: 'Sports Data', marketCap: '2' },
    { ticker: 'RSI', name: 'Rush Street Interactive', sector: 'Consumer', industry: 'Online Gaming', marketCap: '1' },
    { ticker: 'SKLZ', name: 'Skillz Inc.', sector: 'Technology', industry: 'Mobile Gaming', marketCap: '1' },
    { ticker: 'GGPI', name: 'Gores Guggenheim', sector: 'Consumer', industry: 'SPAC', marketCap: '1' },
    { ticker: 'PSFE', name: 'Paysafe Ltd.', sector: 'Finance', industry: 'Payments', marketCap: '2' },
    { ticker: 'PAYO', name: 'Payoneer Global', sector: 'Finance', industry: 'Payments', marketCap: '3' },
    { ticker: 'DLO', name: 'DLocal Limited', sector: 'Finance', industry: 'Payments', marketCap: '5' },
    { ticker: 'FOUR', name: 'Shift4 Payments', sector: 'Finance', industry: 'Payments', marketCap: '8' },
    { ticker: 'GPN', name: 'Global Payments', sector: 'Finance', industry: 'Payments', marketCap: '28' },
    { ticker: 'FIS', name: 'Fidelity National Info', sector: 'Finance', industry: 'Fintech', marketCap: '42' },
    { ticker: 'FISV', name: 'Fiserv Inc.', sector: 'Finance', industry: 'Fintech', marketCap: '82' },
    { ticker: 'BR', name: 'Broadridge Financial', sector: 'Finance', industry: 'Fintech', marketCap: '22' },
    { ticker: 'SEIC', name: 'SEI Investments', sector: 'Finance', industry: 'Wealth Management', marketCap: '10' },
    { ticker: 'LPLA', name: 'LPL Financial', sector: 'Finance', industry: 'Wealth Management', marketCap: '18' },
    { ticker: 'RJF', name: 'Raymond James', sector: 'Finance', industry: 'Wealth Management', marketCap: '28' },
    { ticker: 'SF', name: 'Stifel Financial', sector: 'Finance', industry: 'Investment Banking', marketCap: '10' },
    { ticker: 'EVR', name: 'Evercore Inc.', sector: 'Finance', industry: 'Investment Banking', marketCap: '8' },
    { ticker: 'PIPR', name: 'Piper Sandler', sector: 'Finance', industry: 'Investment Banking', marketCap: '5' },
    { ticker: 'HLI', name: 'Houlihan Lokey', sector: 'Finance', industry: 'Investment Banking', marketCap: '10' },
    { ticker: 'MC', name: 'Moelis & Company', sector: 'Finance', industry: 'Investment Banking', marketCap: '5' },
    { ticker: 'LAZ', name: 'Lazard Ltd.', sector: 'Finance', industry: 'Investment Banking', marketCap: '5' },
    { ticker: 'PJT', name: 'PJT Partners', sector: 'Finance', industry: 'Investment Banking', marketCap: '3' },
    { ticker: 'JEF', name: 'Jefferies Financial', sector: 'Finance', industry: 'Investment Banking', marketCap: '10' },
    { ticker: 'OWL', name: 'Blue Owl Capital', sector: 'Finance', industry: 'Private Equity', marketCap: '22' },
    { ticker: 'APO', name: 'Apollo Global', sector: 'Finance', industry: 'Private Equity', marketCap: '55' },
    { ticker: 'KKR', name: 'KKR & Co.', sector: 'Finance', industry: 'Private Equity', marketCap: '72' },
    { ticker: 'CG', name: 'Carlyle Group', sector: 'Finance', industry: 'Private Equity', marketCap: '18' },
    { ticker: 'ARES', name: 'Ares Management', sector: 'Finance', industry: 'Private Credit', marketCap: '35' },
    { ticker: 'BAM', name: 'Brookfield Asset Mgmt', sector: 'Finance', industry: 'Asset Management', marketCap: '80' },
    { ticker: 'BX', name: 'Blackstone Inc.', sector: 'Finance', industry: 'Private Equity', marketCap: '135' },
    { ticker: 'TPG', name: 'TPG Inc.', sector: 'Finance', industry: 'Private Equity', marketCap: '18' },
    { ticker: 'HLF', name: 'Herbalife Nutrition', sector: 'Consumer', industry: 'MLM', marketCap: '3' },
    { ticker: 'NUS', name: 'Nu Skin Enterprises', sector: 'Consumer', industry: 'MLM', marketCap: '2' },
    { ticker: 'USNA', name: 'USANA Health Sciences', sector: 'Consumer', industry: 'MLM', marketCap: '2' },
    { ticker: 'PRGO', name: 'Perrigo Company', sector: 'Healthcare', industry: 'Consumer Health', marketCap: '5' },
    { ticker: 'CHD', name: 'Church & Dwight', sector: 'Consumer', industry: 'Household Products', marketCap: '25' },
    { ticker: 'CLX', name: 'Clorox Company', sector: 'Consumer', industry: 'Household Products', marketCap: '18' },
    { ticker: 'SPB', name: 'Spectrum Brands', sector: 'Consumer', industry: 'Consumer Products', marketCap: '5' },
    { ticker: 'HNST', name: 'Honest Company', sector: 'Consumer', industry: 'Consumer Products', marketCap: '1' },
    { ticker: 'HELE', name: 'Helen of Troy', sector: 'Consumer', industry: 'Consumer Products', marketCap: '3' },
    { ticker: 'ENR', name: 'Energizer Holdings', sector: 'Consumer', industry: 'Batteries', marketCap: '3' },
    { ticker: 'SWI', name: 'SolarWinds Corp', sector: 'Technology', industry: 'IT Management', marketCap: '3' },
    { ticker: 'PRFT', name: 'Perficient Inc', sector: 'Technology', industry: 'Digital Consulting', marketCap: '3' },
    { ticker: 'GLOB', name: 'Globant S.A.', sector: 'Technology', industry: 'IT Services', marketCap: '10' },
    { ticker: 'G', name: 'Genpact Limited', sector: 'Technology', industry: 'Business Process', marketCap: '8' },
    { ticker: 'EXLS', name: 'ExlService Holdings', sector: 'Technology', industry: 'Business Process', marketCap: '5' },
    { ticker: 'WNS', name: 'WNS Holdings', sector: 'Technology', industry: 'Business Process', marketCap: '3' },
    { ticker: 'CNXC', name: 'Concentrix Corp', sector: 'Technology', industry: 'Customer Experience', marketCap: '5' },
    { ticker: 'TTEC', name: 'TTEC Holdings', sector: 'Technology', industry: 'Customer Experience', marketCap: '2' },
    { ticker: 'TASK', name: 'TaskUs Inc.', sector: 'Technology', industry: 'Customer Experience', marketCap: '2' },
    { ticker: 'ARMK', name: 'Aramark', sector: 'Consumer', industry: 'Food Services', marketCap: '12' },
    { ticker: 'CBRE', name: 'CBRE Group', sector: 'Real Estate', industry: 'Real Estate Services', marketCap: '28' },
    { ticker: 'JLL', name: 'Jones Lang LaSalle', sector: 'Real Estate', industry: 'Real Estate Services', marketCap: '12' },
];

function generateStockData(stockInfo) {
    const basePrice = 50 + Math.random() * 450;
    const change = (Math.random() - 0.5) * 10;
    const moat = 45 + Math.floor(Math.random() * 50);
    const roe = 8 + Math.floor(Math.random() * 30);
    const pe = 10 + Math.floor(Math.random() * 35);
    const zscore = 1.5 + Math.random() * 3;
    const sgr = 5 + Math.floor(Math.random() * 25);
    const history = [];
    let price = basePrice * 0.85;
    for (let i = 0; i < 20; i++) { price = price * (1 + (Math.random() - 0.48) * 0.03); history.push(Math.round(price * 100) / 100); }
    return { ...stockInfo, price: Math.round(basePrice * 100) / 100, change: Math.round(change * 100) / 100, volume: `${(Math.random() * 50 + 5).toFixed(1)}M`, moat, sgr, roe, roic: roe - 2 + Math.floor(Math.random() * 5), roa: Math.floor(roe * 0.6), eps: Math.round((1 + Math.random() * 15) * 100) / 100, pe, peg: Math.round((pe / sgr) * 100) / 100, fcf: Math.floor(Math.random() * 5000) + 500, eva: 40 + Math.floor(Math.random() * 50), zscore: Math.round(zscore * 100) / 100, dividend: Math.round(Math.random() * 4 * 100) / 100, beta: Math.round((0.7 + Math.random() * 0.8) * 100) / 100, aiRating: 55 + Math.floor(Math.random() * 40), history };
}

// Stock Markets

export default function Markets() {
    useEffect(() => {
        document.title = 'MarketsPro ai automated insights';
        document.querySelector('meta[name="description"]')?.setAttribute('content', 'MarketsPro delivers automated insights with AI stock predictions to empower smarter trading decisions.');
        document.querySelector('meta[name="keywords"]')?.setAttribute('content', 'MarketsPro, Ai stock predictions');
    }, []);

    const [stocks, setStocks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activePreset, setActivePreset] = useState('all');
    const [filters, setFilters] = useState({ market: 'All Markets', sector: 'All Sectors', industry: 'All Industries', moat: 'Any', roe: 'Any', pe: 'Any', zscore: 'Any' });
    const [selectedStock, setSelectedStock] = useState(null);
    const [showStockModal, setShowStockModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [chartFilter, setChartFilter] = useState({ type: null, value: null });

    useEffect(() => { fetchStockData(); }, []);



    const fetchStockData = async () => {
        setLoading(true);
        try {
            // Get a random batch of 30 stocks to fetch real data for
            const stockBatch = STOCK_DATA.sort(() => Math.random() - 0.5).slice(0, 30);
            const tickers = stockBatch.map(s => s.ticker).join(', ');
            
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Provide current stock market data for these tickers: ${tickers}

For each stock, provide realistic current market data including:
- Current price (realistic based on recent trading)
- Daily change percentage (-5% to +5% typical range)
- Trading volume
- Key financial metrics: MOAT score (0-100), ROE %, P/E ratio, Z-Score, EPS, Dividend yield

Return data for all ${stockBatch.length} stocks.`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        stocks: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    ticker: { type: "string" },
                                    price: { type: "number" },
                                    change: { type: "number" },
                                    volume: { type: "string" },
                                    moat: { type: "number" },
                                    roe: { type: "number" },
                                    pe: { type: "number" },
                                    zscore: { type: "number" },
                                    eps: { type: "number" },
                                    dividend: { type: "number" },
                                    sgr: { type: "number" }
                                }
                            }
                        }
                    }
                }
            });

            // Merge LLM data with our stock info
            const llmStocks = response?.stocks || [];
            const updatedStocks = STOCK_DATA.map(stock => {
                const llmData = llmStocks.find(s => s.ticker === stock.ticker);
                if (llmData) {
                    const history = [];
                    let price = llmData.price * 0.9;
                    for (let i = 0; i < 20; i++) { 
                        price = price * (1 + (Math.random() - 0.48) * 0.02); 
                        history.push(Math.round(price * 100) / 100); 
                    }
                    return {
                        ...stock,
                        price: llmData.price,
                        change: llmData.change,
                        volume: llmData.volume || `${(Math.random() * 50 + 5).toFixed(1)}M`,
                        moat: llmData.moat || 50 + Math.floor(Math.random() * 40),
                        roe: llmData.roe || 10 + Math.floor(Math.random() * 25),
                        roic: (llmData.roe || 15) - 2 + Math.floor(Math.random() * 5),
                        roa: Math.floor((llmData.roe || 15) * 0.6),
                        pe: llmData.pe || 15 + Math.floor(Math.random() * 25),
                        peg: Math.round(((llmData.pe || 20) / (llmData.sgr || 10)) * 100) / 100,
                        zscore: llmData.zscore || 2 + Math.random() * 2,
                        eps: llmData.eps || 1 + Math.random() * 10,
                        dividend: llmData.dividend || Math.random() * 3,
                        sgr: llmData.sgr || 5 + Math.floor(Math.random() * 20),
                        beta: Math.round((0.7 + Math.random() * 0.8) * 100) / 100,
                        fcf: Math.floor(Math.random() * 5000) + 500,
                        eva: 40 + Math.floor(Math.random() * 50),
                        aiRating: 55 + Math.floor(Math.random() * 40),
                        history
                    };
                }
                return generateStockData(stock);
            });

            setStocks(updatedStocks);
        } catch (error) {
            console.error('Error fetching stock data:', error);
            // Fallback to generated data
            setStocks(STOCK_DATA.map(generateStockData));
        } finally {
            setLoading(false);
        }
    };

    const refreshStocks = () => fetchStockData();
    const handleStockClick = (stock) => { setSelectedStock(stock); setShowStockModal(true); };

    const filteredStocks = useMemo(() => {
        let result = [...stocks];
        if (searchQuery) { 
            const q = searchQuery.toLowerCase().trim(); 
            result = result.filter(s => 
                s.ticker?.toLowerCase().includes(q) || 
                s.name?.toLowerCase().includes(q) || 
                s.sector?.toLowerCase().includes(q) ||
                s.industry?.toLowerCase().includes(q)
            ); 
        }
        if (activePreset === 'wide-moats') result = result.filter(s => s.moat >= 70);
        else if (activePreset === 'undervalued') result = result.filter(s => s.pe < 20);
        else if (activePreset === 'high-growth') result = result.filter(s => s.sgr >= 15);
        else if (activePreset === 'top-movers') result = result.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
        if (filters.moat !== 'Any') result = result.filter(s => s.moat >= parseInt(filters.moat));
        if (filters.roe !== 'Any') result = result.filter(s => s.roe >= parseInt(filters.roe));
        if (filters.pe !== 'Any') result = result.filter(s => s.pe < parseInt(filters.pe.replace('<', '')));
        if (filters.zscore !== 'Any') result = result.filter(s => s.zscore >= parseFloat(filters.zscore));
        if (filters.sector !== 'All Sectors') result = result.filter(s => s.sector === filters.sector);
        // Chart filter
        if (chartFilter.type && chartFilter.value) {
            result = result.filter(s => 
                chartFilter.type === 'sector' ? s.sector === chartFilter.value : s.industry === chartFilter.value
            );
        }
        return result;
    }, [stocks, searchQuery, activePreset, filters, chartFilter]);

    const topMovers = useMemo(() => [...stocks].sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 20), [stocks]);
    const sectors = useMemo(() => ['All Sectors', ...[...new Set(stocks.map(s => s.sector).filter(Boolean))].sort()], [stocks]);
    const clearFilters = () => { setFilters({ market: 'All Markets', sector: 'All Sectors', industry: 'All Industries', moat: 'Any', roe: 'Any', pe: 'Any', zscore: 'Any' }); setActivePreset('all'); setSearchQuery(''); setChartFilter({ type: null, value: null }); };
    
    const handleChartFilter = (type, value) => {
        setChartFilter({ type, value });
    };

    return (
        <div className="p-3 md:p-6">
            <div className="mb-3 md:mb-4 -mx-3 md:-mx-6 -mt-3 md:-mt-6"><StockTicker stocks={topMovers} /></div>



            {/* Search Bar + Preset Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3 mb-3 md:mb-4">
                {/* Search Bar */}
                <div className="relative flex-shrink-0 w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search ticker, name, sector..."
                        className="w-full h-10 pl-9 pr-8 rounded-full border border-gray-200 bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm text-gray-700 placeholder:text-gray-400"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            ×
                        </button>
                    )}
                </div>
                
                {/* Preset Filters */}
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {PRESET_FILTERS.map(preset => (<button key={preset.id} onClick={() => setActivePreset(preset.id)} className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border transition-all text-xs md:text-sm ${activePreset === preset.id ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'}`}><preset.icon className="w-3 h-3 md:w-4 md:h-4" /><span className="hidden sm:inline">{preset.label}</span></button>))}
                </div>
            </div>

            <div className="flex items-center gap-1.5 md:gap-2 flex-wrap mb-4">
                <FilterChips filters={filters} setFilters={setFilters} filterOptions={FILTER_OPTIONS} sectors={sectors} />
                <span className="px-2 md:px-4 py-1.5 md:py-2 rounded-full border border-purple-300 bg-white text-purple-600 text-xs md:text-sm font-medium">{stocks.length}</span>
                <button onClick={refreshStocks} disabled={loading} className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors disabled:opacity-50">
                    <RefreshCw className={`w-3 h-3 md:w-4 md:h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Market Overview Chart */}
            {!loading && stocks.length > 0 && (
                <MarketOverviewChart stocks={stocks} onFilterByGroup={handleChartFilter} />
            )}

            <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="flex items-center gap-2">
                    <p className="text-gray-600 text-xs md:text-sm">Showing <span className="font-bold text-gray-900">{filteredStocks.length}</span> of {stocks.length} stocks</p>
                    {chartFilter.value && (
                        <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium flex items-center gap-1">
                            {chartFilter.type === 'sector' ? 'Sector' : 'Industry'}: {chartFilter.value}
                            <button 
                                onClick={() => setChartFilter({ type: null, value: null })}
                                className="ml-1 hover:text-purple-900"
                            >
                                ×
                            </button>
                        </span>
                    )}
                </div>
            </div>

            {loading ? (
                <LoadingState message="Fetching latest market data..." size="large" />
            ) : (
                <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4">
                    {filteredStocks.map((stock, i) => (<StockCard key={stock.ticker || i} stock={stock} onClick={handleStockClick} />))}
                </div>
            )}

            {!loading && filteredStocks.length === 0 && (
                <EmptyState 
                    icon={BarChart3}
                    title="No Stocks Found"
                    message="No stocks match your current filters. Try adjusting your search criteria."
                    action={clearFilters}
                    actionLabel="Clear All Filters"
                />
            )}

            <StockDetailModal stock={selectedStock} isOpen={showStockModal} onClose={() => setShowStockModal(false)} />
        </div>
    );
}