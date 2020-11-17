const gDriveApi = require('../../gdriveapi');
const Cell = require('../../models/Cell');

module.exports = async (req, res, next) => {
  const { sheetId, range } = req.query;
  const { resource } = req.body;

  console.log(req.body);
  try {
    // const getCell = await gDriveApi.updateCell(sheetId, range, resource);
    // console.log(getCell);

    const getCell = await gDriveApi.appendValues(sheetId, range, resource);
    console.log(getCell);

    // const currentCellNumbers = await Cell.find({}, 'cellNumber -_id').exec();
    // console.log(`currentCellNumbers+${currentCellNumbers}`);

    res.status(200).send(getCell);
  } catch (e) {
    return next({ status: e.code, message: e.message });
  }
};
