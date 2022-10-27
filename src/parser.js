const fs = require('fs');
const readline = require('readline');
const stream = require('stream');
const reverseReader = require('reverse-line-reader');
const prisma = require('../prisma/prisma.js');

const fileSrc = './export-2021-12-31.txt';
const rates = [];

//Assign line to the tempObject
function objAssign(tempObj, line) {
  const key = line.split(' ')[0].slice(0, -1);
  let value = line.replace(/\s+/, '\x01').split('\x01')[1];

  switch (key) {
    case 'id': {
      value = +value;
      break;
    }
    case 'amount': {
      value = +value;
      break;
    }
    case 'date': {
      value = new Date(value);
      break;
    }
  }

  Object.assign(tempObj, {
    [key]: value,
  });
}

//Convert Donation amount to USD
function convertCurrency(payment, line) {
  const amount = line.split(' ');
  const sign = amount[2];
  let value = amount[1];

  if (sign !== 'USD') {
    exchangeRate = rates.find(
      (rate) => +rate.date === +payment.date && rate.sign === sign,
    ).value;

    value = (value * exchangeRate).toFixed(2);
  }

  Object.assign(payment, { amount: +value });
}

//Reverse read file to execute Rates data
async function readRates() {
  let tempObj = {};
  return reverseReader.eachLine(fileSrc, function (line, last) {
    if (line.length === 0) {
      return true;
    }
    line = line.replace(/\s+/, ''); //remove whitespaces on the left

    if (line === 'Rate') {
      rates.push(tempObj);
      tempObj = {};
      return true;
    }

    if (line === 'Rates') {
      return false; // stop reading
    }

    objAssign(tempObj, line);
  });
}

//Read file to execute Employees data and store to DB
async function readEmployeesData() {
  const instream = fs.createReadStream(fileSrc);
  const outstream = new stream();
  const rl = readline.createInterface(instream, outstream);

  let current = '';

  let employeeObj = {
    data: {
      department: {
        connectOrCreate: {
          where: {},
          create: {},
        },
      },
      payments: {
        createMany: { data: [] },
      },
    },
  };

  let payment = {};

  for await (let line of rl) {
    if (line.length === 0) {
      continue;
    }
    line = line.replace(/\s+/, ''); //remove whitespaces on the left

    if (line === 'Rates') {
      employeeObj.data.payments.createMany.data.push(payment);
      await prisma.employee.create(employeeObj);
      rl.close();
      rl.removeAllListeners(); //stop reading
      return;
    }

    if (Object.keys(payment).length > 4) {
      console.log(payment);
    }

    if (line === 'Employee') {
      //save employee obj to db
      if (Object.keys(employeeObj.data).length > 2) {
        if (Object.keys(payment).length > 4) {
          console.log(payment);
        }
        employeeObj.data.payments.createMany.data.push(payment);
        await prisma.employee.create(employeeObj);
      }
      employeeObj = {
        data: {
          department: {
            connectOrCreate: {
              where: {},
              create: {},
            },
          },
          payments: {
            createMany: { data: [] },
          },
        },
      };
      payment = {};
      current = 'Employee';
      continue;
    }

    if (line === 'Department') {
      current = 'Department';
      continue;
    }

    if (line === 'Salary') {
      current = 'Salary';
      continue;
    }

    if (line === 'Statement') {
      if (Object.keys(payment).length !== 0) {
        if (Object.keys(payment).length > 4) {
          console.log(payment);
        }
        employeeObj.data.payments.createMany.data.push(payment);
      }
      payment = { type: 'Salary' };
      current = 'Statement';
      continue;
    }

    if (line === 'Donation') {
      if (Object.keys(payment).length > 4) {
        console.log(payment);
      }
      employeeObj.data.payments.createMany.data.push(payment);
      payment = { type: 'Donation' };
      current = 'Donation';
      continue;
    }

    switch (current) {
      case 'Employee':
        objAssign(employeeObj.data, line);
        break;
      case 'Department':
        if (line.startsWith('id')) {
          objAssign(employeeObj.data.department.connectOrCreate.where, line); // id only
        }
        objAssign(employeeObj.data.department.connectOrCreate.create, line);
        break;
      case 'Statement':
        objAssign(payment, line);
        break;
      case 'Donation':
        if (line.startsWith('amount')) {
          convertCurrency(payment, line);
        } else {
          objAssign(payment, line);
        }
        break;
    }
  }
}

async function parseFile() {
  try {
    console.log('start');
    await readRates();
    await readEmployeesData();
    console.log('end');
  } catch (err) {
    console.log(err);
  }
}

module.exports = { parseFile };
