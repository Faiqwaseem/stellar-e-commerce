// Generate a branded PDF invoice for an order, server-side.
// Validates that the requester owns the order (or is admin), then streams a PDF.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { jsPDF } from 'https://esm.sh/jspdf@2.5.2';
import autoTable from 'https://esm.sh/jspdf-autotable@3.8.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const fmtPKR = (n: number) =>
  'PKR ' +
  Number(n || 0).toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const orderId = url.searchParams.get('order_id');
    if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) {
      return new Response(JSON.stringify({ error: 'Invalid order_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY') ??
        Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // RLS will scope this to the user (or admin)
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: items } = await supabase
      .from('order_items')
      .select('product_name, quantity, price')
      .eq('order_id', orderId);

    // ---------- PDF ----------
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 40;
    let y = margin;

    // Header bar
    doc.setFillColor(124, 58, 237); // primary purple
    doc.rect(0, 0, pageW, 80, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('MyStore', margin, 38);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Invoice / Receipt', margin, 58);

    doc.setFontSize(10);
    doc.text(
      `#${order.id.slice(0, 8).toUpperCase()}`,
      pageW - margin,
      38,
      { align: 'right' }
    );
    doc.text(fmtDate(order.created_at), pageW - margin, 58, {
      align: 'right',
    });

    y = 110;
    doc.setTextColor(20, 20, 20);

    // Status row
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Status:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${String(order.status).toUpperCase()}  ·  Payment: ${String(
        order.payment_status || 'pending'
      ).toUpperCase()}  ·  ${
        order.payment_method === 'cod'
          ? 'Cash on Delivery'
          : order.payment_method
      }`,
      margin + 50,
      y
    );
    y += 24;

    // Two-column block: Bill To | Tracking
    const colW = (pageW - margin * 2 - 20) / 2;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Bill To', margin, y);
    doc.text('Shipment', margin + colW + 20, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);

    const billLines = [
      order.shipping_address || '',
      order.shipping_city || '',
      `Phone: ${order.phone || '—'}`,
    ];
    billLines.forEach((line, i) => {
      doc.text(doc.splitTextToSize(line, colW), margin, y + 16 + i * 14);
    });

    const trackLines = [
      `Carrier: ${order.carrier || '—'}`,
      `Tracking #: ${order.tracking_number || '—'}`,
      order.tracking_url ? `URL: ${order.tracking_url}` : '',
    ].filter(Boolean);
    trackLines.forEach((line, i) => {
      doc.text(
        doc.splitTextToSize(line, colW),
        margin + colW + 20,
        y + 16 + i * 14
      );
    });

    y += 16 + Math.max(billLines.length, trackLines.length) * 14 + 12;

    // Items table
    const subtotal = (items || []).reduce(
      (s, it) => s + Number(it.price) * Number(it.quantity),
      0
    );
    const discount = Number(order.discount_amount) || 0;
    const total = Number(order.total_amount) || 0;
    const shipping = Math.max(total - subtotal + discount, 0);

    autoTable(doc, {
      startY: y,
      head: [['#', 'Item', 'Qty', 'Price', 'Total']],
      body: (items || []).map((it, i) => [
        String(i + 1),
        it.product_name,
        String(it.quantity),
        fmtPKR(Number(it.price)),
        fmtPKR(Number(it.price) * Number(it.quantity)),
      ]),
      theme: 'striped',
      headStyles: {
        fillColor: [124, 58, 237],
        textColor: 255,
        fontStyle: 'bold',
      },
      styles: { fontSize: 10, cellPadding: 6 },
      columnStyles: {
        0: { cellWidth: 30 },
        2: { cellWidth: 40, halign: 'center' },
        3: { cellWidth: 90, halign: 'right' },
        4: { cellWidth: 90, halign: 'right' },
      },
      margin: { left: margin, right: margin },
    });

    // @ts-ignore – autoTable attaches lastAutoTable
    let endY = (doc as any).lastAutoTable.finalY + 16;

    // Totals box (right aligned)
    const totalsX = pageW - margin - 200;
    const totalsW = 200;
    const drawRow = (label: string, value: string, bold = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(bold ? 12 : 10);
      doc.setTextColor(bold ? 20 : 80, bold ? 20 : 80, bold ? 20 : 80);
      doc.text(label, totalsX, endY);
      doc.text(value, totalsX + totalsW, endY, { align: 'right' });
      endY += bold ? 22 : 16;
    };

    drawRow('Subtotal', fmtPKR(subtotal));
    if (discount > 0) {
      drawRow(
        `Discount${order.coupon_code ? ` (${order.coupon_code})` : ''}`,
        '−' + fmtPKR(discount)
      );
    }
    drawRow('Shipping', shipping <= 0 ? 'Free' : fmtPKR(shipping));
    endY += 4;
    doc.setDrawColor(220, 220, 220);
    doc.line(totalsX, endY - 12, totalsX + totalsW, endY - 12);
    drawRow('Total', fmtPKR(total), true);

    // Footer
    const footY = doc.internal.pageSize.getHeight() - 40;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    doc.text(
      'Thank you for shopping with MyStore. For support, contact us via the website.',
      pageW / 2,
      footY,
      { align: 'center' }
    );
    doc.text(
      `Generated ${fmtDate(new Date().toISOString())}`,
      pageW / 2,
      footY + 14,
      { align: 'center' }
    );

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.id
          .slice(0, 8)
          .toUpperCase()}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('generate-invoice error:', err);
    return new Response(
      JSON.stringify({ error: (err as Error).message || 'Server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
