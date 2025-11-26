import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            type, 
            title, 
            data, 
            columns,
            company_name,
            company_address,
            invoice_number,
            invoice_date,
            due_date,
            items,
            subtotal,
            tax,
            total,
            notes
        } = await req.json();

        const doc = new jsPDF();

        switch (type) {
            case 'report':
                // Report Header
                doc.setFontSize(24);
                doc.text(title || 'Report', 20, 25);
                
                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);
                doc.text(`By: ${user.full_name || user.email}`, 20, 42);
                
                // Table headers
                if (columns && columns.length > 0) {
                    doc.setFontSize(11);
                    doc.setTextColor(0);
                    let x = 20;
                    const colWidth = (170) / columns.length;
                    
                    doc.setFillColor(240, 240, 240);
                    doc.rect(15, 50, 180, 10, 'F');
                    
                    columns.forEach((col, idx) => {
                        doc.text(col.label || col, x, 57);
                        x += colWidth;
                    });
                    
                    // Table data
                    let y = 67;
                    if (data && data.length > 0) {
                        doc.setFontSize(10);
                        data.forEach((row) => {
                            if (y > 270) {
                                doc.addPage();
                                y = 20;
                            }
                            x = 20;
                            columns.forEach((col) => {
                                const key = col.key || col;
                                const value = String(row[key] || '');
                                doc.text(value.substring(0, 25), x, y);
                                x += colWidth;
                            });
                            y += 8;
                        });
                    }
                }
                break;

            case 'invoice':
                // Company Header
                doc.setFontSize(22);
                doc.text(company_name || 'Company Name', 20, 25);
                
                doc.setFontSize(10);
                doc.setTextColor(100);
                if (company_address) {
                    doc.text(company_address, 20, 33);
                }
                
                // Invoice Title
                doc.setFontSize(28);
                doc.setTextColor(0);
                doc.text('INVOICE', 150, 25);
                
                // Invoice Details
                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text(`Invoice #: ${invoice_number || '---'}`, 150, 35);
                doc.text(`Date: ${invoice_date || new Date().toLocaleDateString()}`, 150, 42);
                doc.text(`Due: ${due_date || '---'}`, 150, 49);
                
                // Items Table Header
                doc.setFillColor(50, 50, 50);
                doc.rect(15, 70, 180, 10, 'F');
                doc.setTextColor(255);
                doc.setFontSize(10);
                doc.text('Description', 20, 77);
                doc.text('Qty', 110, 77);
                doc.text('Price', 135, 77);
                doc.text('Total', 165, 77);
                
                // Items
                doc.setTextColor(0);
                let itemY = 87;
                if (items && items.length > 0) {
                    items.forEach((item) => {
                        doc.text(String(item.description || ''), 20, itemY);
                        doc.text(String(item.quantity || 1), 110, itemY);
                        doc.text(`$${(item.price || 0).toFixed(2)}`, 135, itemY);
                        doc.text(`$${(item.total || (item.quantity * item.price) || 0).toFixed(2)}`, 165, itemY);
                        itemY += 8;
                    });
                }
                
                // Totals
                itemY += 10;
                doc.setDrawColor(200);
                doc.line(130, itemY, 195, itemY);
                itemY += 8;
                
                doc.text('Subtotal:', 135, itemY);
                doc.text(`$${(subtotal || 0).toFixed(2)}`, 165, itemY);
                itemY += 8;
                
                doc.text('Tax:', 135, itemY);
                doc.text(`$${(tax || 0).toFixed(2)}`, 165, itemY);
                itemY += 8;
                
                doc.setFontSize(12);
                doc.text('Total:', 135, itemY);
                doc.text(`$${(total || 0).toFixed(2)}`, 165, itemY);
                
                // Notes
                if (notes) {
                    itemY += 20;
                    doc.setFontSize(10);
                    doc.setTextColor(100);
                    doc.text('Notes:', 20, itemY);
                    doc.text(notes, 20, itemY + 7);
                }
                break;

            default:
                // Simple document
                doc.setFontSize(20);
                doc.text(title || 'Document', 20, 25);
                doc.setFontSize(12);
                if (typeof data === 'string') {
                    doc.text(data, 20, 40);
                }
        }

        const pdfBytes = doc.output('arraybuffer');

        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=${type || 'document'}.pdf`
            }
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});