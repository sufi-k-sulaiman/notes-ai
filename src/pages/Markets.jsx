import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
    Search, RefreshCw, TrendingUp, TrendingDown, Shield, 
    Zap, DollarSign, BarChart3, Activity, Sparkles, 
    ChevronDown, X, Filter, Loader2, Menu, ChevronLeft
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LOGO_URL, menuItems, footerLinks } from '../components/NavigationConfig';
import StockCard from '../components/markets/StockCard';
import StockTicker from '../components/markets/StockTicker';
import FilterChips from '../components/markets/FilterChips';
import StockDetailModal from '../components/markets/StockDetailModal';

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

// Stock data - generated locally for instant display
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
    { ticker: 'ETSY', name: 'Etsy Inc.', sector: 'Consumer', industry: 'E-Commerce', marketCap: '8' },
    { ticker: 'EA', name: 'Electronic Arts', sector: 'Media', industry: 'Video Games', marketCap: '38' },
    { ticker: 'TTWO', name: 'Take-Two Interactive', sector: 'Media', industry: 'Video Games', marketCap: '28' },
    { ticker: 'RBLX', name: 'Roblox Corp.', sector: 'Media', industry: 'Gaming Platform', marketCap: '28' },
    { ticker: 'SPOT', name: 'Spotify Technology', sector: 'Media', industry: 'Music Streaming', marketCap: '65' },
    { ticker: 'COIN', name: 'Coinbase Global', sector: 'Finance', industry: 'Cryptocurrency', marketCap: '45' },
    { ticker: 'HOOD', name: 'Robinhood Markets', sector: 'Finance', industry: 'Brokerage', marketCap: '18' },
    { ticker: 'GM', name: 'General Motors', sector: 'Automotive', industry: 'Automobiles', marketCap: '55' },
    { ticker: 'F', name: 'Ford Motor Company', sector: 'Automotive', industry: 'Automobiles', marketCap: '45' },
    { ticker: 'RIVN', name: 'Rivian Automotive', sector: 'Automotive', industry: 'Electric Vehicles', marketCap: '15' },
    { ticker: 'LCID', name: 'Lucid Group', sector: 'Automotive', industry: 'Electric Vehicles', marketCap: '8' },
    { ticker: 'FDX', name: 'FedEx Corporation', sector: 'Industrials', industry: 'Logistics', marketCap: '65' },
    { ticker: 'CSX', name: 'CSX Corporation', sector: 'Industrials', industry: 'Railroads', marketCap: '65' },
    { ticker: 'NSC', name: 'Norfolk Southern', sector: 'Industrials', industry: 'Railroads', marketCap: '50' },
    { ticker: 'WM', name: 'Waste Management', sector: 'Industrials', industry: 'Waste Services', marketCap: '80' },
    { ticker: 'RSG', name: 'Republic Services', sector: 'Industrials', industry: 'Waste Services', marketCap: '55' },
    { ticker: 'ETN', name: 'Eaton Corporation', sector: 'Industrials', industry: 'Electrical Equipment', marketCap: '110' },
    { ticker: 'EMR', name: 'Emerson Electric', sector: 'Industrials', industry: 'Industrial Automation', marketCap: '60' },
    { ticker: 'ITW', name: 'Illinois Tool Works', sector: 'Industrials', industry: 'Machinery', marketCap: '75' },
    { ticker: 'ABT', name: 'Abbott Laboratories', sector: 'Healthcare', industry: 'Medical Devices', marketCap: '190' },
    { ticker: 'DHR', name: 'Danaher Corporation', sector: 'Healthcare', industry: 'Life Sciences', marketCap: '180' },
    { ticker: 'MDT', name: 'Medtronic plc', sector: 'Healthcare', industry: 'Medical Devices', marketCap: '105' },
    { ticker: 'SYK', name: 'Stryker Corporation', sector: 'Healthcare', industry: 'Medical Devices', marketCap: '120' },
    { ticker: 'ISRG', name: 'Intuitive Surgical', sector: 'Healthcare', industry: 'Medical Devices', marketCap: '145' },
    { ticker: 'BSX', name: 'Boston Scientific', sector: 'Healthcare', industry: 'Medical Devices', marketCap: '85' },
    { ticker: 'EW', name: 'Edwards Lifesciences', sector: 'Healthcare', industry: 'Medical Devices', marketCap: '45' },
    { ticker: 'DXCM', name: 'DexCom Inc.', sector: 'Healthcare', industry: 'Medical Devices', marketCap: '30' },
    { ticker: 'CI', name: 'Cigna Group', sector: 'Healthcare', industry: 'Health Insurance', marketCap: '95' },
    { ticker: 'HUM', name: 'Humana Inc.', sector: 'Healthcare', industry: 'Health Insurance', marketCap: '45' },
    { ticker: 'CVS', name: 'CVS Health', sector: 'Healthcare', industry: 'Healthcare Services', marketCap: '75' },
    { ticker: 'MCK', name: 'McKesson Corporation', sector: 'Healthcare', industry: 'Healthcare Distribution', marketCap: '70' }
];

// Additional 200 stocks (2 batches of 100)
const STOCK_DATA_EXTENDED = [
    { ticker: 'ENPH', name: 'Enphase Energy', sector: 'Energy', industry: 'Solar', marketCap: '25' },
    { ticker: 'FSLR', name: 'First Solar Inc.', sector: 'Energy', industry: 'Solar', marketCap: '20' },
    { ticker: 'SEDG', name: 'SolarEdge Technologies', sector: 'Energy', industry: 'Solar', marketCap: '8' },
    { ticker: 'RUN', name: 'Sunrun Inc.', sector: 'Energy', industry: 'Solar', marketCap: '5' },
    { ticker: 'PLUG', name: 'Plug Power Inc.', sector: 'Energy', industry: 'Hydrogen', marketCap: '3' },
    { ticker: 'BE', name: 'Bloom Energy', sector: 'Energy', industry: 'Fuel Cells', marketCap: '4' },
    { ticker: 'CHPT', name: 'ChargePoint Holdings', sector: 'Energy', industry: 'EV Charging', marketCap: '2' },
    { ticker: 'ZIM', name: 'ZIM Integrated Shipping', sector: 'Industrials', industry: 'Shipping', marketCap: '2' },
    { ticker: 'DAL', name: 'Delta Air Lines', sector: 'Industrials', industry: 'Airlines', marketCap: '32' },
    { ticker: 'UAL', name: 'United Airlines', sector: 'Industrials', industry: 'Airlines', marketCap: '22' },
    { ticker: 'AAL', name: 'American Airlines', sector: 'Industrials', industry: 'Airlines', marketCap: '10' },
    { ticker: 'LUV', name: 'Southwest Airlines', sector: 'Industrials', industry: 'Airlines', marketCap: '18' },
    { ticker: 'JBLU', name: 'JetBlue Airways', sector: 'Industrials', industry: 'Airlines', marketCap: '2' },
    { ticker: 'ALK', name: 'Alaska Air Group', sector: 'Industrials', industry: 'Airlines', marketCap: '6' },
    { ticker: 'CCL', name: 'Carnival Corporation', sector: 'Consumer', industry: 'Cruise Lines', marketCap: '25' },
    { ticker: 'RCL', name: 'Royal Caribbean', sector: 'Consumer', industry: 'Cruise Lines', marketCap: '40' },
    { ticker: 'NCLH', name: 'Norwegian Cruise Line', sector: 'Consumer', industry: 'Cruise Lines', marketCap: '10' },
    { ticker: 'EXPE', name: 'Expedia Group', sector: 'Consumer', industry: 'Travel', marketCap: '20' },
    { ticker: 'TRIP', name: 'TripAdvisor Inc.', sector: 'Consumer', industry: 'Travel', marketCap: '3' },
    { ticker: 'MTN', name: 'Vail Resorts', sector: 'Consumer', industry: 'Leisure', marketCap: '8' },
    { ticker: 'WYNN', name: 'Wynn Resorts', sector: 'Consumer', industry: 'Casinos', marketCap: '10' },
    { ticker: 'LVS', name: 'Las Vegas Sands', sector: 'Consumer', industry: 'Casinos', marketCap: '35' },
    { ticker: 'MGM', name: 'MGM Resorts', sector: 'Consumer', industry: 'Casinos', marketCap: '15' },
    { ticker: 'PENN', name: 'Penn Entertainment', sector: 'Consumer', industry: 'Gaming', marketCap: '4' },
    { ticker: 'DKNG', name: 'DraftKings Inc.', sector: 'Consumer', industry: 'Sports Betting', marketCap: '18' },
    { ticker: 'GNOG', name: 'Golden Nugget Online', sector: 'Consumer', industry: 'Online Gaming', marketCap: '1' },
    { ticker: 'ROKU', name: 'Roku Inc.', sector: 'Media', industry: 'Streaming Devices', marketCap: '10' },
    { ticker: 'PARA', name: 'Paramount Global', sector: 'Media', industry: 'Entertainment', marketCap: '8' },
    { ticker: 'WBD', name: 'Warner Bros Discovery', sector: 'Media', industry: 'Entertainment', marketCap: '25' },
    { ticker: 'FOXA', name: 'Fox Corporation', sector: 'Media', industry: 'Broadcasting', marketCap: '18' },
    { ticker: 'VIAC', name: 'ViacomCBS Inc.', sector: 'Media', industry: 'Entertainment', marketCap: '12' },
    { ticker: 'CMCSA', name: 'Comcast Corporation', sector: 'Media', industry: 'Cable', marketCap: '160' },
    { ticker: 'CHTR', name: 'Charter Communications', sector: 'Media', industry: 'Cable', marketCap: '55' },
    { ticker: 'DISH', name: 'DISH Network', sector: 'Media', industry: 'Satellite TV', marketCap: '3' },
    { ticker: 'SIRI', name: 'Sirius XM Holdings', sector: 'Media', industry: 'Radio', marketCap: '15' },
    { ticker: 'LYV', name: 'Live Nation Entertainment', sector: 'Media', industry: 'Live Events', marketCap: '25' },
    { ticker: 'MTCH', name: 'Match Group Inc.', sector: 'Technology', industry: 'Dating Apps', marketCap: '10' },
    { ticker: 'PINS', name: 'Pinterest Inc.', sector: 'Technology', industry: 'Social Media', marketCap: '22' },
    { ticker: 'SNAP', name: 'Snap Inc.', sector: 'Technology', industry: 'Social Media', marketCap: '18' },
    { ticker: 'TWTR', name: 'Twitter Inc.', sector: 'Technology', industry: 'Social Media', marketCap: '44' },
    { ticker: 'GDDY', name: 'GoDaddy Inc.', sector: 'Technology', industry: 'Web Services', marketCap: '18' },
    { ticker: 'WIX', name: 'Wix.com Ltd.', sector: 'Technology', industry: 'Web Services', marketCap: '8' },
    { ticker: 'SQSP', name: 'Squarespace Inc.', sector: 'Technology', industry: 'Web Services', marketCap: '5' },
    { ticker: 'HUBS', name: 'HubSpot Inc.', sector: 'Technology', industry: 'Marketing Software', marketCap: '28' },
    { ticker: 'VEEV', name: 'Veeva Systems', sector: 'Technology', industry: 'Life Sciences Software', marketCap: '32' },
    { ticker: 'BILL', name: 'Bill Holdings Inc.', sector: 'Technology', industry: 'Fintech', marketCap: '8' },
    { ticker: 'FOUR', name: 'Shift4 Payments', sector: 'Finance', industry: 'Payments', marketCap: '6' },
    { ticker: 'AFRM', name: 'Affirm Holdings', sector: 'Finance', industry: 'Buy Now Pay Later', marketCap: '15' },
    { ticker: 'UPST', name: 'Upstart Holdings', sector: 'Finance', industry: 'AI Lending', marketCap: '5' },
    { ticker: 'SOFI', name: 'SoFi Technologies', sector: 'Finance', industry: 'Digital Banking', marketCap: '12' },
    { ticker: 'LC', name: 'LendingClub Corp.', sector: 'Finance', industry: 'P2P Lending', marketCap: '1.5' },
    { ticker: 'ALLY', name: 'Ally Financial', sector: 'Finance', industry: 'Auto Lending', marketCap: '10' },
    { ticker: 'SYF', name: 'Synchrony Financial', sector: 'Finance', industry: 'Consumer Finance', marketCap: '18' },
    { ticker: 'DFS', name: 'Discover Financial', sector: 'Finance', industry: 'Credit Cards', marketCap: '30' },
    { ticker: 'NDAQ', name: 'Nasdaq Inc.', sector: 'Finance', industry: 'Exchanges', marketCap: '35' },
    { ticker: 'CBOE', name: 'Cboe Global Markets', sector: 'Finance', industry: 'Exchanges', marketCap: '18' },
    { ticker: 'MKTX', name: 'MarketAxess Holdings', sector: 'Finance', industry: 'Trading Platform', marketCap: '10' },
    { ticker: 'TW', name: 'Tradeweb Markets', sector: 'Finance', industry: 'Trading Platform', marketCap: '22' },
    { ticker: 'VIRT', name: 'Virtu Financial', sector: 'Finance', industry: 'Market Making', marketCap: '5' },
    { ticker: 'HIG', name: 'Hartford Financial', sector: 'Finance', industry: 'Insurance', marketCap: '28' },
    { ticker: 'TRV', name: 'Travelers Companies', sector: 'Finance', industry: 'Insurance', marketCap: '50' },
    { ticker: 'ALL', name: 'Allstate Corporation', sector: 'Finance', industry: 'Insurance', marketCap: '45' },
    { ticker: 'PGR', name: 'Progressive Corp.', sector: 'Finance', industry: 'Insurance', marketCap: '130' },
    { ticker: 'CB', name: 'Chubb Limited', sector: 'Finance', industry: 'Insurance', marketCap: '100' },
    { ticker: 'MET', name: 'MetLife Inc.', sector: 'Finance', industry: 'Insurance', marketCap: '55' },
    { ticker: 'PRU', name: 'Prudential Financial', sector: 'Finance', industry: 'Insurance', marketCap: '42' },
    { ticker: 'AIG', name: 'American International', sector: 'Finance', industry: 'Insurance', marketCap: '48' },
    { ticker: 'AFL', name: 'Aflac Incorporated', sector: 'Finance', industry: 'Insurance', marketCap: '55' },
    { ticker: 'MMC', name: 'Marsh McLennan', sector: 'Finance', industry: 'Insurance Brokerage', marketCap: '100' },
    { ticker: 'AON', name: 'Aon plc', sector: 'Finance', industry: 'Insurance Brokerage', marketCap: '72' },
    { ticker: 'WTW', name: 'Willis Towers Watson', sector: 'Finance', industry: 'Insurance Brokerage', marketCap: '28' },
    { ticker: 'BRO', name: 'Brown & Brown Inc.', sector: 'Finance', industry: 'Insurance Brokerage', marketCap: '28' },
    { ticker: 'AJG', name: 'Arthur J Gallagher', sector: 'Finance', industry: 'Insurance Brokerage', marketCap: '55' },
    { ticker: 'ELV', name: 'Elevance Health', sector: 'Healthcare', industry: 'Health Insurance', marketCap: '115' },
    { ticker: 'CNC', name: 'Centene Corporation', sector: 'Healthcare', industry: 'Managed Care', marketCap: '40' },
    { ticker: 'MOH', name: 'Molina Healthcare', sector: 'Healthcare', industry: 'Managed Care', marketCap: '22' },
    { ticker: 'HCA', name: 'HCA Healthcare', sector: 'Healthcare', industry: 'Hospitals', marketCap: '85' },
    { ticker: 'UHS', name: 'Universal Health Services', sector: 'Healthcare', industry: 'Hospitals', marketCap: '12' },
    { ticker: 'THC', name: 'Tenet Healthcare', sector: 'Healthcare', industry: 'Hospitals', marketCap: '14' },
    { ticker: 'CYH', name: 'Community Health Systems', sector: 'Healthcare', industry: 'Hospitals', marketCap: '1' },
    { ticker: 'DVA', name: 'DaVita Inc.', sector: 'Healthcare', industry: 'Dialysis', marketCap: '12' },
    { ticker: 'FMS', name: 'Fresenius Medical Care', sector: 'Healthcare', industry: 'Dialysis', marketCap: '14' },
    { ticker: 'CAH', name: 'Cardinal Health', sector: 'Healthcare', industry: 'Distribution', marketCap: '28' },
    { ticker: 'ABC', name: 'AmerisourceBergen', sector: 'Healthcare', industry: 'Distribution', marketCap: '42' },
    { ticker: 'HSIC', name: 'Henry Schein Inc.', sector: 'Healthcare', industry: 'Distribution', marketCap: '10' },
    { ticker: 'HOLX', name: 'Hologic Inc.', sector: 'Healthcare', industry: 'Diagnostics', marketCap: '18' },
    { ticker: 'DGX', name: 'Quest Diagnostics', sector: 'Healthcare', industry: 'Diagnostics', marketCap: '16' },
    { ticker: 'LH', name: 'Labcorp Holdings', sector: 'Healthcare', industry: 'Diagnostics', marketCap: '20' },
    { ticker: 'IQV', name: 'IQVIA Holdings', sector: 'Healthcare', industry: 'CRO', marketCap: '42' },
    { ticker: 'CRL', name: 'Charles River Labs', sector: 'Healthcare', industry: 'CRO', marketCap: '12' },
    { ticker: 'WST', name: 'West Pharmaceutical', sector: 'Healthcare', industry: 'Packaging', marketCap: '25' },
    { ticker: 'PKI', name: 'PerkinElmer Inc.', sector: 'Healthcare', industry: 'Life Sciences', marketCap: '15' },
    { ticker: 'MTD', name: 'Mettler-Toledo', sector: 'Healthcare', industry: 'Lab Equipment', marketCap: '28' },
    { ticker: 'WAT', name: 'Waters Corporation', sector: 'Healthcare', industry: 'Analytical Instruments', marketCap: '18' },
    { ticker: 'BIO', name: 'Bio-Rad Laboratories', sector: 'Healthcare', industry: 'Life Sciences', marketCap: '12' },
    { ticker: 'TECH', name: 'Bio-Techne Corp.', sector: 'Healthcare', industry: 'Life Sciences', marketCap: '10' },
    { ticker: 'ALGN', name: 'Align Technology', sector: 'Healthcare', industry: 'Dental', marketCap: '18' },
    { ticker: 'XRAY', name: 'Dentsply Sirona', sector: 'Healthcare', industry: 'Dental', marketCap: '6' },
    // Additional 100 stocks batch 2
    { ticker: 'PAYC', name: 'Paycom Software', sector: 'Technology', industry: 'HR Software', marketCap: '12' },
    { ticker: 'PCTY', name: 'Paylocity Holding', sector: 'Technology', industry: 'HR Software', marketCap: '10' },
    { ticker: 'CEQP', name: 'Crestwood Equity', sector: 'Energy', industry: 'Midstream', marketCap: '3' },
    { ticker: 'AM', name: 'Antero Midstream', sector: 'Energy', industry: 'Midstream', marketCap: '7' },
    { ticker: 'TRGP', name: 'Targa Resources', sector: 'Energy', industry: 'Midstream', marketCap: '28' },
    { ticker: 'WES', name: 'Western Midstream', sector: 'Energy', industry: 'Midstream', marketCap: '14' },
    { ticker: 'PAA', name: 'Plains All American', sector: 'Energy', industry: 'Pipelines', marketCap: '12' },
    { ticker: 'MPLX', name: 'MPLX LP', sector: 'Energy', industry: 'Midstream', marketCap: '40' },
    { ticker: 'HESM', name: 'Hess Midstream', sector: 'Energy', industry: 'Midstream', marketCap: '8' },
    { ticker: 'DTM', name: 'DT Midstream', sector: 'Energy', industry: 'Natural Gas', marketCap: '8' },
    { ticker: 'KNTK', name: 'Kinetik Holdings', sector: 'Energy', industry: 'Midstream', marketCap: '6' },
    { ticker: 'CTRA', name: 'Coterra Energy', sector: 'Energy', industry: 'E&P', marketCap: '20' },
    { ticker: 'EQT', name: 'EQT Corporation', sector: 'Energy', industry: 'Natural Gas', marketCap: '18' },
    { ticker: 'AR', name: 'Antero Resources', sector: 'Energy', industry: 'Natural Gas', marketCap: '10' },
    { ticker: 'RRC', name: 'Range Resources', sector: 'Energy', industry: 'Natural Gas', marketCap: '8' },
    { ticker: 'SWN', name: 'Southwestern Energy', sector: 'Energy', industry: 'Natural Gas', marketCap: '7' },
    { ticker: 'CHK', name: 'Chesapeake Energy', sector: 'Energy', industry: 'Natural Gas', marketCap: '10' },
    { ticker: 'CNX', name: 'CNX Resources', sector: 'Energy', industry: 'Natural Gas', marketCap: '5' },
    { ticker: 'MTDR', name: 'Matador Resources', sector: 'Energy', industry: 'E&P', marketCap: '8' },
    { ticker: 'PR', name: 'Permian Resources', sector: 'Energy', industry: 'E&P', marketCap: '12' },
    { ticker: 'CHRD', name: 'Chord Energy', sector: 'Energy', industry: 'E&P', marketCap: '8' },
    { ticker: 'CIVI', name: 'Civitas Resources', sector: 'Energy', industry: 'E&P', marketCap: '6' },
    { ticker: 'SM', name: 'SM Energy', sector: 'Energy', industry: 'E&P', marketCap: '5' },
    { ticker: 'OVV', name: 'Ovintiv Inc.', sector: 'Energy', industry: 'E&P', marketCap: '12' },
    { ticker: 'MRO', name: 'Marathon Oil', sector: 'Energy', industry: 'E&P', marketCap: '14' },
    { ticker: 'APA', name: 'APA Corporation', sector: 'Energy', industry: 'E&P', marketCap: '10' },
    { ticker: 'PDCE', name: 'PDC Energy', sector: 'Energy', industry: 'E&P', marketCap: '7' },
    { ticker: 'CLR', name: 'Continental Resources', sector: 'Energy', industry: 'E&P', marketCap: '25' },
    { ticker: 'MGY', name: 'Magnolia Oil & Gas', sector: 'Energy', industry: 'E&P', marketCap: '5' },
    { ticker: 'VTLE', name: 'Vital Energy', sector: 'Energy', industry: 'E&P', marketCap: '2' },
    { ticker: 'CPE', name: 'Callon Petroleum', sector: 'Energy', industry: 'E&P', marketCap: '2' },
    { ticker: 'ROIV', name: 'Roivant Sciences', sector: 'Healthcare', industry: 'Biotechnology', marketCap: '8' },
    { ticker: 'RXRX', name: 'Recursion Pharma', sector: 'Healthcare', industry: 'AI Drug Discovery', marketCap: '4' },
    { ticker: 'DNA', name: 'Ginkgo Bioworks', sector: 'Healthcare', industry: 'Synthetic Biology', marketCap: '3' },
    { ticker: 'BEAM', name: 'Beam Therapeutics', sector: 'Healthcare', industry: 'Gene Editing', marketCap: '3' },
    { ticker: 'CRSP', name: 'CRISPR Therapeutics', sector: 'Healthcare', industry: 'Gene Editing', marketCap: '4' },
    { ticker: 'NTLA', name: 'Intellia Therapeutics', sector: 'Healthcare', industry: 'Gene Editing', marketCap: '3' },
    { ticker: 'EDIT', name: 'Editas Medicine', sector: 'Healthcare', industry: 'Gene Editing', marketCap: '1' },
    { ticker: 'VERV', name: 'Verve Therapeutics', sector: 'Healthcare', industry: 'Gene Editing', marketCap: '1' },
    { ticker: 'PRME', name: 'Prime Medicine', sector: 'Healthcare', industry: 'Gene Editing', marketCap: '1' },
    { ticker: 'VNDA', name: 'Vanda Pharmaceuticals', sector: 'Healthcare', industry: 'Specialty Pharma', marketCap: '1' },
    { ticker: 'JAZZ', name: 'Jazz Pharmaceuticals', sector: 'Healthcare', industry: 'Specialty Pharma', marketCap: '8' },
    { ticker: 'NBIX', name: 'Neurocrine Biosciences', sector: 'Healthcare', industry: 'Neurology', marketCap: '14' },
    { ticker: 'INCY', name: 'Incyte Corporation', sector: 'Healthcare', industry: 'Oncology', marketCap: '14' },
    { ticker: 'EXEL', name: 'Exelixis Inc.', sector: 'Healthcare', industry: 'Oncology', marketCap: '8' },
    { ticker: 'SRPT', name: 'Sarepta Therapeutics', sector: 'Healthcare', industry: 'Gene Therapy', marketCap: '12' },
    { ticker: 'BMRN', name: 'BioMarin Pharmaceutical', sector: 'Healthcare', industry: 'Rare Disease', marketCap: '15' },
    { ticker: 'ALNY', name: 'Alnylam Pharmaceuticals', sector: 'Healthcare', industry: 'RNAi', marketCap: '28' },
    { ticker: 'IONS', name: 'Ionis Pharmaceuticals', sector: 'Healthcare', industry: 'Antisense', marketCap: '8' },
    { ticker: 'UTHR', name: 'United Therapeutics', sector: 'Healthcare', industry: 'Pulmonary', marketCap: '12' },
    { ticker: 'HALO', name: 'Halozyme Therapeutics', sector: 'Healthcare', industry: 'Drug Delivery', marketCap: '8' },
    { ticker: 'PCVX', name: 'Vaxcyte Inc.', sector: 'Healthcare', industry: 'Vaccines', marketCap: '10' },
    { ticker: 'DAWN', name: 'Day One Biopharma', sector: 'Healthcare', industry: 'Oncology', marketCap: '2' },
    { ticker: 'KYMR', name: 'Kymera Therapeutics', sector: 'Healthcare', industry: 'Protein Degradation', marketCap: '3' },
    { ticker: 'IMVT', name: 'Immunovant Inc.', sector: 'Healthcare', industry: 'Autoimmune', marketCap: '4' },
    { ticker: 'ARWR', name: 'Arrowhead Pharma', sector: 'Healthcare', industry: 'RNAi', marketCap: '5' },
    { ticker: 'RCKT', name: 'Rocket Pharma', sector: 'Healthcare', industry: 'Gene Therapy', marketCap: '3' },
    { ticker: 'KRYS', name: 'Krystal Biotech', sector: 'Healthcare', industry: 'Gene Therapy', marketCap: '6' },
    { ticker: 'RARE', name: 'Ultragenyx Pharma', sector: 'Healthcare', industry: 'Rare Disease', marketCap: '5' },
    { ticker: 'RPRX', name: 'Royalty Pharma', sector: 'Healthcare', industry: 'Pharma Royalties', marketCap: '18' },
    { ticker: 'PATH', name: 'UiPath Inc.', sector: 'Technology', industry: 'RPA Software', marketCap: '10' },
    { ticker: 'AI', name: 'C3.ai Inc.', sector: 'Technology', industry: 'AI Software', marketCap: '4' },
    { ticker: 'BBAI', name: 'BigBear.ai Holdings', sector: 'Technology', industry: 'AI Analytics', marketCap: '1' },
    { ticker: 'SOUN', name: 'SoundHound AI', sector: 'Technology', industry: 'Voice AI', marketCap: '2' },
    { ticker: 'GFAI', name: 'Guardforce AI', sector: 'Technology', industry: 'AI Robotics', marketCap: '0.1' },
    { ticker: 'ASTS', name: 'AST SpaceMobile', sector: 'Technology', industry: 'Satellite', marketCap: '6' },
    { ticker: 'IRDM', name: 'Iridium Communications', sector: 'Technology', industry: 'Satellite', marketCap: '6' },
    { ticker: 'GSAT', name: 'Globalstar Inc.', sector: 'Technology', industry: 'Satellite', marketCap: '3' },
    { ticker: 'VSAT', name: 'Viasat Inc.', sector: 'Technology', industry: 'Satellite', marketCap: '3' },
    { ticker: 'RKLB', name: 'Rocket Lab USA', sector: 'Industrials', industry: 'Space', marketCap: '8' },
    { ticker: 'SPCE', name: 'Virgin Galactic', sector: 'Industrials', industry: 'Space Tourism', marketCap: '1' },
    { ticker: 'RDW', name: 'Redwire Corporation', sector: 'Industrials', industry: 'Space Infrastructure', marketCap: '1' },
    { ticker: 'MNTS', name: 'Momentus Inc.', sector: 'Industrials', industry: 'Space Transport', marketCap: '0.2' },
    { ticker: 'ASTR', name: 'Astra Space', sector: 'Industrials', industry: 'Space Launch', marketCap: '0.1' },
    { ticker: 'LUNR', name: 'Intuitive Machines', sector: 'Industrials', industry: 'Lunar Services', marketCap: '2' },
    { ticker: 'LMT', name: 'Lockheed Martin', sector: 'Industrials', industry: 'Defense', marketCap: '120' },
    { ticker: 'NOC', name: 'Northrop Grumman', sector: 'Industrials', industry: 'Defense', marketCap: '75' },
    { ticker: 'GD', name: 'General Dynamics', sector: 'Industrials', industry: 'Defense', marketCap: '75' },
    { ticker: 'LHX', name: 'L3Harris Technologies', sector: 'Industrials', industry: 'Defense', marketCap: '45' },
    { ticker: 'HII', name: 'Huntington Ingalls', sector: 'Industrials', industry: 'Shipbuilding', marketCap: '12' },
    { ticker: 'TDG', name: 'TransDigm Group', sector: 'Industrials', industry: 'Aerospace Parts', marketCap: '65' },
    { ticker: 'HEI', name: 'HEICO Corporation', sector: 'Industrials', industry: 'Aerospace Parts', marketCap: '28' },
    { ticker: 'TXT', name: 'Textron Inc.', sector: 'Industrials', industry: 'Aerospace', marketCap: '16' },
    { ticker: 'SPR', name: 'Spirit AeroSystems', sector: 'Industrials', industry: 'Aerospace Parts', marketCap: '4' },
    { ticker: 'HWM', name: 'Howmet Aerospace', sector: 'Industrials', industry: 'Aerospace Parts', marketCap: '28' },
    { ticker: 'AXON', name: 'Axon Enterprise', sector: 'Technology', industry: 'Public Safety', marketCap: '25' },
    { ticker: 'TYL', name: 'Tyler Technologies', sector: 'Technology', industry: 'Gov Software', marketCap: '22' },
    { ticker: 'CACI', name: 'CACI International', sector: 'Technology', industry: 'Gov IT Services', marketCap: '10' },
    { ticker: 'SAIC', name: 'Science Applications', sector: 'Technology', industry: 'Gov IT Services', marketCap: '7' },
    { ticker: 'LDOS', name: 'Leidos Holdings', sector: 'Technology', industry: 'Gov IT Services', marketCap: '18' },
    { ticker: 'BAH', name: 'Booz Allen Hamilton', sector: 'Technology', industry: 'Gov Consulting', marketCap: '18' },
    { ticker: 'KTOS', name: 'Kratos Defense', sector: 'Industrials', industry: 'Defense Tech', marketCap: '3' },
    { ticker: 'MRCY', name: 'Mercury Systems', sector: 'Technology', industry: 'Defense Electronics', marketCap: '2' },
    { ticker: 'PSN', name: 'Parsons Corporation', sector: 'Technology', industry: 'Engineering', marketCap: '8' },
    { ticker: 'KBR', name: 'KBR Inc.', sector: 'Industrials', industry: 'Engineering', marketCap: '9' },
    { ticker: 'J', name: 'Jacobs Solutions', sector: 'Industrials', industry: 'Engineering', marketCap: '18' },
    { ticker: 'TTEK', name: 'Tetra Tech Inc.', sector: 'Industrials', industry: 'Engineering', marketCap: '12' },
    // Additional 100 stocks to reach 450+ total
    { ticker: 'SNPS', name: 'Synopsys Inc.', sector: 'Technology', industry: 'EDA Software', marketCap: '80' },
    { ticker: 'CDNS', name: 'Cadence Design', sector: 'Technology', industry: 'EDA Software', marketCap: '75' },
    { ticker: 'ANSS', name: 'ANSYS Inc.', sector: 'Technology', industry: 'Simulation Software', marketCap: '30' },
    { ticker: 'KLAC', name: 'KLA Corporation', sector: 'Technology', industry: 'Semiconductor Equipment', marketCap: '85' },
    { ticker: 'MRVL', name: 'Marvell Technology', sector: 'Technology', industry: 'Semiconductors', marketCap: '60' },
    { ticker: 'ON', name: 'ON Semiconductor', sector: 'Technology', industry: 'Semiconductors', marketCap: '35' },
    { ticker: 'NXPI', name: 'NXP Semiconductors', sector: 'Technology', industry: 'Semiconductors', marketCap: '55' },
    { ticker: 'SWKS', name: 'Skyworks Solutions', sector: 'Technology', industry: 'Semiconductors', marketCap: '18' },
    { ticker: 'QRVO', name: 'Qorvo Inc.', sector: 'Technology', industry: 'Semiconductors', marketCap: '10' },
    { ticker: 'WOLF', name: 'Wolfspeed Inc.', sector: 'Technology', industry: 'Silicon Carbide', marketCap: '8' },
    { ticker: 'SMCI', name: 'Super Micro Computer', sector: 'Technology', industry: 'Servers', marketCap: '25' },
    { ticker: 'DELL', name: 'Dell Technologies', sector: 'Technology', industry: 'Computer Hardware', marketCap: '85' },
    { ticker: 'HPQ', name: 'HP Inc.', sector: 'Technology', industry: 'Computer Hardware', marketCap: '35' },
    { ticker: 'HPE', name: 'Hewlett Packard Enterprise', sector: 'Technology', industry: 'Enterprise IT', marketCap: '25' },
    { ticker: 'NTAP', name: 'NetApp Inc.', sector: 'Technology', industry: 'Data Storage', marketCap: '22' },
    { ticker: 'PSTG', name: 'Pure Storage', sector: 'Technology', industry: 'Data Storage', marketCap: '15' },
    { ticker: 'STX', name: 'Seagate Technology', sector: 'Technology', industry: 'Hard Drives', marketCap: '22' },
    { ticker: 'WDC', name: 'Western Digital', sector: 'Technology', industry: 'Storage', marketCap: '20' },
    { ticker: 'JNPR', name: 'Juniper Networks', sector: 'Technology', industry: 'Networking', marketCap: '12' },
    { ticker: 'FFIV', name: 'F5 Inc.', sector: 'Technology', industry: 'Networking', marketCap: '12' },
    { ticker: 'AKAM', name: 'Akamai Technologies', sector: 'Technology', industry: 'CDN', marketCap: '15' },
    { ticker: 'OKTA', name: 'Okta Inc.', sector: 'Technology', industry: 'Identity Management', marketCap: '15' },
    { ticker: 'SPLK', name: 'Splunk Inc.', sector: 'Technology', industry: 'Data Analytics', marketCap: '25' },
    { ticker: 'ESTC', name: 'Elastic N.V.', sector: 'Technology', industry: 'Search Software', marketCap: '10' },
    { ticker: 'CFLT', name: 'Confluent Inc.', sector: 'Technology', industry: 'Data Streaming', marketCap: '10' },
    { ticker: 'DOCN', name: 'DigitalOcean Holdings', sector: 'Technology', industry: 'Cloud Infrastructure', marketCap: '4' },
    { ticker: 'TWLO', name: 'Twilio Inc.', sector: 'Technology', industry: 'Communications API', marketCap: '12' },
    { ticker: 'FIVN', name: 'Five9 Inc.', sector: 'Technology', industry: 'Contact Center', marketCap: '4' },
    { ticker: 'RNG', name: 'RingCentral Inc.', sector: 'Technology', industry: 'Communications', marketCap: '4' },
    { ticker: 'ZM', name: 'Zoom Video', sector: 'Technology', industry: 'Video Communications', marketCap: '22' },
    { ticker: 'DOCU', name: 'DocuSign Inc.', sector: 'Technology', industry: 'E-Signature', marketCap: '12' },
    { ticker: 'BOX', name: 'Box Inc.', sector: 'Technology', industry: 'Cloud Storage', marketCap: '5' },
    { ticker: 'DBX', name: 'Dropbox Inc.', sector: 'Technology', industry: 'Cloud Storage', marketCap: '10' },
    { ticker: 'GTLB', name: 'GitLab Inc.', sector: 'Technology', industry: 'DevOps', marketCap: '8' },
    { ticker: 'SUMO', name: 'Sumo Logic', sector: 'Technology', industry: 'Log Analytics', marketCap: '2' },
    { ticker: 'DV', name: 'DoubleVerify Holdings', sector: 'Technology', industry: 'Ad Tech', marketCap: '5' },
    { ticker: 'TTD', name: 'The Trade Desk', sector: 'Technology', industry: 'Ad Tech', marketCap: '45' },
    { ticker: 'MGNI', name: 'Magnite Inc.', sector: 'Technology', industry: 'Ad Tech', marketCap: '2' },
    { ticker: 'PUBM', name: 'PubMatic Inc.', sector: 'Technology', industry: 'Ad Tech', marketCap: '1' },
    { ticker: 'APPS', name: 'Digital Turbine', sector: 'Technology', industry: 'Mobile Ads', marketCap: '0.5' },
    { ticker: 'U', name: 'Unity Software', sector: 'Technology', industry: 'Game Engine', marketCap: '12' },
    { ticker: 'AMBA', name: 'Ambarella Inc.', sector: 'Technology', industry: 'Computer Vision', marketCap: '3' },
    { ticker: 'CGNX', name: 'Cognex Corporation', sector: 'Technology', industry: 'Machine Vision', marketCap: '8' },
    { ticker: 'TER', name: 'Teradyne Inc.', sector: 'Technology', industry: 'Test Equipment', marketCap: '18' },
    { ticker: 'COHR', name: 'Coherent Corp.', sector: 'Technology', industry: 'Lasers', marketCap: '10' },
    { ticker: 'IPGP', name: 'IPG Photonics', sector: 'Technology', industry: 'Fiber Lasers', marketCap: '5' },
    { ticker: 'MKSI', name: 'MKS Instruments', sector: 'Technology', industry: 'Instruments', marketCap: '8' },
    { ticker: 'ENTG', name: 'Entegris Inc.', sector: 'Technology', industry: 'Semiconductor Materials', marketCap: '18' },
    { ticker: 'MPWR', name: 'Monolithic Power', sector: 'Technology', industry: 'Power Semiconductors', marketCap: '35' },
    { ticker: 'ALGM', name: 'Allegro MicroSystems', sector: 'Technology', industry: 'Sensors', marketCap: '6' },
    { ticker: 'CRUS', name: 'Cirrus Logic', sector: 'Technology', industry: 'Audio Chips', marketCap: '6' },
    { ticker: 'SLAB', name: 'Silicon Laboratories', sector: 'Technology', industry: 'IoT Chips', marketCap: '5' },
    { ticker: 'LSCC', name: 'Lattice Semiconductor', sector: 'Technology', industry: 'FPGAs', marketCap: '10' },
    { ticker: 'POWI', name: 'Power Integrations', sector: 'Technology', industry: 'Power ICs', marketCap: '4' },
    { ticker: 'DIOD', name: 'Diodes Incorporated', sector: 'Technology', industry: 'Discrete Semis', marketCap: '4' },
    { ticker: 'VST', name: 'Vistra Corp.', sector: 'Utilities', industry: 'Independent Power', marketCap: '35' },
    { ticker: 'CEG', name: 'Constellation Energy', sector: 'Utilities', industry: 'Nuclear Power', marketCap: '55' },
    { ticker: 'PCG', name: 'PG&E Corporation', sector: 'Utilities', industry: 'Electric Utilities', marketCap: '45' },
    { ticker: 'EXC', name: 'Exelon Corporation', sector: 'Utilities', industry: 'Electric Utilities', marketCap: '42' },
    { ticker: 'SRE', name: 'Sempra Energy', sector: 'Utilities', industry: 'Multi-Utilities', marketCap: '52' },
    { ticker: 'D', name: 'Dominion Energy', sector: 'Utilities', industry: 'Electric Utilities', marketCap: '45' },
    { ticker: 'AEP', name: 'American Electric Power', sector: 'Utilities', industry: 'Electric Utilities', marketCap: '50' },
    { ticker: 'XEL', name: 'Xcel Energy', sector: 'Utilities', industry: 'Electric Utilities', marketCap: '35' },
    { ticker: 'WEC', name: 'WEC Energy Group', sector: 'Utilities', industry: 'Electric Utilities', marketCap: '28' },
    { ticker: 'ED', name: 'Consolidated Edison', sector: 'Utilities', industry: 'Electric Utilities', marketCap: '32' },
    { ticker: 'AWK', name: 'American Water Works', sector: 'Utilities', industry: 'Water Utilities', marketCap: '28' },
    { ticker: 'ES', name: 'Eversource Energy', sector: 'Utilities', industry: 'Electric Utilities', marketCap: '22' },
    { ticker: 'ETR', name: 'Entergy Corporation', sector: 'Utilities', industry: 'Electric Utilities', marketCap: '25' },
    { ticker: 'PPL', name: 'PPL Corporation', sector: 'Utilities', industry: 'Electric Utilities', marketCap: '22' },
    { ticker: 'FE', name: 'FirstEnergy Corp.', sector: 'Utilities', industry: 'Electric Utilities', marketCap: '24' },
    { ticker: 'AES', name: 'AES Corporation', sector: 'Utilities', industry: 'Independent Power', marketCap: '12' },
    { ticker: 'NRG', name: 'NRG Energy', sector: 'Utilities', industry: 'Independent Power', marketCap: '18' },
    { ticker: 'OXY', name: 'Occidental Petroleum', sector: 'Energy', industry: 'Oil & Gas', marketCap: '55' },
    { ticker: 'HES', name: 'Hess Corporation', sector: 'Energy', industry: 'Oil & Gas', marketCap: '45' },
    { ticker: 'DVN', name: 'Devon Energy', sector: 'Energy', industry: 'Oil & Gas', marketCap: '28' },
    { ticker: 'FANG', name: 'Diamondback Energy', sector: 'Energy', industry: 'Oil & Gas', marketCap: '32' },
    { ticker: 'PXD', name: 'Pioneer Natural Resources', sector: 'Energy', industry: 'Oil & Gas', marketCap: '55' },
    { ticker: 'VLO', name: 'Valero Energy', sector: 'Energy', industry: 'Refining', marketCap: '45' },
    { ticker: 'MPC', name: 'Marathon Petroleum', sector: 'Energy', industry: 'Refining', marketCap: '55' },
    { ticker: 'PSX', name: 'Phillips 66', sector: 'Energy', industry: 'Refining', marketCap: '52' },
    { ticker: 'BKR', name: 'Baker Hughes', sector: 'Energy', industry: 'Oil Services', marketCap: '35' },
    { ticker: 'HAL', name: 'Halliburton Company', sector: 'Energy', industry: 'Oil Services', marketCap: '28' },
    { ticker: 'NOV', name: 'NOV Inc.', sector: 'Energy', industry: 'Oil Equipment', marketCap: '8' },
    { ticker: 'CHD', name: 'Church & Dwight', sector: 'Consumer', industry: 'Household Products', marketCap: '25' },
    { ticker: 'CLX', name: 'Clorox Company', sector: 'Consumer', industry: 'Household Products', marketCap: '18' },
    { ticker: 'CL', name: 'Colgate-Palmolive', sector: 'Consumer', industry: 'Personal Products', marketCap: '75' },
    { ticker: 'EL', name: 'Estee Lauder', sector: 'Consumer', industry: 'Cosmetics', marketCap: '45' },
    { ticker: 'MNST', name: 'Monster Beverage', sector: 'Consumer', industry: 'Beverages', marketCap: '55' },
    { ticker: 'KDP', name: 'Keurig Dr Pepper', sector: 'Consumer', industry: 'Beverages', marketCap: '45' },
    { ticker: 'STZ', name: 'Constellation Brands', sector: 'Consumer', industry: 'Beverages', marketCap: '45' },
    { ticker: 'BF.B', name: 'Brown-Forman', sector: 'Consumer', industry: 'Beverages', marketCap: '22' },
    { ticker: 'HSY', name: 'Hershey Company', sector: 'Consumer', industry: 'Confectionery', marketCap: '45' },
    { ticker: 'K', name: 'Kellanova', sector: 'Consumer', industry: 'Packaged Foods', marketCap: '22' },
    { ticker: 'GIS', name: 'General Mills', sector: 'Consumer', industry: 'Packaged Foods', marketCap: '42' },
    { ticker: 'CPB', name: 'Campbell Soup', sector: 'Consumer', industry: 'Packaged Foods', marketCap: '15' },
    { ticker: 'SJM', name: 'JM Smucker', sector: 'Consumer', industry: 'Packaged Foods', marketCap: '15' },
    { ticker: 'HRL', name: 'Hormel Foods', sector: 'Consumer', industry: 'Packaged Foods', marketCap: '18' },
    { ticker: 'TSN', name: 'Tyson Foods', sector: 'Consumer', industry: 'Meat Products', marketCap: '22' },
    // Additional 100 stocks batch 3
    { ticker: 'LUMN', name: 'Lumen Technologies', sector: 'Telecom', industry: 'Telecom Services', marketCap: '5' },
    { ticker: 'ATVI', name: 'Activision Blizzard', sector: 'Media', industry: 'Video Games', marketCap: '75' },
    { ticker: 'CTSH', name: 'Cognizant Technology', sector: 'Technology', industry: 'IT Services', marketCap: '38' },
    { ticker: 'FISV', name: 'Fiserv Inc.', sector: 'Technology', industry: 'Fintech', marketCap: '85' },
    { ticker: 'FIS', name: 'Fidelity National', sector: 'Technology', industry: 'Fintech', marketCap: '42' },
    { ticker: 'GPN', name: 'Global Payments', sector: 'Finance', industry: 'Payments', marketCap: '28' },
    { ticker: 'PAYX', name: 'Paychex Inc.', sector: 'Technology', industry: 'HR Software', marketCap: '48' },
    { ticker: 'ADP', name: 'Automatic Data Processing', sector: 'Technology', industry: 'HR Software', marketCap: '105' },
    { ticker: 'CINF', name: 'Cincinnati Financial', sector: 'Finance', industry: 'Insurance', marketCap: '18' },
    { ticker: 'RE', name: 'Everest Re Group', sector: 'Finance', industry: 'Reinsurance', marketCap: '15' },
    { ticker: 'RNR', name: 'RenaissanceRe Holdings', sector: 'Finance', industry: 'Reinsurance', marketCap: '12' },
    { ticker: 'GNRC', name: 'Generac Holdings', sector: 'Industrials', industry: 'Electrical Equipment', marketCap: '10' },
    { ticker: 'PWR', name: 'Quanta Services', sector: 'Industrials', industry: 'Infrastructure', marketCap: '42' },
    { ticker: 'FAST', name: 'Fastenal Company', sector: 'Industrials', industry: 'Industrial Distribution', marketCap: '38' },
    { ticker: 'GWW', name: 'W.W. Grainger', sector: 'Industrials', industry: 'Industrial Distribution', marketCap: '48' },
    { ticker: 'MSM', name: 'MSC Industrial', sector: 'Industrials', industry: 'Industrial Distribution', marketCap: '5' },
    { ticker: 'POOL', name: 'Pool Corporation', sector: 'Consumer', industry: 'Pool Supplies', marketCap: '14' },
    { ticker: 'WSO', name: 'Watsco Inc.', sector: 'Industrials', industry: 'HVAC Distribution', marketCap: '18' },
    { ticker: 'ROP', name: 'Roper Technologies', sector: 'Technology', industry: 'Diversified Tech', marketCap: '55' },
    { ticker: 'FTV', name: 'Fortive Corporation', sector: 'Industrials', industry: 'Industrial Tech', marketCap: '28' },
    { ticker: 'IEX', name: 'IDEX Corporation', sector: 'Industrials', industry: 'Pumps & Valves', marketCap: '15' },
    { ticker: 'XYL', name: 'Xylem Inc.', sector: 'Industrials', industry: 'Water Equipment', marketCap: '28' },
    { ticker: 'DOV', name: 'Dover Corporation', sector: 'Industrials', industry: 'Industrial Machinery', marketCap: '22' },
    { ticker: 'ROK', name: 'Rockwell Automation', sector: 'Industrials', industry: 'Industrial Automation', marketCap: '32' },
    { ticker: 'AME', name: 'AMETEK Inc.', sector: 'Industrials', industry: 'Electronic Instruments', marketCap: '42' },
    { ticker: 'KEYS', name: 'Keysight Technologies', sector: 'Technology', industry: 'Test & Measurement', marketCap: '28' },
    { ticker: 'GRMN', name: 'Garmin Ltd.', sector: 'Technology', industry: 'GPS & Wearables', marketCap: '32' },
    { ticker: 'TRMB', name: 'Trimble Inc.', sector: 'Technology', industry: 'Positioning Tech', marketCap: '15' },
    { ticker: 'ZBRA', name: 'Zebra Technologies', sector: 'Technology', industry: 'Barcode & RFID', marketCap: '15' },
    { ticker: 'BR', name: 'Broadridge Financial', sector: 'Technology', industry: 'Financial Tech', marketCap: '22' },
    { ticker: 'JKHY', name: 'Jack Henry & Associates', sector: 'Technology', industry: 'Banking Software', marketCap: '12' },
    { ticker: 'EPAM', name: 'EPAM Systems', sector: 'Technology', industry: 'IT Services', marketCap: '15' },
    { ticker: 'IT', name: 'Gartner Inc.', sector: 'Technology', industry: 'IT Research', marketCap: '38' },
    { ticker: 'CSGP', name: 'CoStar Group', sector: 'Technology', industry: 'Real Estate Data', marketCap: '32' },
    { ticker: 'FICO', name: 'Fair Isaac Corporation', sector: 'Technology', industry: 'Credit Scoring', marketCap: '28' },
    { ticker: 'VRSK', name: 'Verisk Analytics', sector: 'Technology', industry: 'Data Analytics', marketCap: '38' },
    { ticker: 'TRU', name: 'TransUnion', sector: 'Finance', industry: 'Credit Bureau', marketCap: '15' },
    { ticker: 'EFX', name: 'Equifax Inc.', sector: 'Finance', industry: 'Credit Bureau', marketCap: '28' },
    { ticker: 'MCO', name: 'Moodys Corporation', sector: 'Finance', industry: 'Credit Rating', marketCap: '72' },
    { ticker: 'MSCI', name: 'MSCI Inc.', sector: 'Finance', industry: 'Index Provider', marketCap: '48' },
    { ticker: 'INFO', name: 'IHS Markit', sector: 'Finance', industry: 'Financial Data', marketCap: '45' },
    { ticker: 'FDS', name: 'FactSet Research', sector: 'Finance', industry: 'Financial Data', marketCap: '18' },
    { ticker: 'SEIC', name: 'SEI Investments', sector: 'Finance', industry: 'Asset Management', marketCap: '9' },
    { ticker: 'TROW', name: 'T. Rowe Price', sector: 'Finance', industry: 'Asset Management', marketCap: '28' },
    { ticker: 'IVZ', name: 'Invesco Ltd.', sector: 'Finance', industry: 'Asset Management', marketCap: '8' },
    { ticker: 'BEN', name: 'Franklin Resources', sector: 'Finance', industry: 'Asset Management', marketCap: '14' },
    { ticker: 'NTRS', name: 'Northern Trust', sector: 'Finance', industry: 'Custody Bank', marketCap: '18' },
    { ticker: 'STT', name: 'State Street', sector: 'Finance', industry: 'Custody Bank', marketCap: '25' },
    { ticker: 'BK', name: 'Bank of New York Mellon', sector: 'Finance', industry: 'Custody Bank', marketCap: '42' },
    { ticker: 'CFG', name: 'Citizens Financial', sector: 'Finance', industry: 'Regional Bank', marketCap: '18' },
    { ticker: 'RF', name: 'Regions Financial', sector: 'Finance', industry: 'Regional Bank', marketCap: '18' },
    { ticker: 'KEY', name: 'KeyCorp', sector: 'Finance', industry: 'Regional Bank', marketCap: '14' },
    { ticker: 'FITB', name: 'Fifth Third Bancorp', sector: 'Finance', industry: 'Regional Bank', marketCap: '25' },
    { ticker: 'HBAN', name: 'Huntington Bancshares', sector: 'Finance', industry: 'Regional Bank', marketCap: '22' },
    { ticker: 'MTB', name: 'M&T Bank', sector: 'Finance', industry: 'Regional Bank', marketCap: '28' },
    { ticker: 'CMA', name: 'Comerica Inc.', sector: 'Finance', industry: 'Regional Bank', marketCap: '8' },
    { ticker: 'ZION', name: 'Zions Bancorporation', sector: 'Finance', industry: 'Regional Bank', marketCap: '7' },
    { ticker: 'WAL', name: 'Western Alliance', sector: 'Finance', industry: 'Regional Bank', marketCap: '8' },
    { ticker: 'FRC', name: 'First Republic Bank', sector: 'Finance', industry: 'Regional Bank', marketCap: '25' },
    { ticker: 'SIVB', name: 'SVB Financial', sector: 'Finance', industry: 'Tech Banking', marketCap: '18' },
    { ticker: 'SBNY', name: 'Signature Bank', sector: 'Finance', industry: 'Banking', marketCap: '12' },
    { ticker: 'EWBC', name: 'East West Bancorp', sector: 'Finance', industry: 'Regional Bank', marketCap: '12' },
    { ticker: 'FHN', name: 'First Horizon', sector: 'Finance', industry: 'Regional Bank', marketCap: '10' },
    { ticker: 'PNC', name: 'PNC Financial', sector: 'Finance', industry: 'Regional Bank', marketCap: '68' },
    { ticker: 'USB', name: 'U.S. Bancorp', sector: 'Finance', industry: 'Regional Bank', marketCap: '62' },
    { ticker: 'TFC', name: 'Truist Financial', sector: 'Finance', industry: 'Regional Bank', marketCap: '52' },
    { ticker: 'CARR', name: 'Carrier Global', sector: 'Industrials', industry: 'HVAC', marketCap: '48' },
    { ticker: 'OTIS', name: 'Otis Worldwide', sector: 'Industrials', industry: 'Elevators', marketCap: '38' },
    { ticker: 'TT', name: 'Trane Technologies', sector: 'Industrials', industry: 'HVAC', marketCap: '55' },
    { ticker: 'JCI', name: 'Johnson Controls', sector: 'Industrials', industry: 'Building Tech', marketCap: '48' },
    { ticker: 'CNH', name: 'CNH Industrial', sector: 'Industrials', industry: 'Farm Equipment', marketCap: '18' },
    { ticker: 'AGCO', name: 'AGCO Corporation', sector: 'Industrials', industry: 'Farm Equipment', marketCap: '10' },
    { ticker: 'CF', name: 'CF Industries', sector: 'Materials', industry: 'Fertilizers', marketCap: '15' },
    { ticker: 'MOS', name: 'Mosaic Company', sector: 'Materials', industry: 'Fertilizers', marketCap: '12' },
    { ticker: 'NTR', name: 'Nutrien Ltd.', sector: 'Materials', industry: 'Fertilizers', marketCap: '35' },
    { ticker: 'FMC', name: 'FMC Corporation', sector: 'Materials', industry: 'Crop Chemicals', marketCap: '8' },
    { ticker: 'CTVA', name: 'Corteva Inc.', sector: 'Materials', industry: 'Agricultural', marketCap: '38' },
    { ticker: 'DD', name: 'DuPont de Nemours', sector: 'Materials', industry: 'Specialty Chemicals', marketCap: '35' },
    { ticker: 'EMN', name: 'Eastman Chemical', sector: 'Materials', industry: 'Specialty Chemicals', marketCap: '12' },
    { ticker: 'CE', name: 'Celanese Corporation', sector: 'Materials', industry: 'Chemicals', marketCap: '15' },
    { ticker: 'ALB', name: 'Albemarle Corporation', sector: 'Materials', industry: 'Lithium', marketCap: '18' },
    { ticker: 'SQM', name: 'Sociedad Quimica', sector: 'Materials', industry: 'Lithium', marketCap: '15' },
    { ticker: 'LAC', name: 'Lithium Americas', sector: 'Materials', industry: 'Lithium Mining', marketCap: '3' },
    { ticker: 'MP', name: 'MP Materials', sector: 'Materials', industry: 'Rare Earths', marketCap: '5' },
    { ticker: 'AA', name: 'Alcoa Corporation', sector: 'Materials', industry: 'Aluminum', marketCap: '8' },
    { ticker: 'NUE', name: 'Nucor Corporation', sector: 'Materials', industry: 'Steel', marketCap: '42' },
    { ticker: 'STLD', name: 'Steel Dynamics', sector: 'Materials', industry: 'Steel', marketCap: '18' },
    { ticker: 'CLF', name: 'Cleveland-Cliffs', sector: 'Materials', industry: 'Steel', marketCap: '10' },
    { ticker: 'X', name: 'United States Steel', sector: 'Materials', industry: 'Steel', marketCap: '8' },
    { ticker: 'RS', name: 'Reliance Steel', sector: 'Materials', industry: 'Steel Distribution', marketCap: '15' },
    { ticker: 'ATI', name: 'ATI Inc.', sector: 'Materials', industry: 'Specialty Metals', marketCap: '5' },
    { ticker: 'CMC', name: 'Commercial Metals', sector: 'Materials', industry: 'Steel', marketCap: '6' },
    { ticker: 'WOR', name: 'Worthington Industries', sector: 'Materials', industry: 'Steel Processing', marketCap: '3' },
    { ticker: 'PKG', name: 'Packaging Corp', sector: 'Materials', industry: 'Packaging', marketCap: '18' },
    { ticker: 'IP', name: 'International Paper', sector: 'Materials', industry: 'Paper & Packaging', marketCap: '15' },
    { ticker: 'WRK', name: 'WestRock Company', sector: 'Materials', industry: 'Packaging', marketCap: '10' },
    { ticker: 'SEE', name: 'Sealed Air', sector: 'Materials', industry: 'Packaging', marketCap: '8' },
    { ticker: 'BLL', name: 'Ball Corporation', sector: 'Materials', industry: 'Metal Packaging', marketCap: '18' },
    // Additional 100 stocks batch 4
    { ticker: 'CHRW', name: 'C.H. Robinson', sector: 'Industrials', industry: 'Logistics', marketCap: '12' },
    { ticker: 'EXPD', name: 'Expeditors International', sector: 'Industrials', industry: 'Freight', marketCap: '18' },
    { ticker: 'JBHT', name: 'J.B. Hunt Transport', sector: 'Industrials', industry: 'Trucking', marketCap: '18' },
    { ticker: 'ODFL', name: 'Old Dominion Freight', sector: 'Industrials', industry: 'Trucking', marketCap: '42' },
    { ticker: 'XPO', name: 'XPO Inc.', sector: 'Industrials', industry: 'Logistics', marketCap: '12' },
    { ticker: 'SAIA', name: 'Saia Inc.', sector: 'Industrials', industry: 'Trucking', marketCap: '12' },
    { ticker: 'LSTR', name: 'Landstar System', sector: 'Industrials', industry: 'Trucking', marketCap: '6' },
    { ticker: 'WERN', name: 'Werner Enterprises', sector: 'Industrials', industry: 'Trucking', marketCap: '3' },
    { ticker: 'KNX', name: 'Knight-Swift Transportation', sector: 'Industrials', industry: 'Trucking', marketCap: '8' },
    { ticker: 'SNDR', name: 'Schneider National', sector: 'Industrials', industry: 'Trucking', marketCap: '4' },
    { ticker: 'MATX', name: 'Matson Inc.', sector: 'Industrials', industry: 'Shipping', marketCap: '4' },
    { ticker: 'KEX', name: 'Kirby Corporation', sector: 'Industrials', industry: 'Marine Transport', marketCap: '6' },
    { ticker: 'ATSG', name: 'Air Transport Services', sector: 'Industrials', industry: 'Air Freight', marketCap: '2' },
    { ticker: 'ASGN', name: 'ASGN Incorporated', sector: 'Industrials', industry: 'Staffing', marketCap: '4' },
    { ticker: 'RHI', name: 'Robert Half', sector: 'Industrials', industry: 'Staffing', marketCap: '8' },
    { ticker: 'KELYA', name: 'Kelly Services', sector: 'Industrials', industry: 'Staffing', marketCap: '1' },
    { ticker: 'MAN', name: 'ManpowerGroup', sector: 'Industrials', industry: 'Staffing', marketCap: '4' },
    { ticker: 'HSII', name: 'Heidrick & Struggles', sector: 'Industrials', industry: 'Executive Search', marketCap: '1' },
    { ticker: 'KFY', name: 'Korn Ferry', sector: 'Industrials', industry: 'Executive Search', marketCap: '4' },
    { ticker: 'CTAS', name: 'Cintas Corporation', sector: 'Industrials', industry: 'Business Services', marketCap: '65' },
    { ticker: 'AOS', name: 'A.O. Smith', sector: 'Industrials', industry: 'Water Heaters', marketCap: '12' },
    { ticker: 'SWK', name: 'Stanley Black & Decker', sector: 'Industrials', industry: 'Tools', marketCap: '14' },
    { ticker: 'LEG', name: 'Leggett & Platt', sector: 'Consumer', industry: 'Furniture Components', marketCap: '2' },
    { ticker: 'MHK', name: 'Mohawk Industries', sector: 'Consumer', industry: 'Flooring', marketCap: '8' },
    { ticker: 'FND', name: 'Floor & Decor', sector: 'Consumer', industry: 'Flooring Retail', marketCap: '10' },
    { ticker: 'TILE', name: 'Interface Inc.', sector: 'Consumer', industry: 'Flooring', marketCap: '2' },
    { ticker: 'AWI', name: 'Armstrong World Industries', sector: 'Materials', industry: 'Building Products', marketCap: '6' },
    { ticker: 'OC', name: 'Owens Corning', sector: 'Materials', industry: 'Building Products', marketCap: '15' },
    { ticker: 'MLM', name: 'Martin Marietta', sector: 'Materials', industry: 'Aggregates', marketCap: '35' },
    { ticker: 'VMC', name: 'Vulcan Materials', sector: 'Materials', industry: 'Aggregates', marketCap: '32' },
    { ticker: 'SUM', name: 'Summit Materials', sector: 'Materials', industry: 'Aggregates', marketCap: '7' },
    { ticker: 'EXP', name: 'Eagle Materials', sector: 'Materials', industry: 'Building Materials', marketCap: '10' },
    { ticker: 'USG', name: 'USG Corporation', sector: 'Materials', industry: 'Building Products', marketCap: '7' },
    { ticker: 'JHX', name: 'James Hardie', sector: 'Materials', industry: 'Building Products', marketCap: '14' },
    { ticker: 'BLDR', name: 'Builders FirstSource', sector: 'Industrials', industry: 'Building Products', marketCap: '22' },
    { ticker: 'BLD', name: 'TopBuild Corp.', sector: 'Industrials', industry: 'Insulation', marketCap: '10' },
    { ticker: 'IBP', name: 'Installed Building Products', sector: 'Industrials', industry: 'Insulation', marketCap: '6' },
    { ticker: 'TREX', name: 'Trex Company', sector: 'Consumer', industry: 'Decking', marketCap: '8' },
    { ticker: 'AZEK', name: 'AZEK Company', sector: 'Materials', industry: 'Building Products', marketCap: '5' },
    { ticker: 'DOOR', name: 'Masonite International', sector: 'Industrials', industry: 'Doors', marketCap: '3' },
    { ticker: 'PGTI', name: 'PGT Innovations', sector: 'Industrials', industry: 'Windows', marketCap: '2' },
    { ticker: 'APOG', name: 'Apogee Enterprises', sector: 'Materials', industry: 'Glass', marketCap: '2' },
    { ticker: 'GMS', name: 'GMS Inc.', sector: 'Industrials', industry: 'Building Products Distribution', marketCap: '4' },
    { ticker: 'WSM', name: 'Williams-Sonoma', sector: 'Consumer', industry: 'Home Furnishings', marketCap: '18' },
    { ticker: 'RH', name: 'RH (Restoration Hardware)', sector: 'Consumer', industry: 'Home Furnishings', marketCap: '8' },
    { ticker: 'W', name: 'Wayfair Inc.', sector: 'Consumer', industry: 'E-Commerce', marketCap: '6' },
    { ticker: 'BURL', name: 'Burlington Stores', sector: 'Consumer', industry: 'Discount Retail', marketCap: '18' },
    { ticker: 'ROST', name: 'Ross Stores', sector: 'Consumer', industry: 'Discount Retail', marketCap: '52' },
    { ticker: 'TJX', name: 'TJX Companies', sector: 'Consumer', industry: 'Discount Retail', marketCap: '120' },
    { ticker: 'DLTR', name: 'Dollar Tree', sector: 'Consumer', industry: 'Discount Retail', marketCap: '32' },
    { ticker: 'DG', name: 'Dollar General', sector: 'Consumer', industry: 'Discount Retail', marketCap: '35' },
    { ticker: 'FIVE', name: 'Five Below', sector: 'Consumer', industry: 'Discount Retail', marketCap: '8' },
    { ticker: 'OLLI', name: 'Ollies Bargain Outlet', sector: 'Consumer', industry: 'Discount Retail', marketCap: '5' },
    { ticker: 'BIG', name: 'Big Lots', sector: 'Consumer', industry: 'Discount Retail', marketCap: '1' },
    { ticker: 'BBY', name: 'Best Buy', sector: 'Consumer', industry: 'Electronics Retail', marketCap: '18' },
    { ticker: 'GME', name: 'GameStop Corp.', sector: 'Consumer', industry: 'Gaming Retail', marketCap: '12' },
    { ticker: 'BBWI', name: 'Bath & Body Works', sector: 'Consumer', industry: 'Specialty Retail', marketCap: '8' },
    { ticker: 'ULTA', name: 'Ulta Beauty', sector: 'Consumer', industry: 'Beauty Retail', marketCap: '22' },
    { ticker: 'ELF', name: 'e.l.f. Beauty', sector: 'Consumer', industry: 'Cosmetics', marketCap: '8' },
    { ticker: 'COTY', name: 'Coty Inc.', sector: 'Consumer', industry: 'Cosmetics', marketCap: '10' },
    { ticker: 'IPAR', name: 'Inter Parfums', sector: 'Consumer', industry: 'Fragrances', marketCap: '5' },
    { ticker: 'REV', name: 'Revlon Inc.', sector: 'Consumer', industry: 'Cosmetics', marketCap: '1' },
    { ticker: 'NUS', name: 'Nu Skin Enterprises', sector: 'Consumer', industry: 'Personal Products', marketCap: '1' },
    { ticker: 'HAIN', name: 'Hain Celestial', sector: 'Consumer', industry: 'Natural Foods', marketCap: '1' },
    { ticker: 'BYND', name: 'Beyond Meat', sector: 'Consumer', industry: 'Plant-Based Foods', marketCap: '1' },
    { ticker: 'OTLY', name: 'Oatly Group', sector: 'Consumer', industry: 'Plant-Based Beverages', marketCap: '1' },
    { ticker: 'SFM', name: 'Sprouts Farmers Market', sector: 'Consumer', industry: 'Grocery', marketCap: '8' },
    { ticker: 'CASY', name: 'Caseys General Stores', sector: 'Consumer', industry: 'Convenience Stores', marketCap: '15' },
    { ticker: 'MUSA', name: 'Murphy USA', sector: 'Consumer', industry: 'Gas Stations', marketCap: '10' },
    { ticker: 'ARKO', name: 'ARKO Corp.', sector: 'Consumer', industry: 'Convenience Stores', marketCap: '1' },
    { ticker: 'GPT', name: 'Gramercy Property Trust', sector: 'Real Estate', industry: 'Industrial REITs', marketCap: '4' },
    { ticker: 'STAG', name: 'STAG Industrial', sector: 'Real Estate', industry: 'Industrial REITs', marketCap: '7' },
    { ticker: 'REXR', name: 'Rexford Industrial', sector: 'Real Estate', industry: 'Industrial REITs', marketCap: '12' },
    { ticker: 'FR', name: 'First Industrial Realty', sector: 'Real Estate', industry: 'Industrial REITs', marketCap: '8' },
    { ticker: 'EGP', name: 'EastGroup Properties', sector: 'Real Estate', industry: 'Industrial REITs', marketCap: '8' },
    { ticker: 'DRE', name: 'Duke Realty', sector: 'Real Estate', industry: 'Industrial REITs', marketCap: '25' },
    { ticker: 'TRNO', name: 'Terreno Realty', sector: 'Real Estate', industry: 'Industrial REITs', marketCap: '6' },
    { ticker: 'PSA', name: 'Public Storage', sector: 'Real Estate', industry: 'Storage REITs', marketCap: '55' },
    { ticker: 'EXR', name: 'Extra Space Storage', sector: 'Real Estate', industry: 'Storage REITs', marketCap: '35' },
    { ticker: 'CUBE', name: 'CubeSmart', sector: 'Real Estate', industry: 'Storage REITs', marketCap: '12' },
    { ticker: 'LSI', name: 'Life Storage', sector: 'Real Estate', industry: 'Storage REITs', marketCap: '12' },
    { ticker: 'NSA', name: 'National Storage Affiliates', sector: 'Real Estate', industry: 'Storage REITs', marketCap: '5' },
    { ticker: 'VTR', name: 'Ventas Inc.', sector: 'Real Estate', industry: 'Healthcare REITs', marketCap: '22' },
    { ticker: 'WELL', name: 'Welltower Inc.', sector: 'Real Estate', industry: 'Healthcare REITs', marketCap: '48' },
    { ticker: 'PEAK', name: 'Healthpeak Properties', sector: 'Real Estate', industry: 'Healthcare REITs', marketCap: '15' },
    { ticker: 'OHI', name: 'Omega Healthcare', sector: 'Real Estate', industry: 'Healthcare REITs', marketCap: '8' },
    { ticker: 'SBRA', name: 'Sabra Health Care', sector: 'Real Estate', industry: 'Healthcare REITs', marketCap: '4' },
    { ticker: 'HR', name: 'Healthcare Realty', sector: 'Real Estate', industry: 'Healthcare REITs', marketCap: '8' },
    { ticker: 'DOC', name: 'Physicians Realty', sector: 'Real Estate', industry: 'Healthcare REITs', marketCap: '4' },
    { ticker: 'MPW', name: 'Medical Properties Trust', sector: 'Real Estate', industry: 'Healthcare REITs', marketCap: '5' },
    { ticker: 'AVB', name: 'AvalonBay Communities', sector: 'Real Estate', industry: 'Residential REITs', marketCap: '32' },
    { ticker: 'EQR', name: 'Equity Residential', sector: 'Real Estate', industry: 'Residential REITs', marketCap: '28' },
    { ticker: 'ESS', name: 'Essex Property Trust', sector: 'Real Estate', industry: 'Residential REITs', marketCap: '18' },
    { ticker: 'UDR', name: 'UDR Inc.', sector: 'Real Estate', industry: 'Residential REITs', marketCap: '15' },
    { ticker: 'CPT', name: 'Camden Property Trust', sector: 'Real Estate', industry: 'Residential REITs', marketCap: '12' },
    { ticker: 'MAA', name: 'Mid-America Apartment', sector: 'Real Estate', industry: 'Residential REITs', marketCap: '18' },
    { ticker: 'AIV', name: 'Apartment Investment', sector: 'Real Estate', industry: 'Residential REITs', marketCap: '1' },
    // Additional 100 stocks batch 5
    { ticker: 'INVH', name: 'Invitation Homes', sector: 'Real Estate', industry: 'Residential REITs', marketCap: '22' },
    { ticker: 'AMH', name: 'American Homes 4 Rent', sector: 'Real Estate', industry: 'Residential REITs', marketCap: '14' },
    { ticker: 'SUI', name: 'Sun Communities', sector: 'Real Estate', industry: 'Manufactured Housing REITs', marketCap: '18' },
    { ticker: 'ELS', name: 'Equity LifeStyle Properties', sector: 'Real Estate', industry: 'Manufactured Housing REITs', marketCap: '14' },
    { ticker: 'NNN', name: 'NNN REIT', sector: 'Real Estate', industry: 'Net Lease REITs', marketCap: '8' },
    { ticker: 'O', name: 'Realty Income', sector: 'Real Estate', industry: 'Net Lease REITs', marketCap: '45' },
    { ticker: 'WPC', name: 'W.P. Carey', sector: 'Real Estate', industry: 'Net Lease REITs', marketCap: '14' },
    { ticker: 'STOR', name: 'STORE Capital', sector: 'Real Estate', industry: 'Net Lease REITs', marketCap: '10' },
    { ticker: 'EPRT', name: 'Essential Properties', sector: 'Real Estate', industry: 'Net Lease REITs', marketCap: '5' },
    { ticker: 'ADC', name: 'Agree Realty', sector: 'Real Estate', industry: 'Net Lease REITs', marketCap: '7' },
    { ticker: 'KIM', name: 'Kimco Realty', sector: 'Real Estate', industry: 'Retail REITs', marketCap: '14' },
    { ticker: 'REG', name: 'Regency Centers', sector: 'Real Estate', industry: 'Retail REITs', marketCap: '12' },
    { ticker: 'FRT', name: 'Federal Realty', sector: 'Real Estate', industry: 'Retail REITs', marketCap: '10' },
    { ticker: 'BRX', name: 'Brixmor Property', sector: 'Real Estate', industry: 'Retail REITs', marketCap: '6' },
    { ticker: 'ROIC', name: 'Retail Opportunity', sector: 'Real Estate', industry: 'Retail REITs', marketCap: '2' },
    { ticker: 'SITC', name: 'SITE Centers', sector: 'Real Estate', industry: 'Retail REITs', marketCap: '3' },
    { ticker: 'UE', name: 'Urban Edge Properties', sector: 'Real Estate', industry: 'Retail REITs', marketCap: '2' },
    { ticker: 'RPT', name: 'RPT Realty', sector: 'Real Estate', industry: 'Retail REITs', marketCap: '1' },
    { ticker: 'ARE', name: 'Alexandria Real Estate', sector: 'Real Estate', industry: 'Office REITs', marketCap: '22' },
    { ticker: 'BXP', name: 'Boston Properties', sector: 'Real Estate', industry: 'Office REITs', marketCap: '12' },
    { ticker: 'VNO', name: 'Vornado Realty', sector: 'Real Estate', industry: 'Office REITs', marketCap: '6' },
    { ticker: 'SLG', name: 'SL Green Realty', sector: 'Real Estate', industry: 'Office REITs', marketCap: '4' },
    { ticker: 'KRC', name: 'Kilroy Realty', sector: 'Real Estate', industry: 'Office REITs', marketCap: '5' },
    { ticker: 'DEI', name: 'Douglas Emmett', sector: 'Real Estate', industry: 'Office REITs', marketCap: '3' },
    { ticker: 'HIW', name: 'Highwoods Properties', sector: 'Real Estate', industry: 'Office REITs', marketCap: '3' },
    { ticker: 'CUZ', name: 'Cousins Properties', sector: 'Real Estate', industry: 'Office REITs', marketCap: '4' },
    { ticker: 'PDM', name: 'Piedmont Office Realty', sector: 'Real Estate', industry: 'Office REITs', marketCap: '1' },
    { ticker: 'OFC', name: 'Corporate Office Properties', sector: 'Real Estate', industry: 'Office REITs', marketCap: '3' },
    { ticker: 'DLR', name: 'Digital Realty', sector: 'Real Estate', industry: 'Data Center REITs', marketCap: '42' },
    { ticker: 'QTS', name: 'QTS Realty Trust', sector: 'Real Estate', industry: 'Data Center REITs', marketCap: '10' },
    { ticker: 'CONE', name: 'CyrusOne', sector: 'Real Estate', industry: 'Data Center REITs', marketCap: '12' },
    { ticker: 'SBAC', name: 'SBA Communications', sector: 'Real Estate', industry: 'Tower REITs', marketCap: '28' },
    { ticker: 'UNIT', name: 'Uniti Group', sector: 'Real Estate', industry: 'Fiber REITs', marketCap: '2' },
    { ticker: 'LUMN', name: 'Lumen Technologies', sector: 'Telecom', industry: 'Telecom Infrastructure', marketCap: '5' },
    { ticker: 'ETRN', name: 'Equitrans Midstream', sector: 'Energy', industry: 'Midstream', marketCap: '5' },
    { ticker: 'KMI', name: 'Kinder Morgan', sector: 'Energy', industry: 'Pipelines', marketCap: '42' },
    { ticker: 'WMB', name: 'Williams Companies', sector: 'Energy', industry: 'Pipelines', marketCap: '52' },
    { ticker: 'OKE', name: 'ONEOK Inc.', sector: 'Energy', industry: 'Midstream', marketCap: '55' },
    { ticker: 'EPD', name: 'Enterprise Products', sector: 'Energy', industry: 'Midstream', marketCap: '62' },
    { ticker: 'ET', name: 'Energy Transfer', sector: 'Energy', industry: 'Midstream', marketCap: '48' },
    { ticker: 'ENLC', name: 'EnLink Midstream', sector: 'Energy', industry: 'Midstream', marketCap: '6' },
    { ticker: 'DCP', name: 'DCP Midstream', sector: 'Energy', industry: 'Midstream', marketCap: '8' },
    { ticker: 'PSXP', name: 'Phillips 66 Partners', sector: 'Energy', industry: 'Midstream', marketCap: '10' },
    { ticker: 'GLP', name: 'Global Partners', sector: 'Energy', industry: 'Petroleum Distribution', marketCap: '1' },
    { ticker: 'SUN', name: 'Sunoco LP', sector: 'Energy', industry: 'Fuel Distribution', marketCap: '5' },
    { ticker: 'CAPL', name: 'CrossAmerica Partners', sector: 'Energy', industry: 'Fuel Distribution', marketCap: '1' },
    { ticker: 'NGL', name: 'NGL Energy Partners', sector: 'Energy', industry: 'Midstream', marketCap: '1' },
    { ticker: 'SPH', name: 'Suburban Propane', sector: 'Energy', industry: 'Propane', marketCap: '2' },
    { ticker: 'APU', name: 'AmeriGas Partners', sector: 'Energy', industry: 'Propane', marketCap: '4' },
    { ticker: 'FLO', name: 'Flowers Foods', sector: 'Consumer', industry: 'Packaged Foods', marketCap: '6' },
    { ticker: 'POST', name: 'Post Holdings', sector: 'Consumer', industry: 'Packaged Foods', marketCap: '6' },
    { ticker: 'BGS', name: 'B&G Foods', sector: 'Consumer', industry: 'Packaged Foods', marketCap: '1' },
    { ticker: 'SMPL', name: 'Simply Good Foods', sector: 'Consumer', industry: 'Packaged Foods', marketCap: '4' },
    { ticker: 'LANC', name: 'Lancaster Colony', sector: 'Consumer', industry: 'Packaged Foods', marketCap: '5' },
    { ticker: 'THS', name: 'TreeHouse Foods', sector: 'Consumer', industry: 'Private Label Foods', marketCap: '2' },
    { ticker: 'INGR', name: 'Ingredion Inc.', sector: 'Consumer', industry: 'Food Ingredients', marketCap: '8' },
    { ticker: 'DAR', name: 'Darling Ingredients', sector: 'Consumer', industry: 'Rendering', marketCap: '10' },
    { ticker: 'CALM', name: 'Cal-Maine Foods', sector: 'Consumer', industry: 'Eggs', marketCap: '4' },
    { ticker: 'PPC', name: 'Pilgrims Pride', sector: 'Consumer', industry: 'Poultry', marketCap: '8' },
    { ticker: 'SAFM', name: 'Sanderson Farms', sector: 'Consumer', industry: 'Poultry', marketCap: '4' },
    { ticker: 'BRFS', name: 'BRF S.A.', sector: 'Consumer', industry: 'Meat Products', marketCap: '4' },
    { ticker: 'FDP', name: 'Fresh Del Monte', sector: 'Consumer', industry: 'Fresh Produce', marketCap: '1' },
    { ticker: 'DOLE', name: 'Dole plc', sector: 'Consumer', industry: 'Fresh Produce', marketCap: '2' },
    { ticker: 'SYY', name: 'Sysco Corporation', sector: 'Consumer', industry: 'Food Distribution', marketCap: '42' },
    { ticker: 'USFD', name: 'US Foods Holding', sector: 'Consumer', industry: 'Food Distribution', marketCap: '12' },
    { ticker: 'PFGC', name: 'Performance Food', sector: 'Consumer', industry: 'Food Distribution', marketCap: '10' },
    { ticker: 'CHEF', name: 'Chefs Warehouse', sector: 'Consumer', industry: 'Food Distribution', marketCap: '2' },
    { ticker: 'SFG', name: 'Spruce Point', sector: 'Finance', industry: 'Investment Management', marketCap: '1' },
    { ticker: 'ALEX', name: 'Alexander & Baldwin', sector: 'Real Estate', industry: 'Diversified REITs', marketCap: '2' },
    { ticker: 'PLYM', name: 'Plymouth Industrial', sector: 'Real Estate', industry: 'Industrial REITs', marketCap: '1' },
    { ticker: 'INN', name: 'Summit Hotel Properties', sector: 'Real Estate', industry: 'Hotel REITs', marketCap: '1' },
    { ticker: 'RLJ', name: 'RLJ Lodging Trust', sector: 'Real Estate', industry: 'Hotel REITs', marketCap: '2' },
    { ticker: 'PK', name: 'Park Hotels & Resorts', sector: 'Real Estate', industry: 'Hotel REITs', marketCap: '4' },
    { ticker: 'HST', name: 'Host Hotels & Resorts', sector: 'Real Estate', industry: 'Hotel REITs', marketCap: '14' },
    { ticker: 'APLE', name: 'Apple Hospitality', sector: 'Real Estate', industry: 'Hotel REITs', marketCap: '4' },
    { ticker: 'SHO', name: 'Sunstone Hotel', sector: 'Real Estate', industry: 'Hotel REITs', marketCap: '2' },
    { ticker: 'PEB', name: 'Pebblebrook Hotel', sector: 'Real Estate', industry: 'Hotel REITs', marketCap: '3' },
    { ticker: 'XHR', name: 'Xenia Hotels', sector: 'Real Estate', industry: 'Hotel REITs', marketCap: '2' },
    { ticker: 'DRH', name: 'DiamondRock Hospitality', sector: 'Real Estate', industry: 'Hotel REITs', marketCap: '2' },
    { ticker: 'CLDT', name: 'Chatham Lodging', sector: 'Real Estate', industry: 'Hotel REITs', marketCap: '1' },
    { ticker: 'HT', name: 'Hersha Hospitality', sector: 'Real Estate', industry: 'Hotel REITs', marketCap: '1' },
    { ticker: 'AHT', name: 'Ashford Hospitality', sector: 'Real Estate', industry: 'Hotel REITs', marketCap: '0.5' },
    { ticker: 'SOHO', name: 'Sotherly Hotels', sector: 'Real Estate', industry: 'Hotel REITs', marketCap: '0.1' },
    { ticker: 'SKT', name: 'Tanger Factory Outlet', sector: 'Real Estate', industry: 'Outlet REITs', marketCap: '3' },
    { ticker: 'MAC', name: 'Macerich Company', sector: 'Real Estate', industry: 'Mall REITs', marketCap: '3' },
    { ticker: 'TCO', name: 'Taubman Centers', sector: 'Real Estate', industry: 'Mall REITs', marketCap: '5' },
    { ticker: 'PEI', name: 'Pennsylvania REIT', sector: 'Real Estate', industry: 'Mall REITs', marketCap: '0.2' },
    { ticker: 'WPG', name: 'Washington Prime', sector: 'Real Estate', industry: 'Mall REITs', marketCap: '0.1' },
    { ticker: 'CBL', name: 'CBL & Associates', sector: 'Real Estate', industry: 'Mall REITs', marketCap: '0.5' },
    { ticker: 'SRG', name: 'Seritage Growth', sector: 'Real Estate', industry: 'Retail REITs', marketCap: '0.2' },
    { ticker: 'GOOD', name: 'Gladstone Commercial', sector: 'Real Estate', industry: 'Industrial REITs', marketCap: '1' },
    { ticker: 'LXP', name: 'LXP Industrial Trust', sector: 'Real Estate', industry: 'Industrial REITs', marketCap: '3' },
    { ticker: 'IIPR', name: 'Innovative Industrial', sector: 'Real Estate', industry: 'Cannabis REITs', marketCap: '3' },
    { ticker: 'GTY', name: 'Getty Realty', sector: 'Real Estate', industry: 'Net Lease REITs', marketCap: '2' },
    { ticker: 'FCPT', name: 'Four Corners Property', sector: 'Real Estate', industry: 'Net Lease REITs', marketCap: '3' },
    { ticker: 'PINE', name: 'Alpine Income Property', sector: 'Real Estate', industry: 'Net Lease REITs', marketCap: '0.5' },
    { ticker: 'NTST', name: 'NETSTREIT', sector: 'Real Estate', industry: 'Net Lease REITs', marketCap: '1' },
    // Additional 100 stocks batch 6
    { ticker: 'VRNT', name: 'Verint Systems', sector: 'Technology', industry: 'Customer Engagement', marketCap: '3' },
    { ticker: 'NICE', name: 'NICE Ltd.', sector: 'Technology', industry: 'Customer Engagement', marketCap: '15' },
    { ticker: 'ORCL', name: 'Oracle Corporation', sector: 'Technology', industry: 'Enterprise Software', marketCap: '310' },
    { ticker: 'SAP', name: 'SAP SE', sector: 'Technology', industry: 'Enterprise Software', marketCap: '220' },
    { ticker: 'INFY', name: 'Infosys Limited', sector: 'Technology', industry: 'IT Services', marketCap: '75' },
    { ticker: 'WIT', name: 'Wipro Limited', sector: 'Technology', industry: 'IT Services', marketCap: '28' },
    { ticker: 'HCL', name: 'HCL Technologies', sector: 'Technology', industry: 'IT Services', marketCap: '42' },
    { ticker: 'TCS', name: 'Tata Consultancy', sector: 'Technology', industry: 'IT Services', marketCap: '155' },
    { ticker: 'GLOB', name: 'Globant S.A.', sector: 'Technology', industry: 'IT Services', marketCap: '10' },
    { ticker: 'EXLS', name: 'ExlService Holdings', sector: 'Technology', industry: 'BPO', marketCap: '5' },
    { ticker: 'GENPACT', name: 'Genpact Limited', sector: 'Technology', industry: 'BPO', marketCap: '7' },
    { ticker: 'TTEC', name: 'TTEC Holdings', sector: 'Technology', industry: 'Customer Experience', marketCap: '2' },
    { ticker: 'TASK', name: 'TaskUs Inc.', sector: 'Technology', industry: 'Outsourcing', marketCap: '3' },
    { ticker: 'CNXC', name: 'Concentrix Corp.', sector: 'Technology', industry: 'Customer Experience', marketCap: '8' },
    { ticker: 'TTEK', name: 'Tetra Tech Inc.', sector: 'Industrials', industry: 'Consulting', marketCap: '12' },
    { ticker: 'FTI', name: 'FTI Consulting', sector: 'Industrials', industry: 'Consulting', marketCap: '8' },
    { ticker: 'HURN', name: 'Huron Consulting', sector: 'Industrials', industry: 'Consulting', marketCap: '3' },
    { ticker: 'EXPO', name: 'Exponent Inc.', sector: 'Industrials', industry: 'Consulting', marketCap: '6' },
    { ticker: 'ICE', name: 'ICE', sector: 'Finance', industry: 'Financial Infrastructure', marketCap: '70' },
    { ticker: 'COIN', name: 'Coinbase Global', sector: 'Finance', industry: 'Cryptocurrency Exchange', marketCap: '45' },
    { ticker: 'MARA', name: 'Marathon Digital', sector: 'Technology', industry: 'Bitcoin Mining', marketCap: '5' },
    { ticker: 'RIOT', name: 'Riot Platforms', sector: 'Technology', industry: 'Bitcoin Mining', marketCap: '3' },
    { ticker: 'CLSK', name: 'CleanSpark Inc.', sector: 'Technology', industry: 'Bitcoin Mining', marketCap: '2' },
    { ticker: 'HUT', name: 'Hut 8 Mining', sector: 'Technology', industry: 'Bitcoin Mining', marketCap: '1' },
    { ticker: 'BITF', name: 'Bitfarms Ltd.', sector: 'Technology', industry: 'Bitcoin Mining', marketCap: '1' },
    { ticker: 'CIFR', name: 'Cipher Mining', sector: 'Technology', industry: 'Bitcoin Mining', marketCap: '1' },
    { ticker: 'IREN', name: 'Iris Energy', sector: 'Technology', industry: 'Bitcoin Mining', marketCap: '2' },
    { ticker: 'CORZ', name: 'Core Scientific', sector: 'Technology', industry: 'Bitcoin Mining', marketCap: '4' },
    { ticker: 'WULF', name: 'TeraWulf Inc.', sector: 'Technology', industry: 'Bitcoin Mining', marketCap: '1' },
    { ticker: 'ARBK', name: 'Argo Blockchain', sector: 'Technology', industry: 'Bitcoin Mining', marketCap: '0.5' },
    { ticker: 'SI', name: 'Silvergate Capital', sector: 'Finance', industry: 'Crypto Banking', marketCap: '1' },
    { ticker: 'MSTR', name: 'MicroStrategy', sector: 'Technology', industry: 'Business Intelligence', marketCap: '8' },
    { ticker: 'GBTC', name: 'Grayscale Bitcoin Trust', sector: 'Finance', industry: 'Crypto Investment', marketCap: '18' },
    { ticker: 'BITO', name: 'ProShares Bitcoin Strategy', sector: 'Finance', industry: 'Crypto ETF', marketCap: '1' },
    { ticker: 'ARKK', name: 'ARK Innovation ETF', sector: 'Finance', industry: 'Growth ETF', marketCap: '8' },
    { ticker: 'ARKW', name: 'ARK Next Generation', sector: 'Finance', industry: 'Tech ETF', marketCap: '2' },
    { ticker: 'ARKG', name: 'ARK Genomic Revolution', sector: 'Finance', industry: 'Healthcare ETF', marketCap: '2' },
    { ticker: 'ARKF', name: 'ARK Fintech Innovation', sector: 'Finance', industry: 'Fintech ETF', marketCap: '1' },
    { ticker: 'ARKQ', name: 'ARK Autonomous Tech', sector: 'Finance', industry: 'Robotics ETF', marketCap: '1' },
    { ticker: 'SPY', name: 'SPDR S&P 500 ETF', sector: 'Finance', industry: 'Index ETF', marketCap: '450' },
    { ticker: 'QQQ', name: 'Invesco QQQ Trust', sector: 'Finance', industry: 'Tech ETF', marketCap: '200' },
    { ticker: 'IWM', name: 'iShares Russell 2000', sector: 'Finance', industry: 'Small Cap ETF', marketCap: '65' },
    { ticker: 'DIA', name: 'SPDR Dow Jones ETF', sector: 'Finance', industry: 'Index ETF', marketCap: '32' },
    { ticker: 'XLF', name: 'Financial Select Sector', sector: 'Finance', industry: 'Sector ETF', marketCap: '38' },
    { ticker: 'XLK', name: 'Technology Select Sector', sector: 'Finance', industry: 'Sector ETF', marketCap: '55' },
    { ticker: 'XLE', name: 'Energy Select Sector', sector: 'Finance', industry: 'Sector ETF', marketCap: '35' },
    { ticker: 'XLV', name: 'Health Care Select', sector: 'Finance', industry: 'Sector ETF', marketCap: '42' },
    { ticker: 'XLI', name: 'Industrial Select', sector: 'Finance', industry: 'Sector ETF', marketCap: '18' },
    { ticker: 'XLY', name: 'Consumer Discretionary', sector: 'Finance', industry: 'Sector ETF', marketCap: '22' },
    { ticker: 'XLP', name: 'Consumer Staples', sector: 'Finance', industry: 'Sector ETF', marketCap: '18' },
    { ticker: 'XLU', name: 'Utilities Select', sector: 'Finance', industry: 'Sector ETF', marketCap: '15' },
    { ticker: 'XLB', name: 'Materials Select', sector: 'Finance', industry: 'Sector ETF', marketCap: '8' },
    { ticker: 'XLRE', name: 'Real Estate Select', sector: 'Finance', industry: 'Sector ETF', marketCap: '5' },
    { ticker: 'VIG', name: 'Vanguard Dividend Appreciation', sector: 'Finance', industry: 'Dividend ETF', marketCap: '75' },
    { ticker: 'VYM', name: 'Vanguard High Dividend', sector: 'Finance', industry: 'Dividend ETF', marketCap: '52' },
    { ticker: 'SCHD', name: 'Schwab US Dividend', sector: 'Finance', industry: 'Dividend ETF', marketCap: '48' },
    { ticker: 'DVY', name: 'iShares Select Dividend', sector: 'Finance', industry: 'Dividend ETF', marketCap: '22' },
    { ticker: 'HDV', name: 'iShares Core High Dividend', sector: 'Finance', industry: 'Dividend ETF', marketCap: '12' },
    { ticker: 'SPYD', name: 'SPDR Portfolio S&P 500 High Dividend', sector: 'Finance', industry: 'Dividend ETF', marketCap: '8' },
    { ticker: 'NOBL', name: 'ProShares S&P 500 Dividend Aristocrats', sector: 'Finance', industry: 'Dividend ETF', marketCap: '12' },
    { ticker: 'VTV', name: 'Vanguard Value ETF', sector: 'Finance', industry: 'Value ETF', marketCap: '105' },
    { ticker: 'VUG', name: 'Vanguard Growth ETF', sector: 'Finance', industry: 'Growth ETF', marketCap: '185' },
    { ticker: 'IVW', name: 'iShares S&P 500 Growth', sector: 'Finance', industry: 'Growth ETF', marketCap: '42' },
    { ticker: 'IVE', name: 'iShares S&P 500 Value', sector: 'Finance', industry: 'Value ETF', marketCap: '28' },
    { ticker: 'MTUM', name: 'iShares MSCI USA Momentum', sector: 'Finance', industry: 'Factor ETF', marketCap: '15' },
    { ticker: 'QUAL', name: 'iShares MSCI USA Quality', sector: 'Finance', industry: 'Factor ETF', marketCap: '38' },
    { ticker: 'VLUE', name: 'iShares MSCI USA Value', sector: 'Finance', industry: 'Factor ETF', marketCap: '8' },
    { ticker: 'SIZE', name: 'iShares MSCI USA Size', sector: 'Finance', industry: 'Factor ETF', marketCap: '1' },
    { ticker: 'USMV', name: 'iShares MSCI USA Min Vol', sector: 'Finance', industry: 'Low Vol ETF', marketCap: '32' },
    { ticker: 'SPLV', name: 'Invesco S&P 500 Low Volatility', sector: 'Finance', industry: 'Low Vol ETF', marketCap: '12' },
    { ticker: 'EEM', name: 'iShares MSCI Emerging Markets', sector: 'Finance', industry: 'International ETF', marketCap: '28' },
    { ticker: 'VWO', name: 'Vanguard FTSE Emerging Markets', sector: 'Finance', industry: 'International ETF', marketCap: '75' },
    { ticker: 'EFA', name: 'iShares MSCI EAFE', sector: 'Finance', industry: 'International ETF', marketCap: '55' },
    { ticker: 'VEA', name: 'Vanguard FTSE Developed Markets', sector: 'Finance', industry: 'International ETF', marketCap: '105' },
    { ticker: 'IEMG', name: 'iShares Core MSCI Emerging', sector: 'Finance', industry: 'International ETF', marketCap: '75' },
    { ticker: 'ACWI', name: 'iShares MSCI ACWI', sector: 'Finance', industry: 'Global ETF', marketCap: '18' },
    { ticker: 'VT', name: 'Vanguard Total World Stock', sector: 'Finance', industry: 'Global ETF', marketCap: '32' },
    { ticker: 'VXUS', name: 'Vanguard Total International', sector: 'Finance', industry: 'International ETF', marketCap: '62' },
    { ticker: 'FXI', name: 'iShares China Large-Cap', sector: 'Finance', industry: 'China ETF', marketCap: '5' },
    { ticker: 'MCHI', name: 'iShares MSCI China', sector: 'Finance', industry: 'China ETF', marketCap: '6' },
    { ticker: 'KWEB', name: 'KraneShares CSI China Internet', sector: 'Finance', industry: 'China Tech ETF', marketCap: '5' },
    { ticker: 'EWJ', name: 'iShares MSCI Japan', sector: 'Finance', industry: 'Japan ETF', marketCap: '15' },
    { ticker: 'EWG', name: 'iShares MSCI Germany', sector: 'Finance', industry: 'Germany ETF', marketCap: '3' },
    { ticker: 'EWU', name: 'iShares MSCI United Kingdom', sector: 'Finance', industry: 'UK ETF', marketCap: '3' },
    { ticker: 'EWY', name: 'iShares MSCI South Korea', sector: 'Finance', industry: 'Korea ETF', marketCap: '5' },
    { ticker: 'EWT', name: 'iShares MSCI Taiwan', sector: 'Finance', industry: 'Taiwan ETF', marketCap: '5' },
    { ticker: 'INDA', name: 'iShares MSCI India', sector: 'Finance', industry: 'India ETF', marketCap: '8' },
    { ticker: 'EWZ', name: 'iShares MSCI Brazil', sector: 'Finance', industry: 'Brazil ETF', marketCap: '5' },
    { ticker: 'EWW', name: 'iShares MSCI Mexico', sector: 'Finance', industry: 'Mexico ETF', marketCap: '2' },
    { ticker: 'RSX', name: 'VanEck Russia ETF', sector: 'Finance', industry: 'Russia ETF', marketCap: '1' },
    { ticker: 'GLD', name: 'SPDR Gold Shares', sector: 'Finance', industry: 'Gold ETF', marketCap: '58' },
    { ticker: 'IAU', name: 'iShares Gold Trust', sector: 'Finance', industry: 'Gold ETF', marketCap: '28' },
    { ticker: 'SLV', name: 'iShares Silver Trust', sector: 'Finance', industry: 'Silver ETF', marketCap: '12' },
    { ticker: 'GDX', name: 'VanEck Gold Miners ETF', sector: 'Finance', industry: 'Mining ETF', marketCap: '14' },
    { ticker: 'GDXJ', name: 'VanEck Junior Gold Miners', sector: 'Finance', industry: 'Mining ETF', marketCap: '5' },
    { ticker: 'USO', name: 'United States Oil Fund', sector: 'Finance', industry: 'Oil ETF', marketCap: '3' },
    { ticker: 'UNG', name: 'United States Natural Gas', sector: 'Finance', industry: 'Gas ETF', marketCap: '1' },
    { ticker: 'DBC', name: 'Invesco DB Commodity Index', sector: 'Finance', industry: 'Commodity ETF', marketCap: '3' }
];

