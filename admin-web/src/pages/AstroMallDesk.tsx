import React, { useState } from 'react';
import { OrderItem, AstroMallProduct } from '../types';
import { INITIAL_ASTROMALL_PRODUCTS } from '../services/api';

interface AstroMallDeskProps {
  orders: OrderItem[];
  onUpdateStatus: (
    orderId: string,
    status: OrderItem['status'],
    tracking?: string,
    courier?: string,
    pandit?: string,
    videoProof?: string
  ) => void;
}

export const AstroMallDesk: React.FC<AstroMallDeskProps> = ({
  orders,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'catalog'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderItem['status']>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | AstroMallProduct['category']>('all');

  // Catalog items state (in-memory stock toggle)
  const [products, setProducts] = useState<AstroMallProduct[]>(INITIAL_ASTROMALL_PRODUCTS);

  // Selected Order for pipeline fulfillment
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [newStatus, setNewStatus] = useState<OrderItem['status']>('pandit_assigned');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierPartner, setCourierPartner] = useState('DTDC Express');
  const [assignedPandit, setAssignedPandit] = useState('');
  const [videoProofUrl, setVideoProofUrl] = useState('');

  // Selected Product for quick view modal
  const [selectedProduct, setSelectedProduct] = useState<AstroMallProduct | null>(null);

  const handleOpenStatusModal = (ord: OrderItem) => {
    setSelectedOrder(ord);
    setNewStatus(ord.status);
    setTrackingNumber(ord.trackingNumber || '');
    setCourierPartner(ord.courierPartner || 'DTDC Express');
    setAssignedPandit(ord.assignedPandit || '');
    setVideoProofUrl(ord.videoProofUrl || '');
  };

  const handleSaveStatus = () => {
    if (!selectedOrder) return;
    onUpdateStatus(
      selectedOrder.id,
      newStatus,
      trackingNumber,
      courierPartner,
      assignedPandit,
      videoProofUrl
    );
    setSelectedOrder(null);
  };

  const handleToggleProductStock = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p))
    );
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.trackingNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered catalog products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sanskritName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.templeOrOrigin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.doshaTarget.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & View Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#EEF2FF' }}>
              Sacred E-Puja & Consecrated AstroMall Desk
            </h1>
            <span className="badge-pill badge-amber">
              App Connected · 12 Consecrated Items
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#A5B4FC', marginTop: '4px' }}>
            Live sync with mobile app offerings: Jyotirlinga pujas, certified Nepali Rudrakshas, Vedic gemstones, and energized yantras.
          </p>
        </div>

        {/* View Tabs */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(26, 33, 64, 0.7)', padding: '4px', borderRadius: '12px' }}>
          <button
            onClick={() => setActiveTab('orders')}
            className={activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '12.5px', padding: '8px 16px', borderRadius: '8px' }}
          >
            📦 Active Orders & Dispatch ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={activeTab === 'catalog' ? 'btn-gold' : 'btn-secondary'}
            style={{ fontSize: '12.5px', padding: '8px 16px', borderRadius: '8px' }}
          >
            🪔 Sacred Inventory Catalog ({products.length})
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="responsive-grid-5">
        {[
          { label: 'New Bookings', count: orders.filter((o) => o.status === 'pending').length, color: '#FCD34D', icon: '⏳' },
          { label: 'Pandit Assigned', count: orders.filter((o) => o.status === 'pandit_assigned').length, color: '#38BDF8', icon: '🙏' },
          { label: 'Puja Performed', count: orders.filter((o) => o.status === 'performed').length, color: '#818CF8', icon: '🪔' },
          { label: 'Prasad Dispatched', count: orders.filter((o) => o.status === 'dispatched').length, color: '#34D399', icon: '🚚' },
          { label: 'Delivered', count: orders.filter((o) => o.status === 'delivered').length, color: '#94A3B8', icon: '✓' },
        ].map((s, idx) => (
          <div key={idx} className="liquid-card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC', textTransform: 'uppercase' }}>
              {s.icon} {s.label}
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: s.color, marginTop: '6px' }}>
              {s.count}
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="liquid-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
          <span style={{ fontSize: '16px' }}>🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'orders' ? 'Search by seeker name, order ID, or tracking...' : 'Search by remedy, deity, Sanskrit title, or dosha target...'}
            className="cosmic-input"
            style={{ flex: 1 }}
          />
        </div>

        {activeTab === 'orders' ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>STATUS:</span>
            {(['all', 'pending', 'pandit_assigned', 'performed', 'dispatched', 'delivered'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={statusFilter === st ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '11px', padding: '5px 10px', textTransform: 'capitalize' }}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>CATEGORY:</span>
            {(['all', 'puja', 'rudraksha', 'gemstone', 'yantra'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={categoryFilter === cat ? 'btn-gold' : 'btn-secondary'}
                style={{ fontSize: '11px', padding: '5px 10px', textTransform: 'capitalize' }}
              >
                {cat === 'all' ? 'All (12)' : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* VIEW 1: ACTIVE ORDERS & DISPATCH PIPELINE */}
      {activeTab === 'orders' && (
        <div className="liquid-card table-responsive-wrapper">
          <table className="cosmic-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Seeker Profile</th>
                <th>Sacred E-Puja / Remedy</th>
                <th>Amount</th>
                <th>Assigned Pandit / Temple</th>
                <th>Status</th>
                <th>Tracking & Proof</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: '800', color: '#FCD34D' }}>
                      {ord.id}
                      <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '500' }}>{ord.createdAt}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#EEF2FF' }}>{ord.customerName}</div>
                      <div style={{ fontSize: '11px', color: '#818CF8' }}>{ord.phone}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px' }}>
                          {ord.itemType === 'puja' ? '🪔' : ord.itemType === 'rudraksha' ? '📿' : ord.itemType === 'gemstone' ? '💎' : '✨'}
                        </span>
                        <span style={{ fontWeight: '700', color: '#EEF2FF' }}>{ord.title}</span>
                      </div>
                      {ord.sankalpDetails && (
                        <div style={{ fontSize: '11px', color: '#A5B4FC', marginTop: '3px', maxWidth: '280px' }}>
                          {ord.sankalpDetails}
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: '800', color: '#34D399', fontSize: '14px' }}>
                      ₹{ord.amount.toLocaleString()}
                    </td>
                    <td>
                      {ord.assignedPandit ? (
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#FDE68A' }}>
                            🙏 {ord.assignedPandit}
                          </div>
                          {ord.temple && (
                            <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>
                              🏛️ {ord.temple}
                            </div>
                          )}
                        </div>
                      ) : ord.temple ? (
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>🏛️ {ord.temple}</div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#64748B' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge-pill ${
                        ord.status === 'delivered' ? 'badge-emerald' :
                        ord.status === 'performed' ? 'badge-indigo' :
                        ord.status === 'dispatched' ? 'badge-amber' :
                        ord.status === 'pandit_assigned' ? 'badge-rose' : 'badge-slate'
                      }`}>
                        {ord.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {ord.trackingNumber ? (
                        <div>
                          <div style={{ fontFamily: 'monospace', fontSize: '11.5px', color: '#38BDF8', fontWeight: '700' }}>
                            📦 {ord.trackingNumber}
                          </div>
                          {ord.courierPartner && (
                            <div style={{ fontSize: '10px', color: '#A5B4FC' }}>via {ord.courierPartner}</div>
                          )}
                        </div>
                      ) : ord.videoProofUrl ? (
                        <a
                          href={ord.videoProofUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: '11px', color: '#34D399', textDecoration: 'underline', fontWeight: '700' }}
                        >
                          🎥 View Video Proof
                        </a>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#64748B' }}>Pending Fulfillment</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenStatusModal(ord)}
                        className="btn-gold"
                        style={{ fontSize: '11px', padding: '6px 12px', fontWeight: '700' }}
                      >
                        ⚡ Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 2: SACRED CONSECRATED CATALOG (APP SYNCHRONIZED) */}
      {activeTab === 'catalog' && (
        <div className="responsive-grid-3">
          {filteredProducts.map((p) => (
            <div key={p.id} className="liquid-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ position: 'relative', height: '140px' }}>
                <img
                  src={p.image}
                  alt={p.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(10, 12, 22, 0.95) 0%, transparent 60%)',
                }} />
                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                  <span className={`badge-pill ${
                    p.category === 'puja' ? 'badge-amber' :
                    p.category === 'gemstone' ? 'badge-rose' :
                    p.category === 'rudraksha' ? 'badge-indigo' : 'badge-emerald'
                  }`} style={{ fontSize: '10px', fontWeight: '800' }}>
                    {p.category.toUpperCase()}
                  </span>
                  {p.prashadIncluded && (
                    <span className="badge-pill badge-emerald" style={{ fontSize: '10px' }}>
                      Prasad Dispatched
                    </span>
                  )}
                </div>

                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <button
                    onClick={() => handleToggleProductStock(p.id)}
                    className={p.inStock ? 'badge-pill badge-emerald' : 'badge-pill badge-rose'}
                    style={{ fontSize: '10px', cursor: 'pointer', border: 'none' }}
                  >
                    {p.inStock ? '● In Stock' : '✕ Out of Stock'}
                  </button>
                </div>

                <div style={{ position: 'absolute', bottom: '10px', left: '12px', right: '12px' }}>
                  {p.sanskritName && (
                    <div style={{ fontSize: '11px', color: '#FCD34D', fontWeight: '700' }}>
                      {p.sanskritName}
                    </div>
                  )}
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#EEF2FF' }}>
                    {p.name}
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>
                <div style={{ fontSize: '11px', color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>🏛️</span>
                  <span>{p.templeOrOrigin}</span>
                </div>

                <div style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  fontSize: '11px',
                  color: '#FDE68A',
                }}>
                  <strong>Target Dosha:</strong> {p.doshaTarget}
                </div>

                <div style={{ fontSize: '11.5px', color: '#CBD5E1', lineHeight: '1.4' }}>
                  {p.consecration}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(129, 140, 248, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: '#FCD34D' }}>
                        ₹{p.price.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through' }}>
                        ₹{p.originalPrice.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#818CF8' }}>
                      ⭐ {p.rating} ({p.reviews.toLocaleString()} reviews in app)
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedProduct(p)}
                    className="btn-secondary"
                    style={{ fontSize: '11px', padding: '6px 12px' }}
                  >
                    View Specs
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PIPELINE UPDATE MODAL */}
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
          padding: '16px',
        }}>
          <div className="liquid-card responsive-modal-box" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge-pill badge-amber" style={{ fontSize: '10px' }}>
                  FULFILLMENT PIPELINE DISPATCHER
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#EEF2FF', marginTop: '4px' }}>
                  Order #{selectedOrder.id}
                </h2>
                <p style={{ fontSize: '12.5px', color: '#A5B4FC' }}>
                  Seeker: <strong style={{ color: '#FDE68A' }}>{selectedOrder.customerName}</strong> ({selectedOrder.phone})
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="btn-secondary" style={{ padding: '4px 8px' }}>
                ✕
              </button>
            </div>

            <div style={{
              margin: '16px 0',
              padding: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              borderRadius: '10px',
              border: '1px solid rgba(129, 140, 248, 0.2)',
              fontSize: '12px',
            }}>
              <div style={{ fontWeight: '700', color: '#EEF2FF' }}>{selectedOrder.title}</div>
              <div style={{ color: '#FCD34D', marginTop: '2px' }}>₹{selectedOrder.amount.toLocaleString()}</div>
              {selectedOrder.sankalpDetails && (
                <div style={{ color: '#94A3B8', marginTop: '4px', fontSize: '11px' }}>
                  {selectedOrder.sankalpDetails}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>
                  ORDER STATUS
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="cosmic-input"
                  style={{ marginTop: '6px', cursor: 'pointer' }}
                >
                  <option value="pending">⏳ Pending Review</option>
                  <option value="pandit_assigned">🙏 Pandit Assigned to Temple</option>
                  <option value="performed">🪔 Puja Performed / Ritual Sanctified</option>
                  <option value="dispatched">🚚 Prasad / Consecrated Item Dispatched</option>
                  <option value="delivered">✓ Delivered to Seeker</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>
                  ASSIGNED VEDIC PUROHIT / PANDIT
                </label>
                <input
                  type="text"
                  value={assignedPandit}
                  onChange={(e) => setAssignedPandit(e.target.value)}
                  placeholder="e.g. Pandit Shambhu Shastri (Kashi Vishwanath)"
                  className="cosmic-input"
                  style={{ marginTop: '6px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>
                  SANCTIFIED RITUAL VIDEO PROOF URL (STREAMABLE IN APP)
                </label>
                <input
                  type="url"
                  value={videoProofUrl}
                  onChange={(e) => setVideoProofUrl(e.target.value)}
                  placeholder="https://astroguru.app/puja/video/..."
                  className="cosmic-input"
                  style={{ marginTop: '6px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>
                    COURIER PARTNER
                  </label>
                  <select
                    value={courierPartner}
                    onChange={(e) => setCourierPartner(e.target.value)}
                    className="cosmic-input"
                    style={{ marginTop: '6px' }}
                  >
                    <option value="DTDC Express">DTDC Express</option>
                    <option value="Blue Dart Express">Blue Dart Express</option>
                    <option value="India Speed Post">India Speed Post</option>
                    <option value="Delhivery Surface">Delhivery Surface</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#A5B4FC' }}>
                    AWB TRACKING NUMBER
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. DTDC-881920"
                    className="cosmic-input"
                    style={{ marginTop: '6px', fontFamily: 'monospace' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button onClick={() => setSelectedOrder(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSaveStatus} className="btn-gold">
                Save & Push Notification to Seeker 📲
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT SPECIFICATION MODAL */}
      {selectedProduct && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(4, 6, 15, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          padding: '20px',
        }}>
          <div className="liquid-card" style={{ width: '500px', maxWidth: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge-pill badge-amber" style={{ fontSize: '10px' }}>
                  {selectedProduct.category.toUpperCase()} SPECIFICATION
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#EEF2FF', marginTop: '4px' }}>
                  {selectedProduct.name}
                </h2>
                {selectedProduct.sanskritName && (
                  <div style={{ fontSize: '12px', color: '#FCD34D' }}>{selectedProduct.sanskritName}</div>
                )}
              </div>
              <button onClick={() => setSelectedProduct(null)} className="btn-secondary" style={{ padding: '4px 8px' }}>
                ✕
              </button>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
              <div>
                <strong style={{ color: '#38BDF8' }}>🏛️ Sacred Origin / Temple:</strong> {selectedProduct.templeOrOrigin}
              </div>
              <div>
                <strong style={{ color: '#FCD34D' }}>🪔 Consecration Protocol:</strong> {selectedProduct.consecration}
              </div>
              <div>
                <strong style={{ color: '#FB7185' }}>🎯 Target Astrological Dosha:</strong> {selectedProduct.doshaTarget}
              </div>
              <div>
                <strong style={{ color: '#34D399' }}>📜 Laboratory Certification:</strong> {selectedProduct.certification}
              </div>

              <div style={{ marginTop: '8px' }}>
                <strong style={{ color: '#EEF2FF' }}>Key Spiritual Benefits:</strong>
                <ul style={{ marginTop: '6px', paddingLeft: '18px', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {selectedProduct.benefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(129, 140, 248, 0.2)' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#FCD34D' }}>
                  ₹{selectedProduct.price.toLocaleString()}
                </div>
                <div style={{ fontSize: '11px', color: '#818CF8' }}>App Retail Price</div>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="btn-primary">
                Close Specifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
