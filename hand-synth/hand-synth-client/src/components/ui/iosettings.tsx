import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { RadioGroup, RadioGroupItem } from './radio-group'
import { Label } from './label'
import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectValue } from './select'
import { SelectTrigger } from '@radix-ui/react-select'

interface midiSelectProps {
    detectedGesture: string;
    setUseMidi: (value: boolean) => void;
    useMidi: boolean;
    setMidiOutput: (midiOutputs: MIDIOutput) => void;
    midiOutputs: MIDIOutput[] | null
    audioOutputs: MediaDeviceInfo[]
    setSelectedAudioOutput: (selectedAudioOutput: MediaDeviceInfo) => void
    webCams: MediaDeviceInfo[]
    setSelectedWebCam: (selectedAudioOutput: MediaDeviceInfo) => void
}

const IoSettings = ({detectedGesture, setUseMidi, useMidi, setMidiOutput, midiOutputs, audioOutputs, setSelectedAudioOutput, webCams, setSelectedWebCam}: midiSelectProps) => {
    return (
        <div>
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>I/O Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-10">

                    <div className='flex-col space-y-4'>
                        <h3 className="font-medium text-left">Midi Output</h3>
                        <RadioGroup
                        value={useMidi ? "midi" : "tonejs"}
                        onValueChange={(value) => setUseMidi(value === "midi")}
                        className="flex-col space-x-4"
                        >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="tonejs" id="tonejs" />
                            <Label htmlFor="tonejs">Tone.js Synth</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="midi" id="midi" />
                            <Label htmlFor="midi">External MIDI</Label>
                        </div>
                        </RadioGroup>
                    </div>

                    {useMidi && (
                        <div className='flex-col space-y-4'>
                            <h3 className="font-medium text-left">Midi Output</h3>
                            <Select>
                                <SelectTrigger className="w-[180px] border border-accent-foreground rounded-md">
                                    <SelectValue className='text-left' placeholder="Select Midi Output"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {midiOutputs?.map((output) => (
                                        <SelectItem key={output.id} value={output.id}>
                                            {output.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className='flex-col space-y-4'>
                        <h3 className="font-medium text-left">Webcam</h3>
                        <Select>
                            <SelectTrigger className="w-[180px] border border-accent-foreground rounded-md">
                                <SelectValue className='text-left' placeholder="Select Webcam"/>
                            </SelectTrigger>
                            <SelectContent>
                                    {webCams?.map((webcam) => (
                                        <SelectItem key={webcam.deviceId} value={webcam.deviceId}>
                                            {webcam.label}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='flex-col space-y-4'>
                        <h3 className="font-medium text-left">Audio Output</h3>
                        <Select>
                                <SelectTrigger className="w-[180px] border border-accent-foreground rounded-md">
                                    <SelectValue className='text-left' placeholder="Select Audio Output"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {audioOutputs?.map((output) => (
                                        <SelectItem key={output.deviceId} value={output.deviceId}>
                                            {output.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                    </div>

                    <div className="text-center">
                        <h2>Detected Gesture: {detectedGesture}</h2>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default IoSettings