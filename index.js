require('dotenv').config();

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const shortid = require('shortid');
const gDriveApi = require('./gdriveapi');

const app = express();
const port = process.env.PORT;

// enable files upload
app.use(
  fileUpload({
    createParentPath: true,
    // useTempFiles: true,
    tempFileDir: '/tmp/',
    abortOnLimit: true,
    limits: { fileSize: 50 * 1024 * 1024 },
  }),
);

// add other middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('combined'));

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
      const evtc = req.files.file;
      const uuid = shortid.generate();
      const evtcName = evtc.name.split('.');

      if (evtcName.length !== 2) {
        throw new Error('Incorrect filename or extension.');
      }

      const newName = `${evtcName[0]}-${uuid}.${evtcName[1]}`;

      evtc.mv(`./uploads/${newName}`);

      // console.log(evtc);

      const { stdout, stderr } = await exec(
        `mono gw2ei/GuildWars2EliteInsights.exe -p -c gw2ei/conf.conf uploads/${newName}`,
      );

      console.log('stdout:', stdout);
      console.log('stderr:', stderr);

      const csvFile = path.basename(stdout.match(/Generated: (.*)/)[0]);

      if (stderr.length > 0) {
        throw new Error(stderr);
      }

      const gSheetId = await gDriveApi.importCsv({
        name: csvFile,
        path: `./csv/${csvFile}`,
      });

      console.log(gSheetId);

      // return response
      res.status(200).send({
        sheetId: gSheetId,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.post('/uploadall', async (req, res) => {
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
