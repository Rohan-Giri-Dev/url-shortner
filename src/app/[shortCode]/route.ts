import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ shortCode: string }> }){
    try {
      const {shortCode} = await params;
      const url = await prisma.url.findUnique({
          where: {
              shortCode
          }
      })
  
      if(!url){
          return NextResponse.json({error: "Short URL not found"}, {status: 404})
      }

      console.log(url)
  
      await prisma.url.update({
        where: {shortCode},
        data: {
          clicks: {
            increment: 1, 
          }
        }
      })
  
      return NextResponse.redirect(url.originalUrl);
    } catch (error) {
      console.error("Failed to Update and get original Url", error)
      return NextResponse.json(
            { error: "Failed to Update and get original Url" },
            { status: 500 }
        )
    }
    
}

/*

Explain the working of this file
This route gets the extract the shortCode when someone clicks the shortUrl
- It checks if the shortCode exits in the DB or not
- Increase the Increment to 1 per click
- Recirects the User to the originalPage

*/