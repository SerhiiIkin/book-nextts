"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useBookedSlots, useCreateBooking } from "@/lib/queries";
import { format } from "date-fns";
import {
    generateTimeSlots,
    isWithinBusinessHours,
    OPENING_HOURS,
} from "@/lib/utils";
import { AxiosError } from "axios";

const BookingComponent = () => {
    const initialMessage = {
        success: "",
        error: "",
    };

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const dateStr = date ? format(date, "yyyy-MM-dd") : "";
    const [message, setMessage] = useState(initialMessage);

    useEffect(() => {
        setMessage(initialMessage);
    }, [date]);

    const { data: bookedSlots = [], isLoading } = useBookedSlots(dateStr);

    const createBooking = useCreateBooking();

    const toggleSlot = (slot: string) => {
        setSelectedSlots((prev) =>
            prev.includes(slot)
                ? prev.filter((s) => s !== slot)
                : [...prev, slot]
        );
    };

    const handleBooking = () => {
        if (!date) return;
        createBooking.mutate(
            {
                date: dateStr,
                timeSlots: selectedSlots,
            },
            {
                onSuccess: () => {
                    setMessage({
                        success: "Booking oprettet",
                        error: "",
                    });
                },
                onError: (error: Error) => {
                    const axiosError = error as AxiosError<{ error: string }>;
                    setMessage({
                        success: "",
                        error:
                            axiosError.response?.data.error ||
                            "Der skete en fejl",
                    });
                },
            }
        );
        setSelectedSlots([]);
    };

    const isOpen = isWithinBusinessHours(date || new Date(), "10:00");

    const openingHours = Object.entries(OPENING_HOURS)
        .map(([day, hours]) => {
            if (hours.isOpen) {
                return {
                    day,
                    hours: hours.start + " - " + hours.end,
                };
            }
        })
        .filter(Boolean);

    return (
        <div className="p-4 gap-y-4 grid">
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                weekStartsOn={1}
                className="mx-auto"
            />
            {!date && <div>Vælg en dag</div>}
            {isOpen && date && (
                <>
                    <div className="grid grid-cols-4 gap-2">
                        {generateTimeSlots(date || new Date()).map((slot) => {
                            const isBooked = bookedSlots.includes(slot);
                            const isSelected = selectedSlots.includes(slot);
                            return (
                                <Button
                                    key={slot}
                                    variant={isSelected ? "default" : "outline"}
                                    disabled={isBooked}
                                    onClick={() => toggleSlot(slot)}>
                                    {slot}
                                </Button>
                            );
                        })}
                    </div>
                    <div className="flex justify-center items-center gap-2">
                        <Button
                            disabled={
                                selectedSlots.length === 0 ||
                                createBooking.isPending
                            }
                            className="mr-2"
                            onClick={handleBooking}>
                            {createBooking.isPending ? "Booking..." : "Book"}
                        </Button>
                        {message.success && (
                            <span className="text-green-500">
                                {message.success}
                            </span>
                        )}
                        {message.error && (
                            <span className="text-red-500">
                                {message.error}
                            </span>
                        )}
                    </div>
                </>
            )}
            {!isOpen && (
                <div className="text-center">
                    <h2>Vi lukket denne dag</h2>
                    <p>Vores åbningstider </p>
                    {openingHours.map((hour) => (
                        <p key={hour?.day}>
                            {hour?.day}: {hour?.hours}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookingComponent;
