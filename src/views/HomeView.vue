<template>
  <h3>Upload a video to transcode to mp4 (x264) and play!</h3>
  <video id="output-video" controls></video><br />
  <input type="file" id="uploader" />
  <p id="message"></p>
  <img id="output-image" />
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  name: 'App',
  setup() {
    const init = () => {
      const { fetchFile } = FFmpegUtil
      const { FFmpeg } = FFmpegWASM
      let ffmpeg = null

      const transcode = async ({ target: { files } }) => {
        const message = document.getElementById('message')
        if (ffmpeg === null) {
          ffmpeg = new FFmpeg()
          ffmpeg.on('log', ({ message }) => {
            console.log(message)
          })
          ffmpeg.on('progress', ({ progress, time }) => {
            message.innerHTML = `${progress * 100} %, time: ${time / 1000000} s`
          })
          await ffmpeg.load({
            coreURL: '/assets/core/package/dist/umd/ffmpeg-core.js',
          })
        }
        const { name } = files[0]
        await ffmpeg.writeFile(name, await fetchFile(files[0]))
        message.innerHTML = 'Start transcoding'
        console.time('exec')
        await ffmpeg.exec([
          '-i',
          name,
          '-ss',
          '00:00:00', // 开始时间
          '-vframes',
          '1', // 输出帧数
          '-f',
          'image2', // 输出格式
          'output.jpg',
        ])
        const imageData = await ffmpeg.readFile('output.jpg')
        const image = URL.createObjectURL(
          new Blob([imageData.buffer], { type: 'image/jpeg' })
        )
        const img = document.getElementById('output-image')
        img.src = image

        await ffmpeg.exec([
          '-i',
          name,
          '-ss',
          '00:00:10', // 开始时间
          '-t',
          '00:00:10', // 持续时间
          '-b:v',
          '600k',
          '-b:a',
          '128k', // 音频比特率
          '-vf',
          'scale=-1:360',
          'output.mp4',
        ])
        console.timeEnd('exec')
        message.innerHTML = 'Complete transcoding'
        const data = await ffmpeg.readFile('output.mp4')

        const video = document.getElementById('output-video')
        video.src = URL.createObjectURL(
          new Blob([data.buffer], { type: 'video/mp4' })
        )
      }
      const elm = document.getElementById('uploader')
      elm.addEventListener('change', transcode)
    }
    onMounted(() => {
      init()
    })
    return {}
  },
})
</script>
