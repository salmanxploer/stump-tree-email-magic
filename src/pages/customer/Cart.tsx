import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Layout from '@/components/shared/Layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { PaymentMethod } from '@/types';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, cartTotal, updateCartQuantity, removeFromCart, clearCart, addOrder } = useData();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const order = {
      customerId: user!.id,
      customerName: user!.name,
      items: cart.map(item => ({
        foodId: item.foodItem.id,
        foodName: item.foodItem.name,
        quantity: item.quantity,
        price: item.foodItem.price,
      })),
      totalAmount: cartTotal,
      status: 'pending' as const,
      paymentMethod,
      notes: notes || undefined,
    };

    const orderId = addOrder(order);
    clearCart();
    navigate(`/customer/orders/${orderId}`);
  };

  if (cart.length === 0) {
    return (
      <Layout title="Shopping Cart">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700">
            <CardContent className="py-16 text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-6"
              >
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Add some delicious items from our menu!</p>
              <Button 
                onClick={() => navigate('/customer/menu')}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700"
              >
                Browse Menu
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </Layout>
    );
  }

  return (
    <Layout title="Shopping Cart">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, index) => (
            <motion.div
              key={item.foodItem.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.foodItem.image}
                      alt={item.foodItem.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.foodItem.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {item.foodItem.description}
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        ৳{item.foodItem.price}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.foodItem.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateCartQuantity(item.foodItem.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateCartQuantity(item.foodItem.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-lg font-bold">
                        ৳{item.foodItem.price * item.quantity}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="sticky top-20 border-2 border-gradient-to-r from-blue-500 to-purple-500">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-850">
                <CardTitle className="text-xl">Order Summary</CardTitle>
              </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>৳{cartTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>৳0</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>৳{cartTotal}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash">Cash</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card">Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mobile" id="mobile" />
                    <Label htmlFor="mobile">Mobile Payment</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Special Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter>
              <motion.div 
                className="w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all"
                  onClick={handleCheckout}
                >
                  <span className="mr-2">🛒</span>
                  Place Order
                </Button>
              </motion.div>
            </CardFooter>
          </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
