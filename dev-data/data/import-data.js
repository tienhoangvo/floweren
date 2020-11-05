const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');

dotenv.config({ path: './../../config.env' });

// const app = require('../../app');
const Category = require('../../models/categoryModel');
const User = require('../../models/userModel');
const Product = require('../../models/productModel');
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/usersData.json`)
);

const categories = JSON.parse(
  fs.readFileSync(
    `${__dirname}/categoriesData.json`
  )
);

const products = JSON.parse(
  fs.readFileSync(
    `${__dirname}/productsData.json`
  )
);

const DB_URI = process.env.DB_URI.replace(
  '<PWD>',
  process.env.DB_PWD
);

mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((_) => {
    console.log('DB connected successully');
  })
  .catch((err) => console.log(err));

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Category.create(categories);
    await User.create(users);
    await Product.create(products);
    console.log('Data successfully loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM COLLECTION FROM DB
const deleteData = async () => {
  try {
    await Category.deleteMany();
    await User.deleteMany();
    await Product.deleteMany();
    console.log('Data successfully deleted');
  } catch (err) {
    console.log(err);
  }

  process.exit();
};
console.log(process.argv);

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
