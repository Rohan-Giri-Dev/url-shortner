import { NextRequest, NextResponse } from "next/server";
import { URL } from "node:url";
import { prisma } from "../../../../../../lib/prisma";
import { generateShortCode } from "../../../../../../lib/short-code";
import { auth } from "@clerk/nextjs/server";


function isValidUrl(url: string) : boolean{
    try {
        new URL(url)
        return true;  
    } catch {
        return false;
    }
}

function createShortUrl(shortCode: string, req: NextRequest): string {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin
    const hasProtocol = appUrl.startsWith("http://") || appUrl.startsWith("https://")
    const baseUrl = hasProtocol ? appUrl : req.nextUrl.origin

    return `${baseUrl.replace(/\/$/, "")}/${shortCode}`
}

// create a short url 
export async function POST(req: NextRequest, {params} : {params : Promise<{userId: string}>}){
    try {
        const {userId} = await params
        const {userId : signedInUserId} = await auth()

        if (!signedInUserId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (userId !== signedInUserId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

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

        await prisma.user.upsert({
            where: {
                id: signedInUserId
            },
            update: {},
            create: {
                id: signedInUserId
            }
        })

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    
        const newUrlCode = await prisma.url.create({
            data: {
                originalUrl,
                shortCode: randomCode,
                userId: signedInUserId,
                expiresAt
            }
        })
    
        return NextResponse.json(
            {
                originalUrl: newUrlCode.originalUrl,
                shortCode: newUrlCode.shortCode,
                shortUrl: createShortUrl(newUrlCode.shortCode, req),
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

export async function GET(req: NextRequest,{ params }: { params: Promise<{ userId: string }> }){
    try {

        const {userId} = await params
        const {userId : signedInUserId} = await auth()
        const now = new Date()

        if (!signedInUserId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (userId !== signedInUserId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const allUrl = await prisma.url.findMany(
            {
                where: {
                   userId: signedInUserId,
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
            shortUrl: createShortUrl(url.shortCode, req)
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
