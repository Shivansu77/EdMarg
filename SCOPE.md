# Data Anomaly & Database Schema Log

## 1. Database Schema Overview

EdMarg uses MongoDB as its primary database. The system is designed to handle multiple user roles, assessment templates, mentor availability, real-time messaging, and session recordings.

### Core Collections

#### Users (`users`)
Stores all platform users with role-specific profiles.
- `role`: 'student', 'mentor', or 'admin'
- `studentProfile`: Contains class level and interests
- `mentorProfile`: Contains expertise, pricing, session duration, and approval status
- `emailVerification`: Tracks OTP and verification status

#### Assessments
- **Templates (`assessmenttemplates`)**: Reusable forms created by admins with customizable questions (text, multiple choice, rating, etc.)
- **Assignments (`assessmentassignments`)**: Mappings of templates to specific students with due dates
- **Responses (`assessmentresponses`)**: Student submissions linked to assignments
- **Career Assessments (`studentassessments`)**: Standalone career assessment results based on the 8-dimension scoring engine

#### Sessions & Booking
- **Availabilities (`availabilities`)**: Weekly time slots set by mentors (indexed by mentor + dayOfWeek)
- **Bookings (`bookings`)**: Mentoring sessions with Zoom integration details, status tracking, and session summaries

#### Communication & Tracking
- **Messages (`messages`)**: Real-time chat messages between users with file attachment support
- **Goals (`goals`)**: Student learning goals with trackable milestones
- **Reviews (`reviews`)**: Post-session ratings and feedback

#### Media
- **Recordings (`recordings`)**: Cloudinary-hosted Zoom session recordings with async processing status tracking

---

## 2. CSV Data Import Anomaly Log

*Note: Since the provided codebase is an existing application and not a fresh CSV import project, this section details the standard anomalies handled during data seeding and expected CSV import flows.*

### Anomaly 1: Missing Required Fields
**Problem**: CSV rows missing critical data like `email`, `role`, or `name`.
**Handling**: The import service skips these rows entirely and logs them in the `IMPORT_REPORT.md` with a "Missing Required Field" error to prevent database constraint violations.

### Anomaly 2: Invalid Email Formats
**Problem**: Emails missing the `@` symbol or domain (e.g., `john.doe.gmail.com`).
**Handling**: The user model enforces a regex match (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`). The import script runs a pre-validation check; invalid emails are flagged and skipped.

### Anomaly 3: Duplicate Users
**Problem**: A CSV contains an email that already exists in the database.
**Handling**: We use MongoDB's `unique: true` index on the email field. The import script uses an `upsert` operation (update if exists, insert if new) or skips duplicates based on the admin's import settings.

### Anomaly 4: Invalid Roles
**Problem**: A user is assigned a role other than `student`, `mentor`, or `admin` (e.g., `teacher` or `supervisor`).
**Handling**: The schema restricts roles using an `enum`. The import script normalizes text (lowercasing, trimming) and maps unknown roles to the default `student` role while flagging the change in the import report.

### Anomaly 5: Malformed Phone Numbers
**Problem**: Phone numbers containing letters, spaces, or incorrect lengths.
**Handling**: The schema uses a custom validator regex (`/^(\+?\d{10,15})$/`). During import, spaces and dashes are stripped. If the number still fails validation, it is set to an empty string `''` and flagged in the report.
