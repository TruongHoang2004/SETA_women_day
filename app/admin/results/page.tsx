"use client";

import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";

type Registration = {
  id: number;
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  luckyNumber: string;
  createdAt: string;
  question: {
    wishes: string | null;
    selectedImages: string[];
  } | null;
};

type Pagination = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

type SortField =
  | "employeeId"
  | "fullName"
  | "email"
  | "department"
  | "luckyNumber"
  | "createdAt";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function ResultsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [departments, setDepartments] = useState<string[]>([]);

  // Controls
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search change
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        sortOrder,
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (selectedDepartment) params.set("department", selectedDepartment);

      const res = await fetch(`/api/admin/results?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRegistrations(data.data);
        setPagination(data.pagination);
        setDepartments(data.departments);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortBy, sortOrder, debouncedSearch, selectedDepartment]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const getSortIcon = (field: SortField) => {
    if (sortBy !== field) return "↕";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const goToPage = (p: number) => {
    if (p >= 1 && p <= pagination.totalPages) {
      setPage(p);
    }
  };

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    const total = pagination.totalPages;
    const current = pagination.page;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push("...");
      for (
        let i = Math.max(2, current - 1);
        i <= Math.min(total - 1, current + 1);
        i++
      ) {
        pages.push(i);
      }
      if (current < total - 2) pages.push("...");
      pages.push(total);
    }

    return pages;
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ sortBy, sortOrder });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (selectedDepartment) params.set("department", selectedDepartment);

      const res = await fetch(`/api/admin/results/export?${params.toString()}`);
      const data = await res.json();

      if (!data.success || !data.data?.length) {
        alert("Không có dữ liệu để xuất!");
        return;
      }

      // Transform data for Excel
      const excelData = data.data.map((reg: Registration, idx: number) => ({
        STT: idx + 1,
        "Mã Nhân Viên": reg.employeeId,
        "Họ và Tên": reg.fullName,
        "Phòng Ban": reg.department,
        Email: reg.email,
        "Số May Mắn": reg.luckyNumber,
        "Ngày Đăng Ký": new Date(reg.createdAt).toLocaleString("vi-VN"),
        "Lời Chúc": reg.question?.wishes || "",
        "Ảnh Đã Chọn": reg.question?.selectedImages?.join(", ") || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Auto-size columns
      const columnWidths = Object.keys(excelData[0]).map((key) => {
        const maxLen = Math.max(
          key.length,
          ...excelData.map(
            (row: Record<string, string | number>) =>
              String(row[key] || "").length,
          ),
        );
        return { wch: Math.min(maxLen + 2, 50) };
      });
      worksheet["!cols"] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Kết Quả Đăng Ký");

      const timestamp = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(workbook, `ket-qua-dang-ky_${timestamp}.xlsx`);
    } catch {
      alert("Có lỗi xảy ra khi xuất file Excel!");
    } finally {
      setExporting(false);
    }
  };

  const startIdx = (pagination.page - 1) * pagination.pageSize + 1;
  const endIdx = Math.min(
    pagination.page * pagination.pageSize,
    pagination.totalCount,
  );

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>📊 Thống Kê Đăng Ký</h1>
            <p style={styles.subtitle}>
              Tổng cộng{" "}
              <span style={styles.totalBadge}>{pagination.totalCount}</span> bản
              ghi
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              id="export-excel-btn"
              onClick={handleExport}
              disabled={exporting || pagination.totalCount === 0}
              style={{
                ...styles.exportBtn,
                ...(exporting || pagination.totalCount === 0
                  ? { opacity: 0.6, cursor: "not-allowed" }
                  : {}),
              }}
            >
              {exporting ? (
                <>
                  <span style={styles.exportSpinner} /> Đang xuất...
                </>
              ) : (
                <>📥 Xuất Excel</>
              )}
            </button>
            <a href="/admin" style={styles.backBtn}>
              ⬅ Quay lại
            </a>
          </div>
        </div>

        {/* Controls Bar */}
        <div style={styles.controlsBar}>
          {/* Search */}
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              id="search-input"
              type="text"
              placeholder="Tìm kiếm theo mã NV, tên, email, phòng ban, số may mắn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={styles.clearBtn}
                title="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>

          {/* Department filter */}
          <div style={styles.filterWrapper}>
            <select
              id="department-filter"
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setPage(1);
              }}
              style={styles.select}
            >
              <option value="">🏢 Tất cả Phòng ban</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Page size */}
          <div style={styles.filterWrapper}>
            <select
              id="page-size-select"
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value));
                setPage(1);
              }}
              style={styles.select}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} / trang
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={styles.tableContainer}>
          {loading && (
            <div style={styles.loadingOverlay}>
              <div style={styles.spinner} />
              <span style={{ marginLeft: 10, color: "#888" }}>Đang tải...</span>
            </div>
          )}
          <table style={styles.table}>
            <thead>
              <tr>
                {[
                  { field: "employeeId" as SortField, label: "Mã NV" },
                  { field: "fullName" as SortField, label: "Họ Tên" },
                  { field: "department" as SortField, label: "Phòng Ban" },
                  { field: "email" as SortField, label: "Email" },
                  { field: "luckyNumber" as SortField, label: "Mã May Mắn" },
                  { field: "createdAt" as SortField, label: "Ngày ĐK" },
                ].map((col) => (
                  <th
                    key={col.field}
                    style={{
                      ...styles.th,
                      cursor: "pointer",
                      userSelect: "none",
                      background:
                        sortBy === col.field
                          ? "rgba(214, 51, 132, 0.15)"
                          : undefined,
                    }}
                    onClick={() => handleSort(col.field)}
                  >
                    <div style={styles.thContent}>
                      {col.label}
                      <span
                        style={{
                          ...styles.sortIcon,
                          opacity: sortBy === col.field ? 1 : 0.3,
                          color:
                            sortBy === col.field ? "var(--primary)" : "#999",
                        }}
                      >
                        {getSortIcon(col.field)}
                      </span>
                    </div>
                  </th>
                ))}
                <th style={styles.th}>Lời chúc</th>
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 && !loading ? (
                <tr>
                  <td colSpan={7} style={styles.emptyState}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                    <div
                      style={{ fontSize: 16, fontWeight: 600, color: "#666" }}
                    >
                      {debouncedSearch || selectedDepartment
                        ? "Không tìm thấy kết quả phù hợp"
                        : "Chưa có ai đăng ký"}
                    </div>
                    {(debouncedSearch || selectedDepartment) && (
                      <button
                        onClick={() => {
                          setSearch("");
                          setSelectedDepartment("");
                          setPage(1);
                        }}
                        style={styles.resetBtn}
                      >
                        Xóa bộ lọc
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                registrations.map((reg, idx) => (
                  <tr
                    key={reg.id}
                    style={{
                      ...styles.tr,
                      background: idx % 2 === 0 ? "#fff" : "#fdf2f8",
                    }}
                  >
                    <td style={styles.td}>
                      <span style={styles.employeeIdBadge}>
                        {reg.employeeId}
                      </span>
                    </td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>
                      {reg.fullName}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.departmentBadge}>
                        {reg.department}
                      </span>
                    </td>
                    <td style={{ ...styles.td, color: "#555", fontSize: 14 }}>
                      {reg.email}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.luckyNumberBadge}>
                        {reg.luckyNumber}
                      </span>
                    </td>
                    <td style={{ ...styles.td, fontSize: 13, color: "#888" }}>
                      {new Date(reg.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        maxWidth: 220,
                        wordWrap: "break-word",
                      }}
                    >
                      {reg.question?.wishes ? (
                        <i style={{ color: "#555" }}>
                          &ldquo;{reg.question.wishes}&rdquo;
                        </i>
                      ) : (
                        <span style={{ color: "#ccc" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 0 && (
          <div style={styles.paginationBar}>
            <div style={styles.paginationInfo}>
              Hiển thị <b>{startIdx}</b>–<b>{endIdx}</b> trên{" "}
              <b>{pagination.totalCount}</b> kết quả
            </div>

            <div style={styles.paginationControls}>
              <button
                id="pagination-first"
                onClick={() => goToPage(1)}
                disabled={page === 1}
                style={{
                  ...styles.pageBtn,
                  ...(page === 1 ? styles.pageBtnDisabled : {}),
                }}
                title="Trang đầu"
              >
                «
              </button>
              <button
                id="pagination-prev"
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                style={{
                  ...styles.pageBtn,
                  ...(page === 1 ? styles.pageBtnDisabled : {}),
                }}
                title="Trang trước"
              >
                ‹
              </button>

              {renderPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} style={styles.ellipsis}>
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goToPage(p as number)}
                    style={{
                      ...styles.pageBtn,
                      ...(page === p ? styles.pageBtnActive : {}),
                    }}
                  >
                    {p}
                  </button>
                ),
              )}

              <button
                id="pagination-next"
                onClick={() => goToPage(page + 1)}
                disabled={page === pagination.totalPages}
                style={{
                  ...styles.pageBtn,
                  ...(page === pagination.totalPages
                    ? styles.pageBtnDisabled
                    : {}),
                }}
                title="Trang sau"
              >
                ›
              </button>
              <button
                id="pagination-last"
                onClick={() => goToPage(pagination.totalPages)}
                disabled={page === pagination.totalPages}
                style={{
                  ...styles.pageBtn,
                  ...(page === pagination.totalPages
                    ? styles.pageBtnDisabled
                    : {}),
                }}
                title="Trang cuối"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inline keyframes for spinner */}
      <style>{`
                @keyframes spin-loader {
                    to { transform: rotate(360deg); }
                }
            `}</style>
    </div>
  );
}

// --------------- Styles ---------------

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    padding: "30px 20px",
    maxWidth: 1400,
    margin: "0 auto",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    minHeight: "100vh",
  },
  container: {
    background: "rgba(255, 255, 255, 0.92)",
    backdropFilter: "blur(20px)",
    borderRadius: 20,
    boxShadow:
      "0 20px 60px rgba(214, 51, 132, 0.12), 0 1px 3px rgba(0,0,0,0.06)",
    border: "1px solid rgba(255, 255, 255, 0.6)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "28px 32px 20px",
    borderBottom: "1px solid #f3e8ef",
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    color: "var(--primary)",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  totalBadge: {
    display: "inline-block",
    background: "linear-gradient(135deg, var(--primary), var(--secondary))",
    color: "white",
    padding: "2px 10px",
    borderRadius: 20,
    fontWeight: 700,
    fontSize: 13,
  },
  backBtn: {
    background: "linear-gradient(135deg, #6c757d, #495057)",
    color: "white",
    padding: "10px 22px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 14,
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(108, 117, 125, 0.3)",
  },
  controlsBar: {
    display: "flex",
    gap: 12,
    padding: "18px 32px",
    background: "rgba(253, 242, 248, 0.5)",
    borderBottom: "1px solid #f3e8ef",
    flexWrap: "wrap" as const,
    alignItems: "center",
  },
  searchWrapper: {
    position: "relative" as const,
    flex: "1 1 300px",
    minWidth: 200,
  },
  searchIcon: {
    position: "absolute" as const,
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 16,
    pointerEvents: "none" as const,
  },
  searchInput: {
    width: "100%",
    padding: "11px 40px 11px 42px",
    borderRadius: 12,
    border: "2px solid #e8d5e0",
    fontSize: 14,
    background: "white",
    transition: "all 0.2s",
    outline: "none",
  },
  clearBtn: {
    position: "absolute" as const,
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    color: "#aaa",
    padding: "4px 8px",
    borderRadius: 6,
    width: "auto",
    minWidth: "auto",
  },
  filterWrapper: {
    flex: "0 0 auto",
  },
  select: {
    padding: "11px 16px",
    borderRadius: 12,
    border: "2px solid #e8d5e0",
    fontSize: 14,
    background: "white",
    cursor: "pointer",
    outline: "none",
    color: "#333",
    minWidth: 170,
  },
  tableContainer: {
    overflowX: "auto" as const,
    position: "relative" as const,
  },
  loadingOverlay: {
    position: "absolute" as const,
    inset: 0,
    background: "rgba(255,255,255,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    backdropFilter: "blur(2px)",
  },
  spinner: {
    width: 24,
    height: 24,
    border: "3px solid #f3e8ef",
    borderTopColor: "var(--primary)",
    borderRadius: "50%",
    animation: "spin-loader 0.7s linear infinite",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    textAlign: "left" as const,
    fontSize: 14,
  },
  th: {
    padding: "14px 16px",
    borderBottom: "2px solid #f3e8ef",
    fontWeight: 700,
    fontSize: 13,
    color: "#6b4c5e",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    background: "#fdf2f8",
    position: "sticky" as const,
    top: 0,
    zIndex: 5,
  },
  thContent: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  sortIcon: {
    fontSize: 14,
    fontWeight: 700,
    transition: "all 0.2s",
  },
  tr: {
    transition: "background 0.15s",
    borderBottom: "1px solid #f9ecf3",
  },
  td: {
    padding: "13px 16px",
    verticalAlign: "middle" as const,
  },
  employeeIdBadge: {
    display: "inline-block",
    background: "#f0e6f6",
    color: "var(--secondary)",
    padding: "3px 10px",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 13,
    fontFamily: "monospace",
  },
  departmentBadge: {
    display: "inline-block",
    background: "#fce4ec",
    color: "#c2185b",
    padding: "3px 10px",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 13,
  },
  luckyNumberBadge: {
    display: "inline-block",
    background: "linear-gradient(135deg, var(--primary), var(--secondary))",
    color: "white",
    padding: "4px 14px",
    borderRadius: 10,
    fontWeight: 800,
    fontSize: 16,
    letterSpacing: "1px",
    boxShadow: "0 2px 8px rgba(214,51,132,0.25)",
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "60px 30px",
  },
  resetBtn: {
    marginTop: 16,
    padding: "8px 24px",
    borderRadius: 10,
    border: "2px solid var(--primary)",
    background: "transparent",
    color: "var(--primary)",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
    width: "auto",
  },
  paginationBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 32px",
    borderTop: "1px solid #f3e8ef",
    background: "rgba(253, 242, 248, 0.3)",
    flexWrap: "wrap" as const,
    gap: 12,
  },
  paginationInfo: {
    fontSize: 14,
    color: "#888",
  },
  paginationControls: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  pageBtn: {
    width: 36,
    height: 36,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    border: "1px solid #e8d5e0",
    background: "white",
    color: "#555",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
    padding: 0,
    minWidth: 36,
  },
  pageBtnActive: {
    background: "linear-gradient(135deg, var(--primary), var(--secondary))",
    color: "white",
    border: "1px solid transparent",
    boxShadow: "0 3px 10px rgba(214,51,132,0.3)",
  },
  pageBtnDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
  ellipsis: {
    padding: "0 6px",
    color: "#aaa",
    fontSize: 16,
  },
  exportBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "linear-gradient(135deg, #28a745, #20c997)",
    color: "white",
    padding: "10px 22px",
    borderRadius: 12,
    border: "none",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)",
    width: "auto",
    minWidth: "auto",
  },
  exportSpinner: {
    display: "inline-block",
    width: 14,
    height: 14,
    border: "2px solid rgba(255,255,255,0.4)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin-loader 0.7s linear infinite",
  },
};
