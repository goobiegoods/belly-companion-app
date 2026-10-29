import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Btn, C, Card, Empty, Input, Label, PageTitle, SectionTitle, Select, StatusPill, Textarea, ago, fontUI } from "@/components/admin/ui";

type Post = {
  id: string;
  caption: string;
  media_url: string | null;
  media_type: "image" | "reel" | "text";
  platforms: string[];
  scheduled_at: string | null;
  status: "draft" | "scheduled" | "processing" | "published" | "failed";
  error: string | null;
  created_at: string;
  published_at: string | null;
};
type Metric = { day: string; source: string; metric: string; value: number };
type Status = {
  facebook?: { name: string; followers: number | null };
  instagram?: { username: string; followers: number; posts: number } | null;
  error?: string;
};

const TONE: Record<Post["status"], "neutral" | "info" | "warning" | "success" | "danger"> = {
  draft: "neutral", scheduled: "info", processing: "warning", published: "success", failed: "danger",
};

async function callSocial(body: object) {
  const { data } = await supabase.auth.getSession();
  const resp = await fetch("/api/social", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` },
    body: JSON.stringify(body),
  });
  return resp.json().catch(() => ({ error: `HTTP ${resp.status}` }));
}

const AdminSocial = () => {
  const [status, setStatus] = useState<Status | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<Post["media_type"]>("image");
  const [fb, setFb] = useState(true);
  const [ig, setIg] = useState(true);
  const [when, setWhen] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    const [p, m] = await Promise.all([
      supabase.from("social_posts" as never).select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("social_metrics" as never).select("*").order("day", { ascending: false }).limit(200),
    ]);
    setPosts(((p.data ?? []) as unknown) as Post[]);
    setMetrics(((m.data ?? []) as unknown) as Metric[]);
  };

  useEffect(() => {
    load();
    callSocial({ action: "status" }).then(setStatus);
  }, []);

  const upload = async (file: File) => {
    setBusy("upload");
    setMsg(null);
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("social").upload(path, file, { contentType: file.type });
    if (error) setMsg(`Upload failed: ${error.message}`);
    else {
      setMediaUrl(supabase.storage.from("social").getPublicUrl(path).data.publicUrl);
      setMediaType(file.type.startsWith("video/") ? "reel" : "image");
    }
    setBusy(null);
  };

  const save = async (mode: "draft" | "schedule" | "now") => {
    if (!caption.trim() && !mediaUrl) return setMsg("Add a caption or media first.");
    const platforms = [fb && "facebook", ig && "instagram"].filter(Boolean) as string[];
    if (!platforms.length) return setMsg("Pick at least one platform.");
    if (mode === "schedule" && !when) return setMsg("Pick a date and time to schedule.");
    setBusy(mode);
    setMsg(null);
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("social_posts" as never).insert({
      caption: caption.trim(),
      media_url: mediaUrl || null,
      media_type: mediaUrl ? mediaType : "text",
      platforms,
      status: mode === "schedule" ? "scheduled" : "draft",
      scheduled_at: mode === "schedule" ? new Date(when).toISOString() : null,
      created_by: u.user?.id ?? null,
    } as never).select("id").single();
    if (error) { setBusy(null); return setMsg(error.message); }
    if (mode === "now") {
      const r = await callSocial({ action: "publish", id: (data as { id: string }).id });
      setMsg(r.error ? `Saved, but publishing failed: ${r.error}` : `Publish result: ${r.status}`);
    } else {
      setMsg(mode === "schedule" ? "Scheduled. The daily 9am run publishes it once its time has passed." : "Saved as draft.");
    }
    setCaption(""); setMediaUrl(""); setWhen("");
    setBusy(null);
    load();
  };

  const publish = async (id: string) => {
    setBusy(id);
    const r = await callSocial({ action: "publish", id });
    setMsg(r.error ? `Publishing failed: ${r.error}` : `Publish result: ${r.status}`);
    setBusy(null);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("social_posts" as never).delete().eq("id", id);
    load();
  };

  const pull = async () => {
    setBusy("metrics");
    const r = await callSocial({ action: "metrics" });
    setMsg(r.error ? `Insights failed: ${r.error}` : `Saved ${r.saved} numbers${r.errors?.length ? ` (${r.errors.length} metrics unavailable)` : ""}.`);
    setBusy(null);
    load();
  };

  const latestDay = metrics[0]?.day;
  const latest = metrics.filter((m) => m.day === latestDay);

  return (
    <div style={{ ...fontUI, display: "flex", flexDirection: "column", gap: 18 }}>
      <PageTitle title="Social" right={<Btn variant="secondary" onClick={pull} disabled={busy === "metrics"}>{busy === "metrics" ? "Pulling…" : "Pull insights now"}</Btn>} />

      <Card>
        <SectionTitle>Connected accounts</SectionTitle>
        {!status ? <p style={{ color: C.text, margin: 0 }}>Checking…</p>
          : status.error ? <p style={{ color: C.danger, margin: 0 }}>Not connected: {status.error}</p>
          : (
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", color: C.white }}>
              <div>Facebook: <b>{status.facebook?.name}</b> · {status.facebook?.followers ?? "—"} followers</div>
              <div>Instagram: {status.instagram ? <><b>@{status.instagram.username}</b> · {status.instagram.followers.toLocaleString()} followers</> : <span style={{ color: C.danger }}>not linked</span>}</div>
            </div>
          )}
      </Card>

      <Card>
        <SectionTitle>New post</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <Label>Caption</Label>
            <Textarea id="social-caption" rows={5} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Write the caption, hashtags and call to action…" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
            <div>
              <Label>Image or video</Label>
              <input id="social-file" type="file" accept="image/jpeg,image/png,video/mp4,video/quicktime" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} style={{ color: C.text, fontSize: 13 }} />
              {busy === "upload" && <div style={{ color: C.text, fontSize: 12 }}>Uploading…</div>}
            </div>
            <div>
              <Label>…or media URL</Label>
              <Input id="social-url" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://…" />
            </div>
            <div>
              <Label>Type</Label>
              <Select id="social-type" value={mediaType} onChange={(e) => setMediaType(e.target.value as Post["media_type"])}>
                <option value="image">Image post</option>
                <option value="reel">Reel / video</option>
              </Select>
            </div>
            <div>
              <Label>Schedule for (optional)</Label>
              <Input id="social-when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 18, color: C.white, fontSize: 14 }}>
            <label><input id="social-fb" type="checkbox" checked={fb} onChange={(e) => setFb(e.target.checked)} /> Facebook</label>
            <label><input id="social-ig" type="checkbox" checked={ig} onChange={(e) => setIg(e.target.checked)} /> Instagram</label>
          </div>
          {mediaUrl && (mediaType === "image"
            ? <img src={mediaUrl} alt="Preview" style={{ maxWidth: 220, borderRadius: 10 }} />
            : <video src={mediaUrl} controls style={{ maxWidth: 220, borderRadius: 10 }} />)}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Btn variant="primary" onClick={() => save("now")} disabled={!!busy}>{busy === "now" ? "Publishing…" : "Publish now"}</Btn>
            <Btn variant="secondary" onClick={() => save("schedule")} disabled={!!busy}>Schedule</Btn>
            <Btn variant="ghost" onClick={() => save("draft")} disabled={!!busy}>Save draft</Btn>
          </div>
          {msg && <p style={{ color: C.text, margin: 0, fontSize: 13 }}>{msg}</p>}
        </div>
      </Card>

      <Card>
        <SectionTitle>Queue</SectionTitle>
        {posts.length === 0 ? <Empty>No posts yet. Write one above.</Empty> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {posts.map((p) => (
              <div key={p.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", borderBottom: `1px solid ${C.border}`, paddingBottom: 10 }}>
                {p.media_url && p.media_type === "image" && <img src={p.media_url} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <StatusPill tone={TONE[p.status]}>{p.status}</StatusPill>
                    <span style={{ color: C.text, fontSize: 12 }}>
                      {p.platforms.join(" + ")} · {p.media_type}
                      {p.scheduled_at && p.status === "scheduled" ? ` · for ${new Date(p.scheduled_at).toLocaleString()}` : ""}
                      {p.published_at ? ` · published ${ago(p.published_at)}` : ` · created ${ago(p.created_at)}`}
                    </span>
                  </div>
                  <div style={{ color: C.white, fontSize: 13, marginTop: 4, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{p.caption.slice(0, 220)}{p.caption.length > 220 ? "…" : ""}</div>
                  {p.error && <div style={{ color: C.danger, fontSize: 12, marginTop: 4 }}>{p.error}</div>}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {p.status !== "published" && <Btn variant="secondary" onClick={() => publish(p.id)} disabled={busy === p.id}>{busy === p.id ? "…" : p.status === "processing" ? "Finish" : "Publish now"}</Btn>}
                  {p.status !== "published" && <Btn variant="ghost" onClick={() => remove(p.id)}>Remove</Btn>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle>Insights {latestDay ? `· ${latestDay}` : ""}</SectionTitle>
        {latest.length === 0 ? <Empty>No insights saved yet. Click “Pull insights now”.</Empty> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
            {latest.map((m) => (
              <div key={`${m.source}-${m.metric}`} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 12 }}>
                <div style={{ color: C.text, fontSize: 11 }}>{m.source} · {m.metric.replace(/_/g, " ")}</div>
                <div style={{ color: C.white, fontSize: 22, fontWeight: 600 }}>{Number(m.value).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminSocial;
