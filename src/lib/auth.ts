import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../../db/instance";
 
export const auth = betterAuth({
    trustedOrigins: ["https://www.chgroup.store/", "https://chgroup.store/"],
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
        provider: "sqlite", 
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