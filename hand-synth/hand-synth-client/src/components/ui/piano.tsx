import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import * as Tone from "tone";
import { Button } from './button';
import { ChordMappings } from '@/lib/types';

interface PianoProps {
    synthRef: React.RefObject<Tone.PolySynth<Tone.Synth> | null>;
    chordMappings: ChordMappings;
    setChordMappings: (mapping: ChordMappings) => void;
    currentGesture: string
}

const Piano = ({ synthRef, chordMappings, setChordMappings, currentGesture}: PianoProps) => {

    const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set<string>());

    useEffect(() => {
        const currentMapping = chordMappings.find(mapping => mapping.gesture === currentGesture)?.notes || [];
        if (currentMapping) {
            setActiveKeys(new Set(currentMapping));
            // console.log(`there is a mapping: ${activeKeys}`)
        } else {
            setActiveKeys(new Set())
            // console.log(`there is not mapping: ${activeKeys}`)
        }
        
    }, [currentGesture, chordMappings])

    function handleKeyPress(note: string): React.MouseEventHandler<HTMLDivElement> {
        return () => {
            setActiveKeys(prev => {
                const newSet = new Set(prev);
                if (newSet.has(note)){
                    newSet.delete(note);
                } else {
                    newSet.add(note);
                    synthRef.current?.triggerAttackRelease(`${note}`, "8n");
                }
                // console.log(newSet)
                return newSet;
            });
            
        }
    }

    const setNewChordMappings = () => {
        const newChordMappings = chordMappings.map((mapping) => {
            if (mapping.gesture == currentGesture){
                return {
                ...mapping,
                notes: Array.from(activeKeys)
                };
            }
            return mapping;

        });
        // console.log(newChordMappings)
        setChordMappings(newChordMappings)
    }

    const clearSelection = () => {
        setActiveKeys(new Set());
    };

    const getKeyClass = (note: string, isBlack: boolean) => {
        if (activeKeys.has(note)) {
            return isBlack 
                ? "w-6 h-24 absolute transition-colors duration-150 bg-orange-300" 
                : "w-10 h-40 border mr-1 transition-colors duration-150 bg-orange-200";
        } else {
            return isBlack 
                ? "w-6 h-24 absolute transition-colors duration-150 bg-black" 
                : "w-10 h-40 border mr-1 transition-colors duration-150 bg-white";
        }
    };


    return (
        <div className='ml-5 items-center'>
            <div className="relative flex">
                <div data-note="C" onClick={handleKeyPress("C4")} className={getKeyClass("C4", false)}></div>
                <div data-note="Db" onClick={handleKeyPress("Db4")} className={getKeyClass("Db4", true) + " ml-7"}></div>
                <div data-note="D" onClick={handleKeyPress("D4")} className={getKeyClass("D4", false)}></div>
                <div data-note="Eb" onClick={handleKeyPress("Eb4")} className={getKeyClass("Eb4", true) + " ml-18"}></div>
                <div data-note="E" onClick={handleKeyPress("E4")} className={getKeyClass("E4", false)}></div>
                <div data-note="F" onClick={handleKeyPress("F4")} className={getKeyClass("F4", false)}></div>
                <div data-note="F#" onClick={handleKeyPress("F#4")} className={getKeyClass("F#4", true) + " ml-40"}></div>
                <div data-note="G" onClick={handleKeyPress("G4")} className={getKeyClass("G4", false)}></div>
                <div data-note="G#" onClick={handleKeyPress("G#4")} className={getKeyClass("G#4", true) + " ml-52"}></div>
                <div data-note="A" onClick={handleKeyPress("A4")} className={getKeyClass("A4", false)}></div>
                <div data-note="Bb" onClick={handleKeyPress("Bb4")} className={getKeyClass("Bb4", true) + " ml-64"}></div>
                <div data-note="B" onClick={handleKeyPress("B4")} className={getKeyClass("B4", false)}></div>
                <div data-note="C5" onClick={handleKeyPress("C5")} className={getKeyClass("C5", false)}></div>
                <div data-note="Db5" onClick={handleKeyPress("Db5")} className={getKeyClass("Db5", true) + " ml-84"}></div>
                <div data-note="D5" onClick={handleKeyPress("D5")} className={getKeyClass("D5", false)}></div>
                <div data-note="Eb5" onClick={handleKeyPress("Eb5")} className={getKeyClass("Eb5", true) + " ml-95"}></div>
                <div data-note="E5" onClick={handleKeyPress("E5")} className={getKeyClass("E5", false)}></div>
            </div>
            <div className='space-x-5'>
                <Button className='mt-10 bg-orange-400 text-white' onClick={clearSelection}>Clear Selection</Button>
                <Button className='mt-10 bg-green-700  text-white' onClick={setNewChordMappings}>Assign Chord</Button>
            </div>
        </div>
    )
}

export default Piano