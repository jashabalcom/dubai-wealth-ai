import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface AddPropertyDialogProps {
  onSubmit: (property: {
    property_name: string;
    location_area: string;
    property_type: string;
    purchase_price: number;
    current_value: number;
    purchase_date: string;
    monthly_rental_income: number;
    monthly_expenses: number;
    mortgage_balance: number;
    notes: string | null;
  }) => void;
  isSubmitting: boolean;
}

const LOCATIONS = [
  'Downtown Dubai',
  'Dubai Marina',
  'Palm Jumeirah',
  'Business Bay',
  'JVC',
  'Dubai Hills',
  'Arabian Ranches',
  'DIFC',
  'JBR',
  'Other',
];

const PROPERTY_TYPES = ['apartment', 'villa', 'townhouse', 'penthouse', 'studio'];

export function AddPropertyDialog({ onSubmit, isSubmitting }: AddPropertyDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    property_name: '',
    location_area: '',
    property_type: 'apartment',
    purchase_price: '',
    current_value: '',
    purchase_date: '',
    monthly_rental_income: '',
    monthly_expenses: '',
    mortgage_balance: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      property_name: formData.property_name,
      location_area: formData.location_area,
      property_type: formData.property_type,
      purchase_price: Number(formData.purchase_price),
      current_value: Number(formData.current_value),
      purchase_date: formData.purchase_date,
      monthly_rental_income: Number(formData.monthly_rental_income) || 0,
      monthly_expenses: Number(formData.monthly_expenses) || 0,
      mortgage_balance: Number(formData.mortgage_balance) || 0,
      notes: formData.notes || null,
    });
    setFormData({
      property_name: '',
      location_area: '',
      property_type: 'apartment',
      purchase_price: '',
      current_value: '',
      purchase_date: '',
      monthly_rental_income: '',
      monthly_expenses: '',
      mortgage_balance: '',
      notes: '',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gold hover:bg-gold/90 text-background">
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Property to Portfolio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="property_name">Property Name</Label>
              <Input
                id="property_name"
                value={formData.property_name}
                onChange={(e) => setFormData({ ...formData, property_name: e.target.value })}
                placeholder="e.g., Marina View Tower 2BR"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_area">Location</Label>
              <Select
                value={formData.location_area}
                onValueChange={(value) => setFormData({ ...formData, location_area: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_type">Property Type</Label>
              <Select
                value={formData.property_type}
                onValueChange={(value) => setFormData({ ...formData, property_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_price">Purchase Price (AED)</Label>
              <Input
                id="purchase_price"
                type="number"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                placeholder="1,500,000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_value">Current Value (AED)</Label>
              <Input
                id="current_value"
                type="number"
                value={formData.current_value}
                onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                placeholder="1,750,000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mortgage_balance">Mortgage Balance (AED)</Label>
              <Input
                id="mortgage_balance"
                type="number"
                value={formData.mortgage_balance}
                onChange={(e) => setFormData({ ...formData, mortgage_balance: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_rental_income">Monthly Rental Income (AED)</Label>
              <Input
                id="monthly_rental_income"
                type="number"
                value={formData.monthly_rental_income}
                onChange={(e) => setFormData({ ...formData, monthly_rental_income: e.target.value })}
                placeholder="8,000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_expenses">Monthly Expenses (AED)</Label>
              <Input
                id="monthly_expenses"
                type="number"
                value={formData.monthly_expenses}
                onChange={(e) => setFormData({ ...formData, monthly_expenses: e.target.value })}
                placeholder="1,500"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes about this property..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.property_name || !formData.location_area || !formData.purchase_price || !formData.current_value || !formData.purchase_date || isSubmitting}
              className="bg-gold hover:bg-gold/90 text-background"
            >
              {isSubmitting ? 'Adding...' : 'Add Property'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
