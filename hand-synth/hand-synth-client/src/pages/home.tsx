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
    {gesture: "fist", notes: ["C4", "E4", "G4"]},
    {gesture: "palm", notes: ["D4", "F4", "A4"]},
    {gesture: "peace", notes: ["E4", "G4", "B4"]},
    {gesture: "point", notes: ["F4", "A4", "C4"]},
    {gesture: "thumbs-up", notes: ["G4", "B4", "D4"]}
]

const Home = () => {
    const [detectedGesture, setDetectedGesture] = useState<string>("None");
    const [activeGesture, setActiveGesture] = useState<string | null>(null);
    const gestureTimeoutRef = useRef<number | null>(null);

    const [chordMappings, setChordMappings] = useState<ChordMappings>(initalMappings);
    const synthRef = useRef<Tone.PolySynth<Tone.Synth> | null>(null);

    const [midiOutputs, setMidiOutputs] = useState<MIDIOutput[] | null>(null)
    const [midiOutput, setMidiOutput] = useState<MIDIOutput | null>(null);
    const [useMidi, setUseMidi] = useState<boolean>(false);

    const [audioOutputs, setAudioOutputs] = useState<MediaDeviceInfo[]>([]);
    const [selectedAudioOutput, setSelectedAudioOutput] = useState<MediaDeviceInfo>();

    const [webCams, setWebCams] = useState<MediaDeviceInfo[]>([]); 
    const [selectedWebCam, setSelectedWebCam] = useState<MediaDeviceInfo>();
    
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
        const chorus = new Tone.Chorus(4, 1.0, 0.5).toDestination().start();
        const polySynth = new Tone.PolySynth(Tone.Synth, {
            envelope: {
            attack: 0,
            decay: 0.2,
            sustain: 1.0,
            release: 2.0,
            },
        }).connect(chorus);
        synthRef.current = polySynth
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

    // Listen for incoming events from the server
    useEffect(() => {
        const handleGesture = (data: { gesture: string }) => {
            const newGesture = data.gesture;
            setDetectedGesture(data.gesture)

            const chordMapping = chordMappings.find(mapping => mapping.gesture === newGesture);
            const chordMappingNotes = chordMapping ? chordMapping.notes : [];
            
            //Set attack on either midi or internal synth
            if (useMidi && midiOutput && chordMappingNotes) {
                chordMappingNotes.forEach((note) => {
                    const midiNote = Tone.Frequency(note).toMidi();
                    midiOutput.send([0x90, midiNote, 127])
                })
                console.log("sent chord to midi")
            }

            if (chordMappingNotes && synthRef.current && !useMidi){
                synthRef.current.triggerAttack(chordMappingNotes)
                console.log("sent chord to Tone")
            }
            setActiveGesture(newGesture)

            if (activeGesture && useMidi && midiOutput && chordMappingNotes) {
                chordMappingNotes.forEach((note) => {
                    const midiNote = Tone.Frequency(note).toMidi()
                    midiOutput.send([0x80, midiNote, 0])
                }) 
            }

            if (activeGesture && chordMappingNotes && synthRef.current) {
                synthRef.current.triggerRelease(chordMappingNotes);
            }
        };

        socket.on("gesture", handleGesture);
        socket.on("effect_data", (data) => {
            // Handle effect data here if needed
        });

        return () => {
            socket.off("gesture", handleGesture);
            socket.off("effect_data");
        };
    }, [activeGesture, useMidi, midiOutput, chordMappings]);

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
                <Camera />
            </div>
        <div className="flex space-x-5">
            <ChordMapping chordMappings={chordMappings} synthRef={synthRef} setChordMappings={setChordMappings}/>
            <EffectsUnit/>
        </div>
        </div>
    );
}

export default Home