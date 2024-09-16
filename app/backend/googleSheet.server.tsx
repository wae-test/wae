import {
  errResult,
  okResult,
  Result,
  unwrap,
} from "~/global--common-typescript/utilities/errorHandling";
import {
  getErrorFromUnknown,
  getStringFromUnknown,
} from "~/global--common-typescript/utilities/typeValidationUtils";
import {auth, sheets} from "@googleapis/sheets";
import {DateTime} from "luxon";

/**
 * Function to append an email, date, and time to the Google Sheet
 * @param {string} email - The email address to be written to the sheet
 * @returns {Promise<Result<boolean>>} - Result indicating success or failure
 */
export async function appendEmailToSheet(
  email: string,
): Promise<Result<boolean>> {
  try {
    console.log("Trying to append email to sheet");
    // const serviceEmail = unwrap(
    //   getStringFromUnknown(process.env.SERVICE_ACCOUNT_EMAIL),
    //   "380cd1bf-a20d-4a32-8083-477b143b6a51",
    // );
    const serviceCredentialsFileContent = unwrap(
      getStringFromUnknown(process.env.SERVICE_ACCOUNT_CREDENTIALS),
      "380cd1bf-a20d-4a32-8083-477b143b6a51",
    );
    const credentials = JSON.parse(serviceCredentialsFileContent);

    const sheetName = unwrap(
      getStringFromUnknown(process.env.NEWSLETTER_SHEET_NAME),
      "fdfab885-890e-41bc-8965-971c0e3333a7",
    );

    const workbookId = unwrap(
      getStringFromUnknown(process.env.WORKBOOK_ID),
      "0967e013-658f-432e-bbb1-e1fd5df388cd",
    );

    const authentication = new auth.GoogleAuth({
      credentials: credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheetsInstantiated = sheets({version: "v4", auth: authentication});

    const now = DateTime.now();
    const date = now.toISODate();
    const time = now.toISOTime();

    const values = [[email, time, date]];

    const response = await sheetsInstantiated.spreadsheets.values.append({
      spreadsheetId: workbookId,
      range: `${sheetName}!A:B`,
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });
    // console.log("Email, date, and time appended successfully:", response.data);
    return okResult(true);
  } catch (error_) {
    const error = getErrorFromUnknown(error_);

    console.error("🤡 ~ file: googleSheet.server.tsx:60 ~ error:", error);

    return errResult(error);
  }
}
