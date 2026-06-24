# Medi Hospital Management System

Professional, responsive hospital management software for **Medi Hospital**. Streamlines patient registration, appointment scheduling, automatic department routing, and AI-assisted typist report generation.

## Features

### Reception Desk
- Register new patients with auto-generated patient IDs
- Schedule doctor appointments by department
- Order diagnostic tests — **automatically routed** to the correct department

### Department Module
- Real-time test queue filtered by department
- Patient info, clinical notes, and priority visible instantly
- Update test status: Pending → In Progress → Completed

### Typist Report Center
- Enter **keywords only** (e.g. `normal, clear` or `fracture, severe`)
- System auto-generates full diagnostic reports
- Edit, save drafts, and finalize reports

### Admin Dashboard
- Overview of departments, test types, and staff
- Role-based access control

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS** (fully responsive)
- **Prisma + SQLite** (easy local setup; can switch to PostgreSQL)

## Quick Start

```bash
# Install dependencies
npm install

# Setup database (migrate + seed demo data)
npm run db:setup

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts

| Role       | Email                        | Password     |
|-----------|------------------------------|--------------|
| Admin     | admin@medihospital.com       | admin123     |
| Reception | reception@medihospital.com   | reception123 |
| Radiology | radiology@medihospital.com   | dept123      |
| Lab       | lab@medihospital.com         | dept123      |
| Typist    | typist@medihospital.com      | typist123    |

## Workflow

```
Patient arrives → Reception registers patient
                → Schedules appointment OR orders test
                → Test auto-routes to department queue
                → Department performs test
                → Typist enters keywords → Report generated
                → Report finalized
```

## Environment Variables

Create `.env`:

```
DATABASE_URL="file:./dev.db"
SESSION_SECRET="your-secret-key-here"
```

## Scripts

| Command          | Description                    |
|-----------------|--------------------------------|
| `npm run dev`   | Start development server       |
| `npm run build` | Production build               |
| `npm run db:setup` | Migrate + seed database     |
| `npm run db:seed`  | Seed demo data only         |
