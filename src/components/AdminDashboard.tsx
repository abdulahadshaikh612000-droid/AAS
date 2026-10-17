import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Booking,
  PlatformSettings,
  Service,
  ServiceCategory,
  SupportTicket,
  User,
  WorkerProfile,
  AdminAuditLog,
} from '../types/index.ts';
import {
  Shield,
  Users,
  Briefcase,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  Search,
  Plus,
  Edit2,
  Trash2,
  History,
  Lock,
  Unlock,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { token, settings, updateSettings, refreshSettings, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'workers' | 'bookings' | 'services' | 'settings' | 'audit' | 'support'
  >('overview');

  const [overview, setOverview] = useState<any>(null);
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters in Bookings
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');

  // Service Edit / Add modal
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);

  // Business settings form state
  const [settingsForm, setSettingsForm] = useState<PlatformSettings>({ ...settings });

  useEffect(() => {
    setSettingsForm({ ...settings });
  }, [settings]);

  const loadAllAdminData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [ovRes, wkRes, bkRes, srvRes, catRes, logRes, tktRes] = await Promise.all([
        fetch('/api/admin/overview', { headers }),
        fetch('/api/workers?showAll=true', { headers }),
        fetch('/api/bookings', { headers }),
        fetch('/api/services', { headers }),
        fetch('/api/categories', { headers }),
        fetch('/api/admin/audit-logs', { headers }),
        fetch('/api/support', { headers }),
      ]);

      if (ovRes.ok) setOverview(await ovRes.json());
      if (wkRes.ok) setWorkers(await wkRes.json());
      if (bkRes.ok) setBookings(await bkRes.json());
      if (srvRes.ok) setServices(await srvRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (logRes.ok) setAuditLogs(await logRes.json());
      if (tktRes.ok) setSupportTickets(await tktRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, [token]);

  // Worker Approval / Rejection
  const handleWorkerStatus = async (workerId: string, status: string, notes = '') => {
    if (!token) return;
    try {
      const res = await fetch(`/api/workers/${workerId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, notes }),
      });
      if (res.ok) {
        showToast(`Worker status updated to ${status}.`, 'success');
        loadAllAdminData();
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  // Booking Status Override
  const handleBookingStatusOverride = async (bookingId: string, status: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, reason: 'Administrative status update' }),
      });
      if (res.ok) {
        showToast(`Booking updated to ${status}.`, 'success');
        loadAllAdminData();
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  // Service Save (Create or Update)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingService) return;

    try {
      const url = editingService.id.startsWith('new_')
        ? '/api/services'
        : `/api/services/${editingService.id}`;
      const method = editingService.id.startsWith('new_') ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingService),
      });

      if (res.ok) {
        showToast('Service saved successfully.', 'success');
        setShowServiceModal(false);
        setEditingService(null);
        loadAllAdminData();
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  // Service Delete
  const handleDeleteService = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('Service deleted.', 'info');
        loadAllAdminData();
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(settingsForm);
  };

  // Resolve Ticket
  const handleResolveTicket = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/support/${id}/resolve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('Support ticket marked as resolved.', 'success');
        loadAllAdminData();
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  // CSV Report Download
  const handleDownloadCsv = () => {
    window.location.href = '/api/admin/reports/csv';
  };

  const filteredBookings = bookings.filter((b) => {
    if (bookingStatusFilter !== 'all' && b.status !== bookingStatusFilter) return false;
    if (bookingSearch) {
      const q = bookingSearch.toLowerCase();
      return (
        b.bookingReference.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.workerName.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-stone-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Header */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-950 text-amber-300 flex items-center justify-center shadow-inner">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-stone-900">
                  Administrator Dashboard
                </h1>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Full platform control • Workers, bookings, commission, and business settings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Bookings CSV</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none bg-white p-2 rounded-2xl border border-stone-200">
          {[
            { id: 'overview', label: 'Overview & KPIs', icon: TrendingUp },
            { id: 'workers', label: `Workers (${overview?.pendingApprovals || 0} Pending)`, icon: Briefcase },
            { id: 'bookings', label: `Bookings (${bookings.length})`, icon: Calendar },
            { id: 'services', label: `Services (${services.length})`, icon: Plus },
            { id: 'settings', label: 'Business Settings', icon: Settings },
            { id: 'audit', label: 'Audit Trail', icon: History },
            { id: 'support', label: `Support (${supportTickets.filter((t) => t.status === 'open').length})`, icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================= OVERVIEW TAB ================= */}
        {activeTab === 'overview' && overview && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
                <span className="text-xs text-stone-500 font-medium block">Total Bookings</span>
                <p className="text-3xl font-serif font-bold text-stone-900 mt-2">
                  {overview.totalBookings}
                </p>
                <span className="text-[11px] text-emerald-700 font-medium">
                  {overview.todayBookings} Scheduled Today
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
                <span className="text-xs text-stone-500 font-medium block">Gross Booking Volume</span>
                <p className="text-3xl font-serif font-bold text-emerald-950 mt-2">
                  {overview.currency} {overview.grossBookingValue.toLocaleString()}
                </p>
                <span className="text-[11px] text-stone-500 font-medium">
                  {overview.completedBookings} Completed Sessions
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
                <span className="text-xs text-stone-500 font-medium block">Platform Commission</span>
                <p className="text-3xl font-serif font-bold text-amber-800 mt-2">
                  {overview.currency} {overview.totalPlatformCommission.toLocaleString()}
                </p>
                <span className="text-[11px] text-stone-500 font-medium">
                  At {settings.platformCommissionPercentage}% rate
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
                <span className="text-xs text-stone-500 font-medium block">Pending Worker Approvals</span>
                <p className="text-3xl font-serif font-bold text-red-600 mt-2">
                  {overview.pendingApprovals}
                </p>
                <button
                  onClick={() => setActiveTab('workers')}
                  className="text-[11px] text-emerald-800 font-semibold hover:underline"
                >
                  Review verification queue &rarr;
                </button>
              </div>
            </div>

            {/* Quick Stats Rows */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-stone-200">
                <h3 className="font-serif font-bold text-base text-stone-900 mb-2">Registered Accounts</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-500">Customers:</span>
                    <span className="font-bold text-stone-800">{overview.totalCustomers}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-500">Verified Specialists:</span>
                    <span className="font-bold text-stone-800">{overview.totalWorkers}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-500">Cancelled Bookings:</span>
                    <span className="font-bold text-red-700">{overview.cancelledBookings}</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 p-6 rounded-2xl bg-white border border-stone-200">
                <h3 className="font-serif font-bold text-base text-stone-900 mb-3">
                  Recent Platform Activity
                </h3>
                <div className="space-y-2 text-xs">
                  {auditLogs.slice(0, 4).map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-stone-800">{log.action}: </span>
                        <span className="text-stone-600">{log.details}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 shrink-0 ml-3">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= WORKERS TAB ================= */}
        {activeTab === 'workers' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="font-serif text-xl font-bold text-stone-900">Worker Management & Approvals</h2>
            <div className="space-y-4">
              {workers.map((w) => (
                <div
                  key={w.id}
                  className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={w.profilePhoto}
                      alt={w.displayName}
                      className="w-14 h-14 rounded-xl object-cover border border-stone-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-stone-900 text-sm">{w.fullName}</h3>
                        <span className="text-xs text-stone-500">({w.displayName})</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            w.verificationStatus === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : w.verificationStatus === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {w.verificationStatus}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        {w.city} • Phone: <strong>{w.phone}</strong> • Email: {w.email}
                      </p>
                      <p className="text-xs text-stone-600 mt-1">
                        Verification Doc: <span className="font-medium text-stone-800">{w.verificationDocType || 'NADRA CNIC'}</span>
                      </p>
                      {w.verificationNotes && (
                        <p className="text-[11px] text-stone-500 italic mt-0.5">
                          Admin Notes: {w.verificationNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {w.verificationStatus !== 'approved' && (
                      <button
                        onClick={() => handleWorkerStatus(w.id, 'approved', 'Approved by administrator')}
                        className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Approve Worker
                      </button>
                    )}
                    {w.verificationStatus === 'pending' && (
                      <button
                        onClick={() => handleWorkerStatus(w.id, 'rejected', 'Verification documents insufficient')}
                        className="px-3 py-1.5 border border-red-300 text-red-700 hover:bg-red-50 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Reject
                      </button>
                    )}
                    {w.verificationStatus === 'approved' && (
                      <button
                        onClick={() => handleWorkerStatus(w.id, 'suspended', 'Suspended by admin')}
                        className="px-3 py-1.5 border border-amber-300 text-amber-800 hover:bg-amber-50 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Suspend
                      </button>
                    )}
                    {w.verificationStatus === 'suspended' && (
                      <button
                        onClick={() => handleWorkerStatus(w.id, 'approved', 'Reinstated by admin')}
                        className="px-3 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= BOOKINGS TAB ================= */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="font-serif text-xl font-bold text-stone-900">All Platform Bookings</h2>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    placeholder="Search ref, customer, worker..."
                    className="pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-900 text-sm">
                        {b.bookingReference}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-800">
                        {b.status}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {b.city} ({b.area})
                      </span>
                    </div>

                    <p className="font-bold text-stone-800 text-sm">{b.serviceName}</p>
                    <p className="text-xs text-stone-500">
                      Customer: <strong>{b.customerName}</strong> ({b.customerPhone}) • Specialist:{' '}
                      <strong>{b.workerName}</strong>
                    </p>
                    <p className="text-xs text-stone-500">
                      Slot: {b.date} ({b.timeSlot}) • Mode: {b.serviceMode}
                    </p>
                    <p className="text-xs text-stone-600">
                      Address: <span className="font-medium">{b.addressDetails}</span>
                    </p>
                  </div>

                  <div className="flex flex-col md:items-end gap-2 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="font-serif font-bold text-base text-emerald-950">
                        {settings.currency} {b.priceSnapshot.totalPrice.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-stone-400 block">
                        Platform Fee: {settings.currency} {b.priceSnapshot.platformCommission.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={b.status}
                        onChange={(e) => handleBookingStatusOverride(b.id, e.target.value)}
                        className="text-xs font-semibold bg-white border border-stone-300 rounded-lg px-2.5 py-1 focus:outline-hidden"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= SERVICES TAB ================= */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-900">Service Catalogue</h2>
                <p className="text-xs text-stone-500">
                  Manage massage offerings, duration, base pricing, and home visit travel fees.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingService({
                    id: 'new_' + Date.now(),
                    name: '',
                    nameUrdu: '',
                    categoryId: categories[0]?.id || 'cat_oil_trad',
                    description: '',
                    descriptionUrdu: '',
                    durationMinutes: 60,
                    basePrice: 2000,
                    homeVisitFee: 400,
                    homeVisitAllowed: true,
                    serviceCentreAllowed: true,
                    imageUrl:
                      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80',
                    active: true,
                    boundariesNotice: 'Strictly professional non-medical therapeutic wellness massage.',
                    createdAt: new Date().toISOString(),
                  });
                  setShowServiceModal(true);
                }}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-stone-900 text-sm">{service.name}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          service.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {service.active ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      {service.durationMinutes} mins • Base: {settings.currency}{' '}
                      {service.basePrice.toLocaleString()} • Visit Fee: +{settings.currency}{' '}
                      {service.homeVisitFee}
                    </p>
                    <p className="text-xs text-stone-600 mt-2 line-clamp-2">{service.description}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingService(service);
                        setShowServiceModal(true);
                      }}
                      className="p-2 text-stone-600 hover:text-emerald-800 hover:bg-stone-200 rounded-lg cursor-pointer"
                      title="Edit Service"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="p-2 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                      title="Delete Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= BUSINESS SETTINGS TAB ================= */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
            <h2 className="font-serif text-xl font-bold text-stone-900 mb-2">
              Platform & Business Settings
            </h2>
            <p className="text-xs text-stone-500 mb-6">
              Update editable brand name, contact numbers, WhatsApp link, currency, and platform commission.
            </p>

            <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Brand Name (English)</label>
                  <input
                    type="text"
                    value={settingsForm.brandName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, brandName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Brand Name (Urdu)</label>
                  <input
                    type="text"
                    value={settingsForm.brandNameUrdu}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, brandNameUrdu: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Currency Code</label>
                  <input
                    type="text"
                    value={settingsForm.currency}
                    onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Platform Commission %</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={settingsForm.platformCommissionPercentage}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        platformCommissionPercentage: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Free Cancellation (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="48"
                    value={settingsForm.freeCancellationWindowHours}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        freeCancellationWindowHours: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Official WhatsApp Number</label>
                  <input
                    type="text"
                    value={settingsForm.whatsappNumber}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })
                    }
                    placeholder="923001234567"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Customer Helpline</label>
                  <input
                    type="text"
                    value={settingsForm.contactPhone}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, contactPhone: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Support Email</label>
                <input
                  type="email"
                  value={settingsForm.supportEmail}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, supportEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Safety Guidelines Notice</label>
                <textarea
                  value={settingsForm.safetyGuidelinesText}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, safetyGuidelinesText: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Save Business Settings
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= AUDIT LOGS TAB ================= */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="font-serif text-xl font-bold text-stone-900">Administrative Audit Trail</h2>
            <div className="space-y-2 text-xs">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-bold text-stone-900 uppercase font-mono mr-2">
                      [{log.action}]
                    </span>
                    <span className="text-stone-700">{log.details}</span>
                  </div>
                  <div className="text-[11px] text-stone-400 shrink-0">
                    <span>By: {log.adminEmail} • </span>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= SUPPORT TICKETS TAB ================= */}
        {activeTab === 'support' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="font-serif text-xl font-bold text-stone-900">Customer Support Inquiries</h2>
            <div className="space-y-3">
              {supportTickets.map((tkt) => (
                <div
                  key={tkt.id}
                  className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-start justify-between gap-4 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-sm">{tkt.subject}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          tkt.status === 'open' ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {tkt.status}
                      </span>
                    </div>
                    <p className="text-stone-500 mt-0.5">
                      From: {tkt.userName} ({tkt.userEmail}) • {new Date(tkt.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-stone-700 mt-2 bg-white p-3 rounded-lg border border-stone-200">
                      {tkt.message}
                    </p>
                  </div>

                  {tkt.status === 'open' && (
                    <button
                      onClick={() => handleResolveTicket(tkt.id)}
                      className="shrink-0 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold text-xs"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Service Modal */}
      {showServiceModal && editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-stone-200 shadow-2xl relative">
            <h3 className="font-serif font-bold text-lg text-stone-900 mb-4">
              {editingService.id.startsWith('new_') ? 'Create New Service' : 'Edit Service'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Service Name *</label>
                <input
                  type="text"
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Category *</label>
                <select
                  value={editingService.categoryId}
                  onChange={(e) =>
                    setEditingService({ ...editingService, categoryId: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Duration (Mins) *</label>
                  <input
                    type="number"
                    value={editingService.durationMinutes}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        durationMinutes: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Base Price (PKR) *</label>
                  <input
                    type="number"
                    value={editingService.basePrice}
                    onChange={(e) =>
                      setEditingService({ ...editingService, basePrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Home Visit Fee (PKR)</label>
                <input
                  type="number"
                  value={editingService.homeVisitFee}
                  onChange={(e) =>
                    setEditingService({ ...editingService, homeVisitFee: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Description</label>
                <textarea
                  value={editingService.description}
                  onChange={(e) =>
                    setEditingService({ ...editingService, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Non-Medical Boundary Disclaimer
                </label>
                <input
                  type="text"
                  value={editingService.boundariesNotice || ''}
                  onChange={(e) =>
                    setEditingService({ ...editingService, boundariesNotice: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeServiceCheckbox"
                  checked={editingService.active}
                  onChange={(e) =>
                    setEditingService({ ...editingService, active: e.target.checked })
                  }
                  className="rounded text-emerald-800"
                />
                <label htmlFor="activeServiceCheckbox" className="font-semibold text-stone-700">
                  Service is Active & Bookable
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
