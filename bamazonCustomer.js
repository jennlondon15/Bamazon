const mysql = require('mysql');
const inquirer = require('inquirer');

// read database password from .env
require('dotenv').config();

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3308,
  user: 'root',
  password: process.env.ROOT_PASSWORD,
  database: 'bamazon_db',
});

connection.connect(function(error) {
  if (error) throw error;

  const query = connection.query('SELECT * FROM products', function(err, data) {
    for (let i = 0; i < data.length; i++) {
      console.log(
        `ID: ${data[i].id} PRODUCT: ${data[i].name} $${data[i].price}`,
      );
    }
    inquirer
      .prompt([
        {
          name: 'itemId',
          message: 'Enter the ID of the product you would like to buy.',
        },
        {
          name: 'quantity',
          message: 'How many would you like to buy?',
        },
      ])
      .then(function(answers) {
        const query = connection.query(
          'SELECT * FROM products WHERE ?',
          {
            id: answers.itemId,
          },
          function(err, data) {
            if (answers.quantity > data[0].stock) {
              console.log('Not enough product in stock to fulfill your order.');
              connection.end();
            } else {
              const query = connection.query(
                'UPDATE products SET ? WHERE ?',
                [
                  {
                    stock: data[0].stock - answers.quantity,
                    sales: data[0].sales + data[0].price * answers.quantity,
                  },
                  {
                    id: answers.itemId,
                  },
                ],
                function(err, data) {
                  console.log('Order placed!');
                  connection.end();
                },
              );
            }
          },
        );
      });
  });
});
