import React from 'react';
import { X, Printer, Download, CheckCircle2, Package } from 'lucide-react';
import { formatINR } from '../utils/format.js';

export default function InvoiceDialog({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modalBack invoiceBackdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modalBox invoiceModalBox" onClick={(e) => e.stopPropagation()}>
        <div className="modalHead noPrint">
          <div className="invoiceHeaderTitle">
            <Package size={20} />
            <h2>Order Tax Invoice & Receipt</h2>
          </div>
          <div className="invoiceHeaderActions">
            <button type="button" className="printBtn primary" onClick={handlePrint}>
              <Printer size={15} /> Print / Save PDF
            </button>
            <button className="iconClose" onClick={onClose} aria-label="Close invoice">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="printableInvoice" id="printable-invoice">
          {/* Invoice Header */}
          <div className="invoiceTop">
            <div className="invoiceBrand">
              <h1>KLOTH<span>.fashion</span><small>· BESPOKE & ARCHIVE</small></h1>
              <p>Kloth.fashion Lifestyle Private Limited</p>
              <p>Bandra West, Mumbai, MH 400050</p>
              <p>GSTIN: 27AABCU1234F1Z9 · support@kloth.fashion</p>
            </div>

            <div className="invoiceMeta">
              <div className="invoiceBadge">TAX INVOICE</div>
              <div className="metaItem">
                <span>Invoice No:</span>
                <strong>INV-{order.id ? order.id.slice(-8).toUpperCase() : '2026-001'}</strong>
              </div>
              <div className="metaItem">
                <span>Order Date:</span>
                <strong>{new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
              </div>
              <div className="metaItem">
                <span>Tracking ID:</span>
                <strong>{order.trackingNumber}</strong>
              </div>
              <div className="metaItem">
                <span>Carrier:</span>
                <strong>{order.carrier || 'Streetwear Express'}</strong>
              </div>
            </div>
          </div>

          <div className="invoiceDivider" />

          {/* Customer & Shipping Details */}
          <div className="invoiceAddresses">
            <div className="addressCol">
              <h4>Billed & Shipped To:</h4>
              <strong>{order.shippingAddress?.fullName || order.customerName}</strong>
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}</p>
              <p>Phone: {order.shippingAddress?.phone}</p>
              <p>Email: {order.customerEmail}</p>
            </div>
            <div className="addressCol paymentCol">
              <h4>Payment Summary:</h4>
              <p>Method: <b>{order.payment?.method || 'UPI'}</b></p>
              <p>Status: <b className="paidStatus">PAID IN FULL</b></p>
              <p>Txn ID: <code>{order.payment?.transactionId || 'TXN-ONLINE'}</code></p>
              <p>Order Status: <b>{order.status}</b></p>
            </div>
          </div>

          {/* Items Table */}
          <div className="tableWrap invoiceTableWrap">
            <table className="invoiceTable">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item Description</th>
                  <th>Size</th>
                  <th>Qty</th>
                  <th style={{ textAlign: 'right' }}>Unit Price</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((it, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <strong>{it.name}</strong>
                      {it.color && <small> · Color: {it.color}</small>}
                    </td>
                    <td>{it.size || 'M'}</td>
                    <td>{it.quantity}</td>
                    <td style={{ textAlign: 'right' }}>{formatINR(it.price)}</td>
                    <td style={{ textAlign: 'right' }}>{formatINR(it.price * it.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="invoiceTotalsWrap">
            <div className="invoiceNotes">
              <small>Thank you for shopping with Kloth.fashion.</small>
              <small>All items covered under our 7-day doorstep replacement and exchange policy.</small>
            </div>

            <div className="totalsTable">
              <div className="totalRow">
                <span>Subtotal:</span>
                <span>{formatINR(order.subtotal || order.total)}</span>
              </div>
              {order.discount > 0 && (
                <div className="totalRow discountRow">
                  <span>Discount ({order.promoCode || 'PROMO'}):</span>
                  <span>- {formatINR(order.discount)}</span>
                </div>
              )}
              <div className="totalRow">
                <span>Express Shipping:</span>
                <span>{order.shippingFee === 0 ? 'FREE' : formatINR(order.shippingFee || 0)}</span>
              </div>
              <div className="totalRow grandTotalRow">
                <span>Total Amount Paid:</span>
                <strong>{formatINR(order.total)}</strong>
              </div>
            </div>
          </div>

          <div className="invoiceFooter">
            <p>This is a computer-generated tax invoice. No signature required.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
