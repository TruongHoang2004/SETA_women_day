"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function AdminPage() {
    const [title, setTitle] = useState("");
    const [images, setImages] = useState<{ id: string, url: string, title: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/admin/config")
            .then(res => res.json())
            .then(data => {
                if (data.questionTitle) setTitle(data.questionTitle);
                if (data.images && Array.isArray(data.images)) setImages(data.images);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ questionTitle: title, images })
            });
            if (!res.ok) throw new Error("Lỗi khi lưu");
            toast.success("Lưu cấu hình thành công!");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const addImage = () => {
        setImages([...images, { id: `img-${Date.now()}`, url: "", title: `Ảnh ${images.length + 1}` }]);
    };

    const removeImage = (idToRemove: string) => {
        setImages(images.filter(img => img.id !== idToRemove));
    };

    const updateImage = (idToUpdate: string, field: "url" | "title", value: string) => {
        setImages(images.map(img => img.id === idToUpdate ? { ...img, [field]: value } : img));
    };

    if (loading) return <div style={{ padding: 20 }}>Đang tải...</div>;

    return (
        <div style={{ padding: "40px", maxWidth: "100%", margin: "0 auto", fontFamily: "sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #ccc", paddingBottom: "10px", marginBottom: "20px" }}>
                <h1 style={{ color: "var(--primary)", margin: 0, textShadow: "none" }}>
                    Admin - Cấu Hình Sự Kiện 8/3
                </h1>
                <a href="/admin/results" style={{ background: "#28a745", color: "white", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>
                    📊 Xem Thống Kê Kết Quả
                </a>
            </div>

            <div style={{ marginTop: "20px" }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>Tiêu đề câu hỏi ảnh:</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}
                />
            </div>

            <div style={{ marginTop: "30px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0 }}>Danh sách ảnh ({images.length} ảnh)</h3>
                    <button
                        onClick={addImage}
                        style={{ background: "var(--secondary)", color: "white", padding: "8px 15px", border: "none", borderRadius: "5px", cursor: "pointer", width: "auto", animation: "none", marginTop: 0 }}
                    >
                        + Thêm Ảnh Mới
                    </button>
                </div>

                <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    {images.map((img, index) => (
                        <div key={img.id} style={{ display: "flex", gap: "15px", alignItems: "center", background: "white", padding: "15px", borderRadius: "8px", border: "1px solid #ddd", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                            <span style={{ fontWeight: "bold", minWidth: "30px", fontSize: "18px" }}>#{index + 1}</span>
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                                <input
                                    type="text"
                                    placeholder="Tên/Mô tả ảnh"
                                    value={img.title}
                                    onChange={(e) => updateImage(img.id, "title", e.target.value)}
                                    style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px", background: "#fff" }}
                                />
                                <input
                                    type="text"
                                    placeholder="Đường dẫn URL ảnh (VD: https://domain/anh.jpg)"
                                    value={img.url}
                                    onChange={(e) => updateImage(img.id, "url", e.target.value)}
                                    style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px", background: "#fff" }}
                                />
                            </div>
                            <img src={img.url || "https://via.placeholder.com/80"} alt="Preview" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "4px", border: "1px solid #ddd" }} />
                            <button
                                onClick={() => removeImage(img.id)}
                                style={{ background: "#dc3545", color: "white", padding: "8px 12px", border: "none", borderRadius: "4px", cursor: "pointer", width: "auto", animation: "none", marginTop: 0 }}
                            >
                                Xoá
                            </button>
                        </div>
                    ))}
                    {images.length === 0 && <p style={{ color: "#777", fontStyle: "italic" }}>Chưa có ảnh nào.</p>}
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                style={{ marginTop: "30px", background: "var(--primary)", color: "white", padding: "15px 30px", fontSize: "16px", fontWeight: "bold", border: "none", borderRadius: "5px", cursor: "pointer", width: "100%" }}
            >
                {saving ? "Đang lưu..." : "Lưu Cấu Hình"}
            </button>
        </div>
    );
}
