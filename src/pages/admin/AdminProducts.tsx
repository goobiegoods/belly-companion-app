import { shopProducts } from "@/data/shopData";

const AdminProducts = () => {
  return (
    <div>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 800, marginBottom: 4 }}>Products</h1>
      <p style={{ fontSize: 13, color: "#7A7A85", marginBottom: 20 }}>Catalog is currently bundled in code. CRUD coming soon.</p>

      <div style={{ background: "#16161A", border: "1px solid #26262C", borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#1B1B20", color: "#7A7A85", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              <th style={{ textAlign: "left", padding: "10px 18px" }}>Name</th>
              <th style={{ textAlign: "left", padding: "10px 18px" }}>Category</th>
              <th style={{ textAlign: "left", padding: "10px 18px" }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {(shopProducts as any[]).map((p, i) => (
              <tr key={p.id ?? i} style={{ borderTop: "1px solid #26262C" }}>
                <td style={{ padding: "12px 18px", color: "#fff" }}>
                  <span style={{ marginRight: 8 }}>{p.emoji || "🌿"}</span>
                  {p.name || p.title}
                </td>
                <td style={{ padding: "12px 18px", textTransform: "capitalize", color: "#7A7A85" }}>{p.category || "—"}</td>
                <td style={{ padding: "12px 18px" }}>${typeof p.price === "number" ? p.price.toFixed(2) : p.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
