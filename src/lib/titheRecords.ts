import { TitheRecord, TitheCurrency, TitheCategory, TithePaymentMethod } from '@/components/tithes/AddTitheDialog';

export type TitheRecordRow = {
  id: string;
  member_name: string;
  member_id: string | null;
  tithe_date: string;
  currency: TitheCurrency;
  tithe_amount: number;
  tithe_payment_method: TithePaymentMethod;
  tithe_transfer_number: string | null;
  offering_amount: number;
  offering_payment_method: TithePaymentMethod;
  offering_transfer_number: string | null;
  first_fruits_amount: number;
  first_fruits_payment_method: TithePaymentMethod;
  first_fruits_transfer_number: string | null;
  pro_templo_amount: number;
  pro_templo_payment_method: TithePaymentMethod;
  pro_templo_transfer_number: string | null;
  special_offering_amount: number;
  special_offering_payment_method: TithePaymentMethod;
  special_offering_transfer_number: string | null;
  notes: string | null;
  created_at: string;
};

const num = (v: number | string | null | undefined) => Number(v) || 0;

export const rowToTitheRecord = (row: TitheRecordRow): TitheRecord => {
  const titheAmount = num(row.tithe_amount);
  const offeringAmount = num(row.offering_amount);
  const firstFruitsAmount = num(row.first_fruits_amount);
  const proTemploAmount = num(row.pro_templo_amount);
  const specialOfferingAmount = num(row.special_offering_amount);
  const total =
    titheAmount + offeringAmount + firstFruitsAmount + proTemploAmount + specialOfferingAmount;
  const primaryMethod = row.tithe_payment_method;

  return {
    id: row.id,
    memberName: row.member_name,
    date: row.tithe_date,
    currency: row.currency,
    titheAmount,
    tithePaymentMethod: row.tithe_payment_method,
    titheTransferNumber: row.tithe_transfer_number || undefined,
    offeringAmount,
    offeringPaymentMethod: row.offering_payment_method,
    offeringTransferNumber: row.offering_transfer_number || undefined,
    firstFruitsAmount,
    firstFruitsPaymentMethod: row.first_fruits_payment_method,
    firstFruitsTransferNumber: row.first_fruits_transfer_number || undefined,
    proTemploAmount,
    proTemploPaymentMethod: row.pro_templo_payment_method,
    proTemploTransferNumber: row.pro_templo_transfer_number || undefined,
    specialOfferingAmount,
    specialOfferingPaymentMethod: row.special_offering_payment_method,
    specialOfferingTransferNumber: row.special_offering_transfer_number || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    amount: total,
    paymentMethod: primaryMethod === 'transferencia' ? 'transfer' : 'cash',
    reference:
      row.tithe_transfer_number ||
      row.offering_transfer_number ||
      row.first_fruits_transfer_number ||
      row.pro_templo_transfer_number ||
      row.special_offering_transfer_number ||
      undefined,
  };
};

export const titheRecordToRow = (record: TitheRecord) => ({
  member_name: record.memberName.trim(),
  tithe_date: record.date,
  currency: record.currency,
  tithe_amount: record.titheAmount || 0,
  tithe_payment_method: record.tithePaymentMethod,
  tithe_transfer_number:
    record.tithePaymentMethod === 'transferencia' ? record.titheTransferNumber?.trim() || null : null,
  offering_amount: record.offeringAmount || 0,
  offering_payment_method: record.offeringPaymentMethod,
  offering_transfer_number:
    record.offeringPaymentMethod === 'transferencia'
      ? record.offeringTransferNumber?.trim() || null
      : null,
  first_fruits_amount: record.firstFruitsAmount || 0,
  first_fruits_payment_method: record.firstFruitsPaymentMethod,
  first_fruits_transfer_number:
    record.firstFruitsPaymentMethod === 'transferencia'
      ? record.firstFruitsTransferNumber?.trim() || null
      : null,
  pro_templo_amount: record.proTemploAmount || 0,
  pro_templo_payment_method: record.proTemploPaymentMethod,
  pro_templo_transfer_number:
    record.proTemploPaymentMethod === 'transferencia'
      ? record.proTemploTransferNumber?.trim() || null
      : null,
  special_offering_amount: record.specialOfferingAmount || 0,
  special_offering_payment_method: record.specialOfferingPaymentMethod,
  special_offering_transfer_number:
    record.specialOfferingPaymentMethod === 'transferencia'
      ? record.specialOfferingTransferNumber?.trim() || null
      : null,
  notes: record.notes?.trim() || null,
});

export const getRecordTotal = (record: TitheRecord) =>
  (record.titheAmount || 0) +
  (record.offeringAmount || 0) +
  (record.firstFruitsAmount || 0) +
  (record.proTemploAmount || 0) +
  (record.specialOfferingAmount || 0);

export const getCategoryAmount = (record: TitheRecord, category: TitheCategory): number => {
  switch (category) {
    case 'diezmo':
      return record.titheAmount || 0;
    case 'ofrenda':
      return record.offeringAmount || 0;
    case 'primicia':
      return record.firstFruitsAmount || 0;
    case 'pro_templo':
      return record.proTemploAmount || 0;
    case 'ofrenda_especial':
      return record.specialOfferingAmount || 0;
    default:
      return getRecordTotal(record);
  }
};

