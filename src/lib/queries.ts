// lib/queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { basisAxios } from "./axios";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

export const useBookedSlots = (date: string) =>
    useQuery({
        queryKey: ["bookedSlots", date],
        queryFn: async () => {
            const res = await basisAxios.get(`/bookings/${date}`);
            return res.data.timeSlots || [];
        },
        enabled: !!date,
    });

export const useCreateBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { date: string; timeSlots: string[] }) => {
            const res = await basisAxios.post("/bookings/create", data);
            return res.data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["bookedSlots", variables.date],
            });
        },
       
    });
};
