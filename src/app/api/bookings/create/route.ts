import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {
    const { date, timeSlots } = await req.json();
    const { db } = await connectToDatabase();

    const existing = await db.collection("bookings").findOne({ date });
    const alreadyBooked = existing?.timeSlots.filter((slot: string) =>
        timeSlots.includes(slot)
    );

    if (alreadyBooked?.length) {
        return NextResponse.json(
            {
                error: "Der allerede er booket, vælg et andet tidspunkt",
                alreadyBooked,
            },
            { status: 400 }
        );
    }

    await db
        .collection("bookings")
        .updateOne(
            { date },
            { $addToSet: { timeSlots: { $each: timeSlots } } },
            { upsert: true }
        );

    return NextResponse.json({ success: true });
}
