import { pool } from "../../db";
import type { TypeofIssue } from "./issue.interface";

const createIssuesIntoDB = async (payload: TypeofIssue, reporter_id: number) => {
  const { title, description, type } = payload;

  const result = await pool.query(
    `INSERT INTO issues(title, description, type, reporter_id) VALUES($1,$2,$3,$4) RETURNING*`,
    [title, description, type, reporter_id],
  );
  return result;
};

const checkUserExists = async (id: number) => {
  const result = await pool.query(`SELECT id FROM users WHERE id=$1`, [id]);
  return result.rows.length > 0;
};

const GetIssuesfromDB = async (filters: {
  sort?: string | undefined;
  type?: string | undefined;
  status?: string | undefined;
}) => {
  const { sort, type, status } = filters;

  const values: string[] = [];
  const conditions: string[] = [];

  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderClause = sort === "oldest" ? "ORDER BY created_at ASC" : "ORDER BY created_at DESC";

  const result = await pool.query(
    `SELECT * FROM issues ${whereClause} ${orderClause}`,
    values
  );
  return result;
};

const getReportersByIds = async (ids: number[]) => {
  const result = await pool.query(
    `SELECT id, name, role FROM users WHERE id = ANY($1::int[])`,
    [ids]
  );
  return result;
};

const getReporterById = async (id: number) => {
  const result = await pool.query(
    `SELECT id, name, role FROM users WHERE id = $1`,
    [id]
  );
  return result;
};

const getSingleissuefromDB = async (id: string) => {
  const result = await pool.query(
    `SELECT * FROM issues WHERE id=$1`,
    [id],
  );
  return result;
};

const updateIssuefromDB = async (payload: TypeofIssue, id: string) => {
  const { title, description, type } = payload;

  const result = await pool.query(
    `UPDATE issues SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      type = COALESCE($3, type),
      updated_at = NOW()
    WHERE id=$4 RETURNING *`,
    [title, description, type, id]
  );
  return result;
};

const updateStatusInDB = async (id: string, status: string) => {
  const result = await pool.query(
    `UPDATE issues SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
    [status, id]
  );
  return result;
};

const deleteissuefromDB = async (id: string) => {
  const result = await pool.query(
    `DELETE FROM issues WHERE id=$1 RETURNING *`,
    [id]
  );
  return result;
};

export const issueService = {
  createIssuesIntoDB,
  checkUserExists,
  GetIssuesfromDB,
  getReportersByIds,
  getReporterById,
  getSingleissuefromDB,
  updateIssuefromDB,
  updateStatusInDB,
  deleteissuefromDB,
};
