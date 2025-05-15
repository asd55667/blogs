<!--
updated: 2020年6月17日 15:36
tags: [python, ffmpeg, m4s, mp4, automation]
-->

# 手机缓存的B站转MP4

> 手机下载的盗版视频被和谐了 导出B站手机m4s视频存到电脑上

```python
# cmd chcp to check cmd encode
# encode No
# 65001 utf-8
# 20936 : GB2312
# 936 : GBK
# 437 : en-us

# D:\m4s转换\ffmpeg\bin\ffmpeg -i video.m4s -i audio.m4s -c:v copy -strict experimental output.mp4

import sys, os, json
from pathlib import Path

def m4s2mp4(root, out_dir):
    root = Path(root)
    out_dir = Path(out_dir)

    for video_folder in root.iterdir():
        for video_wrapper in video_folder.iterdir():
            try:
                # parse json file to get video information
                config = video_wrapper / 'entry.json'
                if config.exists():
                    # may face some encoding problem and then covnert format mannually
                    cfg = json.load(open(config, 'rb'))
                    title = cfg['title']
                    title = ''.join(title.split())
                    part = cfg['page_data']['part']
                    part = '-'.join(part.split('丨'))
                    size = int(cfg['total_bytes'] / 2 ** 20)
                    sub_dir = out_dir / video_folder.name
                    os.makedirs(sub_dir, exist_ok=True)
                    filename = f"{part}-{title}-{size}m"
                    output = sub_dir / filename
                    
                for video in video_wrapper.iterdir():
                    if not os.path.exists(f"{output}.mp4") and video.is_dir():
                        print(video_wrapper)
                        os.system(f"D:\\m4s\\ffmpeg\\bin\\ffmpeg -i {video / 'video.m4s'} -i {video / 'audio.m4s'} -c:v copy -strict experimental {output}.mp4")
            except:
                print(video_wrapper)

if __name__ == "__main__":
    root = "D:/m4s_video"
    out_dir = "D:/mp4_video"
    m4s2mp4(root, out_dir)
```
