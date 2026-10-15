require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const dbConnect = require("./config/dbConnect");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const app = express();
const dotenv = require("dotenv").config();
const PORT = Number(process.env.PORT ?? 5000);
const validateEnv = require("./config/validateEnv");
try {
  validateEnv();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
const authRouter = require("./routes/authRoute");
const productRouter = require("./routes/productRoute");
const blogRouter = require("./routes/blogRoute");
const categoryRouter = require("./routes/prodcategoryRoute");
const blogcategoryRouter = require("./routes/blogCatRoute");
const brandRouter = require("./routes/brandRoute");
const colorRouter = require("./routes/colorRoute");
const enqRouter = require("./routes/enqRoute");
const couponRouter = require("./routes/couponRoute");
const uploadRouter = require("./routes/uploadRoute");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");

app.use(morgan("dev"));
const defaultDevelopmentOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
];

function getAllowedOrigins() {
  if (process.env.CORS_ORIGINS !== undefined) {
    return process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean);
  }
  if (process.env.NODE_ENV === "production") return [];
  return defaultDevelopmentOrigins;
}

const allowedOrigins = getAllowedOrigins();
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/blog", blogRouter);
app.use("/api/category", categoryRouter);
app.use("/api/blogcategory", blogcategoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/color", colorRouter);
app.use("/api/enquiry", enqRouter);
app.use("/api/upload", uploadRouter);

app.use(notFound);
app.use(errorHandler);
dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at PORT ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database startup failed:", error.message);
    process.exitCode = 1;
  });
