"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Confetti from "react-confetti";

export default function Home() {
  const REGISTRATION_DEADLINE = new Date("2026-03-06T17:00:00+07:00");

  const [config, setConfig] = useState({
    title: "Chọn 3 bức ảnh bạn thích nhất",
    images: [] as { id: string; url: string; title: string }[],
  });
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [isFormClosed, setIsFormClosed] = useState(false);
  const [formData, setFormData] = useState<{
    employeeId: string;
    fullName: string;
    email: string;
    department: string;
    wishes: string;
    selectedImages: string[];
  }>({
    employeeId: "",
    fullName: "",
    email: "",
    department: "",
    wishes: "",
    selectedImages: [],
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [luckyNum, setLuckyNum] = useState("");
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    const handleResize = () =>
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    window.addEventListener("resize", handleResize);

    // Check if form is closed
    const checkDeadline = () => {
      if (new Date() >= REGISTRATION_DEADLINE) {
        setIsFormClosed(true);
      }
    };
    checkDeadline();
    const interval = setInterval(checkDeadline, 30000); // Re-check every 30s

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(interval);
    };
  }, []);

  const handleImageToggle = (imageId: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedImages.includes(imageId);
      if (isSelected) {
        return {
          ...prev,
          selectedImages: prev.selectedImages.filter((id) => id !== imageId),
        };
      } else {
        if (prev.selectedImages.length >= 3) {
          return prev; // max 3 selected
        }
        return { ...prev, selectedImages: [...prev.selectedImages, imageId] };
      }
    });
  };

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.questionTitle || data.images) {
          setConfig({
            title: data.questionTitle || "Chọn 3 bức ảnh bạn thích nhất",
            images: Array.isArray(data.images) ? data.images : [],
          });
        }
        setLoadingConfig(false);
      })
      .catch((err) => {
        console.error("Failed to load config", err);
        setLoadingConfig(false);
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Regex check for UX validation
    if (!/^\d{4,5}$/.test(formData.employeeId)) {
      toast.error("Mã nhân viên phải là 4-5 chữ số.");
      setLoading(false);
      return;
    }

    if (formData.selectedImages.length !== 3) {
      toast.error("Vui lòng chọn đúng 3 bức ảnh mà bạn thích nhất.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Đã xảy ra lỗi");
      }

      setLuckyNum(data.luckyNumber);
      setSuccess(true);
      toast.success("Đăng ký thành công!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const flowers = ["🌸", "🌺", "🌹", "🌷", "💐", "✨", "💖"];
  const fallingFlowers = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    emoji: flowers[Math.floor(Math.random() * flowers.length)],
    left: `${Math.random() * 100}vw`,
    animationDuration: `${10 + Math.random() * 15}s`,
    animationDelay: `${Math.random() * 10}s`,
    fontSize: `${16 + Math.random() * 20}px`,
  }));

  if (loadingConfig) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Đang tải cấu hình sự kiện...
      </div>
    );
  }

  return (
    <>
      {/* Confetti if successful */}
      {success && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      {/* Background Falling Flowers */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        {fallingFlowers.map((flower) => (
          <div
            key={flower.id}
            className="falling-flower"
            style={{
              left: flower.left,
              animationDuration: flower.animationDuration,
              animationDelay: flower.animationDelay,
              fontSize: flower.fontSize,
            }}
          >
            {flower.emoji}
          </div>
        ))}
      </div>

      <div className="container" style={{ position: "relative", zIndex: 10 }}>
        <div className="card">
          {success ? (
            <div className="result">
              <h1>Đăng Ký Thành Công! 🎉</h1>
              <p>Cảm ơn bạn đã đăng ký tham gia sự kiện 8/3.</p>
              <p>Con số may mắn của bạn là:</p>
              <div className="lucky-number">{luckyNum}</div>
              <p>Hãy nhớ con số này để tham gia bốc thăm trúng thưởng nhé!</p>
              <button
                onClick={() => {
                  setSuccess(false);
                  setFormData({
                    employeeId: "",
                    fullName: "",
                    email: "",
                    department: "",
                    wishes: "",
                    selectedImages: [],
                  });
                }}
                style={{ marginTop: "30px", background: "var(--secondary)" }}
              >
                Đăng ký thêm
              </button>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: "30px" }}>
                <div
                  style={{
                    fontSize: "36px",
                    letterSpacing: "8px",
                    marginBottom: "8px",
                  }}
                >
                  🌸 🌺 🌷 🌹 🌸
                </div>
                <h1
                  style={{
                    fontSize: "42px",
                    fontWeight: 900,
                    background:
                      "linear-gradient(135deg, #d63384, #6f42c1, #d63384)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    textShadow: "none",
                    letterSpacing: "2px",
                    margin: "10px 0",
                    lineHeight: 1.2,
                  }}
                >
                  BUILT BY GRACE
                </h1>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    margin: "16px auto",
                    maxWidth: "320px",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: "2px",
                      background:
                        "linear-gradient(to right, transparent, #d63384)",
                    }}
                  />
                  <span style={{ fontSize: "18px" }}>✨</span>
                  <div
                    style={{
                      flex: 1,
                      height: "2px",
                      background:
                        "linear-gradient(to left, transparent, #d63384)",
                    }}
                  />
                </div>
                <p
                  className="description"
                  style={{
                    fontSize: "17px",
                    fontWeight: 600,
                    color: "#6f42c1",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    margin: 0,
                  }}
                >
                  Bình Chọn Tác Phẩm Ấn Tượng Và Sáng Tạo
                </p>
                <div
                  style={{
                    fontSize: "28px",
                    letterSpacing: "8px",
                    marginTop: "10px",
                  }}
                >
                  💐 ✨ 💖 ✨ 💐
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Mã Nhân Viên (4-5 chữ số) *</label>
                    <input
                      type="text"
                      name="employeeId"
                      required
                      placeholder="Ví dụ: 1234"
                      maxLength={5}
                      value={formData.employeeId}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Họ và Tên *</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="Nhập họ và tên..."
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="Nhập email công ty..."
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Phòng Ban *</label>
                    <input
                      type="text"
                      name="department"
                      required
                      placeholder="Nhập phòng ban của bạn..."
                      value={formData.department}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Lời chúc 8/3 (Tùy chọn)</label>
                    <textarea
                      name="wishes"
                      placeholder="Gửi một lời chúc thật ý nghĩa dành cho chị em..."
                      value={formData.wishes}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <div className="form-group full-width">
                    <label>
                      {config.title}
                      <span
                        style={{
                          fontWeight: "normal",
                          color: "#666",
                          marginLeft: "8px",
                        }}
                      >
                        (Đã chọn {formData.selectedImages.length}/3)
                      </span>
                    </label>
                    <div className="image-grid">
                      {config.images.map((img) => {
                        const isSelected = formData.selectedImages.includes(
                          img.id,
                        );
                        return (
                          <div
                            key={img.id}
                            onClick={() => handleImageToggle(img.id)}
                            className={`image-item ${isSelected ? "selected" : ""}`}
                          >
                            <img
                              src={
                                img.url ||
                                "https://via.placeholder.com/400/f8bbd0/ffffff?text=" +
                                  encodeURIComponent(img.title)
                              }
                              alt={img.title}
                            />
                            {isSelected && <div className="check-icon">✓</div>}
                          </div>
                        );
                      })}
                    </div>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--primary)",
                        marginTop: "8px",
                        fontStyle: "italic",
                      }}
                    >
                      * Nhấp chuột vào ảnh để chọn hoặc bỏ chọn (tối đa 3 ảnh)
                    </p>
                  </div>

                  <div className="form-group full-width">
                    <button type="submit" disabled={loading}>
                      {loading ? "Đang xử lý..." : "Nhận Mã May Mắn"}
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
