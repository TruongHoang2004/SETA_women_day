"use client";

import { useState, useEffect } from "react";

type ImageVote = {
  id: string;
  url: string;
  title: string;
  votes: number;
};

export default function VotesPage() {
  const [images, setImages] = useState<ImageVote[]>([]);
  const [totalVoters, setTotalVoters] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/votes")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setImages(data.data);
          setTotalVoters(data.totalVoters);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const maxVotes =
    images.length > 0 ? Math.max(...images.map((i) => i.votes), 1) : 1;

  // Compute dense ranks (same votes = same rank)
  const ranks: number[] = [];
  if (images.length > 0) {
    ranks.push(1);
    for (let i = 1; i < images.length; i++) {
      ranks.push(
        images[i].votes === images[i - 1].votes
          ? ranks[i - 1]
          : ranks[i - 1] + 1,
      );
    }
  }

  const getRankStyle = (rank: number) => {
    if (rank === 1)
      return {
        background: "linear-gradient(135deg, #FFD700, #FFA500)",
        color: "#fff",
      };
    if (rank === 2)
      return {
        background: "linear-gradient(135deg, #C0C0C0, #A0A0A0)",
        color: "#fff",
      };
    if (rank === 3)
      return {
        background: "linear-gradient(135deg, #CD7F32, #A0522D)",
        color: "#fff",
      };
    return {};
  };

  const getBarGradient = (rank: number) => {
    if (rank === 1) return "linear-gradient(90deg, #FFD700, #FFA500)";
    if (rank === 2) return "linear-gradient(90deg, #C0C0C0, #888)";
    if (rank === 3) return "linear-gradient(90deg, #CD7F32, #8B4513)";
    return "linear-gradient(90deg, var(--primary), var(--secondary))";
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingSpinner} />
        <p style={{ color: "#888", marginTop: 16 }}>
          Đang tải thống kê bình chọn...
        </p>
        <style>{`@keyframes spin-vote { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>🏆 Thống Kê Bình Chọn</h1>
            <p style={styles.subtitle}>
              <span style={styles.badge}>{totalVoters}</span> người đã bình chọn
              &nbsp;·&nbsp;
              <span style={styles.badge}>{images.length}</span> tác phẩm
            </p>
          </div>
          <a href="/admin" style={styles.backBtn}>
            ⬅ Quay lại
          </a>
        </div>

        {/* Full Ranking List */}
        <div style={styles.rankingSection}>
          <div style={styles.rankingList}>
            {images.map((img, idx) => {
              const rank = ranks[idx];
              const percent =
                totalVoters > 0
                  ? ((img.votes / totalVoters) * 100).toFixed(1)
                  : "0.0";
              const barWidth = maxVotes > 0 ? (img.votes / maxVotes) * 100 : 0;
              return (
                <div key={img.id} style={styles.rankingItem}>
                  {/* Rank */}
                  <div
                    style={{
                      ...styles.rankNumber,
                      ...getRankStyle(rank),
                    }}
                  >
                    {rank}
                  </div>

                  {/* Image thumbnail */}
                  <div style={styles.thumbWrap}>
                    <img
                      src={img.url || ""}
                      alt={img.title}
                      style={styles.thumb}
                    />
                  </div>

                  {/* Info + bar */}
                  <div style={styles.rankingInfo}>
                    <div style={styles.rankingTop}>
                      <span style={styles.rankingTitle}>{img.title}</span>
                      <div style={styles.rankingStats}>
                        <span style={styles.voteCount}>{img.votes}</span>
                        <span style={styles.voteLabel}>phiếu</span>
                        <span style={styles.percentBadge}>{percent}%</span>
                      </div>
                    </div>
                    <div style={styles.barBg}>
                      <div
                        style={{
                          ...styles.barFill,
                          width: `${barWidth}%`,
                          background: getBarGradient(rank),
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Empty state */}
        {images.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 30px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗳️</div>
            <p style={{ fontSize: 16, color: "#888" }}>
              Chưa có phiếu bình chọn nào.
            </p>
          </div>
        )}
      </div>

      <style>{`
                @keyframes spin-vote { to { transform: rotate(360deg); } }
            `}</style>
    </div>
  );
}

// --------------- Styles ---------------

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    padding: "20px 10px",
    maxWidth: "100%",
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
  loadingScreen: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    border: "4px solid #f3e8ef",
    borderTopColor: "var(--primary)",
    borderRadius: "50%",
    animation: "spin-vote 0.7s linear infinite",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "28px 32px 20px",
    borderBottom: "1px solid #f3e8ef",
  },
  title: {
    fontSize: 34,
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
  badge: {
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
    boxShadow: "0 4px 12px rgba(108, 117, 125, 0.3)",
  },

  // Ranking list
  rankingSection: {
    padding: "36px 40px",
  },
  rankingList: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 16,
  },
  rankingItem: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    padding: "20px 24px",
    background: "rgba(253, 242, 248, 0.4)",
    borderRadius: 16,
    border: "1px solid #f3e8ef",
    transition: "all 0.2s",
  },
  rankNumber: {
    flex: "0 0 52px",
    width: 52,
    height: 52,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 20,
    background: "#f0e6f6",
    color: "#6f42c1",
  },
  thumbWrap: {
    flex: "0 0 90px",
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    border: "2px solid white",
  },
  thumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  },
  rankingInfo: {
    flex: 1,
    minWidth: 0,
  },
  rankingTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  rankingTitle: {
    fontWeight: 700,
    fontSize: 18,
    color: "#333",
  },
  rankingStats: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  voteCount: {
    fontWeight: 800,
    fontSize: 22,
    color: "var(--primary)",
  },
  voteLabel: {
    fontSize: 15,
    color: "#999",
  },
  percentBadge: {
    background: "rgba(111, 66, 193, 0.1)",
    color: "var(--secondary)",
    padding: "2px 8px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
  },
  barBg: {
    width: "100%",
    height: 12,
    borderRadius: 6,
    background: "#f0e6f6",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 6,
    transition: "width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    minWidth: 4,
  },
};
