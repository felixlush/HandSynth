import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { Card, CardContent } from "@/components/ui/card";

const videoConstraints = {
    width: 540,
    facingMode: "environment",
};

const Camera: React.FC = () => {
    const webcamRef = useRef<Webcam>(null);
    const [url, setUrl] = useState<string | null>(null);

    const onUserMedia = (stream: MediaStream) => {
        console.log(stream);
    };

    return (
        <div className="flex justify-center">
        <Card className="overflow-hidden rounded-xl border">
            <CardContent>
            <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                onUserMedia={onUserMedia}
                mirrored={true}
            />
            </CardContent>
        </Card>
        </div>
    );
};

export default Camera;
