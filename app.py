
from sre_constants import SUCCESS
from statistics import quantiles
import requests
import youtube_dl
from os import getenv, system
from flask import Flask, request, render_template, make_response, url_for
from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_subclip
from random import randint

app = Flask(__name__)

app.config.update(
    SECRET_KEY=getenv("SECRET")
)

def catch_exceptions(action):
    def wrap_action(*args, **kwargs):
        try:
            result  = action(*args, **kwargs)
            return result
        except Exception as e:
            print(e.with_traceback())
            return {}, 500         
    return wrap_action

@catch_exceptions
@app.route('/')
def index():
	return render_template('index.html', title='Download Youtube')

@catch_exceptions
@app.route('/submit-video-url')
def submit_url():
    video_url = request.args.get('video-url')
    ytl = youtube_dl.YoutubeDL()
    with ytl:
        video_info = ytl.extract_info(video_url, download=False)
    return video_info

@catch_exceptions
@app.route('/download-video')
def download_video():
    quality = request.args.get("video-quality")
    video_url = request.args.get("video-url")
    start_time = int(request.args.get("start-time"))
    end_time = int(request.args.get("end-time"))
    
    ytl = youtube_dl.YoutubeDL()
    with ytl:
        video_info = ytl.extract_info(video_url, download=False)
    download_info = [ vi for vi in video_info['formats'] if vi['format_id'] == quality]
    print()
    video_download_url = download_info[0]['url']
    headers = {'User-Agent': 'Mozilla/5.0'} 
    res = requests.get(video_download_url, headers=headers)
    video = res.content
    filename = f'{video_info["title"].encode("utf-8", "ignore").decoe("utf-8")}.mp4'

    with open(filename, 'wb') as f:
        f.write(video)

    ffmpeg_extract_subclip(filename, start_time, end_time, targetname=f'cropped-{filename}')
    
    with open(f'cropped-{filename}', 'rb') as f:
        video = f.read()
    response = make_response(video)
    response.headers.set('Content-Type', 'video/mp4')
    response.headers.set('Content-Disposition', 'attachment', filename=filename)
    return response
    
