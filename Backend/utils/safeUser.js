const SENSITIVE_FIELDS = [
  "password",
  "refreshToken",
  "passwordResetToken",
  "passwordResetExpires",
];

function safeUser(user) {
  if (!user) return user;
  const value = typeof user.toObject === "function" ? user.toObject() : { ...user };
  for (const field of SENSITIVE_FIELDS) delete value[field];
  return value;
}

module.exports = safeUser;
