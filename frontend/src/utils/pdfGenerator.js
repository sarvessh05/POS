import jsPDF from 'jspdf';

/**
 * Generate a professional invoice PDF
 * @param {Object} invoice - Invoice data
 * @returns {Blob} PDF blob
 */
export const generateInvoicePDF = (invoice) => {
    const doc = new jsPDF();

    // Set font
    doc.setFont('helvetica');

    // Header - Company Name
    doc.setFontSize(24);
    doc.setTextColor(79, 70, 229); // Indigo color
    doc.text('RECO POS', 105, 20, { align: 'center' });

    // Subtitle
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('by Ailexity', 105, 27, { align: 'center' });

    // Line separator
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(20, 32, 190, 32);

    // Invoice Title
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text('INVOICE', 20, 45);

    // Invoice Details Box
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);

    const invoiceDate = new Date(invoice.created_at);
    const dateStr = invoiceDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeStr = invoiceDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    doc.text(`Invoice #: ${invoice.invoice_number}`, 20, 55);
    doc.text(`Date: ${dateStr}`, 20, 62);
    doc.text(`Time: ${timeStr}`, 20, 69);

    // Customer Details
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('BILL TO:', 120, 45);

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(invoice.customer_name || 'Walk-in Customer', 120, 55);
    if (invoice.customer_phone) {
        doc.text(`Phone: ${invoice.customer_phone}`, 120, 62);
    }

    // Items Table Header
    let yPos = 85;
    doc.setFillColor(248, 250, 252);
    doc.rect(20, yPos, 170, 10, 'F');

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text('#', 25, yPos + 7);
    doc.text('ITEM', 35, yPos + 7);
    doc.text('QTY', 120, yPos + 7);
    doc.text('PRICE', 145, yPos + 7);
    doc.text('TOTAL', 170, yPos + 7);

    // Items
    yPos += 15;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);

    invoice.items?.forEach((item, index) => {
        const total = item.unit_price * item.quantity;

        doc.text(`${index + 1}`, 25, yPos);
        doc.text(item.item_name, 35, yPos);
        doc.text(`${item.quantity}`, 120, yPos);
        doc.text(`₹${item.unit_price.toFixed(2)}`, 145, yPos);
        doc.text(`₹${total.toFixed(2)}`, 170, yPos);

        yPos += 8;
    });

    // Summary Section - Enhanced Professional Design
    yPos += 15;

    // Create a professional summary box
    const summaryBoxX = 115;
    const summaryBoxY = yPos - 5;
    const summaryBoxWidth = 75;
    const summaryBoxHeight = 45;

    // Draw subtle background for summary box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(summaryBoxX, summaryBoxY, summaryBoxWidth, summaryBoxHeight, 2, 2, 'F');

    // Draw border for summary box
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(summaryBoxX, summaryBoxY, summaryBoxWidth, summaryBoxHeight, 2, 2, 'S');

    // Calculate amounts
    const subtotal = invoice.items?.reduce((sum, item) =>
        sum + (item.unit_price * item.quantity), 0
    ) || 0;
    const taxAmount = invoice.total_amount - subtotal;

    // Subtotal row
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Subtotal:', summaryBoxX + 5, yPos);
    doc.text(`₹${subtotal.toFixed(2)}`, summaryBoxX + summaryBoxWidth - 5, yPos, { align: 'right' });

    // Tax row
    yPos += 7;
    doc.text('Tax (10%):', summaryBoxX + 5, yPos);
    doc.text(`₹${taxAmount.toFixed(2)}`, summaryBoxX + summaryBoxWidth - 5, yPos, { align: 'right' });

    // Divider line before total
    yPos += 5;
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(1.5);
    doc.line(summaryBoxX + 5, yPos, summaryBoxX + summaryBoxWidth - 5, yPos);

    // Total row - Highlighted
    yPos += 8;

    // Add subtle highlight background for total
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(summaryBoxX + 3, yPos - 5, summaryBoxWidth - 6, 10, 1, 1, 'F');

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text('TOTAL:', summaryBoxX + 5, yPos);
    doc.setFontSize(14);
    doc.text(`₹${invoice.total_amount.toFixed(2)}`, summaryBoxX + summaryBoxWidth - 5, yPos, { align: 'right' });

    // Payment Method - Below the box
    yPos += 12;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Payment Method: ${invoice.payment_mode || 'Cash'}`, summaryBoxX + 5, yPos);

    // Payment status badge
    yPos += 6;
    doc.setFillColor(220, 252, 231);
    doc.setDrawColor(134, 239, 172);
    doc.roundedRect(summaryBoxX + 5, yPos - 4, 35, 6, 1, 1, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 163, 74);
    doc.text('✓ PAID', summaryBoxX + 7, yPos);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });
    doc.text('For any queries, please contact us.', 105, 285, { align: 'center' });

    return doc;
};

/**
 * Download invoice as PDF
 * @param {Object} invoice - Invoice data
 */
export const downloadInvoicePDF = (invoice) => {
    const doc = generateInvoicePDF(invoice);
    doc.save(`Invoice-${invoice.invoice_number}.pdf`);
};

/**
 * Get PDF as blob for sharing
 * @param {Object} invoice - Invoice data
 * @returns {Blob} PDF blob
 */
export const getInvoicePDFBlob = (invoice) => {
    const doc = generateInvoicePDF(invoice);
    return doc.output('blob');
};
