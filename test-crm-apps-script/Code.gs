/**
 * Simplifye Test CRM — Google Apps Script (standalone)
 *
 * A fake CRM in Google Sheets for testing a Retell AI voice agent's
 * "existing tenant lookup" feature before wiring up a real client CRM.
 *
 * Setup:
 *   1. Open script.google.com > New project, paste this file in as Code.gs.
 *   2. Run setupTestCrm() once (Run > Run function > setupTestCrm) to create
 *      the spreadsheet and seed it with test records. Approve the
 *      authorization prompt when asked.
 *   3. Deploy as a web app (see README.md in this folder) and call it from
 *      Retell with ?phone=<number>.
 */

var CRM_SPREADSHEET_NAME = 'Simplifye Test CRM';
var CRM_SHEET_NAME = 'Tenants';
var CRM_SPREADSHEET_ID_PROPERTY = 'CRM_SPREADSHEET_ID';

/**
 * One-time setup: creates the spreadsheet, the Tenants tab, headers, and
 * seed data. Safe to re-run — it always creates a fresh spreadsheet.
 */
function setupTestCrm() {
  var spreadsheet = SpreadsheetApp.create(CRM_SPREADSHEET_NAME);
  PropertiesService.getScriptProperties().setProperty(
    CRM_SPREADSHEET_ID_PROPERTY,
    spreadsheet.getId()
  );

  var sheet = spreadsheet.getSheets()[0];
  sheet.setName(CRM_SHEET_NAME);

  var headers = ['Name', 'Phone Number', 'Property Address', 'Status', 'Notes'];
  var records = [
    ['Ryan Higgins', '07904455774', '20 Elm Street', 'Viewing Booked', 'Viewing scheduled for Thursday 2pm'],
    ['Sarah Wilson', '07700900123', '42 Bath Street', 'Existing Tenant', 'Tenancy renewal due next month'],
    ['David Clarke', '07700900456', '8 Byres Road', 'Application In Progress', 'Referencing checks ongoing']
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  sheet.getRange(2, 1, records.length, headers.length).setValues(records);
  sheet.autoResizeColumns(1, headers.length);

  Logger.log('Created "%s" at: %s', CRM_SPREADSHEET_NAME, spreadsheet.getUrl());
  return spreadsheet.getUrl();
}

/**
 * Looks up a tenant by phone number, tolerating UK caller-ID formats
 * (+44..., 0044..., spaces/dashes) against numbers stored as 0-prefixed
 * local numbers.
 *
 * @param {string} phoneNumber
 * @return {Object|null} matching row as {name, phoneNumber, propertyAddress, status, notes}, or null
 */
function lookupTenant(phoneNumber) {
  var target = normalizePhoneNumber_(phoneNumber);
  if (!target) {
    return null;
  }

  var sheet = getCrmSheet_();
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (normalizePhoneNumber_(row[1]) === target) {
      return {
        name: row[0],
        phoneNumber: row[1],
        propertyAddress: row[2],
        status: row[3],
        notes: row[4]
      };
    }
  }

  return null;
}

/**
 * Web app entry point. Call as:
 *   https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec?phone=07904455774
 */
function doGet(e) {
  var result;

  try {
    var phone = e && e.parameter && e.parameter.phone;
    if (!phone) {
      result = { error: 'Missing required "phone" query parameter.' };
    } else {
      result = lookupTenant(phone);
    }
  } catch (err) {
    result = { error: err.message };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Resolves the CRM spreadsheet, preferring the ID cached at setup time
 * (Script Properties survive between executions) and falling back to a
 * Drive lookup by name so lookupTenant/doGet still work if properties
 * were cleared.
 */
function getCrmSheet_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty(CRM_SPREADSHEET_ID_PROPERTY);
  var spreadsheet;

  if (id) {
    try {
      spreadsheet = SpreadsheetApp.openById(id);
    } catch (err) {
      spreadsheet = null;
    }
  }

  if (!spreadsheet) {
    var files = DriveApp.getFilesByName(CRM_SPREADSHEET_NAME);
    if (!files.hasNext()) {
      throw new Error(
        '"' + CRM_SPREADSHEET_NAME + '" not found. Run setupTestCrm() first.'
      );
    }
    spreadsheet = SpreadsheetApp.openById(files.next().getId());
    props.setProperty(CRM_SPREADSHEET_ID_PROPERTY, spreadsheet.getId());
  }

  var sheet = spreadsheet.getSheetByName(CRM_SHEET_NAME);
  if (!sheet) {
    throw new Error('Sheet tab "' + CRM_SHEET_NAME + '" not found.');
  }
  return sheet;
}

/**
 * Normalizes a UK phone number for comparison: strips whitespace,
 * dashes, brackets and dots, then folds +44 / 0044 / leading + into a
 * local 0-prefixed number, so "+447904455774" and "07904455774" compare
 * equal.
 */
function normalizePhoneNumber_(rawNumber) {
  if (rawNumber === null || rawNumber === undefined) {
    return '';
  }

  var value = String(rawNumber).trim().replace(/[\s\-().]/g, '');

  if (value.indexOf('+44') === 0) {
    value = '0' + value.slice(3);
  } else if (value.indexOf('0044') === 0) {
    value = '0' + value.slice(4);
  } else if (value.indexOf('+') === 0) {
    value = value.slice(1);
  }

  return value.replace(/\D/g, '');
}
