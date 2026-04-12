'use client';

import { useDocumentInfo, useAuth } from '@payloadcms/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// ETA calculation (inline — no server imports allowed in 'use client' components)
const DELIVERY_DAYS: Record<string, number> = { high: 2, medium: 4, low: 7, none: 10 };

function calculateETA(perishability: string): Date {
  const eta = new Date();
  eta.setDate(eta.getDate() + (DELIVERY_DAYS[perishability] ?? 7));
  if (eta.getDay() === 6) eta.setDate(eta.getDate() + 2);
  if (eta.getDay() === 0) eta.setDate(eta.getDate() + 1);
  return eta;
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function OrderActionsPanel() {
  const { id, savedDocumentData } = useDocumentInfo();
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelInput, setShowCancelInput] = useState(false);
  const [customEta, setCustomEta] = useState('');
  const [showAcceptPanel, setShowAcceptPanel] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = savedDocumentData as any;
  const status = doc?.status;
  const perishability = doc?.product?.perishability ?? 'low';

  // Only render for sellers viewing a real saved document
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!id || !status || !(user as any)?.roles?.includes('seller')) return null;

  const suggestedEta = calculateETA(perishability);
  const etaDate = customEta ? new Date(customEta) : suggestedEta;

  async function patchOrder(data: Record<string, unknown>) {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch (e) {
      alert('Failed to update order: ' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const isPending = status === 'pending';
  const panelBg = isPending ? '#fff7ed' : '#f0fdf4';
  const panelBorder = isPending ? '#fed7aa' : '#bbf7d0';

  return (
    <div
      style={{
        background: panelBg,
        border: `1px solid ${panelBorder}`,
        borderRadius: 8,
        padding: '16px 20px',
        marginBottom: 24,
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: 12 }}>
        Order Actions — Current status:{' '}
        <strong style={{ textTransform: 'uppercase' }}>{status}</strong>
      </p>

      {/* PENDING — initial action buttons */}
      {status === 'pending' && !showAcceptPanel && !showCancelInput && (
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setShowAcceptPanel(true)}
            style={{
              background: '#16a34a',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 20px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            ✅ Accept Order
          </button>
          <button
            onClick={() => setShowCancelInput(true)}
            style={{
              background: '#fff',
              color: '#dc2626',
              border: '1px solid #dc2626',
              borderRadius: 6,
              padding: '8px 20px',
              cursor: 'pointer',
            }}
          >
            ❌ Reject Order
          </button>
        </div>
      )}

      {/* Accept panel with ETA picker */}
      {status === 'pending' && showAcceptPanel && (
        <div>
          <p>
            📦 Suggested delivery:{' '}
            <strong>{formatDate(suggestedEta)}</strong> (based on product
            perishability: {perishability})
          </p>
          <label style={{ display: 'block', marginTop: 8 }}>
            Adjust delivery date (optional):
            <br />
            <input
              type="date"
              value={customEta}
              onChange={(e) => setCustomEta(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{
                marginTop: 4,
                padding: '6px 10px',
                borderRadius: 4,
                border: '1px solid #ccc',
              }}
            />
          </label>
          <p style={{ marginTop: 8, color: '#16a34a', fontWeight: 500 }}>
            Will notify customer: estimated delivery on{' '}
            <strong>{formatDate(etaDate)}</strong>
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button
              disabled={loading}
              onClick={() =>
                patchOrder({
                  status: 'confirmed',
                  acceptedAt: new Date().toISOString(),
                  estimatedDeliveryDate: etaDate.toISOString(),
                })
              }
              style={{
                background: '#16a34a',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 20px',
                cursor: 'pointer',
              }}
            >
              {loading ? 'Saving…' : 'Confirm & Notify Customer'}
            </button>
            <button
              onClick={() => setShowAcceptPanel(false)}
              style={{
                background: 'transparent',
                border: '1px solid #ccc',
                borderRadius: 6,
                padding: '8px 16px',
                cursor: 'pointer',
              }}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Cancel / Reject panel */}
      {showCancelInput && (
        <div>
          <label>
            Cancellation reason (required):
            <br />
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                marginTop: 4,
                padding: 8,
                borderRadius: 4,
                border: '1px solid #ccc',
              }}
              placeholder="e.g. Out of stock, unable to fulfil this order."
            />
          </label>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              disabled={loading || cancelReason.trim().length < 10}
              onClick={() => patchOrder({ status: 'cancelled', cancelReason })}
              style={{
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 20px',
                cursor: 'pointer',
                opacity: cancelReason.trim().length < 10 ? 0.5 : 1,
              }}
            >
              {loading ? 'Saving…' : 'Confirm Cancellation'}
            </button>
            <button
              onClick={() => setShowCancelInput(false)}
              style={{
                background: 'transparent',
                border: '1px solid #ccc',
                borderRadius: 6,
                padding: '8px 16px',
                cursor: 'pointer',
              }}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* POST-ACCEPT status progression */}
      {status === 'confirmed' && (
        <button
          disabled={loading}
          onClick={() => patchOrder({ status: 'processing' })}
          style={{
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 20px',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Saving…' : '🔄 Mark as Processing'}
        </button>
      )}

      {status === 'processing' && (
        <button
          disabled={loading}
          onClick={() => patchOrder({ status: 'dispatched' })}
          style={{
            background: '#7c3aed',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 20px',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Saving…' : '🚚 Mark as Dispatched'}
        </button>
      )}

      {status === 'dispatched' && (
        <button
          disabled={loading}
          onClick={() => patchOrder({ status: 'delivered' })}
          style={{
            background: '#16a34a',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 20px',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Saving…' : '✅ Mark as Delivered'}
        </button>
      )}

      {(status === 'delivered' ||
        status === 'cancelled' ||
        status === 'refunded') && (
        <p style={{ color: '#6b7280' }}>
          No further actions available for this order.
        </p>
      )}
    </div>
  );
}
