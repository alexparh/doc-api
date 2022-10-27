const { Router } = require('express');
const router = Router();
const prisma = require('../prisma/prisma');
const fs = require('fs');

router.get('/query1', async (req, res) => {
  try {
    const query = fs.readFileSync(__dirname + '/queries/query1.sql', 'utf8');
    const employees = await prisma.$queryRawUnsafe(query);
    console.log(employees);
    return res.status(200).json(employees);
  } catch (err) {
    console.log(err);
    res.status(400).json({ Error: err.message });
  }
});

router.get('/query2', async (req, res) => {
  try {
    const query = fs.readFileSync(__dirname + '/queries/query2.sql', 'utf8');
    const employees = await prisma.$queryRawUnsafe(query);
    console.log(employees);
    return res.status(200).json(employees);
  } catch (err) {
    console.log(err);
    res.status(400).json({ Error: err.message });
  }
});

router.post('/query3', async (req, res) => {
  try {
    const query = fs.readFileSync(__dirname + '/queries/query3.sql', 'utf8');
    const count = await prisma.$executeRawUnsafe(query);
    return res.status(200).json({ Result: 'created', RowsAffected: count });
  } catch (err) {
    console.log(err);
    res.status(400).json({ Error: err.message });
  }
});

router.post('/query4', async (req, res) => {
  try {
    const query = fs.readFileSync(__dirname + '/queries/query4.sql', 'utf8');
    const count = await prisma.$executeRawUnsafe(query);
    return res.status(200).json({ Result: 'created', RowsAffected: count });
  } catch (err) {
    console.log(err);
    res.status(400).json({ Error: err.message });
  }
});

module.exports = router;
