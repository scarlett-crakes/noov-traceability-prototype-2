export function Settings() {
  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-base font-medium text-gray-900">Settings</h1>
      </div>
      <div className="p-6 space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Organization</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500 mb-1">Organization Name</p>
              <input className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-900 bg-gray-50" defaultValue="Noovoleum" readOnly />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Contact Email</p>
              <input className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-900 bg-gray-50" defaultValue="admin@noovoleum.com" readOnly />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Users &amp; Roles</h2>
          <div className="space-y-2 text-sm">
            {[
              { name: 'Admin User', email: 'admin@noovoleum.com', role: 'Admin' },
              { name: 'Collector A', email: 'collector@noovoleum.com', role: 'Collector' },
              { name: 'Auditor A', email: 'auditor@noovoleum.com', role: 'Auditor' },
            ].map((u) => (
              <div key={u.email} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-gray-900 font-medium">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{u.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
