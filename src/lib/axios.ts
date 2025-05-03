import axios from "axios"

export const basisAxios = axios.create({
    baseURL:"/api"
})