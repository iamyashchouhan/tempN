from flask import Flask, request, jsonify
import yt_dlp

app = Flask(__name__)

@app.route('/download', methods=['GET'])
def get_video_urls():
    video_url = request.args.get('url')

    if not video_url:
        return jsonify({"error": "Missing 'url' parameter."})

    ydl_opts = {
        'quiet': True,
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            formats = info.get('formats', [])

            if not formats:
                return jsonify({"error": "No formats found."})

            # Extract URLs and corresponding quality information
            video_urls = [
                {
                    'format_id': f.get('format_id'),
                    'ext': f.get('ext'),
                    'resolution': f"{f.get('width')}x{f.get('height')}" if f.get('width') and f.get('height') else 'audio only',
                    'url': f.get('url')
                } 
                for f in formats if 'url' in f
            ]

            if not video_urls:
                return jsonify({"error": "No video URLs found."})

            return jsonify(video_urls)
    except Exception as e:
        return jsonify({"error": str(e)})
