import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useOutletContext } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const API_URL = 'http://localhost:5555/events';

const EVENT_NAME_COLUMNS = ['event_name', 'eventName', 'eventname'];
const DATE_COLUMNS = ['created_at', 'updated_at', 'timestamp', 'date', 'time', 'datetime'];
const TEXT_ONLY_COLUMNS = ['update_by', 'updated_by'];

const COLUMN_LABELS = {
  id: 'ID',
  event_id: 'รหัส',
  event_name: 'Event Name',
  event_type: 'ประเภท',
  type: 'ประเภท',
  action: 'การกระทำ',
  username: 'ผู้ใช้',
  user_id: 'รหัสผู้ใช้',
  user: 'ผู้ใช้',
  ip: 'IP',
  ip_address: 'IP',
  description: 'รายละเอียด',
  message: 'ข้อความ',
  details: 'รายละเอียด',
  status: 'สถานะ',
  created_at: 'วันที่',
  updated_at: 'อัปเดต',
  update_by: 'อัปเดตโดย',
  timestamp: 'เวลา',
  date: 'วันที่',
};

const PAGE_SIZES = [25, 50, 100];

function formatLabel(key) {
  return COLUMN_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function isEventNameColumn(col) {
  const lower = col.toLowerCase();
  return EVENT_NAME_COLUMNS.includes(col) || lower === 'event_name' || lower.includes('event_name');
}

function isTextOnlyColumn(col) {
  return TEXT_ONLY_COLUMNS.includes(col) || col.toLowerCase() === 'update_by';
}

function isDateColumn(col) {
  const lower = col.toLowerCase();
  if (isEventNameColumn(col) || isTextOnlyColumn(col)) return false;
  return DATE_COLUMNS.includes(col) || lower.includes('date') || lower.includes('timestamp') || lower === 'time';
}

function dayStartMs(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
}

function dayEndMs(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
}

function normalizeDateRange(value) {
  if (value && typeof value === 'object' && ('from' in value || 'to' in value)) {
    return { from: value.from || '', to: value.to || '' };
  }
  if (typeof value === 'string' && value) return { from: value, to: '' };
  return { from: '', to: '' };
}

function rowMatchesDateRangeFilter(row, col, filterValue) {
  const { from, to } = normalizeDateRange(filterValue);
  if (!from && !to) return true;
  const d = parseDate(row[col]);
  if (!d) return false;
  const t = d.getTime();
  if (from && t < dayStartMs(from)) return false;
  if (to && t > dayEndMs(to)) return false;
  return true;
}

function parseDate(value) {
  if (value instanceof Date) return value;
  if (typeof value === 'number' && value > 1e9) return new Date(value);
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{10,13}$/.test(value)) {
      const d = new Date(value);
      if (!Number.isNaN(d.getTime())) return d;
    }
  }
  return null;
}

