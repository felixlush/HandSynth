import React, { useEffect, useRef, forwardRef } from "react"
import Webcam from "react-webcam"
import { Card, CardContent } from "@/components/ui/card"
import io from "socket.io-client"


const socket = io("http://localhost:5000")

interface CameraProps {
  
}

const videoConstraints = {
    width: 640,           
    height: 480,
    facingMode: "environment"
}

const Camera = forwardRef<HTMLVideoElement, CameraProps>((_, ref) => {
    const webcamRef = useRef<Webcam>(null)

    useEffect(() => {
        const webcamEl = webcamRef.current
        if (!webcamEl) return

        let intervalId: number

        const sendFrame = () => {
        if (!webcamEl) return
        const dataUrl = webcamEl.getScreenshot({
            width: 320,
            height: 320
        })
        if (dataUrl) {
            fetch(dataUrl)
            .then(res => res.blob())
            .then(blob => {
                socket.emit("frame", blob)
            })
            .catch(console.error)
        }
        }

        const startWhenReady = () => {
        const video = webcamEl.video as HTMLVideoElement
        if (video && video.readyState >= 2) {
            // Start emitting ~10 FPS
            intervalId = window.setInterval(sendFrame, 100)
        } else {
            video.addEventListener("loadeddata", startWhenReady, { once: true })
        }
        }
        startWhenReady()

        return () => {
        clearInterval(intervalId)
        }
}, [])


return (
        <div className="flex justify-center">
        <Card className="overflow-hidden rounded-xl border">
            <CardContent className="p-0">
            <Webcam
                ref={webcamRef}
                audio={false}
                mirrored={false}               
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
                }}
            />
            </CardContent>
        </Card>
        <video
            ref={ref as any}
            style={{ display: "none" }}
            autoPlay
            muted
        />
        </div>
    )
})

export default Camera
