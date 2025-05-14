const express = require("express");
const router = express.Router();
const axios = require("axios");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEFAULT_MODEL = "gpt-3.5-turbo";

const upload = multer({ dest: "uploads/" });

const SYSTEM_PROMPTS = {
  task_help: process.env.OPENAI_TASK_HELP_PROMPT,
  chat: process.env.OPENAI_CHAT_PROMPT,
  explain: process.env.OPENAI_EXPLAIN_PROMPT,
};

router.post("/", upload.single("image"), async (req, res) => {
  const { mode = "chat" } = req.body;
  const selectedPrompt = SYSTEM_PROMPTS[mode];

  if (!selectedPrompt) {
    return res.status(400).json({ error: "Неизвестный режим работы ИИ" });
  }

  let finalMessages;
  let model = DEFAULT_MODEL;

  if (mode === "chat") {
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
    const { name, grade, subject, topic, prevExplanation } = req.body;

    if (!name || !grade || !subject || !topic) {
      return res.status(400).json({ error: "Отсутствуют обязательные поля" });
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
          content: `Пожалуйста, объясни тему "${topic}" по предмету "${subject}".`,
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
          content: `Ты объяснил не очень понятно, давай поподробнее.`,
        },
      ];
    }
  } else if (mode === "task_help") {
    const { name, grade, text } = req.body;
    const hasImage = req.file;

    if (!hasImage && !text) {
      return res
        .status(400)
        .json({ error: "Нужно отправить текст или изображение" });
    }

    const systemMessage = {
      role: "system",
      content: selectedPrompt
        .replace(/{name}/g, name)
        .replace(/{grade}/g, grade),
    };

    if (hasImage) {
      const imagePath = path.join(__dirname, "../", req.file.path);
      const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });
      fs.unlinkSync(imagePath); // удаляем файл после чтения

      model = "gpt-4o";

      finalMessages = [
        systemMessage,
        {
          role: "user",
          content: [
            ...(text ? [{ type: "text", text }] : []),
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ];
    } else {
      // Только текст, используем 3.5
      finalMessages = [
        systemMessage,
        {
          role: "user",
          content: text,
        },
      ];
    }
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model,
        messages: finalMessages,
        max_tokens: 1000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const gptMessage = response.data.choices[0].message;
    res.json({ message: gptMessage, model });
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
