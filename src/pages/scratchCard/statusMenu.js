import { List, Clock, CheckCircle, Truck, XCircle, Phone } from 'lucide-react';

// Scratch Card sidebar entries. `status` and `courierFilter` fix the list (the API's
// status and courierStatus filters); `countKey` is the entry's key in the status counts.
// A sent card was Approved by hand, so Approved alone is the cards still to send and
// every sent card is under In Courier.
export const SCRATCH_CARD_STATUS_MENU = [
  { key: 'all', label: 'All Cards', countKey: 'all', icon: List, color: 'text-cyan-400' },
  { key: 'pending', label: 'Pending', status: 'Pending', countKey: 'Pending', icon: Clock, color: 'text-amber-400' },
  { key: 'approved', label: 'Approved', status: 'Approved', courierFilter: 'none', countKey: 'Approved', icon: CheckCircle, color: 'text-blue-400' },
  { key: 'in_courier', label: 'In Courier', courierFilter: 'sent', countKey: 'In Courier', icon: Truck, color: 'text-violet-400' },
  { key: 'rejected', label: 'Rejected', status: 'Rejected', countKey: 'Rejected', icon: XCircle, color: 'text-red-400' },
  { key: 'not_responding', label: 'Not Responding', status: 'Not Responding', countKey: 'Not Responding', icon: Phone, color: 'text-gray-400' },
];

export const scratchCardMenuItem = (key) =>
  SCRATCH_CARD_STATUS_MENU.find((item) => item.key === key) || SCRATCH_CARD_STATUS_MENU[0];
