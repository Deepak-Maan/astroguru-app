// Vercel Serverless Function Catch-All for AstroGuru Admin API
module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';
  const pathname = url.split('?')[0];

  // 1. Admin Authentication
  if (pathname.includes('/admin/login')) {
    const body = req.body || {};
    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    if (email === 'admin@astroguru.app' && (password === 'admin123' || password === 'admin')) {
      return res.status(200).json({
        success: true,
        admin: {
          id: 'usr_admin_1',
          name: 'Master Admin',
          email: 'admin@astroguru.app',
          role: 'super_admin',
        },
      });
    }

    if (email.includes('ramesh') || email.includes('delhi')) {
      return res.status(200).json({
        success: true,
        admin: {
          id: 'usr_subadmin_1001',
          name: 'Rajesh Sharma',
          email: 'ramesh.ops@astroguru.app',
          role: 'sub_admin',
          subAdminId: 'subadmin_1001',
          assignedRegion: 'Delhi-NCR & North Zone',
          licenseId: 'AG-LIC-77218',
        },
      });
    }

    if (email.includes('amitabh') || email.includes('patna')) {
      return res.status(402).json({
        success: false,
        error: 'FEE_PENDING',
        subAdmin: {
          id: 'subadmin_1003',
          name: 'Amitabh Verma',
          email: email,
          assignedRegion: 'Uttar Pradesh & Bihar Zone',
          joiningFeeAmount: 599,
          upiId: 'astroguru.business@axisbank',
        },
      });
    }

    // Default fallback admin for testing
    return res.status(200).json({
      success: true,
      admin: {
        id: 'usr_admin_1',
        name: 'Master Admin',
        email: email || 'admin@astroguru.app',
        role: 'super_admin',
      },
    });
  }

  // 2. Clear Fee and Activate Sub-Admin
  if (pathname.includes('/subadmins/clear-fee-and-activate')) {
    const body = req.body || {};
    const email = body.email || 'partner@astroguru.app';
    const txn = body.transactionRef || `UPI/${Date.now().toString().slice(-8)}/AXIS`;

    return res.status(200).json({
      success: true,
      admin: {
        id: `usr_${Date.now()}`,
        name: 'Amitabh Verma',
        email: email,
        role: 'sub_admin',
        subAdminId: 'subadmin_1003',
        assignedRegion: 'Uttar Pradesh & Bihar Zone',
        licenseId: `AG-LIC-${Math.floor(10000 + Math.random() * 90000)}`,
        transactionRef: txn,
      },
    });
  }

  // 3. Maintenance Mode
  if (pathname.includes('/system/maintenance')) {
    return res.status(200).json({
      success: true,
      maintenanceMode: false,
      allowedIps: ['127.0.0.1'],
      maintenanceMessage: 'System operational',
    });
  }

  // 4. Default Success Response for all other admin routes
  return res.status(200).json({
    success: true,
    message: 'Operation processed successfully',
    timestamp: new Date().toISOString(),
  });
};
