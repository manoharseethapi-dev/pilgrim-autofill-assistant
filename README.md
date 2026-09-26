# Pilgrim Form Autofill — V0.4.2

Chrome Manifest V3 extension prototype for **user-triggered autofill**.

## Current functionality

- Save multiple named profiles locally.
- Each profile contains:
  - General Details:
    - Email Address
    - City
    - State
    - Country
    - Pincode
  - Up to **6 pilgrims**
- Each pilgrim contains:
  - Name
  - Age
  - Gender:
    - Male
    - Female
    - Transgender
  - Photo ID Proof:
    - Aadhaar Card
    - Passport
  - ID Number
- Edit and delete profiles.
- Fill general fields and repeated pilgrim fields after the user explicitly clicks **Fill form**.
- Handles native HTML `<select>` controls and common Angular Material-style `role="combobox"` / `mat-select` controls.

## Intentionally excluded

This extension does **not**:
- detect or monitor ticket availability;
- auto-refresh;
- auto-submit;
- click booking/continue/payment controls;
- solve or bypass CAPTCHA;
- bypass queues;
- make repeated booking attempts;
- call undocumented/private booking APIs;
- collect TTD passwords, OTPs, payment credentials or CVV;
- use a backend to store pilgrim data.

## Local development

1. Extract the ZIP.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the extracted project directory.
6. Pin the extension.
7. Open the intended official booking form.
8. Create a profile and add up to six pilgrims.
9. Click **Fill form**.
10. Verify every populated field manually.

## Important

The website's frontend/DOM can change. The field matcher is deliberately generic and should be tested against the current form before a public release.

Before publishing a public extension, confirm that the current terms/rules of the site permit this type of third-party autofill assistance.

## Privacy

Profile information is stored locally using Chrome extension storage and is not sent to a project server.

## Disclaimer

This is an independent browser extension and is not affiliated with, endorsed by, or officially associated with TTD.
