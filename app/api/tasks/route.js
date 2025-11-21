
import { neon } from '@neondatabase/serverless';
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

const sql = neon(process.env.DATABASE_URL);


export async function GET() {
    try {
        const cookieStore = await cookies();
        const homeId = cookieStore.get('homeId')?.value;

        if (!homeId) {
            return NextResponse.json({ error: "Missing homeId cookie" }, { status: 400 });
        }

        const result = await sql`
            SELECT 
                a.id AS assigned_id,
                a.home_id,
                a.task_id,
                a.member_id,
                m.name AS member_name,
                a.status,
                a.year,
                a.semana,
                d.title,
                d.category,
                d.description
            FROM assigned_tasks a
            JOIN default_tasks d ON a.task_id = d.id
            LEFT JOIN members m ON a.member_id = m.id
            WHERE a.home_id = ${homeId}
            ORDER BY a.id ASC
        `;
        //assignedTasks ya no usa .id como identificador unico, ahora usa .assigned_id

        return NextResponse.json({assignedTasks: result});

    } catch(err){
        console.error('Error fetching tasks:', err);
        return NextResponse.json({error: 'Failed to load tasks'}, {status: 500});
    }

}


export async function POST(req) {
    try {
        const body = await req.json();

        const {
            homeId,
            title,
            description,
            category,
            frequency_type,
            frequency_value,
            next_due_date,
            member_id
        } = body;

        // Validate REQUIRED fields
        /*if (!homeId || !title || !next_due_date) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }*/

        const result = await sql`
            INSERT INTO assigned_tasks 
                (home_id, title, description, category, 
                 frequency_type, frequency_value, next_due_date, member_id)
            VALUES 
                (${homeId}, ${title}, ${description}, ${category},
                 ${frequency_type}, ${frequency_value}, ${next_due_date}, ${member_id})
            RETURNING *;
        `;

        return NextResponse.json({ task: result[0] });

    } catch (err) {
        console.error("POST /api/tasks error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}



export async function DELETE(req){
    try{
        const {taskId} = await req.json();
        
        if (!taskId){
            return NextResponse.json({error: 'Missing taskId'}, {status: 400});
        }

        const result = await sql`DELETE FROM assigned_tasks WHERE id = ${taskId} RETURNING *`;

        if (result.length== 0) {
            return NextResponse.json({error: 'task not found'}, {status: 400})
        }

        return NextResponse.json({message: 'Deleted succesfully', deleted: result[0]})
        
    } catch (err){
        console.error('Error deleting task:', err)
        return NextResponse.json({error: 'Failed to delete task'}, {status: 500})
    }
}

export async function PATCH(req){
    const {memberId, taskId} = await req.json();

    if (!memberId) {
        return NextResponse.json({error: "Member required"}, {status:400})
    }

    const existing = await sql`SELECT member_id FROM assigned_tasks WHERE id = ${taskId}`

    if (existing.length == 0){
        return NextResponse.json({error: "Task doesn't exist"}, {status: 400});
    }

    if (existing[0].member_id){
        return NextResponse.json({error: "Tarea ya asignada"}, {status:400});
    }

    //asignar
    await sql `UPDATE assigned_tasks SET member_id = ${memberId} WHERE id = ${taskId}`

    return NextResponse.json({success: true});

}