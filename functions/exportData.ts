import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import * as XLSX from 'npm:xlsx';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { format, data, columns, filename = 'export', sheet_name = 'Sheet1' } = await req.json();

        if (!data || !Array.isArray(data)) {
            return Response.json({ error: 'Data must be an array' }, { status: 400 });
        }

        switch (format) {
            case 'csv':
                // Build CSV
                let csv = '';
                
                // Headers
                if (columns && columns.length > 0) {
                    csv += columns.map(c => `"${c.label || c.key || c}"`).join(',') + '\n';
                } else if (data.length > 0) {
                    csv += Object.keys(data[0]).map(k => `"${k}"`).join(',') + '\n';
                }
                
                // Rows
                data.forEach(row => {
                    const keys = columns ? columns.map(c => c.key || c) : Object.keys(row);
                    csv += keys.map(key => {
                        const val = row[key];
                        if (val === null || val === undefined) return '';
                        return `"${String(val).replace(/"/g, '""')}"`;
                    }).join(',') + '\n';
                });

                return new Response(csv, {
                    status: 200,
                    headers: {
                        'Content-Type': 'text/csv',
                        'Content-Disposition': `attachment; filename=${filename}.csv`
                    }
                });

            case 'excel':
            case 'xlsx':
                // Prepare data for Excel
                const excelData = [];
                
                // Headers
                if (columns && columns.length > 0) {
                    excelData.push(columns.map(c => c.label || c.key || c));
                } else if (data.length > 0) {
                    excelData.push(Object.keys(data[0]));
                }
                
                // Rows
                const keys = columns ? columns.map(c => c.key || c) : (data.length > 0 ? Object.keys(data[0]) : []);
                data.forEach(row => {
                    excelData.push(keys.map(key => row[key] ?? ''));
                });

                const ws = XLSX.utils.aoa_to_sheet(excelData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, sheet_name);

                const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

                return new Response(excelBuffer, {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'Content-Disposition': `attachment; filename=${filename}.xlsx`
                    }
                });

            case 'json':
                return new Response(JSON.stringify(data, null, 2), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Disposition': `attachment; filename=${filename}.json`
                    }
                });

            default:
                return Response.json({ error: 'Invalid format. Use: csv, excel, xlsx, or json' }, { status: 400 });
        }
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});