/** รูปแบบ วัน/เดือน/ปี(พ.ศ.) เวลา เช่น 25/05/2569 13:50:23 */
function formatThaiDateTime(value) {
  const d = parseDate(value);
  if (!d) return null;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear() + 543;
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} ${h}:${m}:${s}`;
}

function formatCellValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'ใช่' : 'ไม่';
  if (typeof value === 'object') return JSON.stringify(value);
  const thaiDate = formatThaiDateTime(value);
  if (thaiDate) return thaiDate;
  return String(value);
}

function normalizeEventsResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.events)) return data.events;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function getColumns(rows) {
  if (!rows.length) return [];
  const keys = new Set();
  rows.forEach((row) => {
    Object.keys(row || {}).forEach((k) => {
      const v = row[k];
      if (v === null || v === undefined || typeof v !== 'object') keys.add(k);
    });
  });
  const priority = ['id', 'event_id', 'event_name', 'timestamp', 'created_at', 'date', 'update_by', 'event_type', 'type', 'action', 'username', 'user', 'description', 'message', 'ip', 'status'];
  const sorted = [...keys].sort((a, b) => {
    const ai = priority.indexOf(a);
    const bi = priority.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  return sorted;
}

function rowMatchesSearch(row, columns, term) {
  const q = term.trim().toLowerCase();
  if (!q) return true;
  return columns.some((col) => formatCellValue(row[col]).toLowerCase().includes(q));
}

function rowMatchesFilters(row, filters) {
  return Object.entries(filters).every(([col, val]) => {
    if (isDateColumn(col)) return rowMatchesDateRangeFilter(row, col, val);
    const q = String(val).trim();
    if (!q) return true;
    if (isEventNameColumn(col)) {
      return String(row[col] ?? '').toLowerCase() === q.toLowerCase();
    }
    if (isTextOnlyColumn(col)) {
      return String(row[col] ?? '').toLowerCase().includes(q.toLowerCase());
    }
    return formatCellValue(row[col]).toLowerCase().includes(q.toLowerCase());
  });
}

function isFilterActive(val) {
  if (val && typeof val === 'object') return Boolean(val.from || val.to);
  return Boolean(String(val).trim());
}

function compareValues(a, b, key) {
  const va = a[key];
  const vb = b[key];
  if (va == null && vb == null) return 0;
  if (va == null) return 1;
  if (vb == null) return -1;
  const na = Number(va);
  const nb = Number(vb);
  if (!Number.isNaN(na) && !Number.isNaN(nb) && String(va) !== '' && String(vb) !== '') {
    return na - nb;
  }
  const da = Date.parse(va);
  const db = Date.parse(vb);
  if (!Number.isNaN(da) && !Number.isNaN(db)) return da - db;
  return String(va).localeCompare(String(vb), 'th');
}

function formatExportValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'ใช่' : 'ไม่';
  if (typeof value === 'object') return JSON.stringify(value);
  const thaiDate = formatThaiDateTime(value);
  if (thaiDate) return thaiDate;
  return String(value);
}

function escapeCsv(value) {
  const s = String(value);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function exportToCsv(rows, columns) {
  if (!rows.length || !columns.length) return;

  const lines = [
    columns.map((col) => escapeCsv(formatLabel(col))).join(','),
    ...rows.map((row) =>
      columns.map((col) => escapeCsv(formatExportValue(row[col]))).join(',')
    ),
  ];

  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  link.href = url;
  link.download = `history_${stamp}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

const filterInputClass =
  'w-full px-2 py-1 text-xs text-gray-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-purple-400';

function DateRangeFilter({ value, onChange, label }) {
  const range = normalizeDateRange(value);
  return (
    <div className="flex flex-col gap-1 min-w-[132px]" title={`ช่วงวันที่ — ${label}`}>
      <input
        type="date"
        value={range.from}
        onChange={(e) => onChange({ ...range, from: e.target.value })}
        className={filterInputClass}
        title="จากวันที่"
      />
      <span className="text-[10px] text-slate-300 text-center leading-none">ถึง</span>
      <input
        type="date"
        value={range.to}
        onChange={(e) => onChange({ ...range, to: e.target.value })}
        className={filterInputClass}
        title="ถึงวันที่"
      />
    </div>
  );
}

