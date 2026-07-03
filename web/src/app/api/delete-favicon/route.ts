import { NextResponse } from "next/server";
import fs from "fs";

export async function GET() {
  try {
    const srcPath = "d:/WEB/PTQABATUAN/web/public/LOGO PTQA.jpeg";
    const destPath = "d:/WEB/PTQABATUAN/web/src/app/icon.jpeg";
    
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      return NextResponse.json({ success: true, message: "Icon copied successfully" });
    }
    return NextResponse.json({ success: false, message: "Source logo not found" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
