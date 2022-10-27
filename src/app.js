const express = require('express');
const app = express();
const prisma = require('../prisma/prisma.js');
const { parseFile } = require('./parser');
const routes = require('./routes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', routes);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await prisma.$connect();
    await parseFile();
    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  } catch (e) {
    console.log(e);
    prisma.$disconnect();
  }
}
start();
