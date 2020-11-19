module.exports = {
  batchUpdateCalculate(index, sheetToPaste) {
    return {
      requests: [
        {
          appendCells: {
            sheetId: 0,
            rows: [
              {
                values: [[sheetToPaste]],
              },
            ],
            fields: '*',
          },
        },
        {
          copyPaste: {
            source: {
              sheetId: 0,
              startRowIndex: 2,
              endRowIndex: 3,
              startColumnIndex: 2,
              endColumnIndex: 22,
            },
            destination: {
              sheetId: 0,
              startRowIndex: index - 1,
              endRowIndex: index,
              startColumnIndex: 2,
              endColumnIndex: 22,
            },
            pasteType: 'PASTE_FORMULA',
            pasteOrientation: 'NORMAL',
          },
        },
        {
          copyPaste: {
            source: {
              sheetId: 0,
              startRowIndex: 3,
              endRowIndex: 12,
              startColumnIndex: 1,
              endColumnIndex: 9,
            },
            destination: {
              sheetId: 0,
              startRowIndex: index,
              endRowIndex: index + 9,
              startColumnIndex: 1,
              endColumnIndex: 9,
            },
            pasteType: 'PASTE_FORMULA',
            pasteOrientation: 'NORMAL',
          },
        },
        {
          copyPaste: {
            source: {
              sheetId: 0,
              startRowIndex: 3,
              endRowIndex: 12,
              startColumnIndex: 13,
              endColumnIndex: 19,
            },
            destination: {
              sheetId: 0,
              startRowIndex: index,
              endRowIndex: index + 9,
              startColumnIndex: 13,
              endColumnIndex: 19,
            },
            pasteType: 'PASTE_FORMULA',
            pasteOrientation: 'NORMAL',
          },
        },
        {
          copyPaste: {
            source: {
              sheetId: 0,
              startRowIndex: 3,
              endRowIndex: 12,
              startColumnIndex: 21,
              endColumnIndex: 22,
            },
            destination: {
              sheetId: 0,
              startRowIndex: index,
              endRowIndex: index + 9,
              startColumnIndex: 21,
              endColumnIndex: 22,
            },
            pasteType: 'PASTE_FORMULA',
            pasteOrientation: 'NORMAL',
          },
        },
      ],
    };
  },
  batchUpdatePredefined(sheetId) {
    return {
      values: [
        [sheetId, 12],
      ],
    };
  },
};
