function validateEnv(env = process.env) {
  const errors = [];
  if (!env.MONGODB_URL || !env.MONGODB_URL.trim()) {
    errors.push("MONGODB_URL is required");
  }

  const secret = (env.JWT_SECRET || "").trim();
  const lowered = secret.toLowerCase();
  if (
    secret.length < 32 ||
    ["change-me-in-env", "changeme"].includes(lowered) ||
    lowered.startsWith("replace-with-") ||
    lowered.startsWith("your-")
  ) {
    errors.push("JWT_SECRET must be a real random value of at least 32 characters");
  }

  if (errors.length) {
    throw new Error(`Invalid environment configuration: ${errors.join("; ")}`);
  }
}

module.exports = validateEnv;
