const mediaType = (item) => {
  let mediaItem = document.createElement("div");
  mediaItem.className = "media-item";

  let mediaTitle = document.createElement("label");
  mediaTitle.innerText = item.title;

  let media = "";

  if (item.type === "video") {
    media = document.createElement("video");
    media.muted = true;
    media.autoplay = false;
    media.setAttribute("webkit-playsinline", true);
    media.setAttribute("playsinline", true);
    media.preload = "metadata";
    media.setAttribute("data-src", item.src);
  } else if (item.type === "image" || item.type === "survey") {
    media = document.createElement("img");
    media.src = item.src;
    media.onerror = () => {
      media.src =
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjkiIGhlaWdodD0iMjUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CgogPGc+CiAgPHRpdGxlPmJhY2tncm91bmQ8L3RpdGxlPgogIDxyZWN0IGZpbGw9Im5vbmUiIGlkPSJjYW52YXNfYmFja2dyb3VuZCIgaGVpZ2h0PSI0MDIiIHdpZHRoPSI1ODIiIHk9Ii0xIiB4PSItMSIvPgogPC9nPgogPGc+CiAgPHRpdGxlPkxheWVyIDE8L3RpdGxlPgogIDxwYXRoIGlkPSJzdmdfMiIgZmlsbD0iI2ZmZmZmZiIgZD0ibTI2LjQ3NSwyLjk1Yy0yLjg4OSwtMi44ODkgLTcuNDAxLC0zLjE0NiAtMTAuNTksLTAuNzljMC4yNzcsMC40NTQgMC41NjMsMC45MDQgMC44MywxLjM2M2MwLjUyMywwLjg2OCAxLjAxMiwxLjc1MiAxLjQ5MywyLjYzOWMwLjQ5MywwLjg4MiAwLjk2OCwxLjc3MiAxLjQyNywyLjY2OWwwLjU2MywxLjA5OGwtMS4xODgsMC42NjhjLTIuMjQyLDEuMjYxIC00LjUyOSwyLjQzNSAtNi44MzgsMy41NjNjMC42MzksMi4xMTEgMS4yMzIsNC4yMzkgMS43NTEsNi4zOTFjMC4xNjksMC42MzkgMC4yOTgsMS4yOTEgMC40NDMsMS45MzZjMC4xNDMsMC42NDcgMC4yODksMS4yOTMgMC40MDYsMS45NDljMC4wOSwwLjQ2NCAwLjE3MSwwLjkzMiAwLjI1MywxLjM5OGMwLjI0OCwtMC4xOTYgMC40OTIsLTAuNDAzIDAuNzIxLC0wLjYzM2wxMC43MjksLTEwLjcyOWMzLjE4MSwtMy4xODEgMy4xODEsLTguMzQgMCwtMTEuNTIyeiIvPgogIDxwYXRoIGlkPSJzdmdfMyIgZmlsbD0iI2ZmZmZmZiIgZD0ibTEyLjY5NywyMy4wNDNjLTAuMjcxLC0wLjYwNCAtMC41NTksLTEuMjAyIC0wLjgwNywtMS44MTRjLTEuMDQ2LC0yLjQyOSAtMi4wMDcsLTQuODg3IC0yLjg4MywtNy4zNzJsLTAuNDE2LC0xLjE4MmwxLjE1NiwtMC42MDRjMi4yODUsLTEuMTkzIDQuNjA1LC0yLjMxNSA2Ljk1NSwtMy4zNzhjLTAuMiwtMC41MjQgLTAuNDA3LC0xLjA0NSAtMC41OTcsLTEuNTc1Yy0wLjM1MiwtMC45NDYgLTAuNjk3LC0xLjg5NiAtMS4wMDcsLTIuODYxYy0wLjEyNCwtMC4zNjUgLTAuMjMxLC0wLjczNyAtMC4zNDksLTEuMTA0bC0wLjI0MywwLjI0M2wtMC41NzIsLTAuNDQ2Yy0zLjE4MiwtMy4xODIgLTguNDY4LC0zLjE4MiAtMTEuNjUsMGMtMy4xODMsMy4xODIgLTMuMTE5LDguMzQxIDAuMDYzLDExLjUyMmwxMC43OTIsMTAuNzI5YzAuMjgyLDAuMjgxIDAuNjAzLDAuNTI5IDAuOTYyLDAuNzZjLTAuMTg4LC0wLjM3MSAtMC4zNzgsLTAuNzQyIC0wLjU2LC0xLjExNWMtMC4zLC0wLjU5NSAtMC41NjksLTEuMiAtMC44NDQsLTEuODAzeiIvPgogPC9nPgo8L3N2Zz4=";
    };
  } else if (item.type === "twitter-embed") {

    media = document.createElement("div");
    media.className = "twitter-embed";
    media.innerHTML = item.src;

  } else if (item.type === "youtube-embed") {
    media = document.createElement("div");
    media.className = "youtube-embed";
    let embeded = document.createElement("div");
    embeded.className = "embeded";
    embeded.innerHTML = item.src;
    media.appendChild(embeded);
  }

  mediaItem.appendChild(media);

  if (item.type != "twitter-embed") {
    mediaItem.appendChild(mediaTitle);
  }

  return mediaItem;
};

export default mediaType;
