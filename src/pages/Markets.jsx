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
    { ticker: 'TTEK', name: 'Tetra Tech Inc.', sector: 'Industrials', industry: 'Engineering', marketCap: '12' }
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