# PowerShell script to update the shareWhatsApp function in POS.jsx

$filePath = "frontend\src\pages\POS.jsx"
$content = Get-Content $filePath -Raw

# Define the new function
$newFunction = @'
    const shareWhatsApp = (invoice) => {
        // Get customer name for personalization
        const custName = invoice.customer_name || customerName || 'Valued Customer';
        const firstName = custName.split(' ')[0];
        
        // Format date and time
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
        
        // Build itemized list with numbering
        const itemsList = invoice.items?.map((item, index) => 
            `${index + 1}. ${item.item_name}\n   Qty: ${item.quantity} × $${item.unit_price.toFixed(2)} = $${(item.unit_price * item.quantity).toFixed(2)}`
        ).join('\n\n') || 'Items details not available';
        
        // Calculate subtotal and tax
        const subtotal = invoice.items?.reduce((sum, item) => 
            sum + (item.unit_price * item.quantity), 0
        ) || 0;
        const taxAmount = invoice.total_amount - subtotal;
        
        // Create personalized message
        const message = `Hello ${firstName}! 👋\n\nThank you for shopping with us!\n\n━━━━━━━━━━━━━━━━━━━━\n📄 *INVOICE DETAILS*\n━━━━━━━━━━━━━━━━━━━━\n\n*Invoice #:* ${invoice.invoice_number}\n*Date:* ${dateStr}\n*Time:* ${timeStr}\n*Customer:* ${custName}\n\n━━━━━━━━━━━━━━━━━━━━\n🛍️ *ITEMS PURCHASED*\n━━━━━━━━━━━━━━━━━━━━\n\n${itemsList}\n\n━━━━━━━━━━━━━━━━━━━━\n💰 *PAYMENT SUMMARY*\n━━━━━━━━━━━━━━━━━━━━\n\nSubtotal: $${subtotal.toFixed(2)}\nTax (10%): $${taxAmount.toFixed(2)}\n━━━━━━━━━━━━━━━━━━━━\n*TOTAL PAID: $${invoice.total_amount.toFixed(2)}*\n━━━━━━━━━━━━━━━━━━━━\n\nPayment Method: ${invoice.payment_mode || 'Cash'}\n\n✅ Payment received successfully!\n\nWe appreciate your business and look forward to serving you again! 😊\n\nIf you have any questions about this invoice, feel free to reply to this message.\n\nBest regards,\n*POS System Team*`;
        
        const phone = invoice.customer_phone || customerPhone;
        const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };
'@

# Use regex to find and replace the function
$pattern = '(?s)const shareWhatsApp = \(invoice\) => \{.*?\n    \};'
$newContent = $content -replace $pattern, $newFunction

# Write back to file
Set-Content -Path $filePath -Value $newContent -NoNewline

Write-Host "✅ Successfully updated shareWhatsApp function in POS.jsx"
Write-Host "The WhatsApp message is now personalized with customer name and detailed invoice breakdown."
