# CIT-Assignment-4

## B1 vs B3: Where Should Enrolment Logic Live?

### Comparison

| Aspect | B1 — TypeScript | B3 — Database Procedure |
|---|---|---|
| **Logic** | Handled in TypeScript | Handled in PostgreSQL |
| **Maintainability** | Easier to keep business logic in one place | Logic is split between TypeScript and SQL |
| **Database communication** | May require multiple queries | Combines operations in one procedure call |
| **Portability** | Less dependent on a specific database | More dependent on PostgreSQL |

### My Reflection

In B1, the enrolment logic is written in TypeScript, so it is easier to test and maintain in one place. However, it may require several database queries and careful transaction handling.

In B3, the database procedure handles the enrolment and credit update together, reducing communication with the database. The downside is that the logic is split between TypeScript and SQL and becomes more dependent on PostgreSQL.

For a system I had to maintain, I would keep most business logic in TypeScript, as this course recommends, and use database procedures only when they provide a clear benefit.

---

## B3 Setup Instructions

**Important:** Before running the project, the `enrol_student` procedure must exist in your `university` database.

1. Open your database tool (e.g. pgAdmin, DBeaver or Navicat).
2. Connect to the `university` database.
3. Open an SQL query editor.
4. Copy the complete B3 `CREATE OR REPLACE PROCEDURE enrol_student(...)` block from `procedures.sql`.
5. Execute the SQL and make sure it completes successfully.
6. Return to the project directory and run:

   ```bash
   npm run build
   npm start
   ```

### Troubleshooting

If the project reports that `enrol_student` was not found, check that you created the procedure in the same `university` database used by the TypeScript project.

**Note:** Execute only the B3 procedure block if other sections of `procedures.sql` still contain unfinished `TODO`s.