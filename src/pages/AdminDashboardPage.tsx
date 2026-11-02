import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  LogOut, 
  LayoutDashboard, 
  Home, 
  Search, 
  Eye, 
  Trash2, 
  Layers, 
  Clock, 
  RotateCw, 
  CheckCircle2, 
  ChevronDown, 
  Menu, 
  X, 
  AlertCircle, 
  Sparkles,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { Link, useRouter } from '../router/RouterContext';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ComplaintRecord, ComplaintCategory, ComplaintStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ComplaintDetailsModal } from '../components/ComplaintDetailsModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

const CATEGORIES: (ComplaintCategory | 'All Categories')[] = [
  'All Categories',
  'Electrical',
  'IT / Computers',
  'Classroom Equipment',
  'Water / Plumbing',
  'Cleanliness',
  'Other',
];

const STATUSES: (ComplaintStatus | 'All Statuses')[] = [
  'All Statuses',
  'Pending',
  'In Progress',
  'Resolved',
];

export const AdminDashboardPage: React.FC = () => {
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const { navigate } = useRouter();

  // Route protection: redirect to login if session is absent or unauthorized
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/admin/login?unauthorized=true');
    }
  }, [authLoading, user, isAdmin, navigate]);

  // Real complaints state from Supabase
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ComplaintCategory | 'All Categories'>('All Categories');
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus | 'All Statuses'>('All Statuses');

  // Modals state
  const [activeDetailsComplaint, setActiveDetailsComplaint] = useState<ComplaintRecord | null>(null);
  const [complaintToDelete, setComplaintToDelete] = useState<ComplaintRecord | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Status notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Close mobile sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };
    if (mobileSidebarOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileSidebarOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Fetch complaints from public.complaints using authenticated admin session (requirements 2 & 3)
  const fetchComplaints = useCallback(async () => {
    setIsLoadingComplaints(true);
    setFetchError(null);

    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase client is not configured. Please check environment variables.');
      }

      // Query public.complaints with the 9 required fields
      const { data, error } = await supabase
        .from('complaints')
        .select('id, complaint_id, student_name, email, category, location, description, status, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message || 'Failed to fetch complaints from database.');
      }

      interface SupabaseComplaintRow {
        id: string | number;
        complaint_id?: string | null;
        student_name: string;
        email: string;
        category: ComplaintCategory;
        location: string;
        description: string;
        status: ComplaintStatus;
        created_at: string;
      }

      const rows = (data || []) as SupabaseComplaintRow[];

      const mapped: ComplaintRecord[] = rows.map((row) => {
        const formattedDate = row.created_at
          ? new Date(row.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'Recent';

        const displayId = row.complaint_id || String(row.id);

        return {
          id: displayId,
          dbId: String(row.id),
          complaintId: displayId,
          studentName: row.student_name || 'Anonymous Student',
          email: row.email || '',
          category: (row.category as ComplaintCategory) || 'Other',
          location: row.location || 'Campus',
          description: row.description || '',
          date: formattedDate,
          status: (row.status as ComplaintStatus) || 'Pending',
          createdAt: row.created_at || new Date().toISOString(),
        };
      });

      setComplaints(mapped);
    } catch (err: unknown) {
      console.error('Error fetching complaints from Supabase:', err);
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Unable to load complaints from the database.';
      setFetchError(message);
    } finally {
      setIsLoadingComplaints(false);
    }
  }, []);

  // Fetch complaints on mount once admin authentication is confirmed
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      fetchComplaints();
    }
  }, [authLoading, user, isAdmin, fetchComplaints]);

  // Dynamic Statistics calculation from fetched dataset (requirement 6)
  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === 'Pending').length;
    const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
    const resolved = complaints.filter((c) => c.status === 'Resolved').length;
    return { total, pending, inProgress, resolved };
  }, [complaints]);

  // Most Reported Issue calculation (dynamically calculated from live complaints dataset)
  const mostReported = useMemo(() => {
    if (!complaints || complaints.length === 0) {
      return {
        hasData: false,
        categoryDisplay: 'No complaints yet',
        count: 0,
        percentage: 0,
        isTie: false,
        categories: [] as string[],
      };
    }

    const counts: Record<string, number> = {};
    for (const c of complaints) {
      const cat = c.category?.trim() || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    }

    let maxCount = 0;
    for (const cnt of Object.values(counts)) {
      if (cnt > maxCount) {
        maxCount = cnt;
      }
    }

    if (maxCount === 0) {
      return {
        hasData: false,
        categoryDisplay: 'No complaints yet',
        count: 0,
        percentage: 0,
        isTie: false,
        categories: [] as string[],
      };
    }

    const topCategories = Object.keys(counts).filter((cat) => counts[cat] === maxCount);
    const isTie = topCategories.length > 1;
    const categoryDisplay = isTie ? topCategories.join(', ') : topCategories[0];
    const percentage = Math.round((maxCount / complaints.length) * 100);

    return {
      hasData: true,
      categoryDisplay,
      count: maxCount,
      percentage,
      isTie,
      categories: topCategories,
    };
  }, [complaints]);

  // Combined filtering: Search across ID, Student Name, Email + Category + Status (requirements 7 & 8)
  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      // 1. Category check
      if (selectedCategory !== 'All Categories' && item.category !== selectedCategory) {
        return false;
      }

      // 2. Status check
      if (selectedStatus !== 'All Statuses' && item.status !== selectedStatus) {
        return false;
      }

      // 3. Search query check (ID, Student Name, Email address, Category, Location)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesId = item.id.toLowerCase().includes(query) || (item.complaintId ? item.complaintId.toLowerCase().includes(query) : false);
        const matchesName = item.studentName.toLowerCase().includes(query);
        const matchesEmail = item.email.toLowerCase().includes(query);
        const matchesCat = item.category.toLowerCase().includes(query);
        const matchesLoc = item.location.toLowerCase().includes(query);
        return matchesId || matchesName || matchesEmail || matchesCat || matchesLoc;
      }

      return true;
    });
  }, [complaints, searchQuery, selectedCategory, selectedStatus]);

  // Status change handler (Updates in database and refreshes data per requirement 11)
  const handleStatusChange = async (id: string, newStatus: ComplaintStatus) => {
    const target = complaints.find((c) => c.id === id || c.dbId === id || c.complaintId === id);
    if (!target) return;

    try {
      setIsUpdating(true);
      const dbIdentifier = target.dbId || target.id;

      // Update in Supabase public.complaints
      const { error } = await supabase
        .from('complaints')
        .update({ status: newStatus })
        .eq('id', dbIdentifier);

      if (error) {
        // Fallback by complaint_id
        const fallback = await supabase
          .from('complaints')
          .update({ status: newStatus })
          .eq('complaint_id', target.id);

        if (fallback.error) {
          throw new Error(fallback.error.message || error.message);
        }
      }

      showToast(`Status of ${target.id} updated to "${newStatus}"`);

      // Update active modal view if open
      if (activeDetailsComplaint && (activeDetailsComplaint.id === id || activeDetailsComplaint.dbId === target.dbId)) {
        setActiveDetailsComplaint((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      // Refresh complaints list from database
      await fetchComplaints();
    } catch (err: unknown) {
      console.error('Error updating complaint status:', err);
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to update complaint status.';
      showToast(`Error: ${message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete handler (Deletes from public.complaints via primary key 'id' and refreshes data)
  const handleDeleteConfirm = async () => {
    const target = complaintToDelete;
    if (!target) return;

    // 1. Defensive security check: only complaints with status 'Resolved' can be deleted
    if (target.status !== 'Resolved') {
      showToast('Error: Only complaints with status "Resolved" can be deleted.');
      setComplaintToDelete(null);
      return;
    }

    // 2. Verify the complaint's actual database primary key (dbId) exists before issuing query
    const targetDbId = target.dbId;
    if (!targetDbId) {
      showToast('Error: Unable to delete. Complaint database record ID is missing.');
      return;
    }

    try {
      setIsDeleting(true);

      // 2. Perform database deletion using the actual database primary key ('id'), NOT complaint_id
      const { error } = await supabase
        .from('complaints')
        .delete()
        .eq('id', targetDbId);

      if (error) {
        throw error;
      }

      // 3. Successful deletion: show success toast and close delete confirmation modal
      showToast('Complaint deleted successfully');
      setComplaintToDelete(null);

      // 4. If ComplaintDetailsModal is open for this complaint, close it too
      if (
        activeDetailsComplaint &&
        (activeDetailsComplaint.dbId === targetDbId ||
          activeDetailsComplaint.id === target.id ||
          activeDetailsComplaint.complaintId === target.complaintId)
      ) {
        setActiveDetailsComplaint(null);
      }

      // 5. Re-fetch complaints from Supabase so table & KPI statistics update immediately
      await fetchComplaints();
    } catch (err: unknown) {
      console.error('Error deleting complaint:', err);
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to delete complaint record.';
      // Display helpful error toast and do NOT close the modal
      showToast(`Error: ${message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSelectedStatus('All Statuses');
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    navigate('/admin/login');
  };

  // Institutional session verification loader
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="text-sm font-medium">Verifying administrator session...</span>
        </div>
      </div>
    );
  }

  // If not authenticated or not admin, return null while redirect effect runs
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row">
      
      {/* =========================================================================
          1. SIDEBAR NAVIGATION
          ========================================================================= */}
      
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900 text-sm">
            CampusCare <span className="text-emerald-700 text-xs font-semibold">Administration</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
          aria-label="Toggle admin navigation"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar (Desktop + Mobile Responsive) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-base tracking-tight leading-tight">
                CampusCare <span className="text-emerald-400 font-semibold text-xs">Admin</span>
              </div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Administration Portal
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 text-sm">
            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Operations
            </div>

            <button
              type="button"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-emerald-600/20 text-emerald-300 font-semibold border border-emerald-500/30 text-left transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>Complaints Management</span>
            </button>

            <Link
              to="/"
              onClick={() => setMobileSidebarOpen(false)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-left"
            >
              <Home className="w-4 h-4" />
              <span>Back to Student Portal</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer with Logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="mb-3 px-3 py-2 rounded-lg bg-slate-800/60 text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold block">Campus Administrator</span>
            <span className="text-slate-200 block truncate font-mono text-[11px]" title={user?.email || ''}>
              {user?.email || 'admin'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      {/* =========================================================================
          2. MAIN CONTENT AREA
          ========================================================================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top bar / Welcome Banner */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Facility Management Portal</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                CampusCare Administration
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
                Facility & Complaints Management Desk · Review, triage, and resolve campus issue tickets.
              </p>
            </div>

            {/* Quick action: Refresh Database Data */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchComplaints}
                disabled={isLoadingComplaints || isUpdating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
                title="Refresh complaints from database"
              >
                <RotateCw className={`w-3.5 h-3.5 text-slate-500 ${isLoadingComplaints ? 'animate-spin' : ''}`} />
                <span>{isLoadingComplaints ? 'Refreshing...' : 'Refresh Data'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* =========================================================================
              3. STATISTICS CARDS (Dynamically calculated from dataset)
              ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 sm:gap-5">
            
            {/* 1. Total Complaints */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-4.5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Total Complaints
                </span>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5 tabular-nums">
                  {stats.total}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Logged in dataset</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            {/* 2. Pending */}
            <div className="bg-white rounded-2xl border border-amber-200/90 p-4 sm:p-4.5 shadow-2xs flex items-center justify-between bg-gradient-to-br from-amber-50/40 to-white">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">
                  Pending
                </span>
                <div className="text-2xl sm:text-3xl font-bold text-amber-900 mt-0.5 tabular-nums">
                  {stats.pending}
                </div>
                <div className="text-[11px] text-amber-700/80 mt-0.5">Awaiting assignment</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            {/* 3. In Progress */}
            <div className="bg-white rounded-2xl border border-blue-200/90 p-4 sm:p-4.5 shadow-2xs flex items-center justify-between bg-gradient-to-br from-blue-50/40 to-white">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-800">
                  In Progress
                </span>
                <div className="text-2xl sm:text-3xl font-bold text-blue-900 mt-0.5 tabular-nums">
                  {stats.inProgress}
                </div>
                <div className="text-[11px] text-blue-700/80 mt-0.5">Technician dispatched</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                <RotateCw className="w-5 h-5" />
              </div>
            </div>

            {/* 4. Resolved */}
            <div className="bg-white rounded-2xl border border-emerald-200/90 p-4 sm:p-4.5 shadow-2xs flex items-center justify-between bg-gradient-to-br from-emerald-50/40 to-white">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                  Resolved
                </span>
                <div className="text-2xl sm:text-3xl font-bold text-emerald-900 mt-0.5 tabular-nums">
                  {stats.resolved}
                </div>
                <div className="text-[11px] text-emerald-700/80 mt-0.5">Repairs completed</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* 5. Most Reported Issue */}
            <div className="bg-white rounded-2xl border border-emerald-200/90 p-4 sm:p-4.5 shadow-2xs flex items-center justify-between bg-gradient-to-br from-emerald-50/40 to-white sm:col-span-2 xl:col-span-1">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                    Most Reported Issue
                  </span>
                  {mostReported.isTie && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-tight">
                      Tie
                    </span>
                  )}
                </div>
                <div
                  className={`font-bold text-slate-900 mt-0.5 truncate ${
                    mostReported.hasData ? 'text-lg sm:text-xl' : 'text-sm sm:text-base text-slate-400 font-medium'
                  }`}
                  title={mostReported.categoryDisplay}
                >
                  {mostReported.categoryDisplay}
                </div>
                <div className="text-[11px] text-emerald-700/90 mt-0.5 font-medium truncate">
                  {mostReported.hasData ? (
                    <span>
                      <strong className="text-slate-800 font-semibold">{mostReported.count}</strong>{' '}
                      {mostReported.count === 1 ? 'complaint' : 'complaints'}
                      {mostReported.isTie ? ' each' : ''} · {mostReported.percentage}% of total
                    </span>
                  ) : (
                    <span className="text-slate-400">0 reports logged</span>
                  )}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* =========================================================================
              4. SEARCH & FILTERS TOOLBAR
              ========================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Complaint ID (e.g. CMP-...), student name, or email..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Filters Group */}
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
                
                {/* Category Filter */}
                <div className="relative w-full sm:w-auto sm:min-w-[170px]">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as ComplaintCategory | 'All Categories')}
                    className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Status Filter */}
                <div className="relative w-full sm:w-auto sm:min-w-[140px]">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as ComplaintStatus | 'All Statuses')}
                    className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Reset Filters if active */}
                {(searchQuery || selectedCategory !== 'All Categories' || selectedStatus !== 'All Statuses') && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors text-center cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}

              </div>

            </div>

            {/* Sub-bar indicator */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span>
                Showing <strong className="text-slate-800 font-semibold">{filteredComplaints.length}</strong> of{' '}
                <strong className="text-slate-800 font-semibold">{complaints.length}</strong> complaints
              </span>
              <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Supabase Database</span>
              </span>
            </div>
          </div>

          {/* =========================================================================
              5. COMPLAINT MANAGEMENT TABLE (With loading, error, and empty states)
              ========================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            
            {/* 1. Error State */}
            {fetchError && (
              <div className="p-8 text-center bg-red-50/50 border-b border-red-100">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-red-950 mb-1">
                  Unable to Load Complaints
                </h3>
                <p className="text-xs text-red-700 max-w-md mx-auto mb-4 leading-relaxed">
                  {fetchError}
                </p>
                <button
                  type="button"
                  onClick={fetchComplaints}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Retry Connection</span>
                </button>
              </div>
            )}

            {/* 2. Loading State (initial or refreshing) */}
            {isLoadingComplaints && complaints.length === 0 ? (
              <div className="p-14 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-900 mb-1">
                  Loading Live Complaints
                </h3>
                <p className="text-xs text-slate-500">
                  Retrieving records from public.complaints...
                </p>
              </div>
            ) : filteredComplaints.length > 0 ? (
              /* 3. Real Complaints Table */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 border-collapse min-w-[720px]">
                  <thead className="bg-slate-50/90 border-b border-slate-200 text-xs uppercase font-semibold text-slate-600">
                    <tr>
                      <th scope="col" className="px-4 py-3.5 sm:px-6 sm:py-4">Complaint ID</th>
                      <th scope="col" className="px-4 py-3.5 sm:px-6 sm:py-4">Student Name</th>
                      <th scope="col" className="px-4 py-3.5 sm:px-6 sm:py-4">Category</th>
                      <th scope="col" className="px-4 py-3.5 sm:px-6 sm:py-4">Location</th>
                      <th scope="col" className="px-4 py-3.5 sm:px-6 sm:py-4">Date</th>
                      <th scope="col" className="px-4 py-3.5 sm:px-6 sm:py-4">Status</th>
                      <th scope="col" className="px-4 py-3.5 sm:px-6 sm:py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredComplaints.map((item) => (
                      <tr 
                        key={item.dbId || item.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* 1. Complaint ID */}
                        <td className="px-4 py-3.5 sm:px-6 sm:py-4 whitespace-nowrap">
                          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/60">
                            {item.id}
                          </span>
                        </td>

                        {/* 2. Student Name & Email */}
                        <td className="px-4 py-3.5 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{item.studentName}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{item.email}</div>
                        </td>

                        {/* 3. Category */}
                        <td className="px-4 py-3.5 sm:px-6 sm:py-4 whitespace-nowrap">
                          <span className="text-xs font-medium bg-emerald-50/80 text-emerald-900 px-2 py-0.5 rounded border border-emerald-100">
                            {item.category}
                          </span>
                        </td>

                        {/* 4. Location */}
                        <td className="px-4 py-3.5 sm:px-6 sm:py-4 whitespace-nowrap text-xs text-slate-700">
                          {item.location}
                        </td>

                        {/* 5. Date */}
                        <td className="px-4 py-3.5 sm:px-6 sm:py-4 whitespace-nowrap text-xs text-slate-500 tabular-nums">
                          {item.date}
                        </td>

                        {/* 6. Status & quick status changer */}
                        <td className="px-4 py-3.5 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={item.status} size="sm" />
                            
                            {/* Inline quick status dropdown */}
                            <select
                              value={item.status}
                              disabled={isUpdating}
                              onChange={(e) => handleStatusChange(item.id, e.target.value as ComplaintStatus)}
                              className="text-[11px] border border-slate-200 rounded-md py-0.5 px-1.5 text-slate-600 bg-white hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer disabled:opacity-50"
                              title="Update status in database"
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                            </select>
                          </div>
                        </td>

                        {/* 7. Actions */}
                        <td className="px-4 py-3.5 sm:px-6 sm:py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setActiveDetailsComplaint(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition-colors cursor-pointer"
                              title="View full details"
                            >
                              <Eye className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Details</span>
                            </button>

                            {item.status === 'Resolved' && (
                              <button
                                type="button"
                                onClick={() => setComplaintToDelete(item)}
                                disabled={isUpdating || isDeleting}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
                                title="Delete complaint"
                                aria-label={`Delete complaint ${item.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : complaints.length === 0 ? (
              /* 4. Empty State: No complaints in database yet */
              <div className="p-12 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  No Complaints Registered Yet
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-4">
                  There are currently no complaints in the database. When students submit issue reports through the portal, they will appear here in real time.
                </p>
                <button
                  type="button"
                  onClick={fetchComplaints}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Check Again</span>
                </button>
              </div>
            ) : (
              /* 5. Empty State: Filter / Search yielded no results */
              <div className="p-12 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  No matching complaints
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-4">
                  No complaints match your current search query or active category and status filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
                >
                  <span>Clear Search & Filters</span>
                </button>
              </div>
            )}

          </div>

        </div>
      </main>

      {/* =========================================================================
          MODALS
          ========================================================================= */}
      
      {/* 1. Complaint Details Modal */}
      <ComplaintDetailsModal
        isOpen={Boolean(activeDetailsComplaint)}
        complaint={activeDetailsComplaint}
        onClose={() => setActiveDetailsComplaint(null)}
        onStatusChange={handleStatusChange}
        onDelete={(complaint) => setComplaintToDelete(complaint)}
      />

      {/* 2. Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(complaintToDelete)}
        complaint={complaintToDelete}
        isDeleting={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setComplaintToDelete(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
      />

    </div>
  );
};
