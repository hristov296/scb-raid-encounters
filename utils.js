module.exports = {
  batchUpdateCalculate(index) {
    return {
      resource: {
        requests: [
          {
            copyPaste: {
              source: {
                sheetId: 0,
                startRowIndex: 3,
                endRowIndex: 12,
                startColumnIndex: 1,
                endColumnIndex: 22,
              },
              destination: {
                sheetId: 0,
                startRowIndex: 13,
                endRowIndex: 22,
                startColumnIndex: 1,
                endColumnIndex: 22,
              },
              pasteType: 'PASTE_NORMAL',
              pasteOrientation: 'NORMAL',
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
                startRowIndex: 12,
                endRowIndex: 13,
                startColumnIndex: 2,
                endColumnIndex: 22,
              },
              pasteType: 'PASTE_NORMAL',
              pasteOrientation: 'NORMAL',
            },
          },
        ],
      },
    };
  },
};
