function changeVideo(videoId, title, description) {
    document.getElementById('main-player').src = "https://www.youtube.com/embed/" + videoId;
    document.getElementById('video-title').innerText = title;
    document.getElementById('video-desc').innerText = description;
}
