// Enhanced WhatsApp Message Function
// Copy this function to replace the existing shareWhatsApp function in POS.jsx (around line 78)

const shareWhatsApp = (invoice) => {
    // Get customer name for personalization
    const custName = invoice.customer_name || customerName || 'Valued Customer';
    const firstName = custName.split(' ')[0]; // Extract first name for greeting

    // Format date and time nicely
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

    // Build detailed itemized list with numbering
    const itemsList = invoice.items?.map((item, index) =>
        `${index + 1}. ${item.item_name}\n   Qty: ${item.quantity} × $${item.unit_price.toFixed(2)} = $${(item.unit_price * item.quantity).toFixed(2)}`
    ).join('\n\n') || 'Items details not available';

    // Calculate subtotal and tax breakdown
    const subtotal = invoice.items?.reduce((sum, item) =>
        sum + (item.unit_price * item.quantity), 0
    ) || 0;
    const taxAmount = invoice.total_amount - subtotal;

    // Create personalized, professional message
    const message = `Hello ${firstName}! 👋

Thank you for shopping with us!

━━━━━━━━━━━━━━━━━━━━
📄 *INVOICE DETAILS*
━━━━━━━━━━━━━━━━━━━━

*Invoice #:* ${invoice.invoice_number}
*Date:* ${dateStr}
*Time:* ${timeStr}
*Customer:* ${custName}

━━━━━━━━━━━━━━━━━━━━
🛍️ *ITEMS PURCHASED*
━━━━━━━━━━━━━━━━━━━━

${itemsList}

━━━━━━━━━━━━━━━━━━━━
💰 *PAYMENT SUMMARY*
━━━━━━━━━━━━━━━━━━━━

Subtotal: $${subtotal.toFixed(2)}
Tax (10%): $${taxAmount.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━
*TOTAL PAID: $${invoice.total_amount.toFixed(2)}*
━━━━━━━━━━━━━━━━━━━━

Payment Method: ${invoice.payment_mode || 'Cash'}

✅ Payment received successfully!

We appreciate your business and look forward to serving you again! 😊

If you have any questions about this invoice, feel free to reply to this message.

Best regards,
*POS System Team*`;

    const phone = invoice.customer_phone || customerPhone;
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
};
