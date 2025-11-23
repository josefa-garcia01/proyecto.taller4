import {neon} from "@neondatabase/serverless"
import { nextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL);


export async function GET() {
    try{
        const today = new Date().toISOString().split("T")[0];

        const tasks = await sql `SELECT * FROM assigned_tasks WHERE next_due_date = ${today};`;

        for (const task of task.rows) {
            const {id, status, frequency_value, frequency_type, member_id} = task;

            if (frequency_value == 0) {
                await sql`DELETE FROM assigned_tasks WHERE id = ${id};`;
                continue;
            }

            let nextDate = new Date(today);

            if (frequency_type == "days") {
                nextDate.setDate(nextDate.getDate() + frequency_value);
            } else if (frequency_type == "weeks") {
                nextDate.setDate(nextDate.getDate() + 7*frequency_value);
            }

            const next_due = nextDate.toISOString().split("T")[0];

            if(status == "done") {
                await sql `UPDATE assigned_tasks SET status = 'pending', next_due_date = ${next_due} WHERE id = ${id};`;
                continue;
            }

            if (status == "pending") {
                await sql `UPDATE assigned_tasks SET next_due_date = ${next_due} WHERE id = ${id};`;
            }
        }

        return nextResponse.json({ok:true, processed:tasks.rowCount});

    } catch (err) {
        console.error("DAILY CRON ERROR:", err);
        return nextResponse.json({error: "Daily cron failed"}, {status:500});
    }
}