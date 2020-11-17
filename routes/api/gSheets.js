const gDriveApi = require('../../gdriveapi');

async function readCell(req, res, next) {
  const { sheetId, range } = req.query;

  try {
    const getCell = await gDriveApi.readCell(sheetId, range);
    res.status(200).send(getCell.data);
  } catch (e) {
    return next({ status: e.code, message: e.message });
  }
}

async function readBatch(req, res, next) {
  const { sheetId, ranges } = req.query;

  try {
    const getBatch = await gDriveApi.readBatch(sheetId, ranges);
    res.status(200).send(getBatch.data);
  } catch (e) {
    return next({ status: e.code, message: e.message });
  }
}

async function updateCell(req, res, next) {
  const { sheetId, range } = req.query;
  const { resource } = req.body;

  try {
    const getCell = await gDriveApi.updateCell(sheetId, range, resource);
    console.log(getCell);
    res.status(200).send(getCell.data);
  } catch (e) {
    return next({ status: e.code, message: e.message });
  }
}

module.exports = {
  readCell,
  readBatch,
  updateCell,
};
