import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateOrderReceipt = (order) => {
  const doc = new jsPDF();
  
  // Set colors
  const primaryColor = [197, 151, 100]; // Gold color #C59764
  const darkColor = [51, 51, 51];
  const lightGray = [128, 128, 128];
  
  // Add header with company name
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('LA FACTORIA DEL ORO', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Order Receipt', 105, 30, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(...darkColor);
  
  // Order information
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ORDER INFORMATION', 14, 55);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const orderInfo = [
    ['Order Number:', order.orderNumber || order._id?.slice(-8).toUpperCase() || 'N/A'],
    ['Order Date:', new Date(order.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })],
    ['Payment Method:', (order.paymentInfo?.method === 'card' || order.paymentMethod === 'card') ? 'Credit/Debit Card' : 'Cash on Delivery'],
    ['Payment Status:', order.paymentStatus || 'Pending'],
    ['Order Status:', order.orderStatus || order.status || 'Pending']
  ];
  
  let yPos = 62;
  orderInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value || 'N/A'), 70, yPos);
    yPos += 7;
  });
  
  // Shipping address
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('SHIPPING ADDRESS', 14, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  yPos += 7;
  
  const shipping = order.shippingAddress || {};
  const shippingLines = [
    `${shipping.firstName || ''} ${shipping.lastName || ''}`.trim() || 'N/A',
    shipping.street || shipping.addressLine1 || 'N/A',
    `${shipping.city || ''}, ${shipping.state || ''} ${shipping.zipCode || ''}`.trim() || 'N/A',
    shipping.country || 'N/A',
    shipping.phone ? `Phone: ${shipping.phone}` : '',
    shipping.email ? `Email: ${shipping.email}` : ''
  ].filter(line => line); // Remove empty lines
  
  shippingLines.forEach(line => {
    if (line) {
      doc.text(line, 14, yPos);
      yPos += 6;
    }
  });
  
  // Billing address (if different)
  if (!order.useSameAddress && order.billingAddress) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('BILLING ADDRESS', 110, 97);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    let billingYPos = 104;
    
    const billing = order.billingAddress || {};
    const billingLines = [
      `${billing.firstName || ''} ${billing.lastName || ''}`.trim() || 'N/A',
      billing.street || billing.addressLine1 || 'N/A',
      `${billing.city || ''}, ${billing.state || ''} ${billing.zipCode || ''}`.trim() || 'N/A',
      billing.country || 'N/A'
    ].filter(line => line);
    
    billingLines.forEach(line => {
      if (line) {
        doc.text(line, 110, billingYPos);
        billingYPos += 6;
      }
    });
  }
  
  // Items table
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('ORDER ITEMS', 14, yPos);
  
  yPos += 5;
  
  const tableData = (order.items || []).map((item, index) => {
    const customizations = [];
    if (item.selectedSize) customizations.push(`Size: ${item.selectedSize}`);
    if (item.selectedColor) customizations.push(`Color: ${item.selectedColor}`);
    if (item.selectedWeight) customizations.push(`Weight: ${item.selectedWeight}g`);
    if (item.selectedPurity) customizations.push(`Purity: ${item.selectedPurity}`);
    if (item.variant) {
      if (item.variant.material) customizations.push(`Material: ${item.variant.material}`);
      if (item.variant.purity) customizations.push(`Purity: ${item.variant.purity}`);
      if (item.variant.weight) customizations.push(`Weight: ${item.variant.weight}g`);
    }
    
    return [
      index + 1,
      item.product?.name || 'Product',
      customizations.join(', ') || '-',
      item.quantity || 1,
      `$${(item.price || 0).toFixed(2)}`,
      `$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`
    ];
  });
  
  autoTable(doc, {
    startY: yPos,
    head: [['#', 'Product', 'Customization', 'Qty', 'Price', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 50 },
      2: { cellWidth: 50 },
      3: { cellWidth: 15 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 }
    },
    margin: { left: 14, right: 14 }
  });
  
  // Pricing summary
  const finalY = doc.lastAutoTable.finalY || yPos + 10;
  const summaryX = 130;
  let summaryY = finalY + 15;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const pricingDetails = [
    ['Subtotal:', `$${(order.pricing?.subtotal || 0).toFixed(2)}`],
    ['Shipping:', order.pricing?.shipping === 0 ? 'FREE' : `$${(order.pricing?.shipping || 0).toFixed(2)}`],
    ['Tax:', `$${(order.pricing?.tax || 0).toFixed(2)}`]
  ];
  
  if (order.pricing?.discount && order.pricing.discount > 0) {
    pricingDetails.push(['Discount:', `-$${order.pricing.discount.toFixed(2)}`]);
  }
  
  pricingDetails.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.text(label, summaryX, summaryY);
    doc.text(value, 195, summaryY, { align: 'right' });
    summaryY += 7;
  });
  
  // Total
  summaryY += 3;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(summaryX, summaryY - 5, 196, summaryY - 5);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total:', summaryX, summaryY);
  doc.text(`$${(order.pricing?.total || 0).toFixed(2)}`, 195, summaryY, { align: 'right' });
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightGray);
  doc.text('Thank you for your purchase!', 105, pageHeight - 20, { align: 'center' });
  doc.text('For questions about your order, please contact us at samitom11jewelry@gmail.com', 105, pageHeight - 15, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleDateString('en-US')}`, 105, pageHeight - 10, { align: 'center' });
  
  // Save the PDF
  const fileName = `Order-Receipt-${order.orderNumber || order._id?.slice(-8) || 'receipt'}.pdf`;
  doc.save(fileName);
};
