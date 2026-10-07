# AstroGuru Project Memory & Architecture Rules

## Master Admin vs Sub-Admin Hierarchy, Granular RBAC Rights & ₹599 Joining Fee

### 1. Master Admin (Super Admin) Root Authority
- **Account**: `admin@astroguru.app` (`usr_admin_1`).
- Has full, unrestricted, supreme access across all 10 modules: Overview, Live Monitor, Website CMS, Fraud Watchtower, Astrologers Directory, Seeker Vault, AstroMall Orders, Dormant Re-Engagement Broadcasts, Sub-Admin Hierarchy, App Releases & OTA, and System Health.
- The **Sub-Admin Hierarchy** (`subadmins`) and **System Infrastructure / Maintenance Mode** (`system`) desks are strictly exclusive to Master Admin.

### 2. Sub-Admin Hierarchy & Subordination
- Every Sub-Admin reports directly to Master Admin (`masterAdminId: 'usr_admin_1'`).
- Sub-Admins have regional / territorial assignments (e.g. North Zone, West Zone, East Zone, South Zone).
- Sub-Admins are strictly prevented from managing other sub-admins or altering platform-level system maintenance.

### 3. Mandatory ₹599 Partner Joining Fee Architecture
- **Fee Amount**: Exactly ₹599 for every Sub-Admin partner license (`joiningFeeAmount: 599`).
- **Fee Lifecycle States**:
  - `paid`: License fee verified with payment reference (UPI UTR / Razorpay / Bank Transfer). Active official license certificate generated (`AG-LIC-XXXXX`).
  - `pending`: Sub-Admin registered or onboarded without confirmed payment. Status is `pending_approval`.
    - **Login Gate**: Logging in with `pending` status halts regular portal access and presents the interactive **₹599 Fee Clearance Screen** (UPI QR code & UTR submission).
  - `waived`: Master Admin honorary waiver with justification note.
- **Financial Ledger & Verification**:
  - Master Admin dashboard tracks total ₹599 collected (`₹599 × Paid Count`), pending receivables (`₹599 × Pending Count`), and verifies submitted UTR numbers to activate licenses.

### 4. Granular Rights Management (RBAC Switchboard)
Master Admin governs 18 distinct permissions across 5 operational sectors:
1. **Astrologer Fleet Sector**:
   - `canViewAstrologers`: View directory.
   - `canEditTariffs`: Modify per-minute rates.
   - `canApproveKYC`: Verify degree certificates & approve acharyas.
   - `canGenerateAstroId`: Generate unique Astro ID & copy welcome dossier.
   - `canViewDayWiseIncome`: Access day-wise income ledger.
   - `canSettlePayouts`: Trigger consultation payout settlement.
2. **Live Operations & Moderation**:
   - `canMonitorLiveSessions`: View live consultations.
   - `canTerminateSessions`: Forceful session termination & user refund.
   - `canIssueStrikes`: Issue disciplinary strikes.
   - `canAccessWatchtower`: Access fraud incidents and leaked conversations.
   - `canBanDevices`: Access Universal Ban Hammer to blacklist devices/IPs.
3. **Seeker & Wallet Sector**:
   - `canViewUsers`: View user accounts.
   - `canAdjustWallet`: Credit/debit seeker wallets.
   - `maxWalletCreditLimitPerDay`: Configurable daily limit (e.g. ₹5,000/day).
   - `canSuspendUsers`: Suspend/ban seekers.
4. **AstroMall & Puja Orders**:
   - `canManageAstroMall`: Manage gemstone/puja order pipeline.
   - `canAssignPandits`: Assign pandits & dispatch tracking.
5. **Marketing & Broadcasts**:
   - `canDispatchBroadcast`: Send WhatsApp/Push/SMS notifications.
   - `canAccessAutomationRules`: Configure automated dormant re-engagement rules.

### 5. Enforcement Layers
- **Sidebar Navigation**: Hides unauthorized desks for Sub-Admins.
- **Desk Action Guarding**: Disables or hides specific action buttons (e.g. KYC approval, rate editing, wallet adjustment, session termination) if the Sub-Admin's permission flag is `false`.
- **Backend API Validation**: Endpoints verify permission flags before mutating records.