function ColumnFilter({ col, value, onChange, options }) {
  if (isDateColumn(col)) {
    return <DateRangeFilter value={value} onChange={onChange} label={formatLabel(col)} />;
  }
  if (isEventNameColumn(col)) {
    return (
      <select value={value || ''} onChange={(e) => onChange(e.target.value)} className={filterInputClass} title={`เลือก ${formatLabel(col)}`}>
        <option value="">ทั้งหมด</option>
        {options.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    );
  }
  return (
    <input
      type="text"
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={isTextOnlyColumn(col) ? 'พิมพ์ชื่อ...' : 'กรอง...'}
      className={filterInputClass}
      title={isTextOnlyColumn(col) ? `พิมพ์กรอง ${formatLabel(col)}` : undefined}
    />
  );
}

function SortIcon({ direction }) {
  if (!direction) {
    return (
      <svg className="w-3.5 h-3.5 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 8l5-5 5 5H5zm0 4l5 5 5-5H5z" />
      </svg>
    );
  }
  return (
    <svg className={`w-3.5 h-3.5 ${direction === 'asc' ? 'text-purple-500' : 'text-purple-500 rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3z" clipRule="evenodd" />
    </svg>
  );
}

export default function History() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useOutletContext() ?? {};

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showFilters, setShowFilters] = useState(false);

  const menuItems = [
    { icon: '🏠', label: 'หน้าแรก', path: '/' },
    { icon: '📊', label: 'ประวัติ', path: '/history' },
    { icon: '👤', label: 'ข้อมูลส่วนตัว', path: '/profile' },
    { icon: '⚙️', label: 'ตั้งค่า', path: '/settings' },
  ];

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(API_URL, { headers });
      if (!res.ok) throw new Error(`โหลดข้อมูลไม่สำเร็จ (${res.status})`);
      const json = await res.json();
      setEvents(normalizeEventsResponse(json));
    } catch (err) {
      setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const columns = useMemo(() => getColumns(events), [events]);

  const filterOptionsByColumn = useMemo(() => {
    const map = {};
    columns.forEach((col) => {
      if (isEventNameColumn(col)) {
        const set = new Set();
        events.forEach((row) => {
          if (row[col] != null && row[col] !== '') set.add(String(row[col]));
        });
        map[col] = [...set].sort((a, b) => a.localeCompare(b, 'th'));
      }
    });
    return map;
  }, [events, columns]);

  const filteredRows = useMemo(() => {
    let rows = [...events];
    if (globalSearch) {
      rows = rows.filter((row) => rowMatchesSearch(row, columns, globalSearch));
    }
    rows = rows.filter((row) => rowMatchesFilters(row, columnFilters));
    if (sortConfig.key && sortConfig.direction) {
      rows.sort((a, b) => {
        const cmp = compareValues(a, b, sortConfig.key);
        return sortConfig.direction === 'asc' ? cmp : -cmp;
      });
    }
    return rows;
  }, [events, columns, globalSearch, columnFilters, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, safePage, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [globalSearch, columnFilters, sortConfig, pageSize]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      if (prev.direction === 'desc') return { key: null, direction: null };
      return { key, direction: 'asc' };
    });
  };

  const setColumnFilter = (col, value) => {
    setColumnFilters((prev) => {
      const next = { ...prev };
      if (isDateColumn(col)) {
        const range = normalizeDateRange(value);
        if (!range.from && !range.to) delete next[col];
        else next[col] = range;
      } else if (!String(value).trim()) {
        delete next[col];
      } else {
        next[col] = value;
      }
      return next;
    });
  };

  const clearAllFilters = () => {
    setGlobalSearch('');
    setColumnFilters({});
    setSortConfig({ key: null, direction: null });
  };

  const hasActiveFilters =
    globalSearch ||
    sortConfig.key ||
    Object.values(columnFilters).some(isFilterActive);

  const handleExport = () => {
    if (!filteredRows.length) return;
    exportToCsv(filteredRows, columns);
  };

  return (
    <div className="h-screen w-full bg-gray-100 flex overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-800">ประวัติการใช้งาน</h1>
          <div className="w-10" />
        </header>

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden p-3 lg:p-5">
          <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            {/* หัวข้อซ้ำ — แสดงเฉพาะ desktop (mobile ใช้หัวข้อใน header ด้านบน) */}
            <h2 className="hidden lg:block text-xl lg:text-2xl font-bold text-gray-900">ประวัติการใช้งาน</h2>
            <div className="flex items-center gap-2 flex-wrap justify-end sm:justify-start">
              <button
                type="button"
                onClick={handleExport}
                disabled={loading || !filteredRows.length}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
              <button
                type="button"
                onClick={fetchEvents}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all disabled:opacity-50"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                รีเฟรช
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="flex-shrink-0 p-3 lg:p-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="relative flex-1">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={globalSearch}
                      onChange={(e) => setGlobalSearch(e.target.value)}
                      placeholder="ค้นหาทุกคอลัมน์..."
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setShowFilters((v) => !v)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        showFilters
                          ? 'bg-purple-50 border-purple-200 text-purple-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {showFilters ? ' ซ่อนตัวกรอง' : 'แสดงตัวกรอง'}
                    </button>
                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-all"
                      >
                        ล้างทั้งหมด
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  แสดง <span className="font-semibold text-gray-700">{filteredRows.length}</span> จาก{' '}
                  <span className="font-semibold text-gray-700">{events.length}</span> รายการ
                  {hasActiveFilters && ' (กรองแล้ว)'}
                  {filteredRows.length > 0 }
                </p>
              </div>

              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-0">
                  <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                  <p className="text-gray-500 text-sm">กำลังโหลดข้อมูล...</p>
                </div>
              ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 min-h-0">
                  <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-2xl">⚠️</div>
                  <p className="text-gray-700 font-medium">{error}</p>
                  <button type="button" onClick={fetchEvents} className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors">
                    ลองอีกครั้ง
                  </button>
                </div>
              ) : columns.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 min-h-0">
                  <p className="text-lg font-medium text-gray-700 mb-1">ไม่มีข้อมูล</p>
                  <p className="text-sm">ยังไม่มีรายการในประวัติการใช้งาน</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-h-0 overflow-auto">
                    <table className="w-full min-w-[640px] text-left border-collapse">
                      <thead className="sticky top-0 z-20">
                        <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-sm">
                          {columns.map((col) => (
                            <th
                              key={col}
                              className={`px-2 py-2 align-top whitespace-nowrap ${isDateColumn(col) ? 'min-w-[150px]' : 'min-w-[120px]'}`}
                            >
                              <div className="flex flex-col gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleSort(col)}
                                  className="flex items-center gap-1 hover:text-purple-200 transition-colors text-left"
                                >
                                  <span className="text-xs font-semibold uppercase tracking-wider">{formatLabel(col)}</span>
                                  <SortIcon direction={sortConfig.key === col ? sortConfig.direction : null} />
                                </button>
                                {showFilters && (
                                  <ColumnFilter
                                    col={col}
                                    value={columnFilters[col] ?? (isDateColumn(col) ? { from: '', to: '' } : '')}
                                    onChange={(v) => setColumnFilter(col, v)}
                                    options={filterOptionsByColumn[col] || []}
                                  />
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedRows.length === 0 ? (
                          <tr>
                            <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500 text-sm">
                              ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                            </td>
                          </tr>
                        ) : (
                          paginatedRows.map((row, idx) => (
                            <tr
                              key={row.id ?? row.event_id ?? `${safePage}-${idx}`}
                              className={`transition-colors hover:bg-purple-50/50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}
                            >
                              {columns.map((col) => (
                                <td key={col} className="px-4 py-2.5 text-sm text-gray-700 whitespace-nowrap max-w-[280px] truncate" title={formatCellValue(row[col])}>
                                  {col === 'status' || col === 'event_type' || col === 'type' ? (
                                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                      {formatCellValue(row[col])}
                                    </span>
                                  ) : (
                                    formatCellValue(row[col])
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 px-3 lg:px-4 py-3 border-t border-gray-100 bg-slate-50/80">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>แสดง</span>
                      <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
                      >
                        {PAGE_SIZES.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                      <span>รายการต่อหน้า</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={safePage <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <span className="text-sm text-gray-600 min-w-[100px] text-center">
                        หน้า {safePage} / {totalPages}
                      </span>
                      <button
                        type="button"
                        disabled={safePage >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              )}
          </div>
        </main>

        <nav className="lg:hidden bg-white border-t border-gray-200 flex justify-around py-2 flex-shrink-0">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                location.pathname === item.path ? 'text-purple-600' : 'text-gray-500'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