// Combine all stocks
const ALL_STOCK_DATA = [...STOCK_DATA, ...STOCK_DATA_EXTENDED];

// Generate realistic stock metrics
function generateStockData(stockInfo) {
    const basePrice = 50 + Math.random() * 450;
    const change = (Math.random() - 0.5) * 10;
    const moat = 45 + Math.floor(Math.random() * 50);
    const roe = 8 + Math.floor(Math.random() * 30);
    const pe = 10 + Math.floor(Math.random() * 35);
    const zscore = 1.5 + Math.random() * 3;
    const sgr = 5 + Math.floor(Math.random() * 25);
    const eps = 1 + Math.random() * 15;
    const dividend = Math.random() * 4;
    const aiRating = 55 + Math.floor(Math.random() * 40);
    
    // Generate price history
    const history = [];
    let price = basePrice * 0.85;
    for (let i = 0; i < 20; i++) {
        price = price * (1 + (Math.random() - 0.48) * 0.03);
        history.push(Math.round(price * 100) / 100);
    }
    
    return {
        ...stockInfo,
        price: Math.round(basePrice * 100) / 100,
        change: Math.round(change * 100) / 100,
        volume: `${(Math.random() * 50 + 5).toFixed(1)}M`,
        moat,
        sgr,
        roe,
        roic: roe - 2 + Math.floor(Math.random() * 5),
        roa: Math.floor(roe * 0.6),
        eps: Math.round(eps * 100) / 100,
        pe,
        peg: Math.round((pe / sgr) * 100) / 100,
        fcf: Math.floor(Math.random() * 5000) + 500,
        eva: 40 + Math.floor(Math.random() * 50),
        zscore: Math.round(zscore * 100) / 100,
        dividend: Math.round(dividend * 100) / 100,
        beta: Math.round((0.7 + Math.random() * 0.8) * 100) / 100,
        aiRating,
        history
    };
}

