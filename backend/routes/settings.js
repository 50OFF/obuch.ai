const express = require("express");
const { query } = require("../db");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Settings route is working!");
});

// Получить настройки пользователя
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await query(
      "SELECT name, grade, tone, hint_level FROM users WHERE id = $1",
      [userId]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Ошибка при получении настроек:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Обновить настройки пользователя
router.put("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { name, grade, tone, hint_level } = req.body;

  try {
    await query(
      `UPDATE users
       SET name = $1, grade = $2, tone = $3, hint_level = $4
       WHERE id = $5`,
      [name, grade, tone, hint_level, userId]
    );

    res.json({ message: "Настройки успешно обновлены" });
  } catch (error) {
    console.error("Ошибка при обновлении настроек:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
