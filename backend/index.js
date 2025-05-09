// index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const explanationRoutes = require("./routes/explanations");
const generateRoutes = require("./routes/generate");
const settingsRoutes = require("./routes/settings");

dotenv.config();

const app = express();

app.use(express.json()); // Для парсинга JSON в запросах
app.use(cors()); // Для разрешения CORS-запросов

// Маршруты для аутентификации
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/explanations", explanationRoutes);
app.use("/api/generate", generateRoutes);
app.use("/api/settings", settingsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
