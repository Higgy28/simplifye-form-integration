/**
 * Simplifye Demo Enquiry -> Retell AI outbound call trigger.
 *
 * Bound to the Google Form "Simplifye Demo Enquiry"
 * (fields: Name, Phone Number, Property Address).
 *
 * Setup:
 *  1. Fill in the CONFIG values below (or, better, set them as Script
 *     Properties - see README section in the setup guide).
 *  2. In the Apps Script editor: Triggers (clock icon) > Add Trigger >
 *     choose function "onFormSubmit", event source "From form",
 *     event type "On form submit" > Save.
 */

// ---- CONFIG -----------------------------------------------------------
// Non-secret values can live here. The API key does NOT - it's read from
// PropertiesService (see getRetellApiKey_ below).
var RETELL_AGENT_ID = 'PASTE_YOUR_RETELL_AGENT_ID_HERE';
var RETELL_FROM_NUMBER = 'PASTE_YOUR_RETELL_FROM_NUMBER_HERE'; // E.164, e.g. +15551234567
var DEFAULT_COUNTRY_CODE = '+1'; // used when a submitted number has no country code

// Exact question titles as they appear on the Form.
var FIELD_NAME = 'Name';
var FIELD_PHONE = 'Phone Number';
var FIELD_PROPERTY = 'Property Address';
// -------------------------------------------------------------------------

/**
 * Reads the Retell API key from Script Properties.
 * Set it once via: Project Settings > Script Properties > add
 * key "RETELL_API_KEY" with your Retell API key as the value.
 */
function getRetellApiKey_() {
  var apiKey = PropertiesService.getScriptProperties().getProperty('RETELL_API_KEY');
  if (!apiKey) {
    throw new Error('RETELL_API_KEY is not set in Script Properties.');
  }
  return apiKey;
}

/**
 * Formats a phone number to E.164. Strips everything but digits and a
 * leading "+", and prepends DEFAULT_COUNTRY_CODE if no country code is
 * present. This is a best-effort formatter for common US-style input
 * (e.g. "(555) 123-4567" or "555-123-4567") - adjust if your leads use
 * other countries.
 */
function toE164_(rawNumber) {
  var digits = String(rawNumber || '').replace(/[^\d+]/g, '');

  if (digits.charAt(0) === '+') {
    return digits;
  }
  // 11 digits starting with 1 -> assume US/Canada with country code, missing "+".
  if (digits.length === 11 && digits.charAt(0) === '1') {
    return '+' + digits;
  }
  // 10 digits -> assume local number, prepend default country code.
  if (digits.length === 10) {
    return DEFAULT_COUNTRY_CODE + digits;
  }
  // Fallback: prepend default country code to whatever digits we have.
  return DEFAULT_COUNTRY_CODE + digits;
}

/**
 * Form submit trigger handler.
 */
function onFormSubmit(e) {
  try {
    var responses = e.response.getItemResponses();
    var values = {};
    responses.forEach(function (itemResponse) {
      values[itemResponse.getItem().getTitle()] = itemResponse.getResponse();
    });

    var name = values[FIELD_NAME] || '';
    var rawPhone = values[FIELD_PHONE] || '';
    var propertyAddress = values[FIELD_PROPERTY] || '';

    if (!rawPhone) {
      Logger.log('Retell call NOT triggered: no phone number in submission. Values: ' + JSON.stringify(values));
      return;
    }

    var toNumber = toE164_(rawPhone);

    var payload = {
      from_number: RETELL_FROM_NUMBER,
      to_number: toNumber,
      agent_id: RETELL_AGENT_ID,
      retell_llm_dynamic_variables: {
        name: name,
        property_address: propertyAddress
      }
    };

    var options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        Authorization: 'Bearer ' + getRetellApiKey_()
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch('https://api.retellai.com/v2/create-phone-call', options);
    var statusCode = response.getResponseCode();
    var responseBody = response.getContentText();

    if (statusCode >= 200 && statusCode < 300) {
      Logger.log(
        'Retell call triggered successfully for ' + name + ' (' + toNumber + '). ' +
        'Status: ' + statusCode + '. Response: ' + responseBody
      );
    } else {
      Logger.log(
        'Retell call FAILED for ' + name + ' (' + toNumber + '). ' +
        'Status: ' + statusCode + '. Response: ' + responseBody
      );
    }
  } catch (err) {
    Logger.log('Retell call FAILED due to an exception: ' + err.message);
  }
}
