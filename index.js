(async function () {
  const fs = require('fs');
  const express = require('express');
  const path = require('path');
  const bodyParser = require('body-parser');
  const { Sequelize, DataTypes } = require('sequelize');

  const removeFiles = require('./middlewares/removeFiles');
  const extractFile = require('./middlewares/extractFile');

  const app = express();
  const sequelize = new Sequelize(
    'image_map',
    '<MYSQL USERNAME>',
    '<MYSQL PASSWORD>',
    {
      host: 'localhost',
      dialect: 'mysql',
    }
  );

  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

  const Shape = sequelize.define('Shape', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fill: DataTypes.STRING,
    stroke: DataTypes.STRING,
    strokeWidth: DataTypes.INTEGER,
    text: DataTypes.STRING,
    coords: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    link: DataTypes.STRING,
    imageName: DataTypes.STRING,
  });

  try {
    await sequelize.sync({ force: true });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to sync models:', error);
  }

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use('/images', express.static(path.join('images')));
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PATCH, PUT, DELETE, OPTIONS'
    );

    next();
  });

  app.get('/image', (req, res) => {
    let url = '';
    if (fs.existsSync('images/uploaded-img.jpg')) {
      url = '/images/uploaded-img.jpg';
    }
    if (fs.existsSync('images/uploaded-img.png')) {
      url = '/images/uploaded-img.png';
    }
    if (fs.existsSync('images/uploaded-img.jpeg')) {
      url = '/images/uploaded-img.jpeg';
    }

    res
      .status(200)
      .send({ imagePath: req.protocol + '://' + req.get('host') + url });
  });

  app.post('/image', removeFiles, extractFile, async (req, res) => {
    try {
      await Shape.destroy({
        truncate: true,
      });

      const url = req.protocol + '://' + req.get('host');
      const imagePath = url + '/images/' + req.file.filename;
      res.status(200).send({ success: true, imagePath });
    } catch (err) {
      res.status(200).send({ success: false, message: err.message });
    }
  });

  app.get('/shape', async (_, res) => {
    try {
      const shapes = await Shape.findAll();
      res.status(200).send({ success: true, shapes });
    } catch (err) {
      res.status(500).send({ success: false, message: err.message });
    }
  });

  app.post('/shape', async (req, res) => {
    try {
      await Shape.destroy({
        truncate: true,
      });

      const shapes = await Shape.bulkCreate(req.body.shapes);
      console.log(shapes);
      res.status(200).send({ success: true, shapes });
    } catch (err) {
      res.status(500).send({ success: false, message: err.message });
    }
  });

  app.listen(5000, () => console.log('Server started!'));
})();
