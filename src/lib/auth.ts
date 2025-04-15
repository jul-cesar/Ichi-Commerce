import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../../db/instance";
 
export const auth = betterAuth({
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