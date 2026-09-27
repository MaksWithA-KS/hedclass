# HEdClass: Higher Education Classification Platform

HEdClass is a web application that replaces the manual, spreadsheet-based degree
classification process used by higher education institutions. Classification is
produced deterministically from a programme's weighting model and the academic
regulations governing resits and credit progression, and every manual override is
recorded with a written rationale so a board of examiners can audit the result.

Built as a three-tier application for an MSc Web Development module at Queen's
University Belfast.

## Features

* **Automated classification engine** — applies programme-specific Year 2 / Year 3
  weightings, 40% resit capping and 360-credit progression rules.
* **Role-based access control** — separate routing and permissions for Institutional
  Administrators and Classification Officers.
* **Auditable overrides** — a manual change to a classification requires a written
  rationale, which is stored against the student record.
* **CSV export** — generates a board of examiners report for a whole programme.
* **Standalone REST API** — serves programme and student data as JSON on its own port.
* **Light and dark themes** — the chosen theme persists across visits.

## Technical stack

| Tier | Technology |
| :--- | :--- |
| Application | Node.js, Express.js |
| Presentation | EJS, Bootstrap 5 |
| Data | MySQL (via `mysql2`) |
| Security | bcrypt password hashing, session-based authentication |

## Prerequisites

* Node.js v18 or higher
* MySQL Server 8.0 or higher

## Setup

**1. Clone and install**

```bash
git clone https://github.com/MaksWithA-KS/hedclass.git
cd hedclass
npm install
```

**2. Create the database**

Start your local MySQL server, then run the seed script in a MySQL client
(MySQL Workbench, phpMyAdmin, or the `mysql` CLI):

```bash
mysql -u root -p < src/seeder/setup.sql
```

This creates the `hedclass` database, builds the schema with its foreign key
relations, and seeds it with programmes, users and a test cohort of students.

**3. Configure the environment**

Copy the example environment file and edit it to match your local MySQL setup:

```bash
cp .env.example .env
```

`.env` is git-ignored and is never committed.

**4. Run**

The REST API and the web application run as separate processes, so start each in
its own terminal:

```bash
npm run start:api   # REST API on http://localhost:4000
npm start           # web application on http://localhost:3000
```

## Demo accounts

The seed script creates the following accounts to demonstrate role-based access.
These are throwaway credentials for a local demo database — they are not used
anywhere else and are published deliberately so the app can be tried out.

| Role | Email | Password |
| :--- | :--- | :--- |
| Institutional Administrator | gandalf@qub.ac.uk | yoshllntpass!1 |
| Classification Officer | holmes@qub.ac.uk | elementary2$ |
| Classification Officer | kenobi@qub.ac.uk | helloth3re |

## Project structure

```
src/
  api/       standalone REST API
  web/       web application
    controllers/   request handling and classification logic
    routes/        route definitions
    middleware/    authentication and role guards
    views/         EJS templates
  seeder/    database schema and seed data
public/      stylesheets, client-side JS, images
```

## Scope and limitations

This was built to an assignment brief, and a few things were out of scope:

* There is no automated test suite.
* The classification rules are implemented against one institution's regulations
  rather than being configurable per institution.
* The REST API is read-only and unauthenticated.

## Author

Maksymilian Niewiedzial
