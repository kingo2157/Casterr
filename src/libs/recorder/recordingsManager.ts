import FFmpeg from "./ffmpeg";
import PathHelper from "./../helpers/pathHelper";
import * as fs from "fs";
import * as path from "path";

export interface Recording {
  videoPath: string;
  thumbPath: string | undefined;
  fileSize: number | undefined;
  fps: string | undefined;
  duration: number | undefined;
}

export default class RecordingsManager {
  private static ffprobe = new FFmpeg("ffprobe");

  public static async add(videoPath: string) {
    let recording = {} as Recording;

    recording.videoPath = videoPath;
    recording.thumbPath = videoPath + "/thumb";
    recording.fileSize = 69;

    // Get video info from ffprobe
    this.ffprobe.run(
      `-v error -select_streams v:0 -show_entries format=duration:stream=avg_frame_rate -of default=noprint_wrappers=1 "${videoPath}"`,
      {
        stdoutCallback: (out: string) => {
          // Loop over each line in response from ffprobe, removing empty lines
          out.toLowerCase().split(/\r\n|\r|\n/g).filter(l => l !== "").forEach((l: string) => {
            // Get framerate
            if (l.includes("avg_frame_rate=")) {
              // Framerate is returned like: '60/1', '30/1', '30000/1001', etc
              // We need to do the math to get the framerate to avoid
              // returning something like 30000, so split the response by the slash
              let fps = l.replace("avg_frame_rate=", "").split("/");

              // If fps array has more than 1 items, then divide
              // the first by the second and round to nearest whole number
              if (fps.length > 1) {
                recording.fps = (parseInt(fps[0], 10) / parseInt(fps[1], 10)).toFixed(0);
              }
            }

            // Get duration (in seconds)
            if (l.includes("duration=")) {
              recording.duration = parseFloat(l.replace("duration=", ""));
            }
          });

          // Append recording to PastRecordings file
          fs.appendFile(path.join(PathHelper.settingsFolderPath, `PastRecordings.json`), JSON.stringify(recording, null, 2), (err: any) => {
            if (err) throw err;
          });
        }
      }
    );
  }
}
