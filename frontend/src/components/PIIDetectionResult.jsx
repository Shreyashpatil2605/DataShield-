import { useTheme } from "../context/ThemeContext";

export default function PIIDetectionResult({ entities, decision }) {
  const { theme } = useTheme();

  // Function to mask sensitive data
  const maskData = (text, label) => {
    if (!text) return text;

    const textStr = String(text).trim();
    const len = textStr.length;

    switch (label.toLowerCase()) {
      case "name":
        // Show first letter, mask the rest: "J***"
        return textStr.charAt(0) + "*".repeat(Math.max(len - 1, 3));

      case "email":
        // Show first char of local, mask middle, show domain: "j****@example.com"
        const [localPart, domain] = textStr.split("@");
        if (domain) {
          const maskedLocal =
            localPart.charAt(0) + "*".repeat(Math.max(localPart.length - 1, 3));
          return `${maskedLocal}@${domain}`;
        }
        return textStr.charAt(0) + "*".repeat(Math.max(len - 1, 3));

      case "phone":
        // Show last 4 digits, mask the rest: "***-***-1234"
        const digits = textStr.replace(/\D/g, "");
        if (digits.length >= 4) {
          const lastFour = digits.slice(-4);
          return "*".repeat(digits.length - 4) + lastFour;
        }
        return "*".repeat(Math.max(len - 1, 3));

      case "credit_card":
      case "creditcard":
        // Show last 4 digits: "****-****-****-1234"
        const ccDigits = textStr.replace(/\D/g, "");
        if (ccDigits.length >= 4) {
          const lastFour = ccDigits.slice(-4);
          return "*".repeat(ccDigits.length - 4) + lastFour;
        }
        return "*".repeat(Math.max(len - 1, 3));

      case "ssn":
      case "social_security_number":
        // Show last 4 digits: "***-**-1234"
        const ssnDigits = textStr.replace(/\D/g, "");
        if (ssnDigits.length >= 4) {
          const lastFour = ssnDigits.slice(-4);
          return "***-**-" + lastFour;
        }
        return "*".repeat(Math.max(len - 1, 3));

      case "password":
      case "api_key":
      case "apikey":
        // Mask entirely or show only first and last char
        return (
          textStr.charAt(0) +
          "*".repeat(Math.max(len - 2, 4)) +
          textStr.charAt(len - 1)
        );

      default:
        // Generic mask: show first character and last character
        if (len <= 2) return "*".repeat(len);
        return (
          textStr.charAt(0) +
          "*".repeat(Math.max(len - 2, 3)) +
          textStr.charAt(len - 1)
        );
    }
  };

  // Group entities by label
  const groupedEntities = entities.reduce((acc, entity) => {
    if (!acc[entity.label]) {
      acc[entity.label] = [];
    }
    acc[entity.label].push(entity);
    return acc;
  }, {});

  // Get risk level badge color
  const getRiskBadgeColor = (level) => {
    switch (level) {
      case "safe":
        return "bg-green-600 text-white";
      case "low":
        return "bg-yellow-500 text-white";
      case "medium":
        return "bg-orange-500 text-white";
      case "high":
        return "bg-red-600 text-white";
      case "critical":
        return "bg-red-800 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  // Get risk level message
  const getRiskMessage = (level) => {
    const messages = {
      safe: "The detected PII has a low risk level. It is generally safe to proceed.",
      low: "The detected PII has a low risk level. Review recommended as a precaution.",
      medium:
        "The detected PII has a medium risk level. It is recommended to investigate and apply masking.",
      high: "The detected PII has a high risk level. Immediate action is recommended to investigate the context and sensitivity of the data, and to mask or redact it as needed.",
      critical:
        "The detected PII has a critical risk level. Urgent action required to protect sensitive information.",
    };
    return messages[level] || "Risk assessment complete.";
  };

  return (
    <div
      className={`rounded-xl border transition-colors ${
        theme === "dark"
          ? "bg-gray-800/50 border-gray-700"
          : "bg-white border-gray-200"
      }`}
    >
      {/* Header */}
      <div
        className={`border-b p-6 ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
      >
        <h2
          className={`text-2xl font-bold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          PII Detection Result
        </h2>
      </div>

      {/* Content */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Masked Data Section */}
        <div className="lg:col-span-1">
          <h3
            className={`text-lg font-semibold mb-4 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Masked Data
          </h3>
          <div className="space-y-4">
            {Object.entries(groupedEntities).map(([label, items]) => (
              <div key={label}>
                <p
                  className={`text-sm font-medium mb-2 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {label}
                </p>
                <div className="space-y-1">
                  {items.slice(0, 3).map((item, idx) => (
                    <p
                      key={idx}
                      className={`text-sm font-mono ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {maskData(item.text, label)}
                    </p>
                  ))}
                  {items.length > 3 && (
                    <p
                      className={`text-xs ${
                        theme === "dark" ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      +{items.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Risk Details Badge */}
          <div
            className="mt-6 pt-6 border-t"
            style={{
              borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
            }}
          >
            <p
              className={`text-sm font-medium mb-3 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Risk Details
            </p>
            <span
              className={`inline-block px-4 py-2 rounded-lg font-semibold text-sm ${getRiskBadgeColor(
                decision.risk.level,
              )}`}
            >
              {decision.risk.level.charAt(0).toUpperCase() +
                decision.risk.level.slice(1)}
            </span>
          </div>
        </div>

        {/* Risk Level Section */}
        <div className="lg:col-span-2">
          <h3
            className={`text-lg font-semibold mb-4 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Risk Level
          </h3>
          <div
            className={`p-4 rounded-lg ${
              theme === "dark"
                ? "bg-gray-900/50 border border-gray-700"
                : "bg-gray-50 border border-gray-200"
            }`}
          >
            <p
              className={`leading-relaxed ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {getRiskMessage(decision.risk.level)}
            </p>
          </div>

          {/* Risk Score Info */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div
              className={`p-4 rounded-lg ${
                theme === "dark"
                  ? "bg-gray-900/50 border border-gray-700"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <p
                className={`text-xs font-medium mb-1 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Risk Score
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {decision.risk.score}
              </p>
            </div>
            <div
              className={`p-4 rounded-lg ${
                theme === "dark"
                  ? "bg-gray-900/50 border border-gray-700"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <p
                className={`text-xs font-medium mb-1 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Entities Found
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {entities.length}
              </p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-6">
            <h4
              className={`text-sm font-semibold mb-3 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Recommendations
            </h4>
            <ul className="space-y-2">
              <li
                className={`flex gap-2 text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <span className="text-green-500">✓</span>
                <span>Review and verify all detected PII</span>
              </li>
              <li
                className={`flex gap-2 text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <span className="text-green-500">✓</span>
                <span>Apply appropriate redaction method</span>
              </li>
              <li
                className={`flex gap-2 text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <span className="text-green-500">✓</span>
                <span>Verify sensitive data context</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
