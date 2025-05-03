import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

type RouteContext = {
    params: Promise<{ date: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { date } = await context.params;
        const { db } = await connectToDatabase();
        const booking = await db.collection("bookings").findOne({ date });

        return NextResponse.json(booking || { date, timeSlots: [] });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
