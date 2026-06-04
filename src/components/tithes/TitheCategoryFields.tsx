import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TitheCurrency, TithePaymentMethod } from './AddTitheDialog';

type CategoryFields = {
  amount: string;
  paymentMethod: TithePaymentMethod;
  transferNumber: string;
};

interface TitheCategoryFieldsProps {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: TitheCurrency;
  amountId: string;
  methodId: string;
  transferId: string;
  fields: CategoryFields;
  onChange: (fields: CategoryFields) => void;
}

export function TitheCategoryFields({
  title,
  open,
  onOpenChange,
  currency,
  amountId,
  methodId,
  transferId,
  fields,
  onChange,
}: TitheCategoryFieldsProps) {
  const symbol = currency === 'USD' ? '$' : 'Q';

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="border border-border rounded-lg">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 rounded-t-lg transition-colors">
        <span className="font-semibold text-foreground">{title}</span>
        <ChevronDown
          className={cn('h-5 w-5 text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3 space-y-3">
        <div className="space-y-2">
          <Label htmlFor={amountId}>Monto {title}</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              {symbol}
            </span>
            <Input
              id={amountId}
              type="number"
              min="0"
              step="0.01"
              value={fields.amount}
              onChange={(e) => onChange({ ...fields, amount: e.target.value })}
              placeholder="0.00"
              className="pl-8"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={methodId}>Forma ({title})</Label>
          <Select
            value={fields.paymentMethod}
            onValueChange={(value: TithePaymentMethod) =>
              onChange({ ...fields, paymentMethod: value })
            }
          >
            <SelectTrigger id={methodId}>
              <SelectValue placeholder="Seleccione la forma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="efectivo">Efectivo</SelectItem>
              <SelectItem value="transferencia">Transferencia</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {fields.paymentMethod === 'transferencia' && (
          <div className="space-y-2">
            <Label htmlFor={transferId}>Número de transferencia</Label>
            <Input
              id={transferId}
              value={fields.transferNumber}
              onChange={(e) => onChange({ ...fields, transferNumber: e.target.value })}
              placeholder="Número de referencia"
              maxLength={100}
            />
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
