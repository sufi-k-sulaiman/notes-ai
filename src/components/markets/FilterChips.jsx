import React from 'react';
import { ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function FilterChips({ filters, setFilters, filterOptions }) {
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="flex flex-wrap gap-2">
            {/* Market/Sector/Industry Dropdowns */}
            <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-full text-sm hover:border-gray-300">
                    {filters.market} <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {['All Markets', 'US', 'EU', 'Asia'].map(opt => (
                        <DropdownMenuItem key={opt} onClick={() => handleFilterChange('market', opt)}>
                            {opt}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-full text-sm hover:border-gray-300">
                    {filters.sector} <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {['All Sectors', 'Technology', 'Finance', 'Healthcare', 'Consumer', 'Energy'].map(opt => (
                        <DropdownMenuItem key={opt} onClick={() => handleFilterChange('sector', opt)}>
                            {opt}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-full text-sm hover:border-gray-300">
                    {filters.industry} <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {['All Industries', 'Software', 'Hardware', 'Banking', 'Retail', 'Pharma'].map(opt => (
                        <DropdownMenuItem key={opt} onClick={() => handleFilterChange('industry', opt)}>
                            {opt}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Metric Filters */}
            {Object.entries(filterOptions).map(([key, config]) => (
                <DropdownMenu key={key}>
                    <DropdownMenuTrigger className={`flex items-center gap-2 px-3 py-2 border rounded-full text-sm transition-colors ${
                        filters[key] !== 'Any' 
                            ? 'bg-purple-100 border-purple-300 text-purple-700' 
                            : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}>
                        {config.label}
                        {filters[key] !== 'Any' && <span className="font-medium">{filters[key]}</span>}
                        <ChevronDown className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {config.options.map(opt => (
                            <DropdownMenuItem 
                                key={opt} 
                                onClick={() => handleFilterChange(key, opt)}
                                className={filters[key] === opt ? 'bg-purple-50' : ''}
                            >
                                {opt}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            ))}
        </div>
    );
}