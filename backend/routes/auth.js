// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const { query } = require('../db');
const jwt = require('jsonwebtoken');
const router = express.Router();

// ✅ Тестовый GET-маршрут
router.get('/test', (req, res) => {
  res.send('Auth route is working!');
});

// Регистрация пользователя
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Проверяем, существует ли уже пользователь с таким email
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);

    if (existingUser.length > 0) {
      // Если пользователь найден, отправляем ошибку
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Сохраняем нового пользователя в базе данных
    const result = await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );

    const user = result[0];

    // Генерируем JWT-токен для нового пользователя
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h', // Время действия токена
    });

    // Отправляем ответ с токеном
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Логин пользователя
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = result[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
