# coding: utf-8

import sys
import os
import base64
import cStringIO

sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/lib')

from PIL import Image, ImageDraw, ImageFont

def image_text(event, context):
    
    text_canvas = Image.new('RGB', (400, 400), (255, 255, 255))
    draw = ImageDraw.Draw(text_canvas)

    # フォントの種類とサイズを指定

    font = ImageFont.truetype('font.otf', 30)

    # テキストを書き込み。引数は順に、書き込み座標（tuple）、テキスト、テキストのフォント、テキストのカラー
    draw.text((10, 10), u'#かまってほしい\n#メンヘラです', font=font, fill='#000')

    # 保存
    buffer = cStringIO.StringIO()

    text_canvas.save(buffer, 'PNG')
    img_str = base64.b64encode(buffer.getvalue())
    print(img_str)

    res = {
      "statusCode": 200,
      "headers": {
        'Content-type': 'image/png'
      },
      "body": img_str
    }
    return res



print(image_text('',''))


