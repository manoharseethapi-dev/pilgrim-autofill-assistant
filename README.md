# Pilgrim Form Autofill — V0.4.1

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

## V0.4.1

This build restores the generic pilgrim Name/Age/ID matching used in the
original working version, while isolating Gender and Photo ID Proof handling.
The custom dropdown is located by the visible `Gender` / `Photo ID Proof`
label and its nearby readonly/combobox input.

## V0.4.1 — multi-pilgrim slot mapping

This version resolves each pilgrim slot independently instead of relying on
one global array of matching Name/Age controls.

It prefers the known TTD indexed field names and falls back to the repeated
visible field labels. Each pilgrim is processed sequentially, with the ID
type selected before the ID number is filled.

## V0.4.1 — visual slot mapping

The multi-pilgrim mapper no longer relies on potentially unstable field-name
or generated-ID selectors for Name, Photo ID Proof, or Photo ID Number.

It maps repeated fields from their visible labels and screen position, using
the same occurrence index for each pilgrim. This prevents repeated controls
from collapsing onto Pilgrim 1.

## V0.4.1 — unique field mapping

Each repeated Name/Age/Gender/Photo ID/Photo ID Number field is now mapped to
a unique DOM control from its own visible label container. The same DOM input
cannot be assigned to two pilgrim slots. This specifically addresses the
second-pilgrim-overwrites-first behavior.

## V0.4.1 — restored proven Name detection

The Name field is restored to the metadata-based detection from V0.2.9,
which was the last version where Name filling was confirmed to work.

The detection collects visible `input/textarea` elements whose ID/name/
placeholder/aria/form-control or nearby field text contains the Name pattern.
The resulting DOM elements are de-duplicated and sorted by screen position,
so Pilgrim 1 and Pilgrim 2 receive different actual inputs.

Age, Gender, Photo ID Proof and Photo ID Number remain on the V0.4.1 baseline.

## V0.4.2 — Name label matching broadened, sturdier value assignment, field validation

Name detection no longer requires the visible label to be the exact word
"Name". It now also matches labels that contain "name" as one of their
words (e.g. "Pilgrim Name", "Full Name", "Devotee Name", "Name (as per ID
Proof)"), using the same generic label-to-nearest-control resolution that
already works reliably for Age, Gender, and Photo ID Proof. This was the
most likely reason Name was silently left blank while the other fields
filled correctly: the fname-attribute guess and the exact "Name" label
match do not apply to every site's markup.

The value-assignment step also now retries up to three times over 40ms/
150ms/400ms (instead of a single 40ms check) and dispatches a real
InputEvent with `data`/`inputType` set, since some controlled-input
frameworks discard a bare `Event`.

If Name is still not filled after this update, open the browser DevTools
Console before clicking "Fill form" — the extension now logs a clear
`[Pilgrim Autofill]` warning identifying whether no Name field could be
found at all, or whether a field was found but the site rejected the
value.

The popup's own profile editor now validates as you type:
- **Age**: digits only, capped at 3 characters.
- **ID Number**: when Photo ID Proof is set to "Aadhaar Card", digits
  only, capped at 12 characters. Switching Photo ID Proof to "Aadhaar
  Card" re-checks whatever is already in ID Number. Saving a profile also
  re-validates both fields (Age must be 1–3 digits; an Aadhaar ID Number
  must be exactly 12 digits) as a safety net.

The visible version label in the popup header, and the matching console
log tag, were also brought in line with the actual extension version
(both had been left at V0.4.1).

## V0.4.1 — Name-only hybrid resolver

This build is based on V0.3.8, the latest build that successfully populated
Pilgrim 1 Name while the other pilgrim fields were functioning.

Name resolution now combines:
1. visible `input[name="fname"]` elements in DOM order;
2. exact visible `Name` labels mapped to unique nearby controls;
3. the previous metadata-based Name detection.

The candidates are de-duplicated and sorted by screen position, so the second
pilgrim cannot reuse the first pilgrim's Name element.

Age, Gender, Photo ID Proof, and Photo ID Number are preserved from V0.3.8.
