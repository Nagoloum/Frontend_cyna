import { authAPI, usersAPI } from "@/services/api";
import { AlertCircle, CheckCircle2, ChevronRight, Eye, EyeOff, Lock, LogOut, Package, Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const getUser = () => {
  try {
    const t = localStorage.getItem("token");
    if (!t) return null;
    return JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch { return null; }
};

const TABS = [
  { id: "profile", label: "My Profile", icon: User },
  { id: "password", label: "Password", icon: Lock },
  { id: "orders", label: "My Orders", icon: Package },
];

const Field = ({ label, type = "text", value, onChange, placeholder }) => (
  <div>
    <label className="block text-xs font-[Kumbh Sans] font-600 mb-1.5" style={{ color: "var(--text-muted)" }}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-all"
      style={{ fontFamily: "'Kumbh Sans', sans-serif" }}
    />
  </div>
);

export default function AccountPage() {
  const navigate = useNavigate();
  const tokenUser = getUser();
  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState({ firstName: "", lastName: "", email: "" });
  const [pwd, setPwd] = useState({ current: "", new: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!tokenUser) {
      navigate("/auth");
      return;
    }
    authAPI.me().then(u =>
      setProfile({
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        email: u.email || ""
      })
    ).catch(() => { });
  }, [navigate, tokenUser]);

  const notify = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await usersAPI.updateProfile(tokenUser.id, {
        firstName: profile.firstName,
        lastName: profile.lastName
      });
      notify("success", "Profile updated successfully!");
    } catch {
      notify("error", "Error updating profile.");
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (pwd.new !== pwd.confirm) {
      notify("error", "Passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await authAPI.changePassword(pwd.current, pwd.new);
      notify("success", "Password changed successfully!");
      setPwd({ current: "", new: "", confirm: "" });
    } catch {
      notify("error", "Error — please check your current password.");
    }
    setSaving(false);
  };

  return (
    <div className="page-enter" style={{ background: "var(--bg-base)", minHeight: "70vh" }}>
      <div style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
        <div className="cyna-container py-10 sm:py-14">
          <p className="section-label">Account Settings</p>
          <h1 className="section-title mb-2">Account</h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)", fontFamily: "'Kumbh Sans', sans-serif" }}>
              Manage your personal information, password and view your order history.
          </p>
        </div>
      </div>

      <div className="cyna-container">
        {msg && (
          <div className={`flex items-center gap-2.5 p-4 rounded-xl mt-6 text-sm ${msg.type === "success" ? "bg-[rgba(16,185,129,.1)] border border-[rgba(16,185,129,.25)]" : "bg-[rgba(239,68,68,.08)] border border-[rgba(239,68,68,.2)]"}`}>
            {msg.type === "success" ? <CheckCircle2 size={16} style={{ color: "var(--success)" }} /> : <AlertCircle size={16} style={{ color: "var(--danger)" }} />}
            <span style={{ color: msg.type === "success" ? "var(--success)" : "var(--danger)", fontFamily: "'DM Sans',sans-serif" }}>{msg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 py-10">
          {/* Sidebar */}
          <div className="lg:col-span-1 items-center">
            <div className="cyna-card p-2 mb-4">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-[Kumbh Sans] font-600 transition-all ${tab === id ? "text-[var(--accent)] bg-[var(--accent-light)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"}`}
                >
                  <Icon size={16} />{label}
                  {tab === id && <ChevronRight size={14} className="ml-auto" style={{ color: "var(--accent)" }} />}
                </button>
              ))}
            </div>
            <button
              onClick={() => { authAPI.logout(); }}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-[Kumbh Sans] font-600 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
              style={{ color: "var(--danger)" }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {tab === "profile" && (
              <div className="cyna-card p-6">
                <h2 className="font-[Kumbh Sans] font-700 text-lg mb-6" style={{ color: "var(--text-primary)" }}>Personal Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <Field
                    label="First Name"
                    value={profile.firstName}
                    onChange={v => setProfile({ ...profile, firstName: v })}
                    placeholder="John"
                  />
                  <Field
                    label="Last Name"
                    value={profile.lastName}
                    onChange={v => setProfile({ ...profile, lastName: v })}
                    placeholder="Doe"
                  />
                  <div className="sm:col-span-2">
                    <Field
                      label="Email Address"
                      type="email"
                      value={profile.email}
                      onChange={() => { }}
                      placeholder="john@example.com"
                    />
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)", fontFamily: "'DM Sans',sans-serif" }}>
                      The email cannot be changed from this interface.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="btn-primary gap-2 py-2.5"
                >
                  <Save size={16} /> {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            )}

            {tab === "password" && (
              <div className="cyna-card p-6">
                <h2 className="font-[Kumbh Sans] font-700 text-lg mb-6" style={{ color: "var(--text-primary)" }}>Change Password</h2>
                <div className="space-y-4 max-w-md mb-6">
                  <Field
                    label="Current Password"
                    type={showPwd ? "text" : "password"}
                    value={pwd.current}
                    onChange={v => setPwd({ ...pwd, current: v })}
                    placeholder="••••••••"
                  />
                  <Field
                    label="New Password"
                    type={showPwd ? "text" : "password"}
                    value={pwd.new}
                    onChange={v => setPwd({ ...pwd, new: v })}
                    placeholder="••••••••"
                  />
                  <Field
                    label="Confirm New Password"
                    type={showPwd ? "text" : "password"}
                    value={pwd.confirm}
                    onChange={v => setPwd({ ...pwd, confirm: v })}
                    placeholder="••••••••"
                  />
                  <button
                    onClick={() => setShowPwd(v => !v)}
                    className="flex items-center gap-1.5 text-xs transition-colors hover:text-[var(--accent)]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {showPwd ? <EyeOff size={13} /> : <Eye size={13} />}
                    {showPwd ? "Hide" : "Show"} passwords
                  </button>
                </div>
                <p className="text-xs mb-4" style={{ color: "var(--text-muted)", fontFamily: "'Kumbh Sans',sans-serif" }}>
                  The password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character.
                </p>
                <button
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="btn-primary gap-2 py-2.5"
                >
                  <Lock size={16} /> {saving ? "Updating…" : "Change Password"}
                </button>
              </div>
            )}

            {tab === "orders" && (
              <div className="cyna-card p-6">
                <h2 className="font-[Kumbh Sans] font-700 text-lg mb-6" style={{ color: "var(--text-primary)" }}>Order History</h2>
                <div className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center" style={{ background: "var(--bg-subtle)" }}>
                  <Package size={36} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
                  <p className="font-[Kumbh Sans] font-600 mb-1" style={{ color: "var(--text-secondary)" }}>No orders yet</p>
                  <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                    Your subscriptions will appear here after your first purchase
                  </p>
                  <Link to="/products" className="btn-primary gap-2 inline-flex">
                    Discover Our Solutions
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}