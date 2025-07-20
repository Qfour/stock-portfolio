const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const collection = db.collection('portfolio');

// バリデーション関数
const validateStockData = (data) => {
  const errors = [];
  
  if (!data.ticker || data.ticker.trim() === '') {
    errors.push('ティッカーシンボルは必須です');
  }
  
  if (!data.name || data.name.trim() === '') {
    errors.push('銘柄名は必須です');
  }
  
  if (!data.shares || data.shares <= 0) {
    errors.push('保有株数は0より大きい値を入力してください');
  }
  
  if (!data.buy_price || data.buy_price <= 0) {
    errors.push('取得単価は0より大きい値を入力してください');
  }
  
  return errors;
};

// GET /api/portfolio - 全ポートフォリオ取得
router.get('/', async (req, res) => {
  try {
    const snapshot = await collection.get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// GET /api/portfolio/basic - ポートフォリオ一覧取得（株価なし）
router.get('/basic', async (req, res, next) => {
  try {
    const snapshot = await collection.get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// POST /api/portfolio - 新規追加
router.post('/', async (req, res) => {
  try {
    const docRef = await collection.add(req.body);
    res.json({ id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add portfolio item' });
  }
});

// PUT /api/portfolio/:id - 編集
router.put('/:id', async (req, res) => {
  try {
    await collection.doc(req.params.id).update(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update portfolio item' });
  }
});

// DELETE /api/portfolio/:id - 削除
router.delete('/:id', async (req, res) => {
  try {
    await collection.doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete portfolio item' });
  }
});

module.exports = router; 