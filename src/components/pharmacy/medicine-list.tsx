// src/components/pharmacy/medicine-list.tsx
'use client';

import React, { useState, useEffect } from 'react';
import type { Medicine, OrderItem } from '@/services/pharmacy';
import { getAllMedicines, placeOrder } from '@/services/pharmacy'; // Import Firestore service functions
import { MedicineCard } from './medicine-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCcw, ShoppingCart, X } from 'lucide-react'; // Added ShoppingCart, X icons
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from '@/components/ui/sheet'; // Import Sheet components
import { Separator } from '../ui/separator';

interface CartItem extends OrderItem {
    imageUrl?: string; // To display image in cart
}

export function MedicineList() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth(); // Get user from auth context

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedMedicines = await getAllMedicines();
      setMedicines(fetchedMedicines);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch medicines. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleAddToCart = (medicine: Medicine) => {
     if (!user) {
        toast({
            title: 'Login Required',
            description: 'Please log in to add items to your cart.',
            variant: 'destructive',
        });
        return;
     }
     if (medicine.stock === 0) {
        toast({
            title: 'Out of Stock',
            description: `${medicine.name} is currently unavailable.`,
            variant: 'destructive',
        });
        return;
     }


    setCart(prevCart => {
        const existingItemIndex = prevCart.findIndex(item => item.medicineId === medicine.id);
        if (existingItemIndex > -1) {
            // Increase quantity if item already in cart
            const updatedCart = [...prevCart];
            const currentItem = updatedCart[existingItemIndex];
             if (currentItem.quantity < (medicine.stock ?? Infinity)) { // Check against stock
                updatedCart[existingItemIndex] = { ...currentItem, quantity: currentItem.quantity + 1 };
                toast({ title: 'Item Added', description: `${medicine.name} quantity updated in cart.` });
                return updatedCart;
            } else {
                toast({ title: 'Stock Limit Reached', description: `Cannot add more ${medicine.name} to cart.`, variant: 'destructive' });
                return prevCart; // Return previous cart if stock limit reached
            }
        } else {
            // Add new item to cart
            toast({ title: 'Item Added', description: `${medicine.name} added to cart.` });
            return [...prevCart, { medicineId: medicine.id, name: medicine.name, quantity: 1, price: medicine.price, imageUrl: medicine.imageUrl }];
        }
    });
  };

 const handleRemoveFromCart = (medicineId: string) => {
     setCart(prevCart => prevCart.filter(item => item.medicineId !== medicineId));
     toast({ title: 'Item Removed', description: `Item removed from cart.`, variant: 'destructive' });
 };

 const handleUpdateQuantity = (medicineId: string, quantity: number) => {
     setCart(prevCart => {
        const medicine = medicines.find(m => m.id === medicineId);
        const maxStock = medicine?.stock ?? Infinity;
        const newQuantity = Math.max(1, Math.min(quantity, maxStock)); // Ensure quantity is at least 1 and not more than stock

         if (newQuantity > maxStock && maxStock !== Infinity) {
             toast({ title: 'Stock Limit', description: `Only ${maxStock} units available.`, variant: 'destructive' });
         }

         return prevCart.map(item =>
             item.medicineId === medicineId ? { ...item, quantity: newQuantity } : item
         )
     });
 };

 const calculateTotal = () => {
     return cart.reduce((total, item) => total + item.price * item.quantity, 0);
 };


 const handlePlaceOrder = async () => {
    if (!user) {
        toast({ title: 'Login Required', description: 'Please log in to place an order.', variant: 'destructive' });
        return;
    }
    if (cart.length === 0) {
        toast({ title: 'Empty Cart', description: 'Cannot place an empty order.', variant: 'destructive' });
        return;
    }

    setIsPlacingOrder(true);
    const orderItems: OrderItem[] = cart.map(({ medicineId, name, quantity, price }) => ({ medicineId, name, quantity, price }));
    const totalAmount = calculateTotal();

    try {
        const orderId = await placeOrder(user, orderItems, totalAmount);
        toast({
            title: 'Order Placed!',
            description: `Your order (ID: ${orderId}) has been successfully placed.`,
            variant: 'default',
        });
        setCart([]); // Clear cart after successful order
        // Potentially close the cart sheet here if needed
    } catch (orderError: any) {
        console.error("Failed to place order:", orderError);
        toast({
            title: 'Order Failed',
            description: orderError.message || 'Could not place your order. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsPlacingOrder(false);
    }
 };


  if (loading) {
    return <MedicineListSkeleton />;
  }

  if (error) {
    return (
        <div className="text-center py-10">
           <Alert variant="destructive" className="max-w-md mx-auto mb-4">
             <AlertCircle className="h-4 w-4" />
             <AlertTitle>Error Loading Medicines</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
           </Alert>
           <Button onClick={fetchMedicines} variant="outline">
                <RefreshCcw className="mr-2 h-4 w-4" /> Retry
           </Button>
        </div>
    );
  }

   if (medicines.length === 0) {
       return (
         <div className="text-center py-10 text-muted-foreground">
            <p>No medicines available at the moment.</p>
             <Button onClick={fetchMedicines} variant="outline" className="mt-4">
                 <RefreshCcw className="mr-2 h-4 w-4" /> Check Again
             </Button>
         </div>
       );
   }


  return (
    <div>
        <div className="flex justify-end mb-4">
             <Sheet>
                <SheetTrigger asChild>
                     <Button variant="outline" className="relative">
                       <ShoppingCart className="mr-2 h-4 w-4" />
                       Cart
                       {cart.length > 0 && (
                           <Badge variant="destructive" className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs">
                             {cart.reduce((sum, item) => sum + item.quantity, 0)}
                           </Badge>
                       )}
                    </Button>
                </SheetTrigger>
                 <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
                    <SheetHeader>
                        <SheetTitle>Your Shopping Cart</SheetTitle>
                    </SheetHeader>
                    <Separator />
                    <div className="flex-grow overflow-y-auto pr-6 -mr-6"> {/* Add padding-right and negative margin-right */}
                       {cart.length === 0 ? (
                           <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                               <ShoppingCart className="h-16 w-16 mb-4" />
                               <p>Your cart is empty.</p>
                           </div>
                       ) : (
                           <div className="space-y-4 py-4">
                               {cart.map(item => (
                                   <div key={item.medicineId} className="flex items-center space-x-4">
                                        {item.imageUrl && (
                                            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-contain rounded border p-1" />
                                        )}
                                       <div className="flex-grow">
                                           <p className="font-medium">{item.name}</p>
                                           <p className="text-sm text-muted-foreground">Price: ${item.price.toFixed(2)}</p>
                                           <div className="flex items-center space-x-2 mt-1">
                                               <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleUpdateQuantity(item.medicineId, item.quantity - 1)} disabled={item.quantity <= 1}>-</Button>
                                               <span>{item.quantity}</span>
                                               <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleUpdateQuantity(item.medicineId, item.quantity + 1)}>+</Button>
                                           </div>
                                       </div>
                                       <div className="text-right">
                                           <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 mt-1 text-destructive hover:text-destructive" onClick={() => handleRemoveFromCart(item.medicineId)}>
                                               <X className="h-4 w-4" />
                                           </Button>
                                       </div>
                                   </div>
                               ))}
                           </div>
                       )}
                    </div>
                     {cart.length > 0 && (
                         <>
                            <Separator />
                            <SheetFooter className="mt-auto pt-4">
                                <div className="flex justify-between w-full font-semibold text-lg mb-4">
                                   <span>Total:</span>
                                   <span>${calculateTotal().toFixed(2)}</span>
                               </div>
                                <Button
                                    className="w-full bg-primary hover:bg-primary/90"
                                    onClick={handlePlaceOrder}
                                    disabled={isPlacingOrder}
                                >
                                    {isPlacingOrder ? 'Placing Order...' : 'Proceed to Checkout'}
                                </Button>
                            </SheetFooter>
                         </>
                     )}
                </SheetContent>
             </Sheet>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {medicines.map(medicine => (
            <MedicineCard key={medicine.id} medicine={medicine} onAddToCart={handleAddToCart} />
        ))}
        </div>
    </div>
  );
}


// Skeleton Component for Loading State
function MedicineListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col h-full">
          <CardHeader className="p-0 relative h-40 w-full">
            <Skeleton className="h-full w-full" />
          </CardHeader>
          <CardContent className="p-4 flex-grow space-y-2">
            <Skeleton className="h-6 w-3/4" /> {/* Title */}
            <Skeleton className="h-4 w-full" /> {/* Description */}
            <Skeleton className="h-4 w-1/2" /> {/* Stock */}
            <Skeleton className="h-6 w-1/3" /> {/* Price */}
          </CardContent>
          <CardFooter className="p-4 pt-0 mt-auto">
            <Skeleton className="h-10 w-full" /> {/* Button */}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

// Basic Card components for Skeleton (if not globally available/imported)
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("border rounded-lg shadow-sm bg-card text-card-foreground", className)}>
    {children}
  </div>
);
const CardHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("", className)}>{children}</div>
);
const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("p-6 pt-0", className)}>{children}</div>
);
const CardFooter = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("flex items-center p-6 pt-0", className)}>{children}</div>
);
// --- End Basic Card Components ---
