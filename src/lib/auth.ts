import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../../db/instance";
 
export const auth = betterAuth({
    trustedOrigins: ["https://chgroup.store", "http://chgroup.store", "https://chgroup.store/productos"], // Add your trusted origins here
    baseURL: process.env.NODE_ENV === "production" 
        ? "https://chgroup.store" 
        : "http://localhost:3000",
    
    socialProviders: { 
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID!, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!, 
        } 
    }, 

    database: prismaAdapter(prisma, {
        provider: "sqlite", // or "mysql", "postgresql", ...etc
    }),
    
    user: {
        additionalFields: {
            role: {
                type: "string",
                default: "user",    
                required: true,
            }
        }
    }
});