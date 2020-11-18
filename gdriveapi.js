/* eslint camelcase: ["error", {"properties": "never", ignoreDestructuring: true}] */

const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = './config/token.json';

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (onWriteFileErr) => {
        if (onWriteFileErr) return console.error(onWriteFileErr);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0],
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function importCsv(file) {
  return new Promise((res, rej) => {
    fs.readFile('./config/credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Drive API.
      authorize(JSON.parse(content), (auth) => {
        const drive = google.drive({ version: 'v3', auth });
        const fileMetadata = {
          name: file.name,
          mimeType: 'application/vnd.google-apps.spreadsheet',
          parents: ['16MG2uBkpa4TDq18IXe2rF_00NuKySSUY'],
        };
        const media = {
          mimeType: 'text/csv',
          body: fs.createReadStream(file.path),
        };
        drive.files.create({
          resource: fileMetadata,
          media,
          fields: 'id',
        }, (onCreateErr, onCreateFile) => {
          if (onCreateErr) {
          // Handle error
            // console.error(onCreateErr);
            return rej(onCreateErr);
          }
          res(onCreateFile.data.id);
        });
      });
    });
  });
}

function readCell(spreadsheetId, range) {
  return new Promise((res, rej) => {
    fs.readFile('./config/credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Drive API.
      authorize(JSON.parse(content), (auth) => {
        const sheets = google.sheets({ version: 'v4', auth });

        sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
        }, (getSheetsErr, getSheetsResult) => {
          if (getSheetsErr) {
            let error;
            if (Object.prototype.hasOwnProperty.call(getSheetsErr, 'response')) {
              const { message, code } = getSheetsErr.response.data.error;
              error = new Error(message);
              error.code = code;
            } else {
              error = getSheetsErr;
              error.code = 500;
            }
            return rej(error);
          }
          res(getSheetsResult);
        });
      });
    });
  });
}

function readBatch(spreadsheetId, ranges = []) {
  return new Promise((res, rej) => {
    fs.readFile('./config/credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Drive API.
      authorize(JSON.parse(content), (auth) => {
        const sheets = google.sheets({ version: 'v4', auth });

        sheets.spreadsheets.values.batchGet({
          spreadsheetId,
          ranges,
        }, (getSheetsErr, getSheetsResult) => {
          if (getSheetsErr) {
            let error;
            if (Object.prototype.hasOwnProperty.call(getSheetsErr, 'response')) {
              const { message, code } = getSheetsErr.response.data.error;
              error = new Error(message);
              error.code = code;
            } else {
              error = getSheetsErr;
              error.code = 500;
            }
            return rej(error);
          }
          res(getSheetsResult.data);
        });
      });
    });
  });
}

function updateCell(spreadsheetId, range, valueInputOption = 'RAW', resource) {
  return new Promise((res, rej) => {
    fs.readFile('./config/credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Drive API.
      authorize(JSON.parse(content), (auth) => {
        const sheets = google.sheets({ version: 'v4', auth });
        console.log(`spreadsheetId + ${spreadsheetId}`);
        console.log(`range + ${range}`);
        console.log(`resource + ${resource}`);
        sheets.spreadsheets.values.update({
          spreadsheetId,
          range,
          valueInputOption,
          resource,
        }, (getSheetsErr, getSheetsResult) => {
          if (getSheetsErr) {
            let error;
            if (Object.prototype.hasOwnProperty.call(getSheetsErr, 'response')) {
              const { message, code } = getSheetsErr.response.data.error;
              error = new Error(message);
              error.code = code;
            } else {
              error = getSheetsErr;
              error.code = 500;
            }
            return rej(error);
          }
          res(getSheetsResult);
        });
      });
    });
  });
}

function batchUpdate(spreadsheetId, resource) {
  return new Promise((res, rej) => {
    fs.readFile('./config/credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Drive API.
      authorize(JSON.parse(content), (auth) => {
        const sheets = google.sheets({ version: 'v4', auth });
        sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          resource,
        }, (getSheetsErr, getSheetsResult) => {
          if (getSheetsErr) {
            let error;
            if (Object.prototype.hasOwnProperty.call(getSheetsErr, 'response')) {
              const { message, code } = getSheetsErr.response.data.error;
              error = new Error(message);
              error.code = code;
            } else {
              error = getSheetsErr;
              error.code = 500;
            }
            return rej(error);
          }
          res(getSheetsResult);
        });
      });
    });
  });
}

function appendValues(spreadsheetId, range, valueInputOption = 'RAW', resource) {
  return new Promise((res, rej) => {
    fs.readFile('./config/credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Drive API.
      authorize(JSON.parse(content), (auth) => {
        const sheets = google.sheets({ version: 'v4', auth });
        console.log(`spreadsheetId + ${spreadsheetId}`);
        console.log(`range + ${range}`);
        console.log(`resource + ${resource}`);
        sheets.spreadsheets.values.append({
          spreadsheetId,
          range,
          valueInputOption,
          insertDataOption: 'INSERT_ROWS',
          resource,
        }, (getSheetsErr, getSheetsResult) => {
          if (getSheetsErr) {
            let error;
            if (Object.prototype.hasOwnProperty.call(getSheetsErr, 'response')) {
              const { message, code } = getSheetsErr.response.data.error;
              error = new Error(message);
              error.code = code;
            } else {
              error = getSheetsErr;
              error.code = 500;
            }
            return rej(error);
          }
          res(getSheetsResult);
        });
      });
    });
  });
}

module.exports = {
  importCsv,
  readCell,
  readBatch,
  updateCell,
  batchUpdate,
  appendValues,
};

// module.exports = new GdriveApi();
