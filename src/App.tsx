const handlePrint = useCallback(() => {
  const confirmed = invoices.filter(i => i.status === 'confirmed' || i.status === 'done');
  if (confirmed.length === 0) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
    <head>
      <title>发票打印</title>
      <style>
        @page { 
          size: A4; 
          margin: 10mm;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: sans-serif; }
        .page { 
          width: 100%; 
          display: flex;
          flex-wrap: wrap;
          gap: 0;
        }
        .invoice { 
          width: 100%; 
          border: 2px dashed #999;
          page-break-inside: avoid;
          position: relative;
          background: white;
          padding: 10px;
          margin-bottom: 10px;
        }
        .invoice img { 
          width: 100%; 
          height: auto; 
          display: block;
        }
        .invoice .amount {
          position: absolute;
          bottom: 10px;
          right: 10px;
          color: red;
          font-weight: bold;
          font-size: 14px;
        }
        .invoice .date {
          position: absolute;
          bottom: 10px;
          left: 10px;
          color: #666;
          font-size: 11px;
        }
        @media print {
          .invoice { 
            page-break-after: always; 
            border: 2px dashed #999;
          }
        }
      </style>
    </head>
    <body>
  `);

  // 纵向排列：每列 perColumn 张，横向排列多列
  const cols = Math.ceil(confirmed.length / perColumn);
  
  for (let col = 0; col < cols; col++) {
    printWindow.document.write('<div class="page">');
    
    for (let row = 0; row < perColumn; row++) {
      const idx = col * perColumn + row;
      if (idx >= confirmed.length) break;
      
      const inv = confirmed[idx];
      printWindow.document.write(`
        <div class="invoice">
          <img src="${inv.preview}" alt="${inv.name}" />
          ${inv.amount ? `<div class="amount">¥${inv.amount.toFixed(2)}</div>` : ''}
          ${inv.date ? `<div class="date">${inv.date}</div>` : ''}
        </div>
      `);
    }
    
    printWindow.document.write('</div>');
  }

  printWindow.document.write('</body></html>');
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
  }, 500);
}, [invoices, perColumn]);
