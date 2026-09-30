const DEFAULT_ORIGINS = "http://localhost:3000,http://localhost:3001";

const getAllowedOrigins = () =>
  new Set(
    (process.env.CORS_ORIGINS || DEFAULT_ORIGINS)
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  );

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  return getAllowedOrigins().has(origin);
};

const corsOptions = {
  origin(origin, callback) {
    callback(null, isOriginAllowed(origin));
  },
  credentials: true,
};

module.exports = { corsOptions, isOriginAllowed };
