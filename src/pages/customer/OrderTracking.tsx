import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/shared/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Check, Clock, ChefHat, Package, CheckCircle, FileText } from 'lucide-react';
import { Invoice } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { orders } = useData();
  const { authToken } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  const order = orders.find(o => o.id === orderId);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!orderId || !authToken) return;
      setLoadingInvoice(true);
      try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/invoice`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.ok) {
          const data = await response.json();
          setInvoice(data.invoice);
        }
      } catch (error) {
        console.error('Failed to fetch invoice', error);
      } finally {
        setLoadingInvoice(false);
      }
    };

    if (order?.status === 'delivered') {
      fetchInvoice();
    }
  }, [orderId, order?.status, authToken]);

  useEffect(() => {
    if (!order) {
      navigate('/customer/orders');
    }
  }, [order, navigate]);

  if (!order) return null;

  const statusSteps = [
    { status: 'pending', label: 'Order Received', icon: Clock },
    { status: 'preparing', label: 'Preparing', icon: ChefHat },
    { status: 'ready', label: 'Ready for Pickup', icon: Package },
    { status: 'delivered', label: 'Delivered', icon: CheckCircle },
  ];

  const currentStepIndex = statusSteps.findIndex(step => step.status === order.status);

  return (
    <Layout title="Order Tracking">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Order Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Order #{order.id}</CardTitle>
              <Badge className={
                order.status === 'delivered' ? 'bg-green-500' :
                order.status === 'ready' ? 'bg-blue-500' :
                'bg-yellow-500'
              }>
                {order.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Order Time</p>
                <p className="font-semibold">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Payment Method</p>
                <p className="font-semibold capitalize">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Total Amount</p>
                <p className="font-semibold text-lg">৳{order.totalAmount}</p>
              </div>
              {order.notes && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Notes</p>
                  <p className="font-semibold">{order.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute top-8 left-8 right-8 h-1 bg-gray-200 dark:bg-gray-700">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="grid grid-cols-4 gap-4 relative">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index <= currentStepIndex;
                  return (
                    <motion.div
                      key={step.status}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex flex-col items-center"
                    >
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-all ${
                        isActive
                          ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                      }`}>
                        {isActive && index < currentStepIndex ? (
                          <Check className="h-8 w-8" />
                        ) : (
                          <Icon className="h-8 w-8" />
                        )}
                      </div>
                      <p className={`text-sm text-center font-medium ${
                        isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{item.foodName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold">৳{item.price * item.quantity}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Section */}
        {order.status === 'delivered' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingInvoice ? (
                <p className="text-center text-gray-500">Loading invoice...</p>
              ) : invoice ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Invoice Number</p>
                      <p className="font-semibold">{invoice.invoiceNumber}</p>
                    </div>
                    <Badge className={invoice.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}>
                      {invoice.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Issued Date</p>
                      <p className="font-semibold">{new Date(invoice.issuedAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Total Amount</p>
                      <p className="font-semibold text-lg">৳{invoice.total}</p>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                    onClick={() => navigate(`/customer/invoices/${invoice.id}`)}
                  >
                    View Full Invoice
                  </Button>
                </div>
              ) : (
                <p className="text-center text-gray-500">Invoice will be generated soon</p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/customer/orders')}
          >
            View All Orders
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
            onClick={() => navigate('/customer/menu')}
          >
            Order Again
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default OrderTracking;
