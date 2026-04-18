# HEdClass: Higher Education Classification Platform

## Overview
HEdClass is a secure, dynamic web application designed to automate the manual, spreadsheet-based degree classification process for Higher Education institutions. Built with a robust three-tier architecture, it ensures deterministic and regulatory-compliant award calculations based on a dynamic weighting model and strict resit capping rules. 

## Technical Stack
* **Application Tier:** Node.js, Express.js
* **Presentation Tier:** EJS (Embedded JavaScript), Bootstrap CSS
* **Data Tier:** MySQL (Relational Database)
* **Security:** bcrypt (Password Hashing), Session-based Authentication

## Prerequisites
To run this application locally, ensure you have the following installed:
* Node.js (v14.x or higher)
* MySQL Server (v8.0+)

## Installation & Database Setup

1. **Clone the Repository:**
   git clone https://gitlab.eeecs.qub.ac.uk/40083161/hedclass.git
   cd 40083161

2. **Install Dependencies:**
   npm install

3. **Database Configuration:**
   * Ensure your local MySQL server is running (e.g., via XAMPP, MAMP, or standard MySQL Server).
   * Open your preferred MySQL client (such as MySQL Workbench or phpMyAdmin).
   * Locate the setup script provided in the repository at: `src/seeder/setup.sql`
   * Open and execute the entire `setup.sql` script. This script will automatically:
     1. Create the required database (`40083161`).
     2. Build all necessary schema tables with correct foreign key relations.
     3. Seed the database with the core programmes, users, and a diverse cohort of test students.
   * Finally, ensure your database connection settings (User, Password, Host) in your application configuration (e.g., `.env` or `db.js`) match your local MySQL environment.

## Running the Application

The system is designed with a separate REST API and Web Application for optimal load distribution.

1. **Start the Standalone REST API:**
   * Open a terminal window and start the API service (Configured for PORT 4000):
     node src/api/server.js

2. **Start the Main Web Application:**
   * Open a second terminal window and start the web application (Configured for PORT 3000):
     node src/web/app.js

3. **Access the System:**
   * Open a web browser and navigate to: `http://localhost:3000`

## Test Credentials

The database seeder provides the following accounts to demonstrate the Role-Based Access Control (RBAC) and user flows:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Institutional Administrator** | gandalf@qub.ac.uk | yoshllntpass!1 |
| **Classification Officer** | holmes@qub.ac.uk | elementary2$ |
| **Classification Officer** | kenobi@qub.ac.uk | helloth3re |

## Key Features
* **Role-Based Access Control:** Strict routing separation between Administrators and Classification Officers.
* **Automated Classification Engine:** Enforces 360-credit progression rules, 40% resit caps, and dynamic Year 2/Year 3 weightings.
* **Auditability:** Mandates written rationales for any manual grade overrides.
* **Data Export:** CSV generation for board of examiner reporting.
* **Standalone API:** Independent JSON data retrieval.

## Authorship
Developed by Maksymilian Niewiedzial Student ID: 40083161