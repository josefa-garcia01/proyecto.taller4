import { neon } from '@neondatabase/serverless';
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL);

export async function PUT(req) {
    try {
        const {taskId, body} = await req.json();

        const {
            homeId,
            title,
            description,
            category,
            frequency_type,
            frequency_value,
            next_due_date,
            member_id,
            estimated_minutes,
            difficulty
        } = body;

        // Validate REQUIRED fields
        /*if (!homeId || !title || !next_due_date) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }*/

        const result = await sql`
            UPDATE assigned_tasks
            SET
                title = ${title},
                description = ${description},
                category = ${category},
                frequency_type = ${frequency_type},
                frequency_value = ${frequency_value},
                next_due_date = ${next_due_date},
                member_id = ${member_id},
                estimated_minutes = ${estimated_minutes},
                difficulty = ${difficulty}
            WHERE id = ${taskId}
            RETURNING *;
        `;

        if (result.length === 0){
            return NextResponse.json({error: "edit, task not found"}, {status: 400});
        }

        return NextResponse.json([result[0]]);

    } catch (err) {
        console.error("POST /api/tasks error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
