const express = require("express");
const { query } = require("../db");
const router = express.Router();

// ✅ Тестовый GET-маршрут
router.get("/", (req, res) => {
  res.send("Explanations route is working!");
});

// Получение всех объяснений конкретного пользователя
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await query(
      `SELECT id, user_id, explanation_content, subject, topic, created_at
       FROM explanations
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result);
  } catch (error) {
    console.error("Ошибка при получении объяснений:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Добавление нового объяснения (id задаётся вручную)
router.post("/", async (req, res) => {
  const { id, userId, explanationContent, subject, topic } = req.body;

  if (!id || !userId || !explanationContent || !subject || !topic) {
    return res.status(400).json({
      message: "Необходимы id, userId, explanationContent, subject и topic",
    });
  }

  try {
    const result = await query(
      `INSERT INTO explanations (id, user_id, explanation_content, subject, topic)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, explanation_content, subject, topic, created_at`,
      [id, userId, explanationContent, subject, topic]
    );

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Ошибка при добавлении объяснения:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Обновление explanation_content по id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { explanationContent } = req.body;

  if (!explanationContent) {
    return res
      .status(400)
      .json({ message: "Необходим explanationContent для обновления" });
  }

  try {
    const result = await query(
      `UPDATE explanations
       SET explanation_content = $1
       WHERE id = $2
       RETURNING id, user_id, explanation_content, subject, topic, created_at`,
      [explanationContent, id]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "Объяснение не найдено" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Ошибка при обновлении объяснения:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Удаление объяснения по id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      `DELETE FROM explanations
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "Объяснение не найдено" });
    }

    res.json({ message: "Объяснение удалено", id: result[0].id });
  } catch (error) {
    console.error("Ошибка при удалении объяснения:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
