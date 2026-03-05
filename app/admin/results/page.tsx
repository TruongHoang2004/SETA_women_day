"use client";

import { useState, useEffect } from "react";

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

export default function ResultsPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/results")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setRegistrations(data.data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Đang tải dữ liệu...</div>;

    return (
        <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", fontFamily: "sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #ccc", paddingBottom: "10px", marginBottom: "20px" }}>
                <h1 style={{ color: "var(--primary)", margin: 0 }}>
                    Thống Kê Đăng Ký (Tổng: {registrations.length})
                </h1>
                <a href="/admin" style={{ background: "#6c757d", color: "white", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>
                    ⬅ Quay lại Cấu Hình
                </a>
            </div>

            <div style={{ overflowX: "auto", background: "white", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ background: "var(--primary)", color: "white" }}>
                            <th style={{ padding: "15px 10px", borderBottom: "2px solid #eee" }}>Mã NV</th>
                            <th style={{ padding: "15px 10px", borderBottom: "2px solid #eee" }}>Họ Tên</th>
                            <th style={{ padding: "15px 10px", borderBottom: "2px solid #eee" }}>Phòng Ban</th>
                            <th style={{ padding: "15px 10px", borderBottom: "2px solid #eee" }}>Email</th>
                            <th style={{ padding: "15px 10px", borderBottom: "2px solid #eee" }}>Mã May Mắn</th>
                            <th style={{ padding: "15px 10px", borderBottom: "2px solid #eee" }}>Ngày ĐK</th>
                            <th style={{ padding: "15px 10px", borderBottom: "2px solid #eee" }}>Lời chúc</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registrations.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                                    Chưa có ai đăng ký.
                                </td>
                            </tr>
                        ) : (
                            registrations.map(reg => (
                                <tr key={reg.id} style={{ borderBottom: "1px solid #eee" }}>
                                    <td style={{ padding: "12px 10px", fontWeight: "bold" }}>{reg.employeeId}</td>
                                    <td style={{ padding: "12px 10px" }}>{reg.fullName}</td>
                                    <td style={{ padding: "12px 10px" }}>{reg.department}</td>
                                    <td style={{ padding: "12px 10px" }}>{reg.email}</td>
                                    <td style={{ padding: "12px 10px", color: "var(--primary)", fontWeight: "bold", fontSize: "18px" }}>{reg.luckyNumber}</td>
                                    <td style={{ padding: "12px 10px", fontSize: "14px", color: "#666" }}>{new Date(reg.createdAt).toLocaleString("vi-VN")}</td>
                                    <td style={{ padding: "12px 10px", maxWidth: "250px", wordWrap: "break-word" }}>
                                        {reg.question?.wishes ? <i>"{reg.question.wishes}"</i> : <span style={{ color: "#aaa" }}>Không có</span>}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