export const matchesCategoryFilter = (record: TitheRecord, category: TitheCategory | 'all') =>
  category === 'all' || getCategoryAmount(record, category) > 0;

export const matchesDateFilters = (
  record: TitheRecord,
  dayFilter: string,
  monthFilter: string,
  yearFilter: string
) => {
  const [y, m, d] = record.date.split('-');
  if (dayFilter !== 'all') return record.date === dayFilter;
  if (yearFilter !== 'all' && y !== yearFilter) return false;
  if (monthFilter !== 'all' && m !== monthFilter) return false;
  return true;
};

export const formatTitheCurrency = (amount: number, currency: TitheCurrency) => {
  const symbol = currency === 'USD' ? '$' : 'Q';
  return `${symbol} ${amount.toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const CATEGORY_LABELS: Record<TitheCategory | 'all', string> = {
  all: 'Todos los tipos',
  diezmo: 'Diezmo',
  ofrenda: 'Ofrenda',
  primicia: 'Primicia',
  pro_templo: 'ProTemplo',
  ofrenda_especial: 'Ofrenda Especial',
};

export const SPANISH_MONTHS = [
  { value: 'all', label: 'Todos los meses' },
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

export const buildYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [{ value: 'all', label: 'Todos los años' }];
  for (let y = currentYear; y >= currentYear - 5; y--) {
    years.push({ value: String(y), label: String(y) });
  }
  return years;
};

export const emptyTitheFormState = () => ({
  date: new Date().toISOString().split('T')[0],
  memberName: '',
  currency: 'GTQ' as TitheCurrency,
  titheAmount: '',
  tithePaymentMethod: 'efectivo' as TithePaymentMethod,
  titheTransferNumber: '',
  offeringAmount: '',
  offeringPaymentMethod: 'efectivo' as TithePaymentMethod,
  offeringTransferNumber: '',
  firstFruitsAmount: '',
  firstFruitsPaymentMethod: 'efectivo' as TithePaymentMethod,
  firstFruitsTransferNumber: '',
  proTemploAmount: '',
  proTemploPaymentMethod: 'efectivo' as TithePaymentMethod,
  proTemploTransferNumber: '',
  specialOfferingAmount: '',
  specialOfferingPaymentMethod: 'efectivo' as TithePaymentMethod,
  specialOfferingTransferNumber: '',
  notes: '',
});

export const formStateToTitheRecord = (
  formData: ReturnType<typeof emptyTitheFormState>,
  id?: string
): TitheRecord => {
  const titheAmount = parseFloat(formData.titheAmount) || 0;
  const offeringAmount = parseFloat(formData.offeringAmount) || 0;
  const firstFruitsAmount = parseFloat(formData.firstFruitsAmount) || 0;
  const proTemploAmount = parseFloat(formData.proTemploAmount) || 0;
  const specialOfferingAmount = parseFloat(formData.specialOfferingAmount) || 0;
  const total = titheAmount + offeringAmount + firstFruitsAmount + proTemploAmount + specialOfferingAmount;

  return {
    id: id || crypto.randomUUID(),
    date: formData.date,
    memberName: formData.memberName.trim(),
    currency: formData.currency,
    titheAmount,
    tithePaymentMethod: formData.tithePaymentMethod,
    titheTransferNumber:
      formData.tithePaymentMethod === 'transferencia'
        ? formData.titheTransferNumber.trim() || undefined
        : undefined,
    offeringAmount,
    offeringPaymentMethod: formData.offeringPaymentMethod,
    offeringTransferNumber:
      formData.offeringPaymentMethod === 'transferencia'
        ? formData.offeringTransferNumber.trim() || undefined
        : undefined,
    firstFruitsAmount,
    firstFruitsPaymentMethod: formData.firstFruitsPaymentMethod,
    firstFruitsTransferNumber:
      formData.firstFruitsPaymentMethod === 'transferencia'
        ? formData.firstFruitsTransferNumber.trim() || undefined
        : undefined,
    proTemploAmount,
    proTemploPaymentMethod: formData.proTemploPaymentMethod,
    proTemploTransferNumber:
      formData.proTemploPaymentMethod === 'transferencia'
        ? formData.proTemploTransferNumber.trim() || undefined
        : undefined,
    specialOfferingAmount,
    specialOfferingPaymentMethod: formData.specialOfferingPaymentMethod,
    specialOfferingTransferNumber:
      formData.specialOfferingPaymentMethod === 'transferencia'
        ? formData.specialOfferingTransferNumber.trim() || undefined
        : undefined,
    notes: formData.notes.trim() || undefined,
    createdAt: new Date().toISOString(),
    amount: total,
    paymentMethod: formData.tithePaymentMethod === 'transferencia' ? 'transfer' : 'cash',
    reference:
      formData.titheTransferNumber ||
      formData.offeringTransferNumber ||
      formData.firstFruitsTransferNumber ||
      formData.proTemploTransferNumber ||
      formData.specialOfferingTransferNumber ||
      undefined,
  };
};
