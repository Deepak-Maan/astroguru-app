import React, { useState } from 'react';
import { OrderItem } from '../types';

interface AstroMallDeskProps {
  orders: OrderItem[];
  onUpdateStatus: (orderId: string, status: OrderItem['status'], tracking?: string) => void;
}

export const AstroMallDesk: React.FC<AstroMallDeskProps> = ({
  orders,
  onUpdateStatus,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [newStatus, setNewStatus] = useState<OrderItem['status']>('pandit_assigned');
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleOpenStatusModal = (ord: OrderItem) => {
    setSelectedOrder(ord);
    setNewStatus(ord.status);
    setTrackingNumber(ord.trackingNumber || '');
  };

  const handleSaveStatus = () => {
    if (!selectedOrder) return;
    onUpdateStatus(selectedOrder.id, newStatus, trackingNumber);
    setSelectedOrder(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#EEF2FF' }}>
            Sacred E-Puja & AstroMall Warehouse Desk
          </h1>
          <p style={{ fontSize: '13px', color: '#A5B4FC', marginTop: '4px' }}>
            Manage temple puja bookings, pandit assignments, consecrated remedy shipping, and courier tracking.
          </p>
        </div>
      </div>

      {/* Pipeline Status Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
        {[
          { label: 'New Bookings', count: orders.filter((o) => o.status === 'pending').length, color: '#FCD34D' },
          { label: 'Pandit Assigned', count: orders.filter((o) => o.status === 'pandit_assigned').length, color: '#38BDF8' },
          { label: 'Puja Performed', count: orders.filter((o) => o.status === 'performed').length, color: '#818CF8' },
          { label: 'Prasad Dispatched', count: orders.filter((o) => o.status === 'dispatched').length, color: '#34D399' },
          { label: 'Completed', count: orders.filter((o) => o.status === 'delivered').length, color: '#64748B' },
        ].map((s, idx) => (
          <div key={idx} className="liquid-card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: s.color, marginTop: '6px' }}>
              {s.count}
            </div>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="liquid-card" style={{ overflow: 'hidden' }}>
        <table className="cosmic-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Item / Temple E-Puja</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Tracking / Courier</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((ord) => (
              <tr key={ord.id}>
                <td style={{ fontFamily: 'monospace', fontWeight: '700', color: '#FCD34D' }}>
                  {ord.id}
                </td>
                <td>
                  <div style={{ fontWeight: '600', color: '#EEF2FF' }}>{ord.customerName}</div>
                  <div style={{ fontSize: '11px', color: '#818CF8' }}>{ord.phone}</div>
                </td>
                <td>
                  <div style={{ fontWeight: '700', color: '#EEF2FF' }}>{ord.title}</div>
                  {ord.sankalpDetails && (
                    <div style={{ fontSize: '11px', color: '#A5B4FC', marginTop: '2px', maxWidth: '280px' }}>
                      {ord.sankalpDetails}
                    </div>
                  )}
                </td>
                <td style={{ fontWeight: '800', color: '#34D399' }}>
                  ₹{ord.amount.toLocaleString()}
                </td>
                <td>
                  <span className="badge-pill badge-indigo">
                    {ord.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#38BDF8' }}>
                  {ord.trackingNumber || 'Pending AWB'}
                </td>
                <td style={{ fontSize: '12px', color: '#64748B' }}>{ord.createdAt}</td>
                <td>
                  <button
                    onClick={() => handleOpenStatusModal(ord)}
                    className="btn-secondary"
                    style={{ fontSize: '11px', padding: '5px 10px' }}
                  >
                    Update Pipeline
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Update Pipeline Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(4, 6, 15, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
        }}>
          <div className="liquid-card" style={{ width: '480px', padding: '28px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#EEF2FF' }}>
              Fulfillment Pipeline Update
            </h2>
            <p style={{ fontSize: '13px', color: '#A5B4FC', marginTop: '4px' }}>
              Order: <strong style={{ color: '#FCD34D' }}>{selectedOrder.id}</strong> · {selectedOrder.title}
            </p>

            <div style={{ marginTop: '18px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>
                FULFILLMENT STATUS
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="cosmic-input"
                style={{ marginTop: '6px', cursor: 'pointer' }}
              >
                <option value="pending">Pending Review</option>
                <option value="pandit_assigned">Pandit Assigned to Temple</option>
                <option value="performed">Puja Performed / Consecrated</option>
                <option value="dispatched">Prasad / Consecrated Item Dispatched</option>
                <option value="delivered">Delivered to Seeker</option>
              </select>
            </div>

            <div style={{ marginTop: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>
                COURIER / SPEEDPOST AWB TRACKING NUMBER
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. BLUEDART-882910"
                className="cosmic-input"
                style={{ marginTop: '6px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button onClick={() => setSelectedOrder(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSaveStatus} className="btn-primary">
                Save & Notify Customer 📲
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
