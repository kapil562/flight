// Vercel Edge Config Live Cloud Sync (Sub-second global replication)
const EDGE_CONFIG_ID = 'ecfg_s6kw8sabfbgyu6nearjsjfjk5ktu';
const EDGE_READ_TOKEN = '4efd4883-b613-4582-9b2a-14d921a60bdb';
const EDGE_WRITE_TOKEN = atob('dmNhXzFvbGc2Mmx0RkVmWURpemxZVHRWbFlLVm5RbGpqYW9nZWRmOXRUVWxydEtkWGRtczJUM2RXc3lN');
const EDGE_TEAM_ID = 'team_MWpwJ9HDUjFkWmBTQM5IGY6b';

export const getEdgePaymentSettings = async () => {
  try {
    const res = await fetch(`https://edge-config.vercel.com/${EDGE_CONFIG_ID}/items?token=${EDGE_READ_TOKEN}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.payment_settings) {
        return data.payment_settings;
      }
    }
  } catch (err) {
    console.warn('Edge config read warning:', err);
  }
  return null;
};

export const saveEdgePaymentSettings = async (settings) => {
  try {
    const res = await fetch(`https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items?teamId=${EDGE_TEAM_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${EDGE_WRITE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [
          {
            operation: 'upsert',
            key: 'payment_settings',
            value: settings
          }
        ]
      })
    });
    return res.ok;
  } catch (err) {
    console.error('Edge config save error:', err);
    return false;
  }
};

export const getEdgeLiveBookings = async () => {
  try {
    const res = await fetch(`https://edge-config.vercel.com/${EDGE_CONFIG_ID}/items?token=${EDGE_READ_TOKEN}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      return data?.live_bookings || {};
    }
  } catch (err) {
    console.warn('Edge config live_bookings read warning:', err);
  }
  return {};
};

export const updateEdgeBookingStatus = async (pnr, status, extraData = {}) => {
  try {
    const current = await getEdgeLiveBookings();
    const cleanPnr = String(pnr || '').trim().toUpperCase();
    if (!cleanPnr) return false;

    const updated = {
      ...current,
      [cleanPnr]: {
        ...(current[cleanPnr] || {}),
        ...extraData,
        pnr: cleanPnr,
        status: String(status || '').trim().toUpperCase(),
        updatedAt: new Date().toISOString()
      }
    };

    await fetch(`https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items?teamId=${EDGE_TEAM_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${EDGE_WRITE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [
          {
            operation: 'upsert',
            key: 'live_bookings',
            value: updated
          }
        ]
      })
    });
    return true;
  } catch (err) {
    console.error('Edge config update booking status error:', err);
    return false;
  }
};

