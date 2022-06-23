var videoInfo = document.getElementById("video-info");
var urlForm = document.getElementById("video-url-form");
var downloadForm = document.getElementById("download-form");
var videoUrl = document.getElementById("video-url");
var downloadButton = document.getElementById("download-video");
var selectQuality = document.getElementById("video-quality");
var startTime = document.getElementById("start-time");
var endTime = document.getElementById("end-time");

const formatNotes = ["144p", "240p", "360p", "480p", "720p", "1080p"];

function ToggleUrlForm(showVideoInfo = false){
    
    if (showVideoInfo){
        urlForm.className.replace("d-flex", "d-none");
        videoInfo.style.display = "block !important";
        return;
    }

    if (urlForm.className.includes("d-flex")){
        urlForm.className = urlForm.className.replace("d-flex", "d-none");
        videoInfo.className = videoInfo.className.replace("d-none", "d-block");
    }
    else{
        urlForm.className = urlForm.className.replace("d-none", "d-flex");
        videoInfo.className = videoInfo.className.replace("d-block", "d-none");
    }
}

function HandleVideoData(){
    let response = JSON.parse(this.responseText)
    console.log(response);
    LoadVideoInfo(response);
}

function LoadVideoInfo(videoData){
    var videoInput = videoInfo.querySelector("input[name='video-url']")
    var title = videoInfo.querySelector(".title");
    var thumbnail = videoInfo.querySelector(".thumb"); 

    CreateQualityOptions(videoData);
    
    startTime.value = 0;
    startTime.disabled = false;
    startTime.max = videoData.duration - 3;
    endTime.value = videoData.duration;
    endTime.max = videoData.duration;
    endTime.disabled = false;

    videoInput.value = videoData.webpage_url;
    
    title.innerText = "";
    title.innerText = videoData.title;
    title.title = videoData.webpage_url;
    title.href = videoData.webpage_url;
    
    localStorage.setItem("video-url", videoUrl.value)
    thumbnail.src = videoData.thumbnail;   
    ToggleUrlForm();
}

function CreateQualityOptions(videoData){
    let videoOptions = videoData.formats.filter(f => formatNotes.includes(f.format_note) && f.ext === "mp4");
    videoOptions = [ ...videoOptions.reduce((map, value) => {
        let lastValue = map[value.format_note] || { filesize: -1 };
        map.set(value.format_note, (value.filesize || 0) > lastValue.filesize ? value : lastValue);  
        return map;
    }, new Map()).values() ]; 

    console.log(videoOptions);
    selectQuality.innerHTML = videoOptions.map(f => {
        return `<option value=${f.format_id} data-url=${f.url}>${f.format_note}</option>`
    }).join('\n');
    selectQuality.disabled = false;
}

urlForm.onsubmit = (e) => {
    e.preventDefault();
    let url = urlForm.action + `?video-url=${videoUrl.value}`;
    console.log(url);
    let xhr = new XMLHttpRequest();
    xhr.addEventListener("load", HandleVideoData);
    xhr.open("GET", url);
    xhr.send();
    return false;
}

// downloadForm.onsubmit = (e) => {
//     e.preventDefault();
//     let url = downloadForm.action;
//     let payload = {}
//     payload['video-quality'] = selectQuality.value
//     payload['video-url'] = localStorage.getItem("video-url")
//     payload['start-time'] = startTime.value
//     payload['end-time'] = endTime.value 

//     console.log(url);
//     let xhr = new XMLHttpRequest();
//     xhr.open('POST', url, true);
//     xhr.responseType = "blob";
//     xhr.onreadystatechange = function() {
//         if(this.readyState == 4 && this.status == 200) {
//             let blob = this.response;
//             var blobUrl = URL.createObjectURL(blob);
//             var link = document.createElement("a");
//             link.href = blobUrl;
//             link.display = "none";
//             link.target = "blank";
//             link.download = "video.mp4";
//             //document.body.appendChild(link);
//             link.click();
//         }
//     }
//     xhr.setRequestHeader('Content-type', 'application/json');
//     xhr.send(JSON.stringify(payload));
// }

selectQuality.onchange = (e) => {
    let optionIndex = selectQuality.selectedIndex;
    let option = selectQuality[optionIndex];

    // downloadButton.href = option.dataset.url;
}

