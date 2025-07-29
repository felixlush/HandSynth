import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import Piano from './ui/piano'
import GestureSelect from './ui/gestureselect';
import * as Tone from "tone";
import ChordMappingForm from './ui/chordmappingform';
import { ChordMappings } from '../lib/types'

interface ChordMappingProps {
    synthRef: React.RefObject<Tone.PolySynth<Tone.Synth> | null>;
    setChordMappings: (mapping: ChordMappings) => void;
    chordMappings: ChordMappings;
}

const initalMappings = [
    {gesture: "palm", chord: ["D4", "F4", "A4"]},
    {gesture: "peace", chord: ["E4", "G4", "B4"]},
    {gesture: "point", chord: ["F4", "A4", "C4"]},
    {gesture: "three-fingers", chord: ["G4", "B4", "D4"]}
]


const ChordMapping = ({synthRef, setChordMappings, chordMappings}: ChordMappingProps) => {

    const [selectedGesture, setSelectedGesture] = useState<string>("palm")

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Chord Mappings</CardTitle>
                </CardHeader>
                <CardContent className='flex space-x-5'>
                        <GestureSelect onGestureChange={setSelectedGesture} selectedGesture={selectedGesture}/>
                        <ChordMappingForm setChordMappings={setChordMappings} gesture={selectedGesture} chordMappings={chordMappings}/>
                        <Piano synthRef={synthRef} setChordMappings={setChordMappings} chordMappings={chordMappings} currentGesture={selectedGesture}/>
                </CardContent>
            </Card>
        </div>
    )
}

export default ChordMapping