# CSV Import Report

**Date of Run:** 2026-06-12
**Environment:** Development
**Source File:** `sample_users_batch_01.csv`
**Total Rows Processed:** 150

---

## Summary
- **Successfully Imported:** 142 records
- **Skipped/Failed:** 3 records
- **Modified/Corrected:** 5 records

---

## Anomaly Detection Log

| Row # | Entity / Email | Anomaly Detected | Action Taken |
|-------|---------------|------------------|--------------|
| 14 | `john.doe@gmail` | Invalid email format (missing TLD) | **SKIPPED**: Record rejected due to validation failure. |
| 27 | `alice.smith@edmarg.com` | Duplicate email address | **MODIFIED**: Updated existing record with new profile data (Upsert). |
| 45 | `bob.jones@yahoo.com` | Role specified as `teacher` (Invalid Enum) | **MODIFIED**: Mapped unknown role to default `student` role. |
| 88 | `sarah.connor@gmail.com` | Phone number contained formatting `(555) 123-4567` | **MODIFIED**: Stripped non-numeric characters to `5551234567`. |
| 102 | `mike.w@hotmail.com` | Phone number contains letters `555-123-CALL` | **MODIFIED**: Stripped invalid characters. Remaining length < 10. Set phone to empty string `''`. |
| 115 | `N/A` | Missing required field: `email` | **SKIPPED**: Record rejected. Email is required. |
| 134 | `david.k@gmail.com` | Missing required field: `name` | **SKIPPED**: Record rejected. Name is required. |
| 149 | `emily.r@gmail.com` | Role specified as empty string | **MODIFIED**: Applied default role `student`. |

---
*End of Report*
