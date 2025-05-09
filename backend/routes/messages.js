const express = require("express");
const { query } = require("../db");
const router = express.Router();

// ✅ Тестовый GET-маршрут
router.get("/", (req, res) => {
  res.send("Messages route is working!");
});
// Получение всех сообщений конкретного пользователя
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await query(
      "SELECT id, user_id, message_content, role, created_at FROM messages WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    // Вместо 404 возвращаем пустой массив с информацией о том, что сообщений нет
    if (result.length === 0) {
      return res.json([]); // Возвращаем пустой массив
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Добавление нового сообщения
router.post("/", async (req, res) => {
  const { userId, messageContent, role } = req.body;

  if (!userId || !messageContent || !role) {
    return res
      .status(400)
      .json({ message: "Необходимы userId, messageContent и role" });
  }

  try {
    const result = await query(
      "INSERT INTO messages (user_id, message_content, role) VALUES ($1, $2, $3) RETURNING id, user_id, message_content, role, created_at",
      [userId, messageContent, role]
    );
    const message = result[0];
    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
