const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

//  to read the configuration file
dotenv.config({ path: './config.env' }); // it takes an object and should be before requirin our app

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
// this a promise
mongoose.connect(DB).then(() => {
  console.log('DB is connected');
});
// read file
const tours = fs.readFileSync(`${__dirname}/tours.json`, 'utf-8');
const users = fs.readFileSync(`${__dirname}/users.json`, 'utf-8');
const reviews = fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8');
const importData = async () => {
  try {
    await Tour.create(JSON.parse(tours)); // it can take an array of objects
    await User.create(JSON.parse(users), { validateBeforeSave: false }); // it can take an array of objects
    await Review.create(JSON.parse(reviews)); // it can take an array of objects
    console.log('data imported');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};
// delete all data from database
const deleteAllData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('data deleted');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteAllData();
}
console.log(process.argv);
