import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GEMSTONES_CATALOG, GemstoneRemedy } from '../data/remedies';

export interface OrderRecord {
  id: string;
  itemId: string;
  itemName: string;
  price: number;
  userName: string;
  phone: string;
  address: string;
  date: string;
  status: 'Processing' | 'Dispatched' | 'Delivered' | 'Cancelled';
}

export interface InventoryItem extends GemstoneRemedy {
  stock: number;
  available: boolean;
}

interface RemediesState {
  inventory: InventoryItem[];
  orders: OrderRecord[];
  updateItemPrice: (itemId: string, newPrice: number) => void;
  updateItemStock: (itemId: string, newStock: number) => void;
  toggleItemAvailable: (itemId: string) => void;
  placeOrder: (order: Omit<OrderRecord, 'id' | 'date' | 'status'>) => OrderRecord;
  updateOrderStatus: (orderId: string, newStatus: OrderRecord['status']) => void;
}

const INITIAL_INVENTORY: InventoryItem[] = GEMSTONES_CATALOG.map((gem, idx) => ({
  ...gem,
  stock: 10 + idx * 5,
  available: true,
}));

const INITIAL_DEMO_ORDERS: OrderRecord[] = [
  {
    id: 'ORD-94821',
    itemId: 'yellow_sapphire',
    itemName: 'Natural Yellow Sapphire (Pukhraj)',
    price: 4999,
    userName: 'Demo Seeker',
    phone: '+91 98765 43210',
    address: '123 Temple Road, Connaught Place, New Delhi 110001',
    date: '2026-08-01 11:30',
    status: 'Dispatched',
  },
  {
    id: 'ORD-83712',
    itemId: 'blue_sapphire',
    itemName: 'Ceylon Blue Sapphire (Neelam)',
    price: 7999,
    userName: 'Rajesh Sharma',
    phone: '+91 99887 76655',
    address: '45 MG Road, Indiranagar, Bengaluru 560038',
    date: '2026-07-31 16:45',
    status: 'Delivered',
  },
];

export const useRemediesStore = create<RemediesState>()(
  persist(
    (set, get) => ({
      inventory: INITIAL_INVENTORY,
      orders: INITIAL_DEMO_ORDERS,

      updateItemPrice: (itemId, newPrice) => {
        set((state) => ({
          inventory: state.inventory.map((item) =>
            item.id === itemId ? { ...item, price: newPrice } : item
          ),
        }));
      },

      updateItemStock: (itemId, newStock) => {
        set((state) => ({
          inventory: state.inventory.map((item) =>
            item.id === itemId ? { ...item, stock: newStock, available: newStock > 0 } : item
          ),
        }));
      },

      toggleItemAvailable: (itemId) => {
        set((state) => ({
          inventory: state.inventory.map((item) =>
            item.id === itemId ? { ...item, available: !item.available } : item
          ),
        }));
      },

      placeOrder: (orderData) => {
        const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
        const now = new Date();
        const dateStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const newOrder: OrderRecord = {
          ...orderData,
          id: orderId,
          date: dateStr,
          status: 'Processing',
        };

        // Decrement stock
        set((state) => ({
          orders: [newOrder, ...state.orders],
          inventory: state.inventory.map((item) =>
            item.id === orderData.itemId ? { ...item, stock: Math.max(0, item.stock - 1) } : item
          ),
        }));

        return newOrder;
      },

      updateOrderStatus: (orderId, newStatus) => {
        set((state) => ({
          orders: state.orders.map((ord) =>
            ord.id === orderId ? { ...ord, status: newStatus } : ord
          ),
        }));
      },
    }),
    {
      name: 'astroguru_remedies_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
