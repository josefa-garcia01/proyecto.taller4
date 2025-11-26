import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const sql = neon(process.env.DATABASE_URL);


export async function POST(req) {
    try{
        const {homeId, memberName} = await req.json();

        if (!homeId || !memberName)
            return NextResponse.json({error: "Missing Fields"}, {status: 400});

        const result = await sql `INSERT INTO members (home_id, name) VALUES (${homeId}, ${memberName}) RETURNING *`;

        return NextResponse.json({member: result[0]});

        } catch (err) {
            console.error("Error creating members", err);
            return NextResponse.json ({error: 'Internal Server Error'}, {status: 500});
        }
}


//el id del miembro se añade por si solo atraves de postgresql

export async function GET(req) {
    try{
        const cookieStore = await cookies();
        const homeId = cookieStore.get('homeId')?.value;

        if (!homeId) {
            return NextResponse.json({error: 'Missing homeId Cookie'}, {status: 400}); 
        }

        const result = await sql`SELECT * FROM members WHERE home_id = ${homeId}`;
        return NextResponse.json({members: result});
    } catch(err) {
        console.error("Error fetching members", err);
        return NextResponse.json({error: "Failed to fetch members"}, {status: 500});
    }
}

export async function DELETE(req){
    try{
        const {memberId} = await req.json();
        
        if (!memberId){
            return NextResponse.json({error: 'Missing memberId'}, {status: 400});
        }

        const result = await sql`DELETE FROM members WHERE id = ${memberId} RETURNING *`;

        if (result.length == 0) {
            return NextResponse.json({error: 'Member not found'}, {status: 400})
        }

        return NextResponse.json({message: 'Deleted succesfully', deleted: result[0]})
        
    } catch (err){
        console.error('Error deleting member:', err)
        return NextResponse.json({error: 'Failed to delete member'}, {status: 500})
    }
}

export async function PATCH(req){
    const {taskId} = await req.json();

    if (!taskId) {
        return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    const existing = await sql`SELECT id FROM assigned_tasks WHERE id = ${taskId};`;

    if (existing.length === 0) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await sql`UPDATE assigned_tasks SET status = 'done' WHERE id = ${taskId};`;
    
    return NextResponse.json({success: true});

}