# 08 Questions Round 1 - Duplicate Owner Prevention

Please answer each question below (select one or more options, or add your own notes). Feel free to add additional context under any question.

## 1. Duplicate Detection Criteria

What combination of fields should define a "duplicate" owner?

- [ ] (A) First name + Last name only (e.g., two "George Franklin" entries are duplicates regardless of address)
- [ ] (B) First name + Last name + address (same name at same address is a duplicate)
- [x] (C) First name + Last name + telephone (same name with same phone number is a duplicate)
- [ ] (D) First name + Last name + city (same name in same city is a duplicate)
- [ ] (E) Other (describe)

## 2. Case Sensitivity

Should the duplicate check be case-sensitive?

- [x] (A) Case-insensitive — "george franklin" and "George Franklin" are duplicates
- [ ] (B) Case-sensitive — only exact case matches are considered duplicates
- [ ] (C) Other (describe)

## 3. Error Message Placement

Where should the duplicate error message appear in the UI?

- [ ] (A) As a field-level error on the Last Name field (consistent with how pet duplicates are shown today)
- [x] (B) As a global/form-level alert banner at the top of the form
- [ ] (C) As a field-level error on the First Name field
- [ ] (D) Other (describe)

## 4. Error Message Wording

What should the error message say when a duplicate is detected?

- [ ] (A) "already exists" — reuses the existing `duplicate` i18n message key (matches pet behavior)
- [x] (B) "An owner with this name already exists. Please search for the existing owner." — more actionable guidance
- [ ] (C) "An owner with this name already exists." — concise form-level message
- [ ] (D) Other (describe)

## 5. Edit/Update Scope

Should the duplicate check also apply when editing an existing owner's name?

- [ ] (A) No — only block duplicates on the create form (simpler scope)
- [x] (B) Yes — also block renaming an owner to a name that already exists
- [ ] (C) Other (describe)

## 6. Implementation Layer

Where should the duplicate detection logic live?

- [x] (A) In the Controller — query repository before saving, add error to BindingResult (matches existing pet duplicate pattern)
- [ ] (B) In a dedicated Service layer class — keeps controller thin, encapsulates business logic
- [ ] (C) Database constraint only — unique index on name columns (no UI error, just DB error)
- [ ] (D) Other (describe)
