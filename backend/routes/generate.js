const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = "gpt-3.5-turbo";

// system prompts для разных режимов
const SYSTEM_PROMPTS = {
  chat: process.env.OPENAI_CHAT_PROMPT,
  plan: process.env.OPENAI_PLAN_PROMPT,
  explain: process.env.OPENAI_EXPLAIN_PROMPT,
};

router.post("/", async (req, res) => {
  const { mode = "chat" } = req.body;

  const selectedPrompt = SYSTEM_PROMPTS[mode];
  if (!selectedPrompt) {
    return res.status(400).json({ error: "Неизвестный режим работы ИИ" });
  }

  let finalMessages;

  if (mode === "chat" || mode === "plan") {
    const { name, grade, tone, hint_level, messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Неверный формат messages" });
    }

    finalMessages = [
      {
        role: "system",
        content: selectedPrompt
          .replace(/{name}/g, name)
          .replace(/{grade}/g, grade)
          .replace(/{tone}/g, tone)
          .replace(/{hint_level}/g, hint_level),
      },
      ...messages,
    ];
  } else if (mode === "explain") {
    const { name, grade, topic, prevExplanation } = req.body;

    if (!name || !grade || !topic) {
      return res
        .status(400)
        .json({ error: "Отсутствуют name, grade или topic" });
    }

    if (!prevExplanation) {
      finalMessages = [
        {
          role: "system",
          content: selectedPrompt
            .replace(/{name}/g, name)
            .replace(/{grade}/g, grade),
        },
        {
          role: "user",
          content: `Пожалуйста, объясни тему "${topic}".`,
        },
      ];
    } else {
      finalMessages = [
        {
          role: "system",
          content: selectedPrompt
            .replace(/{name}/g, name)
            .replace(/{grade}/g, grade),
        },
        prevExplanation,
        {
          role: "user",
          content: `Ты обьяснил не очень понятно, давай поподробнее`,
        },
      ];
    }
  }

  try {
    const openaiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: MODEL,
        messages: finalMessages,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const gptMessage = openaiResponse.data.choices[0].message;
    res.json({ message: gptMessage, req: finalMessages });
  } catch (error) {
    console.error(
      "Ошибка при обращении к OpenAI:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Ошибка генерации ответа" });
  }
});

router.get("/test", (req, res) => {
  res.send("Generate route is working!");
});

module.exports = router;
