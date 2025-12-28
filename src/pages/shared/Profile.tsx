import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Layout from '@/components/shared/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Save,
  User,
  Mail,
  Phone,
  Shield,
  Settings,
  Bell,
  Palette,
  ShoppingBag,
  DollarSign,
  Calendar,
  Camera,
  Lock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useTheme } from 'next-themes';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const USE_BACKEND = Boolean(API_BASE_URL && !API_BASE_URL.includes('localhost'));

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { orders } = useData();
  const { theme, setTheme: setThemeMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });
  const [preferences, setPreferences] = useState({
    theme: user?.preferences?.theme || 'system',
    notifications: {
      email: user?.preferences?.notifications?.email ?? true,
      push: user?.preferences?.notifications?.push ?? true,
      orderUpdates: user?.preferences?.notifications?.orderUpdates ?? true,
      promotions: user?.preferences?.notifications?.promotions ?? true,
    },
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
      });
      setPreferences({
        theme: user.preferences?.theme || 'system',
        notifications: {
          email: user.preferences?.notifications?.email ?? true,
          push: user.preferences?.notifications?.push ?? true,
          orderUpdates: user.preferences?.notifications?.orderUpdates ?? true,
          promotions: user.preferences?.notifications?.promotions ?? true,
        },
      });
    }
  }, [user]);

  // Calculate user statistics
  const userStats = {
    totalOrders: orders.filter(o => o.customerId === user?.id).length,
    totalSpent: orders
      .filter(o => o.customerId === user?.id && o.status === 'delivered')
      .reduce((sum, o) => sum + o.totalAmount, 0),
    pendingOrders: orders.filter(o => o.customerId === user?.id && o.status === 'pending').length,
    completedOrders: orders.filter(o => o.customerId === user?.id && o.status === 'delivered').length,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user) {
        toast.error('You must be logged in to update your profile');
        setIsLoading(false);
        return;
      }

      if (!formData.name.trim()) {
        toast.error('Name is required');
        setIsLoading(false);
        return;
      }

      // Create updated user object
      const updatedUser = {
        ...user,
        name: formData.name,
        phone: formData.phone || undefined,
        avatar: formData.avatar || undefined,
        preferences,
      };

      // If backend is available, try to sync
      if (USE_BACKEND) {
        const token = localStorage.getItem('bubt-auth-token');
        if (token) {
          try {
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: formData.name,
                phone: formData.phone || null,
                avatar: formData.avatar || null,
                preferences,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              Object.assign(updatedUser, data.user);
            }
          } catch (error) {
            console.warn('Backend sync failed, saving locally:', error);
          }
        }
      }

      // Save to localStorage
      localStorage.setItem('bubt-current-user', JSON.stringify(updatedUser));
      
      // Update context
      if (updateUser) {
        updateUser(updatedUser);
      }

      // Update theme if changed
      if (preferences.theme !== user?.preferences?.theme) {
        setThemeMode(preferences.theme);
      }

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, we'll use a URL input. In production, you'd upload to a storage service
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Layout title="My Profile">
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="statistics" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Statistics
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <User className="h-6 w-6" />
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Update your personal information and profile picture
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4 pb-6 border-b">
                      <Avatar className="h-32 w-32 border-4 border-blue-500">
                        <AvatarImage src={formData.avatar} alt={formData.name} />
                        <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {getInitials(formData.name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-center gap-2">
                        <Label htmlFor="avatar-upload" className="cursor-pointer">
                          <Button type="button" variant="outline" size="sm" asChild>
                            <span>
                              <Camera className="h-4 w-4 mr-2" />
                              Change Avatar
                            </span>
                          </Button>
                        </Label>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                        <p className="text-xs text-gray-500">Or enter image URL below</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter your full name"
                          required
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          disabled
                          className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500">Email cannot be changed</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Enter your phone number"
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="avatar-url" className="flex items-center gap-2">
                          <Camera className="h-4 w-4" />
                          Avatar URL (Optional)
                        </Label>
                        <Input
                          id="avatar-url"
                          type="url"
                          value={formData.avatar}
                          onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                          placeholder="https://example.com/avatar.jpg"
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Account Role
                        </Label>
                        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 capitalize">
                              {user?.role}
                            </p>
                            <Badge variant={user?.role === 'admin' ? 'default' : user?.role === 'staff' ? 'secondary' : 'outline'}>
                              {user?.role}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">Your role is managed by administrators</p>
                      </div>
                    </div>

                    <Separator />

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                    >
                      {isLoading ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Settings className="h-6 w-6" />
                    Preferences & Settings
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    Customize your experience and notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Theme Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Palette className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-semibold">Appearance</h3>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="theme">Theme Preference</Label>
                        <Select
                          value={preferences.theme}
                          onValueChange={(value: 'light' | 'dark' | 'system') => {
                            setPreferences({ ...preferences, theme: value });
                            setThemeMode(value);
                          }}
                        >
                          <SelectTrigger id="theme">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          Choose your preferred color theme
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Notification Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Bell className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-semibold">Notifications</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="email-notifications">Email Notifications</Label>
                            <p className="text-sm text-gray-500">Receive notifications via email</p>
                          </div>
                          <Switch
                            id="email-notifications"
                            checked={preferences.notifications.email}
                            onCheckedChange={(checked) =>
                              setPreferences({
                                ...preferences,
                                notifications: { ...preferences.notifications, email: checked },
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="push-notifications">Push Notifications</Label>
                            <p className="text-sm text-gray-500">Receive browser push notifications</p>
                          </div>
                          <Switch
                            id="push-notifications"
                            checked={preferences.notifications.push}
                            onCheckedChange={(checked) =>
                              setPreferences({
                                ...preferences,
                                notifications: { ...preferences.notifications, push: checked },
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="order-updates">Order Updates</Label>
                            <p className="text-sm text-gray-500">Get notified about order status changes</p>
                          </div>
                          <Switch
                            id="order-updates"
                            checked={preferences.notifications.orderUpdates}
                            onCheckedChange={(checked) =>
                              setPreferences({
                                ...preferences,
                                notifications: { ...preferences.notifications, orderUpdates: checked },
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="promotions">Promotions & Offers</Label>
                            <p className="text-sm text-gray-500">Receive updates about special offers</p>
                          </div>
                          <Switch
                            id="promotions"
                            checked={preferences.notifications.promotions}
                            onCheckedChange={(checked) =>
                              setPreferences({
                                ...preferences,
                                notifications: { ...preferences.notifications, promotions: checked },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                    >
                      {isLoading ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Preferences
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="statistics" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userStats.totalOrders}</div>
                    <p className="text-xs text-muted-foreground">All time orders</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">৳{userStats.totalSpent.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Lifetime spending</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userStats.pendingOrders}</div>
                    <p className="text-xs text-muted-foreground">In progress</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userStats.completedOrders}</div>
                    <p className="text-xs text-muted-foreground">Delivered orders</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Account Status</CardTitle>
                  <CardDescription>Your account information and status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Account Status</span>
                    <Badge variant={user?.isBlocked ? 'destructive' : 'default'} className="flex items-center gap-1">
                      {user?.isBlocked ? (
                        <>
                          <XCircle className="h-3 w-3" />
                          Blocked
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </>
                      )}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Member Since</span>
                    <span className="text-sm text-gray-500">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Account Role</span>
                    <Badge variant="outline" className="capitalize">
                      {user?.role}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Profile;
