const GENDERS = ["Male", "Female", "Transgender"];
const ID_PROOFS = ["Aadhaar Card", "Passport"];
const MAX_PILGRIMS = 6;

const els = {
  profileSelect: document.getElementById("profileSelect"),
  newProfileBtn: document.getElementById("newProfileBtn"),
  editProfileBtn: document.getElementById("editProfileBtn"),
  deleteProfileBtn: document.getElementById("deleteProfileBtn"),
  profileBar: document.getElementById("profileBar"),
  editorSection: document.getElementById("editorSection"),
  editorTitle: document.getElementById("editorTitle"),
  countBadge: document.getElementById("countBadge"),
  profileName: document.getElementById("profileName"),
  email: document.getElementById("email"),
  city: document.getElementById("city"),
  state: document.getElementById("state"),
  country: document.getElementById("country"),
  pincode: document.getElementById("pincode"),
  pilgrimsContainer: document.getElementById("pilgrimsContainer"),
  addPilgrimBtn: document.getElementById("addPilgrimBtn"),
  cancelBtn: document.getElementById("cancelBtn"),
  saveBtn: document.getElementById("saveBtn"),
  emptySection: document.getElementById("emptySection"),
  startBtn: document.getElementById("startBtn"),
  useSection: document.getElementById("useSection"),
  fillBtn: document.getElementById("fillBtn"),
  status: document.getElementById("status")
};

let profiles = [];
let editingProfileId = null;
let editingPilgrims = [];

function setStatus(message) {
  els.status.textContent = message || "";
}

function uid() {
  return crypto.randomUUID();
}

function blankPilgrim() {
  return {
    id: uid(),
    name: "",
    age: "",
    gender: "Male",
    idType: "Aadhaar Card",
    idNumber: ""
  };
}

function blankProfile() {
  return {
    id: uid(),
    profileName: "",
    general: {
      email: "",
      city: "",
      state: "",
      country: "India",
      pincode: ""
    },
    pilgrims: [blankPilgrim()]
  };
}

async function loadProfiles() {
  const result = await chrome.storage.local.get({ profiles: [] });
  profiles = Array.isArray(result.profiles)
    ? result.profiles.map(normalizeProfile)
    : [];

  renderProfileList();
}

function normalizeProfile(profile) {
  const normalized = {
    id: profile?.id || uid(),
    profileName: profile?.profileName || profile?.name || "Unnamed Profile",
    general: {
      email: profile?.general?.email || profile?.email || "",
      city: profile?.general?.city || profile?.city || "",
      state: profile?.general?.state || profile?.state || "",
      country: profile?.general?.country || profile?.country || "India",
      pincode: profile?.general?.pincode || profile?.pincode || ""
    },
    pilgrims: Array.isArray(profile?.pilgrims)
      ? profile.pilgrims.slice(0, MAX_PILGRIMS).map(p => ({
          id: p?.id || uid(),
          name: p?.name || "",
          age: p?.age ?? "",
          gender: GENDERS.includes(p?.gender) ? p.gender : "Male",
          idType: ID_PROOFS.includes(p?.idType) ? p.idType : "Aadhaar Card",
          idNumber: p?.idNumber || ""
        }))
      : []
  };

  if (!normalized.pilgrims.length) {
    normalized.pilgrims.push(blankPilgrim());
  }

  return normalized;
}

function renderProfileList() {
  els.profileSelect.innerHTML = "";

  if (!profiles.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No profiles saved";
    els.profileSelect.appendChild(option);

    els.profileBar.hidden = true;
    els.emptySection.hidden = false;
    els.useSection.hidden = true;
    return;
  }

  profiles.forEach(profile => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = profile.profileName || "Unnamed Profile";
    els.profileSelect.appendChild(option);
  });

  els.profileBar.hidden = false;
  els.emptySection.hidden = true;
  els.useSection.hidden = false;
  els.profileSelect.value = profiles[0].id;
}

function selectedProfile() {
  return profiles.find(p => p.id === els.profileSelect.value) || null;
}

function showNewProfile() {
  const profile = blankProfile();
  editingProfileId = null;
  editingPilgrims = structuredClone(profile.pilgrims);

  els.editorTitle.textContent = "Create profile";
  els.profileName.value = "";
  els.email.value = "";
  els.city.value = "";
  els.state.value = "";
  els.country.value = "India";
  els.pincode.value = "";

  renderPilgrims();

  els.editorSection.hidden = false;
  els.profileBar.hidden = true;
  els.emptySection.hidden = true;
  els.useSection.hidden = true;
  setStatus("");
}

