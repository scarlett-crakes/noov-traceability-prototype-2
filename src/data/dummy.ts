export const dummyTraceUnits = [
  { id: 'TU-2026-0142', mass_kg: 48.2, status: 'active', product_type: 'UCO', current_owner: 'UCO Collectors Inc', location: 'Warehouse A', created: '2026-06-20', origin: { name: 'Burger Joint', type: 'business' } },
  { id: 'TU-2026-0141', mass_kg: 31.0, status: 'in_transit', product_type: 'UCO', current_owner: 'UCO Analytics Lab', location: 'In Transit', created: '2026-06-19', origin: { name: 'Pizza Palace Restaurant', type: 'business' } },
  { id: 'TU-2026-0140', mass_kg: 12.5, status: 'active', product_type: 'UCO', current_owner: 'UCO Collectors Inc', location: 'Warehouse B', created: '2026-06-18', origin: { name: 'Maria Garcia', type: 'individual' } },
  { id: 'TU-2026-0139', mass_kg: 5.7, status: 'quarantine', product_type: 'UCO', current_owner: 'UCO Collectors Inc', location: 'Quarantine Bay', created: '2026-06-17', origin: { name: 'Burger Joint', type: 'business' } },
  { id: 'TU-2026-0138', mass_kg: 22.3, status: 'consumed', product_type: 'UCO', current_owner: 'Green Fuels Trading Ltd', location: 'Processing Plant', created: '2026-06-15', origin: { name: 'Pizza Palace Restaurant', type: 'business' } },
]

export const dummyOrigins = [
  { id: '1', name: 'Burger Joint', type: 'business', address: '123 Main St, Los Angeles, CA', phone: '+1 213 555 0101', signatory: 'John Smith', declaration_date: '2026-01-15' },
  { id: '2', name: 'Maria Garcia', type: 'individual', address: '456 Oak Ave, Los Angeles, CA', phone: '+1 213 555 0202', signatory: 'Maria Garcia', declaration_date: '2026-02-20' },
  { id: '3', name: 'Pizza Palace Restaurant', type: 'business', address: '789 Elm St, Los Angeles, CA', phone: '+1 213 555 0303', signatory: 'Tony Rossi', declaration_date: '2026-03-10' },
]

export const dummyActors = [
  { id: 'a1', name: 'UCO Collectors Inc', type: 'collector', contact_email: 'ops@ucocollectors.com', is_active: true, cert_number: 'ISCC-EU-2024-001234', cert_expiry: '2027-03-31', cert_status: 'ACTIVE' },
  { id: 'a2', name: 'UCO Analytics Lab', type: 'auditor', contact_email: 'lab@ucoanalytics.com', is_active: true, cert_number: 'ISCC-EU-2024-005678', cert_expiry: '2026-08-15', cert_status: 'ACTIVE' },
  { id: 'a3', name: 'Green Fuels Trading Ltd', type: 'trader', contact_email: 'trade@greenfuels.com', is_active: true, cert_number: 'ISCC-EU-2023-009999', cert_expiry: '2025-12-31', cert_status: 'EXPIRED' },
]

export const dummyEvents = [
  { id: 'e1', type: 'collection', tu_id: 'TU-2026-0142', actor: 'UCO Collectors Inc', notes: 'Collected from Burger Joint', created: '2026-06-20T10:30:00Z' },
  { id: 'e2', type: 'transfer', tu_id: 'TU-2026-0141', actor: 'Admin', notes: 'Transferred to UCO Analytics', created: '2026-06-20T08:15:00Z' },
  { id: 'e3', type: 'split', tu_id: 'TU-2026-0140', actor: 'UCO Collectors Inc', notes: 'Split into TU-0140a and TU-0140b', created: '2026-06-19T14:00:00Z' },
  { id: 'e4', type: 'quarantine', tu_id: 'TU-2026-0139', actor: 'Auditor', notes: 'Flagged for quality review', created: '2026-06-19T09:45:00Z' },
]