export default function Markets() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stocks, setStocks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activePreset, setActivePreset] = useState('all');
    const [filters, setFilters] = useState({
        market: 'All Markets',
        sector: 'All Sectors',
        industry: 'All Industries',
        moat: 'Any',
        roe: 'Any',
        pe: 'Any',
        zscore: 'Any',
    });
    const [selectedStock, setSelectedStock] = useState(null);
    const [showStockModal, setShowStockModal] = useState(false);

    useEffect(() => {
        const handleResize = () => setSidebarOpen(window.innerWidth >= 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Generate all stocks immediately on mount
    useEffect(() => {
        const generatedStocks = ALL_STOCK_DATA.map(generateStockData);
        setStocks(generatedStocks);
    }, []);

    const refreshStocks = () => {
        const refreshedStocks = ALL_STOCK_DATA.map(generateStockData);
        setStocks(refreshedStocks);
    };

    const handleStockClick = (stock) => {
        setSelectedStock(stock);
        setShowStockModal(true);
    };

    const filteredStocks = useMemo(() => {
        let result = [...stocks];
        
        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s => 
                s.ticker?.toLowerCase().includes(q) || 
                s.name?.toLowerCase().includes(q) ||
                s.sector?.toLowerCase().includes(q)
            );
        }

        // Preset filters
        if (activePreset === 'wide-moats') {
            result = result.filter(s => s.moat >= 70);
        } else if (activePreset === 'undervalued') {
            result = result.filter(s => s.pe < 20);
        } else if (activePreset === 'high-growth') {
            result = result.filter(s => s.sgr >= 15);
        } else if (activePreset === 'top-movers') {
            result = result.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
        }

        // Dropdown filters
        if (filters.moat !== 'Any') {
            const min = parseInt(filters.moat);
            result = result.filter(s => s.moat >= min);
        }
        if (filters.roe !== 'Any') {
            const min = parseInt(filters.roe);
            result = result.filter(s => s.roe >= min);
        }
        if (filters.pe !== 'Any') {
            const max = parseInt(filters.pe.replace('<', ''));
            result = result.filter(s => s.pe < max);
        }
        if (filters.zscore !== 'Any') {
            const min = parseFloat(filters.zscore);
            result = result.filter(s => s.zscore >= min);
        }
        if (filters.sector !== 'All Sectors') {
            result = result.filter(s => s.sector === filters.sector);
        }

        return result;
    }, [stocks, searchQuery, activePreset, filters]);

    const topMovers = useMemo(() => {
        return [...stocks]
            .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
            .slice(0, 20);
    }, [stocks]);

    const sectors = useMemo(() => {
        const uniqueSectors = [...new Set(stocks.map(s => s.sector).filter(Boolean))];
        return ['All Sectors', ...uniqueSectors.sort()];
    }, [stocks]);

    const clearFilters = () => {
        setFilters({
            market: 'All Markets',
            sector: 'All Sectors',
            industry: 'All Industries',
            moat: 'Any',
            roe: 'Any',
            pe: 'Any',
            zscore: 'Any',
        });
        setActivePreset('all');
        setSearchQuery('');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="bg-white sticky top-0 z-40 border-b border-gray-200 shadow-sm h-[72px]">
                <div className="flex items-center justify-between px-4 h-full">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="hover:bg-gray-100 md:hidden">
                            <Menu className="w-5 h-5 text-purple-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="hover:bg-gray-100 hidden md:flex">
                            {sidebarOpen ? <ChevronLeft className="w-5 h-5 text-purple-600" /> : <Menu className="w-5 h-5 text-purple-600" />}
                        </Button>
                        <Link to={createPageUrl('Home')} className="flex items-center gap-3 hover:opacity-80">
                            <img src={LOGO_URL} alt="1cPublishing" className="h-10 w-10 object-contain" />
                            <div className="hidden sm:block">
                                <span className="text-xl font-bold text-gray-900">1cPublishing</span>
                                <p className="text-xs font-medium text-purple-600">Ai Markets</p>
                            </div>
                        </Link>
                    </div>

                    <div className="flex-1 max-w-md mx-4 md:mx-8">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search stocks..."
                                className="pl-12 h-12 rounded-full border-gray-200 focus:border-purple-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button onClick={refreshStocks} variant="outline" size="sm" className="gap-2">
                            <RefreshCw className="w-4 h-4" />
                            <span className="hidden md:inline">Refresh</span>
                        </Button>
                        <span className="text-sm text-gray-500 hidden md:block">{stocks.length} stocks</span>
                    </div>
                </div>

                <StockTicker stocks={topMovers} />
            </header>

            <div className="flex flex-1">
                {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

                <aside className={`${sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 flex-shrink-0 fixed md:relative z-50 md:z-auto h-[calc(100vh-120px)] md:h-auto`}>
                    <nav className="p-4 space-y-2">
                        {menuItems.map((item, index) => (
                            <Link key={index} to={item.href} onClick={() => window.innerWidth < 768 && setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${item.label === 'Markets' ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'}`}>
                                <item.icon className="w-5 h-5 text-purple-600" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </aside>

                <main className="flex-1 overflow-auto p-4 md:p-6">
                    {/* Preset Filters */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {PRESET_FILTERS.map(preset => (
                            <button
                                key={preset.id}
                                onClick={() => setActivePreset(preset.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                                    activePreset === preset.id
                                        ? 'bg-purple-600 text-white border-purple-600'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                                }`}
                            >
                                <preset.icon className="w-4 h-4" />
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    <FilterChips filters={filters} setFilters={setFilters} filterOptions={FILTER_OPTIONS} sectors={sectors} />

                    <div className="flex items-center justify-between mb-4 mt-6">
                        <p className="text-gray-600">
                            Showing <span className="font-bold text-gray-900">{filteredStocks.length}</span> of {stocks.length} stocks
                        </p>
                    </div>

                    {/* Stock Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredStocks.map((stock, i) => (
                            <StockCard key={stock.ticker || i} stock={stock} onClick={handleStockClick} />
                        ))}
                    </div>

                    {filteredStocks.length === 0 && (
                        <div className="text-center py-20">
                            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">No stocks match your current filters</p>
                            <Button onClick={clearFilters} variant="outline">
                                Clear All Filters
                            </Button>
                        </div>
                    )}
                </main>
            </div>

            <footer className="py-6 bg-white border-t border-gray-200">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <img src={LOGO_URL} alt="1cPublishing" className="h-8 w-8 object-contain grayscale" />
                        <nav className="flex flex-wrap justify-center gap-6 text-sm">
                            {footerLinks.map((link, i) => (
                                <a key={i} href={link.href} className="text-gray-600 hover:text-purple-600 transition-colors">{link.label}</a>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
                        © 2025 1cPublishing.com
                    </div>
                </div>
            </footer>

            <StockDetailModal 
                stock={selectedStock} 
                isOpen={showStockModal} 
                onClose={() => setShowStockModal(false)} 
            />
        </div>
    );
}