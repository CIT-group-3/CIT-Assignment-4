// Part B1 - one operation, two statements, one transaction

import { pool } from './db.js';

export interface EnrolInput {
  studentId: string;
  courseId: string;
  secId: string;
  semester: string;
  year: number;
}

/**
 * Enrols a student in a course section and adds the course credits to the
 * student's total.
 *
 * Two statements:
 *   INSERT INTO takes (id, course_id, sec_id, semester, year, grade)
 *     VALUES ($1, $2, $3, $4, $5, NULL)
 *   UPDATE student SET tot_cred = tot_cred + <the course credits>
 *     WHERE id = $1
 *
 * They must both happen or neither. A student enrolled without the credits
 * being added is a database that quietly disagrees with itself.
 *
 * A transaction runs on one connection, so take a client from the pool
 * rather than using the pool directly: BEGIN, both statements, COMMIT, and
 * ROLLBACK if anything fails. Release the client in a finally block.
 *
 * Returns the student's new credit total.
 */
export async function enrolInTypeScript(input: EnrolInput): Promise<number> {
  const client = await pool.connect();

  try {
    // Start a transaction on this specific connection.
    await client.query("BEGIN");

    // Find how many credits the course is worth.
    const { rows: courseRows } = await client.query<{ credits: number }>(
      `SELECT credits
       FROM course
       WHERE course_id = $1`,
      [input.courseId],
    );

    if (courseRows.length === 0) {
      throw new Error(`Course ${input.courseId} does not exist`);
    }

    const credits = Number(courseRows[0].credits);

    // Record the enrolment.
    await client.query(
      `INSERT INTO takes (id, course_id, sec_id, semester, year, grade)
       VALUES ($1, $2, $3, $4, $5, NULL)`,
      [
        input.studentId,
        input.courseId,
        input.secId,
        input.semester,
        input.year,
      ],
    );

    // Add the course credits and retrieve the new total.
    const { rows: studentRows } = await client.query<{ tot_cred: number }>(
      `UPDATE student
       SET tot_cred = tot_cred + $2
       WHERE id = $1
       RETURNING tot_cred`,
      [input.studentId, credits],
    );

    if (studentRows.length === 0) {
      throw new Error(`Student ${input.studentId} does not exist`);
    }

    const newTotal = Number(studentRows[0].tot_cred);

    // Both changes succeeded, so save the transaction.
    await client.query("COMMIT");

    return newTotal;
  } catch (error) {
    // If anything failed, undo all changes made by this transaction.
    await client.query("ROLLBACK");
    throw error;
  } finally {
    // Always return the connection to the pool.
    client.release();
  }
}