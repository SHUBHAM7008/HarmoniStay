import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaBuilding, FaChartLine, FaShieldAlt } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import "./DualLoginPage.css";

const portalContent = {
  member: {
    eyebrow: "Resident access",
    title: "A calmer way to manage daily society life.",
    description:
      "Pay maintenance, review notices, access documents, and keep your home account organized from one place.",
    primaryLabel: "Flat number",
    primaryPlaceholder: "Enter your registered flat number",
    secondaryLabel: "Password",
    secondaryPlaceholder: "Enter your password",
    submitLabel: "Enter member workspace",
  },
  admin: {
    eyebrow: "Administrator access",
    title: "Coordinate operations with greater clarity.",
    description:
      "Monitor members, bills, meetings, facilities, and society notices from a focused operations dashboard.",
    primaryLabel: "Email address",
    primaryPlaceholder: "Enter your admin email",
    secondaryLabel: "Password",
    secondaryPlaceholder: "Enter your password",
    submitLabel: "Enter admin workspace",
  },
  accountant: {
    eyebrow: "Accounts access",
    title: "Track collections and dues without the clutter.",
    description:
      "Review payment health, inspect monthly collections, and keep financial activity visible across the society.",
    primaryLabel: "Email address",
    primaryPlaceholder: "Enter your accountant email",
    secondaryLabel: "Password",
    secondaryPlaceholder: "Enter your password",
    submitLabel: "Enter accountant workspace",
  },
};

const highlights = [
  {
    icon: FaShieldAlt,
    title: "Secure access",
    description: "Separate entry points keep resident, admin, and accounts workflows organized.",
  },
  {
    icon: FaBuilding,
    title: "Society-first design",
    description: "Built around day-to-day operations like billing, notices, flats, and resident coordination.",
  },
  {
    icon: FaChartLine,
    title: "Actionable oversight",
    description: "Dashboards surface key tasks quickly so decisions happen with context.",
  },
];

const stats = [
  { value: "3", label: "Role-based portals" },
  { value: "24/7", label: "Operational visibility" },
  { value: "1", label: "Unified society workspace" },
];

const DualLoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("member");
  const [memberFlatNo, setMemberFlatNo] = useState("");
  const [memberPassword, setMemberPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [accountantEmail, setAccountantEmail] = useState("");
  const [accountantPassword, setAccountantPassword] = useState("");
  const [error, setError] = useState("");

  const currentPortal = portalContent[activeTab];

  const handleMemberSubmit = async (event) => {
    event.preventDefault();
    const success = await login(memberFlatNo, memberPassword, "member");

    if (!success) {
      setError("Invalid member credentials.");
      return;
    }

    setError("");
    navigate("/member/dashboard");
  };

  const handleAdminSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const success = await login(adminEmail, adminPassword, "admin");

    if (!success) {
      setError("Invalid admin credentials.");
      return;
    }

    navigate("/admin/dashboard");
  };

  const handleAccountantSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const success = await login(accountantEmail, accountantPassword, "accountant");

    if (!success) {
      setError("Invalid accountant credentials.");
      return;
    }

    navigate("/accountant/dashboard");
  };

  const renderForm = () => {
    if (activeTab === "member") {
      return (
        <form className="login-form" onSubmit={handleMemberSubmit}>
          <label className="login-form__field">
            <span>{currentPortal.primaryLabel}</span>
            <input
              type="text"
              placeholder={currentPortal.primaryPlaceholder}
              value={memberFlatNo}
              onChange={(event) => setMemberFlatNo(event.target.value)}
              required
            />
          </label>
          <label className="login-form__field">
            <span>{currentPortal.secondaryLabel}</span>
            <input
              type="password"
              placeholder={currentPortal.secondaryPlaceholder}
              value={memberPassword}
              onChange={(event) => setMemberPassword(event.target.value)}
              required
            />
          </label>
          <button type="submit" className="login-submit">
            {currentPortal.submitLabel}
            <FaArrowRight aria-hidden />
          </button>
        </form>
      );
    }

    if (activeTab === "admin") {
      return (
        <form className="login-form" onSubmit={handleAdminSubmit}>
          <label className="login-form__field">
            <span>{currentPortal.primaryLabel}</span>
            <input
              type="email"
              placeholder={currentPortal.primaryPlaceholder}
              value={adminEmail}
              onChange={(event) => setAdminEmail(event.target.value)}
              required
            />
          </label>
          <label className="login-form__field">
            <span>{currentPortal.secondaryLabel}</span>
            <input
              type="password"
              placeholder={currentPortal.secondaryPlaceholder}
              value={adminPassword}
              onChange={(event) => setAdminPassword(event.target.value)}
              required
            />
          </label>
          <button type="submit" className="login-submit">
            {currentPortal.submitLabel}
            <FaArrowRight aria-hidden />
          </button>
        </form>
      );
    }

    return (
      <form className="login-form" onSubmit={handleAccountantSubmit}>
        <label className="login-form__field">
          <span>{currentPortal.primaryLabel}</span>
          <input
            type="email"
            placeholder={currentPortal.primaryPlaceholder}
            value={accountantEmail}
            onChange={(event) => setAccountantEmail(event.target.value)}
            required
          />
        </label>
        <label className="login-form__field">
          <span>{currentPortal.secondaryLabel}</span>
          <input
            type="password"
            placeholder={currentPortal.secondaryPlaceholder}
            value={accountantPassword}
            onChange={(event) => setAccountantPassword(event.target.value)}
            required
          />
        </label>
        <button type="submit" className="login-submit">
          {currentPortal.submitLabel}
          <FaArrowRight aria-hidden />
        </button>
      </form>
    );
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <section className="login-hero">
          <div className="login-hero__badge">Residential operations platform</div>
          <h1>HarmonyStay brings society management into a polished digital front door.</h1>
          <p className="login-hero__lede">
            From maintenance billing to resident communication, every role enters a workspace
            designed for focus, trust, and daily use.
          </p>

          <div className="login-stats">
            {stats.map((item) => (
              <article key={item.label} className="login-stat">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>

          <div className="login-highlights">
            {highlights.map(({ icon: Icon, title, description }) => (
              <article key={title} className="login-highlight">
                <div className="login-highlight__icon">
                  <Icon aria-hidden />
                </div>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="login-panel">
          <div className="login-panel__header">
            <p className="login-panel__eyebrow">{currentPortal.eyebrow}</p>
            <h2>{currentPortal.title}</h2>
            <p>{currentPortal.description}</p>
          </div>

          <div className="login-tabs" role="tablist" aria-label="Login portals">
            <button
              type="button"
              className={activeTab === "member" ? "active" : ""}
              onClick={() => {
                setActiveTab("member");
                setError("");
              }}
            >
              Member
            </button>
            <button
              type="button"
              className={activeTab === "admin" ? "active" : ""}
              onClick={() => {
                setActiveTab("admin");
                setError("");
              }}
            >
              Admin
            </button>
            <button
              type="button"
              className={activeTab === "accountant" ? "active" : ""}
              onClick={() => {
                setActiveTab("accountant");
                setError("");
              }}
            >
              Accountant
            </button>
          </div>

          <div className="login-panel__body">
            {renderForm()}
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <p className="login-panel__footnote">
              Use the role-specific credentials issued for your HarmonyStay account.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DualLoginPage;
