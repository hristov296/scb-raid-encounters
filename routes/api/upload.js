const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const shortid = require('shortid');
const mongoose = require('mongoose');
const gDriveApi = require('../../gdriveapi');

const Entry = require('../../models/Entry');
const Cell = require('../../models/Cell');
const gdriveapi = require('../../gdriveapi');

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

  const { stdout, stderr } = await exec(
    `mono gw2ei/GuildWars2EliteInsights.exe -p -c config/conf.conf "uploads/${newName}"`,
  );

  console.log('gw2ei output:\n', stdout);
  console.log('-----------');

  if (stderr.length > 0) {
    return next({
      status: 500,
      message: stderr,
    });
  }

  const matchedFile = stdout.match(/Generated: (.*)/);
  if (!matchedFile) {
    console.log('no matched file');
    return next({
      status: 500,
      message: 'Failed parsing file, using gw2ei',
    });
  }

  const csvFile = path.basename(matchedFile[0]);

  try {
    const gSheetId = await gDriveApi.importCsv({
      name: csvFile,
      path: `./csv/${csvFile}`,
    });
    console.log(`created new table id: ${gSheetId}`);

    const batchReadData = await gDriveApi.readBatch(gSheetId, ['B7', 'B6', 'B11', 'B16', 'B1', 'B3']);

    // const currentCellNumbers = await Cell.find({}, 'cellNumber').exec();
    // console.log(`currentCellNumbers+${currentCellNumbers}`);

    const newEntry = new Entry({
      _id: new mongoose.Types.ObjectId(),
      uuid,
      name: csvFile,
      gSheetId,
      dpsLink: batchReadData.valueRanges[0].values[0][0],
      logDate: batchReadData.valueRanges[1].values[0][0],
      boss: batchReadData.valueRanges[2].values[0][0],
      duration: batchReadData.valueRanges[3].values[0][0],
      eiVer: batchReadData.valueRanges[4].values[0][0],
      fightId: batchReadData.valueRanges[5].values[0][0],
    });

    const newCell = new Cell({
      _id: new mongoose.Types.ObjectId(),
      entryId: newEntry._id,
    });

    newEntry.cellId = newCell._id;

    await Promise.all([newEntry.save(), newCell.save()]);

    await gDriveApi.updateCell('1nefgFI-GSJUiIdVeKtH07CfJ2qM3KJXuMPiHvHKpdtg', newCell.cellAddress, { values: [[`https://docs.google.com/spreadsheets/d/${gSheetId}/`]] });
    await gDriveApi.appendValues(process.env.SHEET_ID, 'data!B2', { values: [[`https://docs.google.com/spreadsheets/d/${gSheetId}/`]] });
  } catch (e) {
    console.log(e);
    return next({ status: 500, message: e.message });
  }

  // return response
  res.status(200).send('asd');
};