function showEditProfile() {
  const profile = selectedProfile();
  if (!profile) return;

  editingProfileId = profile.id;
  editingPilgrims = structuredClone(profile.pilgrims);

  els.editorTitle.textContent = "Edit profile";
  els.profileName.value = profile.profileName;
  els.email.value = profile.general.email;
  els.city.value = profile.general.city;
  els.state.value = profile.general.state;
  els.country.value = profile.general.country;
  els.pincode.value = profile.general.pincode;

  renderPilgrims();

  els.editorSection.hidden = false;
  els.profileBar.hidden = true;
  els.emptySection.hidden = true;
  els.useSection.hidden = true;
  setStatus("");
}

function closeEditor() {
  els.editorSection.hidden = true;
  renderProfileList();
  setStatus("");
}

function renderPilgrims() {
  els.pilgrimsContainer.innerHTML = "";

  editingPilgrims.forEach((pilgrim, index) => {
    const card = document.createElement("div");
    card.className = "pilgrim-card";

    card.innerHTML = `
      <div class="pilgrim-card-header">
        <span class="pilgrim-title">Pilgrim ${index + 1}</span>
        ${editingPilgrims.length > 1
          ? `<button class="remove-btn" data-remove="${index}" type="button">Remove</button>`
          : ""}
      </div>

      <label>Name</label>
      <input data-key="name" data-index="${index}" value="${escapeHtml(pilgrim.name)}">

      <div class="grid2">
        <div>
          <label>Age</label>
          <input data-key="age" data-index="${index}" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="3" value="${escapeHtml(String(pilgrim.age))}">
        </div>

        <div>
          <label>Gender</label>
          <select data-key="gender" data-index="${index}">
            ${GENDERS.map(v => `<option ${v === pilgrim.gender ? "selected" : ""}>${v}</option>`).join("")}
          </select>
        </div>

        <div>
          <label>Photo ID Proof</label>
          <select data-key="idType" data-index="${index}">
            ${ID_PROOFS.map(v => `<option ${v === pilgrim.idType ? "selected" : ""}>${v}</option>`).join("")}
          </select>
        </div>

        <div>
          <label>ID Number</label>
          <input data-key="idNumber" data-index="${index}" value="${escapeHtml(pilgrim.idNumber)}" autocomplete="off" ${pilgrim.idType === "Aadhaar Card" ? 'inputmode="numeric" pattern="[0-9]*" maxlength="12"' : ""}>
        </div>
      </div>
    `;

    els.pilgrimsContainer.appendChild(card);
  });

  els.countBadge.textContent = `${editingPilgrims.length} / ${MAX_PILGRIMS} pilgrims`;
  els.addPilgrimBtn.disabled = editingPilgrims.length >= MAX_PILGRIMS;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

els.pilgrimsContainer.addEventListener("input", (event) => {
  const target = event.target;
  const key = target.dataset.key;
  const index = Number(target.dataset.index);
  if (!key || !editingPilgrims[index]) return;

  let value = target.value;

  if (key === "age") {
    value = value.replace(/\D/g, "").slice(0, 3);
  } else if (
    key === "idNumber" &&
    editingPilgrims[index].idType === "Aadhaar Card"
  ) {
    value = value.replace(/\D/g, "").slice(0, 12);
  }

  if (value !== target.value) {
    target.value = value;
  }

  editingPilgrims[index][key] = value;
});

els.pilgrimsContainer.addEventListener("change", (event) => {
  const target = event.target;
  const key = target.dataset.key;
  const index = Number(target.dataset.index);
  if (!key || !editingPilgrims[index]) return;

  editingPilgrims[index][key] = target.value;

  if (key === "idType") {
    if (target.value === "Aadhaar Card") {
      editingPilgrims[index].idNumber = String(
        editingPilgrims[index].idNumber || ""
      )
        .replace(/\D/g, "")
        .slice(0, 12);
    }

    // Re-render so the ID Number field's maxlength/pattern (which depend
    // on the selected Photo ID Proof) and its sanitized value are refreshed.
    renderPilgrims();
  }
});

els.pilgrimsContainer.addEventListener("click", (event) => {
  const removeIndex = event.target.dataset.remove;
  if (removeIndex === undefined) return;

  editingPilgrims.splice(Number(removeIndex), 1);

  if (!editingPilgrims.length) {
    editingPilgrims.push(blankPilgrim());
  }

  renderPilgrims();
});

els.addPilgrimBtn.addEventListener("click", () => {
  if (editingPilgrims.length >= MAX_PILGRIMS) return;
  editingPilgrims.push(blankPilgrim());
  renderPilgrims();
});

els.newProfileBtn.addEventListener("click", showNewProfile);
els.startBtn.addEventListener("click", showNewProfile);
els.editProfileBtn.addEventListener("click", showEditProfile);

els.cancelBtn.addEventListener("click", closeEditor);

els.profileSelect.addEventListener("change", () => {
  setStatus("");
});

els.deleteProfileBtn.addEventListener("click", async () => {
  const profile = selectedProfile();
  if (!profile) return;

  const ok = confirm(`Delete profile "${profile.profileName}"?`);
  if (!ok) return;

  profiles = profiles.filter(p => p.id !== profile.id);
  await chrome.storage.local.set({ profiles });

  if (!profiles.length) {
    renderProfileList();
    return;
  }

  renderProfileList();
  setStatus("Profile deleted.");
});

els.saveBtn.addEventListener("click", async () => {
  const profileName = els.profileName.value.trim();

  if (!profileName) {
    setStatus("Enter a profile name.");
    return;
  }

  if (!editingPilgrims.length || editingPilgrims.length > MAX_PILGRIMS) {
    setStatus("A profile must contain 1 to 6 pilgrims.");
    return;
  }

  const cleanedPilgrims = editingPilgrims.map((p, index) => ({
    id: p.id || uid(),
    name: String(p.name || "").trim(),
    age: String(p.age || "").trim(),
    gender: GENDERS.includes(p.gender) ? p.gender : "Male",
    idType: ID_PROOFS.includes(p.idType) ? p.idType : "Aadhaar Card",
    idNumber: String(p.idNumber || "").trim()
  }));

  const invalid = cleanedPilgrims.find(p => !p.name || p.age === "");
  if (invalid) {
    setStatus("Please enter name and age for every pilgrim.");
    return;
  }

  const badAge = cleanedPilgrims.find(p => !/^\d{1,3}$/.test(p.age));
  if (badAge) {
    setStatus("Age must be numbers only, up to 3 digits.");
    return;
  }

  const badAadhaar = cleanedPilgrims.find(
    p => p.idType === "Aadhaar Card" && !/^\d{12}$/.test(p.idNumber)
  );
  if (badAadhaar) {
    setStatus("Aadhaar ID Number must be exactly 12 digits.");
    return;
  }

  const profile = {
    id: editingProfileId || uid(),
    profileName,
    general: {
      email: els.email.value.trim(),
      city: els.city.value.trim(),
      state: els.state.value.trim(),
      country: els.country.value.trim(),
      pincode: els.pincode.value.trim()
    },
    pilgrims: cleanedPilgrims
  };

  const existingIndex = profiles.findIndex(p => p.id === profile.id);

  if (existingIndex >= 0) {
    profiles[existingIndex] = profile;
  } else {
    profiles.push(profile);
  }

  await chrome.storage.local.set({ profiles });

  closeEditor();
  renderProfileList();
  els.profileSelect.value = profile.id;
  setStatus("Profile saved locally.");
});

els.fillBtn.addEventListener("click", async () => {
  const profile = selectedProfile();

  if (!profile) {
    setStatus("Select a profile first.");
    return;
  }

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    if (!tab?.id) {
      setStatus("No active tab found.");
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: fillPage,
      args: [profile]
    });

    setStatus("Autofill attempted. Verify every value manually.");
  } catch (error) {
    console.error(error);
    setStatus("Could not access this page. Open the booking form and try again.");
  }
});

