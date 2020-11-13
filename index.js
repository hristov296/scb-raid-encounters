require('dotenv').config();

const mongoose = require('mongoose');
const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');

const app = express();
const port = process.env.PORT;

// enable files upload
app.use(fileUpload({
  createParentPath: true,
  // useTempFiles: true,
  tempFileDir: '/tmp/',
  abortOnLimit: true,
  limits: { fileSize: 50 * 1024 * 1024 },
}));

// add other middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('combined'));

mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PWD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, { useNewUrlParser: true, useUnifiedTopology: true }).catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello world');
});

app.post('/upload', async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: 'No file uploaded',
      });
    } else {
      const data = [];

      // loop all files
      _.forEach(_.keysIn(req.files.evtcs), (key) => {
        const evtc = req.files.evtcs[key];

        // move evtc to uploads directory
        evtc.mv(`./uploads/${evtc.name}`);

        // push file details
        data.push({
          name: evtc.name,
          mimetype: evtc.mimetype,
          size: evtc.size,
        });
      });

      // return response
      res.send({
        status: true,
        message: 'Files are uploaded',
        data,
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
