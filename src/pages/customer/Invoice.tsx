import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/shared/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Download, ArrowLeft, FileText, Printer } from 'lucide-react';
import { Invoice } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const InvoicePage = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { authToken } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceId || !authToken) return;
      try {
        const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.ok) {
          const data = await response.json();
          setInvoice(data.invoice);
        } else {
          navigate('/customer/orders');
        }
      } catch (error) {
        console.error('Failed to fetch invoice', error);
        navigate('/customer/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId, authToken, navigate]);

  const handlePrint = () => {
    window.print();
  };

  // Add print styles dynamically
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        @page {
          size: A4;
          margin: 1cm;
        }
        
        body * {
          visibility: hidden;
        }
        
        .print-area,
        .print-area * {
          visibility: visible;
        }
        
        .print-area {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: white;
          padding: 0;
          margin: 0;
        }
        
        .no-print {
          display: none !important;
        }
        
        .invoice-container {
          box-shadow: none;
          border: none;
          padding: 0;
          margin: 0;
        }
        
        .invoice-header {
          border-bottom: 4px solid #1e40af !important;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .invoice-table {
          border-collapse: collapse;
          width: 100%;
          page-break-inside: avoid;
        }
        
        .invoice-table th,
        .invoice-table td {
          border: 1px solid #e5e7eb;
          padding: 12px;
        }
        
        .invoice-table th {
          background-color: #f3f4f6 !important;
          font-weight: 600;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .invoice-summary {
          border-top: 4px solid #1e40af !important;
          padding-top: 20px;
          page-break-inside: avoid;
        }
        
        .bg-blue-50 {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .bg-yellow-50 {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (loading) {
    return (
      <Layout title="Invoice">
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-gray-500">Loading invoice...</p>
        </div>
      </Layout>
    );
  }

  if (!invoice) {
    return (
      <Layout title="Invoice">
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-gray-500">Invoice not found</p>
          <Button onClick={() => navigate('/customer/orders')} className="mt-4">
            Back to Orders
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Invoice">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between no-print">
          <Button variant="outline" onClick={() => navigate('/customer/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print Invoice
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Invoice Card - Print Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="print-area bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 md:p-12 invoice-container"
        >
          {/* Invoice Header */}
          <div className="invoice-header border-b-4 border-blue-600 pb-6 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">INVOICE</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Official Receipt</p>
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">BUBT Cafeteria</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Bangladesh University of Business & Technology</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Dhaka, Bangladesh</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Invoice Number</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{invoice.invoiceNumber}</p>
                  <Badge className={`mt-3 ${
                    invoice.status === 'paid' ? 'bg-green-500' :
                    invoice.status === 'pending' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}>
                    {invoice.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 tracking-wider">
                Bill To
              </h3>
              <p className="font-bold text-lg text-gray-900 dark:text-white mb-1">{invoice.customerName}</p>
              {invoice.customerEmail && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{invoice.customerEmail}</p>
              )}
              {invoice.customerPhone && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.customerPhone}</p>
              )}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 tracking-wider">
                Invoice Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Issued Date:</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {new Date(invoice.issuedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                {invoice.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Due Date:</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {new Date(invoice.dueDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Payment Method:</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                    {invoice.paymentMethod}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-10">
            <table className="invoice-table w-full">
              <thead>
                <tr className="bg-blue-50 dark:bg-blue-900/20">
                  <th className="text-left py-4 px-5 font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-center py-4 px-5 font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider w-24">
                    Qty
                  </th>
                  <th className="text-right py-4 px-5 font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider w-32">
                    Unit Price
                  </th>
                  <th className="text-right py-4 px-5 font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider w-32">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                  >
                    <td className="py-4 px-5">
                      <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                    </td>
                    <td className="py-4 px-5 text-center text-gray-700 dark:text-gray-300">
                      {item.quantity}
                    </td>
                    <td className="py-4 px-5 text-right text-gray-700 dark:text-gray-300">
                      ৳{item.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-4 px-5 text-right font-semibold text-gray-900 dark:text-white">
                      ৳{item.total.toFixed(2)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Invoice Summary */}
          <div className="invoice-summary border-t-4 border-blue-600 pt-6">
            <div className="flex justify-end">
              <div className="w-full md:w-80 space-y-3">
                <div className="flex justify-between text-base text-gray-700 dark:text-gray-300 py-1">
                  <span className="font-medium">Subtotal:</span>
                  <span className="font-semibold">৳{invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.tax > 0 && (
                  <div className="flex justify-between text-base text-gray-700 dark:text-gray-300 py-1">
                    <span className="font-medium">Tax (VAT):</span>
                    <span className="font-semibold">৳{invoice.tax.toFixed(2)}</span>
                  </div>
                )}
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-base text-gray-700 dark:text-gray-300 py-1">
                    <span className="font-medium">Discount:</span>
                    <span className="font-semibold text-green-600">-৳{invoice.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-2xl font-bold pt-4 mt-4 border-t-4 border-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-lg">
                  <span className="text-gray-900 dark:text-white">Total Amount:</span>
                  <span className="text-blue-600 dark:text-blue-400">৳{invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 tracking-wider">
                Additional Notes
              </h3>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-gray-700 dark:text-gray-300 italic">{invoice.notes}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Payment Information</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Payment Method: <span className="font-semibold capitalize">{invoice.paymentMethod}</span>
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Status: <span className="font-semibold uppercase">{invoice.status}</span>
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Terms & Conditions</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  This is a computer-generated invoice and does not require a signature.
                </p>
              </div>
            </div>
            <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Thank you for your business!
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                BUBT Cafeteria - Quality Food, Great Service
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                For inquiries, please contact: cafeteria@bubt.edu
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default InvoicePage;

