import { pool } from "../../db";
import type { TypeofIssue } from "./issue.interface";

const createIssuesIntoDB = async (payload: TypeofIssue, reporter_id: number) => {
  const { title, description, type } = payload;

  const result = await pool.query(
    `
        INSERT INTO issues(title, description, type, reporter_id) VALUES($1,$2,$3,$4) RETURNING*
        `,
    [title, description, type, reporter_id],
  );

  return result;
};
const GetIssuesfromDB = async () => {
  const result = await pool.query(`SELECT * FROM issues`);

  return result;
};
const getSingleissuefromDB = async (id: string) => {
  const result = await pool.query(
    `
      SELECT * FROM issues WHERE id=$1

`,
    [id],
  );
  return result;
};

const updateIssuefromDB = async (payload: TypeofIssue, id: string) => {
  const { title, description, type } = payload;

  const result = await pool.query(`
      UPDATE issues SET
      title=COALESCE($1,title),
      description=COALESCE($2,description),
      type=COALESCE($3,type),
        updated_at = NOW()
      WHERE id=$4 RETURNING *
     
 

    `,[title, description, type, id]);
  return result;
};

const deleteissuefromDB=async(id:string)=>{
  const result=await pool.query(`DELETE FROM issues WHERE id=$1 RETURNING *`,
    [id]);
    return result;
}

export const issueService = {
  createIssuesIntoDB,
  GetIssuesfromDB,
  getSingleissuefromDB,
  updateIssuefromDB,
  deleteissuefromDB
};
