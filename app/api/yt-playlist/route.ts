import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing or invalid playlist URL" }, { status: 400 });
    }

    // yt-dlp command to get playlist info as JSON
    const ytDlpArgs = [
      "--flat-playlist",
      "--dump-json",
      url
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

    // Each line is a JSON object for a video
    const playlist = output
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    // Each item: { id, title }
    return NextResponse.json({ playlist });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}
