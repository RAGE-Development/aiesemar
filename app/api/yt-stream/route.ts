import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing or invalid video ID" }, { status: 400 });
    }

    // yt-dlp command to get best video+audio direct URL
    const ytDlpArgs = [
      "-f", "best[ext=mp4][vcodec^=avc1][acodec^=mp4a]/best",
      "-g",
      `https://www.youtube.com/watch?v=${id}`
    ];

    const ytDlp = spawn("yt-dlp", ytDlpArgs);

    let output = "";
    let error = "";

    ytDlp.stdout.on("data", (data) => {
      output += data.toString();
    });

    ytDlp.stderr.on("data", (data) => {
      error += data.toString();
    });

    const exitCode: number = await new Promise((resolve) => {
      ytDlp.on("close", resolve);
    });

    if (exitCode !== 0) {
      return NextResponse.json({ error: error || "yt-dlp failed" }, { status: 500 });
    }

    // The output is the direct video URL (may be multiple lines, take the first)
    const url = output.split("\n").filter(Boolean)[0];

    if (!url) {
      return NextResponse.json({ error: "No video URL found" }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}
