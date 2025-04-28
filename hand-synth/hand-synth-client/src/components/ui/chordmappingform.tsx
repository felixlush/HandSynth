import React, { useEffect, useState } from "react";
import { Chord } from "tonal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChordMappings } from "@/lib/types";

interface ChordMappingFormProps {
    setChordMappings: (mapping: ChordMappings) => void;
    gesture: string;
    chordMappings: ChordMappings;
}

const ChordMappingForm = ({gesture, chordMappings}: ChordMappingFormProps) => {

    const [assignedChord, setAssignedChord] = useState<string[]>(['No chord assigned']);
    const [assignedChordName, setAssignedChordName] = useState<string>('');

    useEffect(() => {
        const currentMapping = chordMappings.find(mapping => mapping.gesture === gesture);
        if (currentMapping) {
            setAssignedChord(currentMapping.notes);
            const detectedChord = Chord.detect(currentMapping.notes);
            if (detectedChord) {setAssignedChordName(detectedChord.toString())}
        } else {
            setAssignedChord(['No chord assigned']);
            setAssignedChordName('');
        }
    }), [gesture, chordMappings]

    return (
        <div>
            <Card className="border-accent-foreground">
                <CardHeader>
                    <CardTitle>Assigned Chord</CardTitle>
                </CardHeader>

                <CardContent className="flex-row space-y-4">
                    <div><b>Chord:</b> {assignedChordName}</div>
                    <div><b>Notes:</b> {assignedChord}</div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChordMappingForm