import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { URL } from "node:url";
import { error } from "node:console";

function isValidUrl(url: string) : boolean{
    try {
        new URL(url)
        return true;  
    } catch (error) {
        return false;
    }
}

// function to geneate random code
function generateCode(): string{
    return Math.random().toString(30).slice(2, 10)
    /*
    How it works:
    Math.random() → generates a random decimal like 0.735821...
    .toString(36) → converts it to base-36 (digits 0-9 + letters a-z), giving something like "0.k7x2mq9p4r"
    .slice(2, 10) → removes the "0." prefix and takes 8 chars */
}

// create a short url 
export async function POST(req: NextRequest){
    try {
        const {originalUrl} = await req.json()
    
        // checking for valid url
        if(!originalUrl || !isValidUrl(originalUrl)){
            return NextResponse.json({error: "Invalid url"}, {status: 400})
        }
    
        const randomCode = generateCode()
    
        const shortCodeDb = await prisma.url.findFirst({
            where: {
                shortCode: randomCode
            }
        })
    
        if(shortCodeDb){
            return NextResponse.json({error: "Short code already exits"}, {status: 500})
        }
    
        const newUrlCode = await prisma.url.create({
            data: {
                originalUrl,
                shortCode: randomCode
            }
        })
    
        return NextResponse.json(newUrlCode, {status: 400})
    } catch (error) {
        console.error("Failed to create short code", error)
    }
}

export async function GET(){}

/*
1. Receive originalUrl from req.json()
2. Validate that it is a real URL
3. Generate a random shortCode
4. Check if shortCode already exists in database
5. Save originalUrl and shortCode in database
6. Return the short URL to frontend
*/
