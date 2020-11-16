const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const shortid = require('shortid');
const mongoose = require('mongoose');
const gDriveApi = require('../../gdriveapi');

const Entry = require('../../models/Entry');

module.exports = async (req, res, next) => {
  if (!req.files) {
    return next({
      status: 400,
      message: 'No file uploaded',
    });
  }

  const evtc = req.files.file;
  const uuid = shortid.generate();
  const evtcName = evtc.name.split('.');

  if (evtcName.length !== 2) {
    return next({
      status: 400,
      message: 'Incorrect filename or extension.',
    });
  }

  const newName = `${evtcName[0]}-${uuid}.${evtcName[1]}`;

  evtc.mv(`./uploads/${newName}`);

  // console.log(evtc);

  const { stdout, stderr } = await exec(
    `mono gw2ei/GuildWars2EliteInsights.exe -p -c config/conf.conf "uploads/${newName}"`,
  );

  console.log('gw2ei output:\n', stdout);
  console.log('-----------');
  // console.log('stderr:', stderr);

  const matchedFile = stdout.match(/Generated: (.*)/);
  if (!matchedFile) {
    console.log('no matched file');
    return next({
      status: 500,
      message: 'Failed parsing file, using gw2ei',
    });
  }

  const csvFile = path.basename(matchedFile[0]);

  if (stderr.length > 0) {
    return next({
      status: 500,
      message: stderr,
    });
  }

  // gDriveApi.init()
  //   .then(() => {
  //     gDriveApi.importCsv({
  //       name: csvFile,
  //       path: `./csv/${csvFile}`,
  //     });
  //   }).catch((e) => console.log(e));

  const gSheetId = await gDriveApi.importCsv({
    name: csvFile,
    path: `./csv/${csvFile}`,
  });

  console.log(`created new table id: ${gSheetId}`);

  // return response
  res.status(200).send({
    sheetId: gSheetId,
  });
};
