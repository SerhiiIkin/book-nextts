import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(
    request: Request,
    { params }: { params: { date: string } }
) {
    try {
        const { db } = await connectToDatabase();

        const { date } = await params

        const booking = await db
            .collection("bookings")
            .findOne({  date });

        return NextResponse.json(
            booking || {  date, timeSlots: [] }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
