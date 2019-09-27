const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

// load static html/css/js for testing
app.use("/assets", express.static("assets"));

app.use(express.static(path.join(__dirname, "static")));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/dashboard", function(req, res) {
  res.sendFile(path.join(__dirname + "/dashboard.html"));
});

app.get("/video/:video", function(req, res) {
  const path = `assets/${req.params.video}.mp4`;
  console.log(`Loading video ${req.params.video}.mp4`);
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunkSize = end - start + 1;
    const file = fs.createReadStream(path, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4"
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4"
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
});

const videoSequence = ["iphone", "spiderman", "transformer"];
let videoNum = 2;
app.get("/next", (req, res) => {
  // increment the videoNum
  if (videoNum === videoSequence.length - 1) {
    videoNum = -1;
  }
  videoNum += 1;

  res.send(videoSequence[videoNum]);
});

app.listen(3000, function() {
  console.log("Listening on port 3000!");
});
