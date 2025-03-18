import axios from "axios"

export const API_URL = "https://fa04-14-232-245-33.ngrok-free.app"

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
})