/*
 * Runs only after the user clicks "Fill form".
 * It fills general details and up to six pilgrim groups.
 * It intentionally does not submit, book, refresh, solve CAPTCHA, or bypass queues.
 */
async function fillPage(profile) {
  /*
   * V0.3.3
   *
   * Multi-pilgrim mapping:
   *  - Collect each repeated field from its own visible label.
   *  - Resolve the control inside the label's nearest field container.
   *  - Never reuse the same DOM element for two pilgrim slots.
   *  - Sort repeated fields by screen position.
   *
   * This directly addresses the observed bug where Pilgrim 2 values
   * were being written back into Pilgrim 1 controls.
   */

  const MAX_PILGRIMS = 6;

  const normalize = value =>
    String(value || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[^a-z0-9 ]/g, "")
      .trim();

  const sleep = ms =>
    new Promise(resolve => setTimeout(resolve, ms));

  const isVisible = element => {
    if (!element) return false;

    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    return (
      element.getClientRects().length > 0 &&
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      rect.width > 0 &&
      rect.height > 0
    );
  };

  const rectCenter = element => {
    const rect = element.getBoundingClientRect();

    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  };

  const distance = (a, b) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return Math.sqrt(dx * dx + dy * dy);
  };

  function setInputValue(element, value) {
    if (!element || value === undefined || value === null) {
      return false;
    }

    if (
      !(element instanceof HTMLInputElement) &&
      !(element instanceof HTMLTextAreaElement)
    ) {
      return false;
    }

    const stringValue = String(value);

    /*
     * Use the native setter first, then direct assignment as a fallback.
     * Both input/change/blur events are dispatched so the site's form
     * state can react to the change.
     */
    const prototype =
      element instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;

    const setter = Object.getOwnPropertyDescriptor(
      prototype,
      "value"
    )?.set;

    if (setter) {
      setter.call(element, stringValue);
    } else {
      element.value = stringValue;
    }

    if (element.value !== stringValue) {
      element.value = stringValue;
    }

    element.dispatchEvent(
      new Event("input", {
        bubbles: true,
        cancelable: true
      })
    );

    element.dispatchEvent(
      new Event("change", {
        bubbles: true,
        cancelable: true
      })
    );

    element.dispatchEvent(
      new Event("blur", {
        bubbles: true,
        cancelable: true
      })
    );

    return element.value === stringValue;
  }

  // ============================================================
  // GENERAL DETAILS
  // ============================================================
  const generalFields = [
    ...document.querySelectorAll("input, textarea")
  ].filter(isVisible);

  function generalMetadata(element) {
    const data = [
      element.id,
      element.getAttribute("name"),
      element.getAttribute("placeholder"),
      element.getAttribute("aria-label"),
      element.getAttribute("formcontrolname")
    ];

    if (element.id) {
      try {
        const label = document.querySelector(
          `label[for="${CSS.escape(element.id)}"]`
        );

        if (label) {
          data.push(label.textContent || "");
        }
      } catch (_) {}
    }

    return normalize(data.join(" "));
  }

  function findGeneralField(patterns) {
    return generalFields.find(field => {
      const meta = generalMetadata(field);

      return patterns.some(pattern =>
        meta.includes(normalize(pattern))
      );
    });
  }

  let regularFilled = 0;
  let dropdownFilled = 0;

  const general = profile?.general || {};

  const generalMappings = [
    [["email", "emailaddress"], general.email],
    [["city", "town"], general.city],
    [["state", "province"], general.state],
    [["country"], general.country],
    [["pincode", "postalcode", "zipcode", "postcode"], general.pincode]
  ];

  for (const [patterns, value] of generalMappings) {
    if (!value) continue;

    const field = findGeneralField(patterns);

    if (field && setInputValue(field, value)) {
      regularFilled++;
    }
  }

  // ============================================================
  // LABEL → FIELD RESOLUTION
  // ============================================================
  function exactLabelElements(labelText) {
    const wanted = normalize(labelText);

    /*
     * Prefer actual label-like nodes. We include div/span because some
     * versions of the TTD form render the floating labels using those.
     */
    const nodes = [
      ...document.querySelectorAll(
        "label, mat-label, .mat-mdc-floating-label, " +
        ".mat-form-field-label, span, div"
      )
    ].filter(element => {
      if (!isVisible(element)) return false;

      const rect = element.getBoundingClientRect();

      // Prevent a full section/container from being considered a label.
      if (rect.width > 500 || rect.height > 100) return false;

      if (normalize(element.textContent) !== wanted) {
        return false;
      }

      /*
       * If a child already contains the same exact text, prefer the
       * smallest/innermost node instead of its parent wrapper.
       */
      const sameTextChild = [
        ...element.children
      ].some(child => normalize(child.textContent) === wanted);

      return !sameTextChild;
    });

    /*
     * De-duplicate nodes that occupy essentially the same screen location.
     * This is important because the same visual label can be represented by
     * multiple nested Angular/React elements.
     */
    const unique = [];

    for (const node of nodes) {
      const center = rectCenter(node);

      const duplicate = unique.some(existing => {
        const existingCenter = rectCenter(existing);

        return (
          Math.abs(center.x - existingCenter.x) < 3 &&
          Math.abs(center.y - existingCenter.y) < 3
        );
      });

      if (!duplicate) {
        unique.push(node);
      }
    }

    return unique.sort((a, b) => {
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();

      if (Math.abs(ar.top - br.top) > 8) {
        return ar.top - br.top;
      }

      return ar.left - br.left;
    });
  }

  /*
   * Looser variant of exactLabelElements: matches any short visible label
   * that contains WORD as one of its words, rather than requiring the whole
   * label text to equal it exactly.
   *
   * This exists because real-world forms rarely label the pilgrim name
   * field with the bare word "Name" — it's commonly "Pilgrim Name",
   * "Full Name", "Devotee Name", "Name (as per ID Proof)", etc. The exact
   * match used for Age/Gender/Photo ID happens to equal the real labels on
   * this site, but Name should not assume that.
   */
  function wordMatchLabelElements(word) {
    const wanted = normalize(word);

    const nodes = [
      ...document.querySelectorAll(
        "label, mat-label, .mat-mdc-floating-label, " +
        ".mat-form-field-label, span, div"
      )
    ].filter(element => {
      if (!isVisible(element)) return false;

      const rect = element.getBoundingClientRect();
      if (rect.width > 500 || rect.height > 100) return false;

      const text = normalize(element.textContent);
      if (!text) return false;

      const words = text.split(" ");
      if (!words.includes(wanted)) return false;

      const sameTextChild = [...element.children].some(child => {
        const childText = normalize(child.textContent);
        return childText.split(" ").includes(wanted);
      });

      return !sameTextChild;
    });

    const unique = [];

    for (const node of nodes) {
      const center = rectCenter(node);

      const duplicate = unique.some(existing => {
        const existingCenter = rectCenter(existing);
        return (
          Math.abs(center.x - existingCenter.x) < 3 &&
          Math.abs(center.y - existingCenter.y) < 3
        );
      });

      if (!duplicate) {
        unique.push(node);
      }
    }

    return unique;
  }

  function controlsInside(container) {
    if (!container) return [];

    return [
      ...container.querySelectorAll(
        "input, textarea, select, " +
        "[role='combobox'], [aria-haspopup='listbox']"
      )
    ].filter(isVisible);
  }

  /*
   * Resolve a field from its OWN label container, not from all page controls.
   *
   * We walk from the label upward. As soon as a container contains a single
   * unused visible form control, that control belongs to this field.
   *
   * This prevents the P2 label from selecting P1's input.
   */
  function resolveControlForLabel(label, usedControls) {
    if (!label) return null;

    const labelRect = label.getBoundingClientRect();

    let current = label;

    for (
      let depth = 0;
      current && depth < 8;
      depth++,
      current = current.parentElement
    ) {
      const controls = controlsInside(current).filter(
        control => !usedControls.has(control)
      );

      if (!controls.length) {
        continue;
      }

      if (controls.length === 1) {
        return controls[0];
      }

      /*
       * More than one control exists in this ancestor. Choose the one
       * geometrically closest to this exact label.
       */
      const labelCenter = rectCenter(label);

      const ranked = controls
        .map(control => {
          const controlRect = control.getBoundingClientRect();
          const controlCenter = rectCenter(control);

          const verticalPenalty =
            controlRect.top < labelRect.top
              ? 100
              : 0;

          return {
            control,
            score:
              distance(labelCenter, controlCenter) +
              verticalPenalty
          };
        })
        .sort((a, b) => a.score - b.score);

      /*
       * Only use this ranked candidate if it is reasonably close.
       */
      if (ranked[0] && ranked[0].score < 250) {
        return ranked[0].control;
      }
    }

    /*
     * Final fallback: nearest unused visible control.
     * This is deliberately evaluated only after the label-container
     * resolution has failed.
     */
    const allControls = [
      ...document.querySelectorAll(
        "input, textarea, select, " +
        "[role='combobox'], [aria-haspopup='listbox']"
      )
    ].filter(
      control => isVisible(control) && !usedControls.has(control)
    );

    const labelCenter = rectCenter(label);

    return allControls
      .map(control => ({
        control,
        score: distance(
          labelCenter,
          rectCenter(control)
        )
      }))
      .sort((a, b) => a.score - b.score)[0]?.control || null;
  }

  /*
   * Map all repeated fields of one type to UNIQUE DOM elements.
   */
  function buildFieldMap(labelText) {
    const labels = exactLabelElements(labelText);
    const usedControls = new Set();
    const result = [];

    for (const label of labels) {
      const control = resolveControlForLabel(
        label,
        usedControls
      );

      if (!control) {
        result.push(null);
        continue;
      }

      usedControls.add(control);

      result.push({
        label,
        control
      });
    }

    return result;
  }

  // Build once. Each array index is now a specific DOM field.
  /*
   * NAME — restored from the last build where Name was confirmed to work
   * (V0.2.9).
   *
   * V0.2.9 did not assume a specific `fname` attribute; it found the actual
   * Name inputs from their metadata. We keep that successful detection
   * strategy, but add a Set so one DOM element cannot be reused by P2.
   */
  function buildWorkingNameMap() {
    const wanted = [
      "pilgrimname",
      "devoteename",
      "passengername",
      "travellername",
      "travelername",
      "fullname",
      "name"
    ].map(normalize);

    const candidates = [
      ...document.querySelectorAll("input, textarea")
    ].filter(isVisible).filter(element => {
      const values = [
        element.id,
        element.getAttribute("name"),
        element.getAttribute("placeholder"),
        element.getAttribute("aria-label"),
        element.getAttribute("formcontrolname")
      ].map(normalize);

      let parentText = "";
      const parent = element.closest(
        "mat-form-field, .mat-mdc-form-field, .mat-form-field, " +
        ".form-group, .form-field"
      );

      if (parent) {
        parentText = normalize(parent.textContent || "");
      }

      return wanted.some(pattern =>
        values.some(value => value.includes(pattern)) ||
        parentText.includes(pattern)
      );
    });

    /*
     * Deduplicate by the actual DOM node, then keep the screen/DOM order.
     * The same Name input can therefore not be assigned twice.
     */
    return [...new Set(candidates)].sort((a, b) => {
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();

      if (Math.abs(ar.top - br.top) > 5) {
        return ar.top - br.top;
      }

      return ar.left - br.left;
    }).map(control => ({
      label: null,
      control
    }));
  }

  /*
   * V0.4.1 — Name resolver only.
   *
   * V0.3.8 proved that the existing metadata-based strategy can find at
   * least Pilgrim 1 Name. The problem is that it doesn't reliably discover
   * every repeated Name input.
   *
   * We now combine three independent sources:
   *
   *   A. all inputs with name="fname" (preferred; based on the public TTD
   *      reference implementation)
   *   B. exact visible "Name" label -> nearest editable input
   *   C. existing V0.3.8 metadata matcher
   *
   * The candidate DOM nodes are de-duplicated, and each node can only be
   * assigned to one pilgrim slot.
   */
  function buildNameMapV041() {
    const used = new Set();
    const result = [];

    const allInputs = [
      ...document.querySelectorAll("input, textarea")
    ].filter(isVisible);

    const fnameInputs = [
      ...document.querySelectorAll('input[name="fname"]')
    ];

    // Include fname inputs even when the page reports them differently
    // through style/visibility while scrolling.
    const fnameVisibleOrRendered = fnameInputs.filter(input => {
      const rect = input.getBoundingClientRect();
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        getComputedStyle(input).display !== "none" &&
        getComputedStyle(input).visibility !== "hidden"
      );
    });

    function editableTextInput(input) {
      if (!input) return false;
      if (!allInputs.includes(input) && !fnameVisibleOrRendered.includes(input)) {
        return false;
      }
      if (!isVisible(input)) return false;
      if (input instanceof HTMLTextAreaElement) return true;
      if (!(input instanceof HTMLInputElement)) return false;

      const type = String(
        input.getAttribute("type") || "text"
      ).toLowerCase();

      return (
        type === "text" ||
        type === "" ||
        type === "search"
      ) && !input.readOnly;
    }

    function add(control) {
      if (!control || used.has(control)) return false;
      if (!isVisible(control)) return false;

      used.add(control);

      result.push({
        label: null,
        control
      });

      return true;
    }

    /*
     * Pass A: direct TTD fname collection.
     *
     * Do NOT use querySelector() with a single ID because a repeated
     * component can expose duplicate/generated IDs.
     *
     * Preserve DOM order.
     */
    for (const input of fnameVisibleOrRendered) {
      if (editableTextInput(input)) {
        add(input);
      }
    }

    /*
     * Pass B: if fewer than six fname controls were discoverable, use the
     * visible Name-ish labels as slot anchors.
     *
     * Combines an exact "Name" match with a looser match for labels that
     * contain "name" as one of their words (Pilgrim Name, Full Name,
     * Devotee Name, Name (as per ID Proof), ...), since real forms rarely
     * use the bare word "Name" by itself.
     */
    if (result.length < MAX_PILGRIMS) {
      const candidateLabels = [
        ...exactLabelElements("Name"),
        ...wordMatchLabelElements("name")
      ];

      const seenSpots = new Set();
      const labels = [];

      for (const label of candidateLabels) {
        const rect = label.getBoundingClientRect();
        const key = `${Math.round(rect.top)}:${Math.round(rect.left)}`;

        if (seenSpots.has(key)) continue;
        seenSpots.add(key);
        labels.push(label);
      }

      labels.sort((a, b) => {
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();

        if (Math.abs(ar.top - br.top) > 8) {
          return ar.top - br.top;
        }

        return ar.left - br.left;
      });

      for (const label of labels) {
        if (result.length >= MAX_PILGRIMS) break;

        const control = resolveControlForLabel(
          label,
          used
        );

        if (
          control &&
          editableTextInput(control)
        ) {
          add(control);
        }
      }
    }

    /*
     * Pass C: restore the successful V0.3.8 metadata matcher as a final
     * source. This is deliberately additive; it can only add a new DOM
     * element and can never replace an already resolved slot.
     */
    if (result.length < MAX_PILGRIMS) {
      const wanted = [
        "pilgrimname",
        "devoteename",
        "passengername",
        "travellername",
        "travelername",
        "fullname",
        "name"
      ].map(normalize);

      const metadataCandidates = allInputs.filter(input => {
        if (!editableTextInput(input)) return false;

        const values = [
          input.id,
          input.getAttribute("name"),
          input.getAttribute("placeholder"),
          input.getAttribute("aria-label"),
          input.getAttribute("formcontrolname")
        ].map(normalize);

        let parentText = "";
        const parent = input.closest(
          "mat-form-field, .mat-mdc-form-field, .mat-form-field, " +
          ".form-group, .form-field"
        );

        if (parent) {
          parentText = normalize(parent.textContent || "");
        }

        return wanted.some(pattern =>
          values.some(value => value.includes(pattern)) ||
          parentText.includes(pattern)
        );
      });

      metadataCandidates.sort((a, b) => {
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();

        if (Math.abs(ar.top - br.top) > 5) {
          return ar.top - br.top;
        }

        return ar.left - br.left;
      });

      for (const input of metadataCandidates) {
        if (result.length >= MAX_PILGRIMS) break;
        add(input);
      }
    }

    /*
     * Re-order final candidates by screen position so the mapping always
     * follows P1 -> P2 -> P3... in the same order as the form.
     */
    return result
      .sort((a, b) => {
        const ar = a.control.getBoundingClientRect();
        const br = b.control.getBoundingClientRect();

        if (Math.abs(ar.top - br.top) > 8) {
          return ar.top - br.top;
        }

        return ar.left - br.left;
      });
  }

  const nameMap = buildNameMapV041();
  const ageMap = buildFieldMap("Age");
  const genderMap = buildFieldMap("Gender");
  const photoIdMap = buildFieldMap("Photo ID Proof");
  const idNumberMap = buildFieldMap("Photo ID Number");

  console.info(
    "[Pilgrim Autofill V0.4.2] resolved Name controls",
    nameMap.map((item, index) => ({
      slot: index + 1,
      id: item?.control?.id || "",
      name: item?.control?.getAttribute("name") || "",
      type: item?.control?.getAttribute("type") || "",
      value: item?.control?.value || ""
    }))
  );

  console.info("[Pilgrim Autofill] unique slot maps", {
    name: nameMap.length,
    age: ageMap.length,
    gender: genderMap.length,
    photoIdProof: photoIdMap.length,
    photoIdNumber: idNumberMap.length
  });

  if (!nameMap.length) {
    console.warn(
      "[Pilgrim Autofill] No Name input could be resolved on this page. " +
      "Right-click the Name field on the real form, choose Inspect, and " +
      "share the outer HTML of that <input> plus its label so detection " +
      "can be corrected."
    );
  } else {
    const pilgrimCount = Array.isArray(profile?.pilgrims)
      ? profile.pilgrims.length
      : 0;

    if (nameMap.length < pilgrimCount) {
      console.warn(
        `[Pilgrim Autofill] Found only ${nameMap.length} Name input(s) but ` +
        `${pilgrimCount} pilgrim(s) are set. Later pilgrims will not get ` +
        "a Name filled in."
      );
    }
  }

  // ============================================================
  // CUSTOM DROPDOWN
  // ============================================================
  function dropdownOptions() {
    const selectors = [
      "li.floatingDropdown_listItem__tU_5x",
      "li[class*='floatingDropdown_listItem']",
      "[role='option']"
    ];

    const result = [];
    const seen = new Set();

    for (const selector of selectors) {
      for (const item of document.querySelectorAll(selector)) {
        if (seen.has(item)) continue;
        seen.add(item);

        if (isVisible(item)) {
          result.push(item);
        }
      }
    }

    return result;
  }

  async function selectDropdown(control, value) {
    if (!control || !value) {
      return false;
    }

    control.scrollIntoView({
      behavior: "instant",
      block: "center",
      inline: "center"
    });

    await sleep(40);

    control.focus?.();
    control.click();

    await sleep(70);

    let options = dropdownOptions();

    if (!options.length) {
      await sleep(120);
      options = dropdownOptions();
    }

    const wanted = normalize(value);

    const option =
      options.find(
        item => normalize(item.textContent) === wanted
      ) ||
      options.find(
        item => normalize(item.textContent).includes(wanted)
      );

    if (!option) {
      return false;
    }

    option.click();

    await sleep(100);

    const actual =
      control instanceof HTMLInputElement
        ? control.value
        : control.textContent ||
          control.getAttribute("value") ||
          "";

    return normalize(actual) === wanted;
  }

  // ============================================================
  // PROCESS EACH PILGRIM — SAME INDEX ACROSS UNIQUE FIELD MAPS
  // ============================================================
  const pilgrims = Array.isArray(profile?.pilgrims)
    ? profile.pilgrims.slice(0, MAX_PILGRIMS)
    : [];

  for (let index = 0; index < pilgrims.length; index++) {
    const pilgrim = pilgrims[index];

    if (!pilgrim) continue;

    console.groupCollapsed(
      `[Pilgrim Autofill] Pilgrim ${index + 1}`
    );

    const nameControl =
      nameMap[index]?.control || null;

    const ageControl =
      ageMap[index]?.control || null;

    const genderControl =
      genderMap[index]?.control || null;

    const photoIdControl =
      photoIdMap[index]?.control || null;

    const idNumberControl =
      idNumberMap[index]?.control || null;

    console.debug("Mapped controls", {
      name: nameControl,
      age: ageControl,
      gender: genderControl,
      photoId: photoIdControl,
      idNumber: idNumberControl
    });

    // Name — resilient field setter with multiple verified attempts.
    if (
      nameControl &&
      pilgrim.name
    ) {
      await sleep(20);

      const desiredName =
        String(pilgrim.name);

      if (nameControl.disabled) {
        nameControl.removeAttribute("disabled");
      }

      nameControl.focus?.();

      const setter =
        Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value"
        )?.set;

      function assignName() {
        if (setter) {
          setter.call(nameControl, "");
          setter.call(nameControl, desiredName);
        } else {
          nameControl.value = desiredName;
        }

        /*
         * Prefer a real InputEvent with `data`/`inputType` set, since some
         * frameworks (notably React's controlled-input handling in some
         * versions) only fully process an "input" event that looks like a
         * genuine keystroke rather than a bare Event. Fall back to a plain
         * Event if InputEvent construction isn't supported.
         */
        let inputEvent;
        try {
          inputEvent = new InputEvent("input", {
            bubbles: true,
            cancelable: true,
            data: desiredName,
            inputType: "insertText"
          });
        } catch (_) {
          inputEvent = new Event("input", {
            bubbles: true,
            cancelable: true
          });
        }

        nameControl.dispatchEvent(inputEvent);

        nameControl.dispatchEvent(
          new Event("change", {
            bubbles: true,
            cancelable: true
          })
        );

        nameControl.dispatchEvent(
          new KeyboardEvent("keyup", {
            bubbles: true,
            cancelable: true
          })
        );
      }

      assignName();

      /*
       * Controlled field fallback: some frameworks re-render and overwrite
       * the value shortly after the input event, rather than immediately.
       * Retry with increasing delays instead of a single 40ms check.
       */
      for (const delay of [40, 150, 400]) {
        await sleep(delay);

        if (nameControl.value === desiredName) {
          break;
        }

        assignName();
      }

      nameControl.dispatchEvent(
        new Event("blur", {
          bubbles: true,
          cancelable: true
        })
      );

      const nameFilled = nameControl.value === desiredName;

      if (nameFilled) {
        regularFilled++;
      } else {
        console.warn(
          `[Pilgrim Autofill] Pilgrim ${index + 1} Name did not stick. ` +
          "The site's form is likely overwriting the value after a delay " +
          "longer than this extension retries for, or is rejecting " +
          "programmatic input. Check the field manually.",
          {
            expected: desiredName,
            actual: nameControl.value
          }
        );
      }

      console.debug(
        `[Pilgrim Autofill] Pilgrim ${index + 1} Name`,
        {
          expected: desiredName,
          actual: nameControl.value,
          filled: nameFilled,
          id: nameControl.id,
          name: nameControl.getAttribute("name"),
          placeholder: nameControl.getAttribute("placeholder")
        }
      );
    } else if (pilgrim.name) {
      console.warn(
        `[Pilgrim Autofill] Pilgrim ${index + 1} has a Name but no Name ` +
        "input was found on the page for this slot."
      );
    }
    // Age
    if (
      ageControl &&
      pilgrim.age !== undefined &&
      pilgrim.age !== null &&
      pilgrim.age !== ""
    ) {
      await sleep(20);

      if (
        !ageControl.disabled &&
        !ageControl.readOnly
      ) {
        if (
          setInputValue(
            ageControl,
            pilgrim.age
          )
        ) {
          regularFilled++;
        }
      }
    }

    // Gender
    if (
      genderControl &&
      pilgrim.gender
    ) {
      if (
        await selectDropdown(
          genderControl,
          pilgrim.gender
        )
      ) {
        dropdownFilled++;
      }
    }

    // Photo ID Proof
    if (
      photoIdControl &&
      pilgrim.idType
    ) {
      if (
        await selectDropdown(
          photoIdControl,
          pilgrim.idType
        )
      ) {
        dropdownFilled++;
      }

      // Allow the dependent ID field to update.
      await sleep(100);
    }

    // Photo ID Number
    if (
      idNumberControl &&
      pilgrim.idNumber
    ) {
      if (
        !idNumberControl.disabled &&
        !idNumberControl.readOnly
      ) {
        if (
          setInputValue(
            idNumberControl,
            pilgrim.idNumber
          )
        ) {
          regularFilled++;
        }
      } else {
        await sleep(120);

        if (
          !idNumberControl.disabled &&
          !idNumberControl.readOnly
        ) {
          if (
            setInputValue(
              idNumberControl,
              pilgrim.idNumber
            )
          ) {
            regularFilled++;
          }
        }
      }
    }

    console.groupEnd();
  }

  // ============================================================
  // STATUS BANNER
  // ============================================================
  const old =
    document.getElementById(
      "__pilgrim_autofill_status"
    );

  if (old) old.remove();

  const banner =
    document.createElement("div");

  banner.id =
    "__pilgrim_autofill_status";

  banner.textContent =
    `${regularFilled} regular field(s) + ` +
    `${dropdownFilled} dropdown(s) handled. ` +
    "Please verify every pilgrim manually.";

  Object.assign(banner.style, {
    position: "fixed",
    top: "16px",
    right: "16px",
    zIndex: "2147483647",
    maxWidth: "440px",
    padding: "10px 14px",
    borderRadius: "8px",
    background: "#1a73e8",
    color: "#fff",
    font: "600 13px Arial, sans-serif",
    lineHeight: "1.35",
    boxShadow: "0 2px 10px rgba(0,0,0,.2)"
  });

  document.documentElement.appendChild(
    banner
  );

  setTimeout(
    () => banner.remove(),
    8000
  );
}

loadProfiles();
