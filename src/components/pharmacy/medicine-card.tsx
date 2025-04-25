// src/components/pharmacy/medicine-card.tsx
import type { Medicine } from '@/services/pharmacy';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Package, Info, ShoppingCart } from 'lucide-react'; // Added ShoppingCart icon, removed DollarSign as we use ₹ directly
import { cn } from '@/lib/utils'; // Import cn

interface MedicineCardProps {
  medicine: Medicine;
  onAddToCart: (medicine: Medicine) => void; // Changed to Add to Cart for potential future cart implementation
}

export function MedicineCard({ medicine, onAddToCart }: MedicineCardProps) {
  return (
    <Card className={cn(
        "overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm", // Base styles
        "flex flex-col h-full", // Ensure flex layout for footer alignment
        "transition-all duration-300 ease-out hover:shadow-xl hover:scale-[1.02]" // Added transition and hover effects
    )}>
      <CardHeader className="p-0 relative h-40 w-full">
           <Image
            src={medicine.imageUrl || `https://picsum.photos/seed/${medicine.id}/300/200`} // Provide a default placeholder
            alt={medicine.name}
            layout="fill"
            objectFit="contain" // Use contain to show the whole image
            className="p-2 rounded-t-lg" // Add some padding around the image and round top corners
          />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-semibold mb-1">{medicine.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-2 flex items-center">
           <Info className="mr-1 h-4 w-4" /> {medicine.description}
        </CardDescription>
         <p className="text-sm text-muted-foreground mb-2 flex items-center">
          <Package className="mr-1 h-4 w-4" />
          Stock: {medicine.stock !== undefined ? (medicine.stock > 0 ? `${medicine.stock} available` : 'Out of Stock') : 'N/A'}
        </p>
        <p className="text-lg font-bold text-primary flex items-center">
           <span className="mr-1">₹</span> {medicine.price.toFixed(2)} {/* Changed $ to ₹ */}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button
            onClick={() => onAddToCart(medicine)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
            disabled={medicine.stock === 0} // Disable if out of stock
            aria-label={`Add ${medicine.name} to cart`}
        >
           <ShoppingCart className="mr-2 h-4 w-4" />
           {medicine.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
}
