import os

def convert_audio(input_file, output_file, output_format):
    cmd = f'ffmpeg -i {input_file} -f {output_format} {output_file}'
    os.system(cmd)
