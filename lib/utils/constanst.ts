//export const API_BACKEND = 'https://booking-suit-back-nest.onrender.com';
//export const API_BACKEND = "https://api2.mutualsmsv.com.ar";
//export const API_BACKEND = "http://localhost:3001";
export const API_BACKEND = process.env.NEXT_PUBLIC_API_BACKEND ?? "http://localhost:3001";
