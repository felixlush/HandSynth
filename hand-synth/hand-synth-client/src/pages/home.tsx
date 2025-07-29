import { useEffect, useState, useRef } from "react";
import * as Tone from "tone";
import Camera from "../components/ui/camera";
import IoSettings from "../components/ui/iosettings";
import io from "socket.io-client";
import ChordMapping from "../components/chordmapping";
import { ChordMappings } from '../lib/types'
import EffectsUnit from "@/components/ui/effectsunit";


const socket = io("http://localhost:5000");

// Updated chord mappings (default values)
const initalMappings: ChordMappings = [
    {gesture: "palm", notes: ["D4", "F4", "A4"]},
    {gesture: "peace", notes: ["E4", "G4", "B4"]},
    {gesture: "point", notes: ["F4", "A4", "C4"]},
    {gesture: "three-fingers", notes: ["G4", "B4", "D4"]}
]

const Home = () => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [detectedGesture, setDetectedGesture] = useState<string>("None");
    const [activeGesture, setActiveGesture] = useState<string | null>(null);
    const currentGestureRef = useRef<string | null>(null)

    const [chordMappings, setChordMappings] = useState<ChordMappings>(initalMappings);
    const synthRef = useRef<Tone.PolySynth<Tone.Synth> | null>(null);

    const [midiOutputs, setMidiOutputs] = useState<MIDIOutput[] | null>(null)
    const [midiOutput, setMidiOutput] = useState<MIDIOutput | null>(null);
    const [useMidi, setUseMidi] = useState<boolean>(false);

    const [audioOutputs, setAudioOutputs] = useState<MediaDeviceInfo[]>([]);
    const [selectedAudioOutput, setSelectedAudioOutput] = useState<MediaDeviceInfo>();

    const [webCams, setWebCams] = useState<MediaDeviceInfo[]>([]); 
    const [selectedWebCam, setSelectedWebCam] = useState<MediaDeviceInfo>();
    
    const [cropDataUrl, setCropDataUrl] = useState<string|null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || !cropDataUrl) return
        const ctx = canvas.getContext("2d")!
        const img = new Image()
        img.src = cropDataUrl
        img.onload = () => {
            // match canvas size to image
            canvas.width = img.width
            canvas.height = img.height
            // draw the palm crop
            ctx.clearRect(0, 0, img.width, img.height)
            ctx.drawImage(img, 0, 0)

        }
    }, [cropDataUrl])


    //Get Audio and Webcam I/Os
    useEffect(() => {
        const fetchIOs = async () => {
            try {
                // Request audio permission so that device labels become available.
                await navigator.mediaDevices.getUserMedia({ audio: true });
                const devices = await navigator.mediaDevices.enumerateDevices();

                const webcams = devices.filter(device => device.kind === 'videoinput');
                setWebCams(webcams)
                if (webCams.length > 0) {
                    setSelectedWebCam(webCams[0])
                }

                const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
                setAudioOutputs(audioOutputs); 
                if (audioOutputs.length > 0) {
                    setSelectedAudioOutput(audioOutputs[0]);
                }
            } catch (error) {
            console.error('Error fetching audio output devices:', error);
            }
        };
    
        fetchIOs();
    }, []);
    

    // Initialize the synth only once
    useEffect(() => {
        const limiter = new Tone.Limiter(-1).toDestination();
        const vol = new Tone.Volume(-12).connect(limiter);
        const chorus = new Tone.Chorus(4, 1, 0.5).connect(vol).start();
        const poly = new Tone.PolySynth(Tone.Synth, {
            envelope: { attack: 1, decay: 0.2, sustain: 0.8, release: 1 },
        }).connect(chorus);

        synthRef.current = poly;
        Tone.start();
    }, []);

    // Request MIDI access on the client side
    useEffect(() => {
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess().then((midiAccess) => {
            const outputs = Array.from(midiAccess.outputs.values());
            if (outputs && outputs[2]) {
                setMidiOutputs(outputs)
                setMidiOutput(outputs[2])
            }
            });
        }
    }, []);

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        // Create an off-screen canvas for capturing full-size frames
        const offscreenCanvas = document.createElement('canvas')
        const offscreenCtx = offscreenCanvas.getContext('2d')!

        let captureInterval: number

        const startCapturing = () => {
        // Make sure video has loaded metadata (width/height)
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            requestAnimationFrame(startCapturing)
            return
        }

        // Set the offscreen canvas size once based on video resolution
        offscreenCanvas.width = video.videoWidth
        offscreenCanvas.height = video.videoHeight

        // Now, every 100ms, draw the video onto canvas and send JPEG blob
        captureInterval = window.setInterval(() => {
                offscreenCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)

                offscreenCanvas.toBlob(
                (blob) => {
                    if (blob) {
                    // Send this Blob over Socket.IO as 'frame'
                    socket.emit('frame', blob)
                    }
                },
                'image/jpeg',
                0.7 // quality (0–1)
                )
            }, 100) // 100ms → ~10 FPS
        }

        // Once the video metadata is loaded, kick off capturing
        if (video.readyState >= 2) {
            startCapturing()
        } else {
            video.addEventListener('loadedmetadata', startCapturing)
        }

        // Cleanup when component unmounts
        return () => {
            clearInterval(captureInterval)
            video.removeEventListener('loadedmetadata', startCapturing)
            try {
                // Stop camera stream tracks
                const tracks = (video.srcObject as MediaStream)?.getTracks() || []
                tracks.forEach((t) => t.stop())
            } catch {}
        }
    }, [videoRef])

    // Listen for incoming events from the server
    useEffect(() => {
        const handler = (data: {
            gesture: string
            cropDataUrl?: string
        }) => {
            const oldG = currentGestureRef.current

            // 1) NO‐HAND: release and clear everything
            if (data.gesture === "no-hand") {
            // release old notes
            if (oldG) {
                const oldMap = chordMappings.find(m => m.gesture === oldG)
                if (oldMap) {
                if (useMidi && midiOutput) {
                    oldMap.notes.forEach(n => {
                    const m = Tone.Frequency(n).toMidi()
                    midiOutput.send([0x80, m, 0])
                    })
                } else {
                    synthRef.current?.releaseAll()
                }
                }
            }

            currentGestureRef.current = null
            setDetectedGesture("no-hand")
            setCropDataUrl(null)
            return
            }

            if (oldG) {
            const oldMap = chordMappings.find(m => m.gesture === oldG)
            if (oldMap) {
                if (useMidi && midiOutput) {
                oldMap.notes.forEach(n => {
                    const m = Tone.Frequency(n).toMidi()
                    midiOutput.send([0x80, m, 0])
                })
                } else {
                synthRef.current?.triggerRelease(oldMap.notes)
                }
            }
            }

            const newMap = chordMappings.find(m => m.gesture === data.gesture)
            if (newMap) {
            if (useMidi && midiOutput) {
                newMap.notes.forEach(n => {
                const m = Tone.Frequency(n).toMidi()
                midiOutput.send([0x90, m, 127])
                })
            } else {
                synthRef.current?.triggerAttack(newMap.notes)
            }
            }

            setDetectedGesture(data.gesture)
            currentGestureRef.current = data.gesture
        }

        socket.on("gesture", handler)
        return () => { socket.off("gesture", handler) }
    }, [chordMappings, useMidi, midiOutput])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
            <div className="flex space-x-5 items-center">
                <IoSettings 
                    useMidi = {useMidi} 
                    setUseMidi={setUseMidi} 
                    detectedGesture={detectedGesture} 
                    midiOutputs={midiOutputs} 
                    setMidiOutput={setMidiOutput}
                    audioOutputs = {audioOutputs}
                    setSelectedAudioOutput = {setSelectedAudioOutput}
                    setSelectedWebCam = {setSelectedWebCam}
                    webCams = {webCams}
                />
                <Camera/>
            </div>
        <div className="flex space-x-5">
            <ChordMapping chordMappings={chordMappings} synthRef={synthRef} setChordMappings={setChordMappings}/>
        </div>
        </div>
    );
}

export default Home