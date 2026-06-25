import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { generateShortCode } from "../../../../lib/short-code";
import { URL } from "node:url";
import { createShortUrl } from "../../../../lib/app-url";


function isValidUrl(url: string) : boolean{
    try {
        new URL(url)
        return true;  
    } catch {
        return false;
    }
}

// create a short url 
export async function POST(req: NextRequest){
    try {
        const {originalUrl} = await req.json()
    
        // checking for valid url
        if(!originalUrl || !isValidUrl(originalUrl)){
            return NextResponse.json({error: "Invalid url"}, {status: 400})
        }
    
        let randomCode = generateShortCode()
        let attempts = 0;
    
        let shortCodeDb = await prisma.url.findUnique({
            where: {
                shortCode: randomCode
            }
        })
    
        while(shortCodeDb && attempts < 5){
            randomCode = generateShortCode()
            attempts++;
    
            shortCodeDb = await prisma.url.findUnique({
                where: {
                    shortCode: randomCode
                }
        })
        }

        if (shortCodeDb) {
            return NextResponse.json(
                { error: "Could not generate a unique short code" },
                { status: 500 }
            )
}
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    
        const newUrlCode = await prisma.url.create({
            data: {
                originalUrl,
                shortCode: randomCode,
                expiresAt
            }
        })
    
        return NextResponse.json(
            {
                originalUrl: newUrlCode.originalUrl,
                shortCode: newUrlCode.shortCode,
                shortUrl: createShortUrl(newUrlCode.shortCode, req.nextUrl.origin),
                expiresAt: newUrlCode.expiresAt
                
            },
            {status: 201})
    } catch (error) {
    console.error("Failed to create short code", error)

    return NextResponse.json(
      { error: "Failed to create short URL" },
      { status: 500 }
    )
  }
} 

export async function GET(req: NextRequest){
    try {
        const now = new Date()
        const allUrl = await prisma.url.findMany(
            {
                where: {
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: now } }
                    ]
                },
                orderBy: {
                    createdAt: "desc"
                }
            }
        )

        const urlsWithShortLinks = allUrl.map((url) => ({
            ...url,
            shortUrl: createShortUrl(url.shortCode, req.nextUrl.origin)
        }))

        return NextResponse.json(urlsWithShortLinks)
        
    } catch (error) {
        console.error("Failed to GET the Url", error)

        return NextResponse.json(
            { error: "Failed to GET the Url" },
            { status: 500 }
        )
    }
}



/*
POST /api/urls
1. Receive originalUrl from req.json()
2. Validate that it is a real URL
3. Generate a random shortCode
4. Check if shortCode already exists in database
5. Save originalUrl and shortCode in database
6. Return the short URL to frontend

GET /api/urls
Backend should do:
1. Fetch all URLs from database
2. Order by latest created
3. Return array of URLs
*/
