import { neon } from '@neondatabase/serverless';
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL);


export async function PUT(req){
    const {memberId, newName} = await req.json();

    if (!memberId) {
        return NextResponse.json({ error: "Member ID required" }, { status: 400 });
    }

    await sql`UPDATE members SET name = ${newName} WHERE id = ${memberId};`;
    
    return NextResponse.json({success: true});

}