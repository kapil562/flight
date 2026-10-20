// Vercel Edge Config Live Cloud Sync (Sub-second global replication)
const EDGE_CONFIG_ID = 'ecfg_s6kw8sabfbgyu6nearjsjfjk5ktu';
const EDGE_READ_TOKEN = '4efd4883-b613-4582-9b2a-14d921a60bdb';
const EDGE_WRITE_TOKEN = atob('dmNhXzE0RHNtaWhvR0FDeVd0cDFIVTFGUXE1SkhpU0NCVXFLZlZJdmFpak5BN3lNc1JBNm1mM01sRFMw');
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
