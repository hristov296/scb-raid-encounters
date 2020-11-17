const gDriveApi = require('../../gdriveapi');

module.exports = async (req, res, next) => {
  const { sheetId, range } = req.query;
  const { resource } = req.body;

  console.log(req.body);
  try {
    const getCell = await gDriveApi.updateCell(sheetId, range, resource);
    res.status(200).send(getCell.data);
  } catch (e) {
    return next({ status: e.code, message: e.message });
  }
};
