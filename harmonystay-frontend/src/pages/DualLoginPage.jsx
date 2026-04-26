import React, { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./DualLoginPage.css";

const LOGIN_CONFIG = {
  member: {
    title: "Member Login",
    identifierLabel: "Flat Number",
    identifierPlaceholder: "Enter your flat number",
    identifierType: "text",
    submitLabel: "Login To Your Account",
    route: "/member/dashboard",
    errorMessage: "Invalid member credentials",
  },
  admin: {
    title: "Admin Login",
    identifierLabel: "Email Address",
    identifierPlaceholder: "Enter your admin email",
    identifierType: "email",
    submitLabel: "Login To Your Account",
    route: "/admin/dashboard",
    errorMessage: "Invalid admin credentials",
  },
  accountant: {
    title: "Accountant Login",
    identifierLabel: "Email Address",
    identifierPlaceholder: "Enter your accountant email",
    identifierType: "email",
    submitLabel: "Login To Your Account",
    route: "/accountant/dashboard",
    errorMessage: "Invalid accountant credentials",
  },
  security: {
    title: "Security Login",
    identifierLabel: "Email Address",
    identifierPlaceholder: "Enter your security email",
    identifierType: "email",
    submitLabel: "Login To Your Account",
    route: "/security/dashboard",
    errorMessage: "Invalid security credentials",
  },
};

const ROLE_BUTTONS = [
  { id: "member", label: "Member" },
  { id: "admin", label: "Admin" },
  { id: "accountant", label: "Accountant" },
  { id: "security", label: "Security" },
];

const DualLoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("member");
  const [credentials, setCredentials] = useState({
    member: { identifier: "", password: "" },
    admin: { identifier: "", password: "" },
    accountant: { identifier: "", password: "" },
    security: { identifier: "", password: "" },
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentConfig = LOGIN_CONFIG[activeTab];
  const currentCredentials = useMemo(
    () => credentials[activeTab],
    [credentials, activeTab]
  );

  const handleRoleChange = (role) => {
    setActiveTab(role);
    setError("");
    setShowPassword(false);
  };

  const handleChange = (field, value) => {
    setCredentials((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const success = await login(
      currentCredentials.identifier,
      currentCredentials.password,
      activeTab
    );

    if (success) {
      navigate(currentConfig.route);
    } else {
      setError(currentConfig.errorMessage);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="login-shell">
      <div className="login-brand-bar">
        <strong>HarmonyStay</strong>
        <span>Multi-role access portal</span>
      </div>

      <main className="login-layout">
        <section className="login-panel-copy">
          <span className="login-copy-badge">Society Management Portal</span>
          <h1>One login surface for every role in HarmonyStay.</h1>
          <p>
            The frontend already uses a clean dashboard style with practical
            navigation, compact cards, and a calm blue palette. This login page
            now follows that same direction so it feels like part of the same
            system.
          </p>

          <div className="login-feature-list" aria-label="Portal features">
            <div className="login-feature-item">
              <span className="login-feature-icon">A</span>
              <div>
                <strong>Admin and operations access</strong>
                <span>Role-specific sign-in flows stay in one place.</span>
              </div>
            </div>
            <div className="login-feature-item">
              <span className="login-feature-icon">M</span>
              <div>
                <strong>Member-first usability</strong>
                <span>Flat number login still works without extra friction.</span>
              </div>
            </div>
            <div className="login-feature-item">
              <span className="login-feature-icon">S</span>
              <div>
                <strong>Responsive by default</strong>
                <span>The layout compresses cleanly for tablet and mobile.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="login-panel">
          <p className="login-kicker">HarmonyStay Access</p>
          <h1>Login to Your Account!</h1>
          <p className="login-subtitle">
            Sign in with the appropriate role to continue to your dashboard.
          </p>

          <div className="login-role-grid" role="tablist" aria-label="Login methods">
            {ROLE_BUTTONS.map((roleButton) => (
              <button
                key={roleButton.id}
                type="button"
                role="tab"
                aria-selected={activeTab === roleButton.id}
                className={`login-role-button${
                  activeTab === roleButton.id ? " is-active" : ""
                }`}
                onClick={() => handleRoleChange(roleButton.id)}
              >
                {roleButton.label}
              </button>
            ))}
          </div>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form-heading">
              <h2>{currentConfig.title}</h2>
              <p>
                Use your {activeTab === "member" ? "flat number" : "email"} and
                password to continue.
              </p>
            </div>

            <label className="login-field">
              <span>{currentConfig.identifierLabel}</span>
              <input
                type={currentConfig.identifierType}
                placeholder={currentConfig.identifierPlaceholder}
                value={currentCredentials.identifier}
                onChange={(e) => handleChange("identifier", e.target.value)}
                required
              />
            </label>

            <label className="login-field">
              <span>Password</span>
              <div className="login-password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={currentCredentials.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <div className="login-options">
              <label className="remember-row">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember Me</span>
              </label>
              <button type="button" className="link-button">
                Forgot Password
              </button>
            </div>

            {error ? <p className="login-error">{error}</p> : null}

            <button type="submit" className="login-submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : currentConfig.submitLabel}
            </button>
          </form>

          <div className="login-footer-links" aria-label="Available roles">
            <span>Member</span>
            <span>Admin</span>
            <span>Accountant</span>
            <span>Security</span>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DualLoginPage;
