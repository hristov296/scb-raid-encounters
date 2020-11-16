const gDriveApi = require('../../gdriveapi');

module.exports = async (req, res, next) => {
  const gSheetId = req.query.sheetId;

  console.log(`created new table id: ${gSheetId}`);

  const readed = await gDriveApi.readCell(gSheetId, 'B6:B5').catch((e) => console.log(e));

  console.log(readed);
  res.status(200).send('ay');
};
