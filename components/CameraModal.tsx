
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface CameraModalProps {
    mode: 'image' | 'video';
    onClose: () => void;
    onCapture: (file: File) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ mode, onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

    // Effect to get the stream
    useEffect(() => {
        let active = true;
        const constraints: MediaStreamConstraints = {
            video: {
                facingMode: facingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 },
            },
            audio: mode === 'video',
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(mediaStream => {
                if (active) {
                    setStream(mediaStream);
                    setError(null);
                } else {
                    mediaStream.getTracks().forEach(track => track.stop());
                }
            })
            .catch(err => {
                console.error("Error accessing camera:", err);
                if (active) {
                    if (err instanceof Error) {
                        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                            setError("Camera access was denied. Please allow camera access in your browser settings.");
                        } else {
                            setError(`Could not access the camera: ${err.message}`);
                        }
                    } else {
                        setError("An unknown error occurred while accessing the camera.");
                    }
                }
            });

        return () => {
            active = false;
        };
    }, [mode, facingMode]);

    // Effect to handle the stream (assign to video and cleanup)
    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const handleClose = useCallback(() => {
        setStream(null); // This will trigger cleanup effect in the useEffect above
        onClose();
    }, [onClose]);

    const handleCaptureImage = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                if (facingMode === 'user') {
                    context.translate(canvas.width, 0);
                    context.scale(-1, 1);
                }
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(blob => {
                    if (blob) {
                        const file = new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' });
                        onCapture(file);
                        handleClose();
                    }
                }, 'image/png');
            }
        }
    }, [onCapture, facingMode, handleClose]);

    const handleStartRecording = useCallback(() => {
        if (stream) {
            recordedChunksRef.current = [];
            let options = { mimeType: 'video/webm; codecs=vp9' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = { mimeType: 'video/webm; codecs=vp8' };
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    options = { mimeType: 'video/webm' };
                    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                        options = { mimeType: '' };
                    }
                }
            }
            
            try {
                mediaRecorderRef.current = new MediaRecorder(stream, options);
                mediaRecorderRef.current.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        recordedChunksRef.current.push(event.data);
                    }
                };
                mediaRecorderRef.current.onstop = () => {
                    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                    const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'video/webm' });
                    onCapture(file);
                    handleClose();
                };
                mediaRecorderRef.current.start();
                setIsRecording(true);
            } catch (e) {
                console.error('Error starting media recorder:', e);
                setError('Could not start video recording.');
            }
        }
    }, [stream, onCapture, handleClose]);

    const handleStopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    const handleCapture = () => {
        if (mode === 'image') {
            handleCaptureImage();
        } else if (mode === 'video') {
            if (isRecording) {
                handleStopRecording();
            } else {
                handleStartRecording();
            }
        }
    };
    
    const handleSwitchCamera = () => {
        setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" aria-modal="true" role="dialog">
            <div className="relative w-full max-w-4xl h-full sm:h-auto sm:max-h-[90vh] bg-gray-900 rounded-lg shadow-xl flex flex-col p-4">
                <div className="flex justify-between items-center mb-2 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-white capitalize">{mode} Capture</h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-white" aria-label="Close camera modal">
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="relative flex-grow bg-black rounded-md overflow-hidden flex items-center justify-center">
                    {!stream && !error && <div className="text-white">Starting camera...</div>}
                    {error && (
                        <div className="text-red-400 p-4 text-center">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}
                    <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-contain ${facingMode === 'user' ? 'transform scale-x-[-1]' : ''} ${!stream || error ? 'hidden' : ''}`}></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                </div>

                <div className="flex-shrink-0 flex items-center justify-center gap-8 pt-4">
                    <button 
                        onClick={handleSwitchCamera} 
                        className="text-white p-3 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
                        disabled={isRecording}
                        aria-label="Switch camera"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                         </svg>
                    </button>
                    <button 
                        onClick={handleCapture}
                        className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-50 transition-colors ${
                            isRecording ? 'bg-red-500/70' : 'bg-transparent hover:bg-white/20'
                        }`}
                        disabled={!stream}
                        aria-label={mode === 'image' ? 'Take picture' : (isRecording ? 'Stop recording' : 'Start recording')}
                    >
                        {mode === 'image' ? (
                            <div className="w-16 h-16 bg-white rounded-full"></div>
                        ) : isRecording ? (
                            <div className="w-8 h-8 bg-white rounded-md"></div>
                        ) : (
                            <div className="w-16 h-16 bg-red-500 rounded-full"></div>
                        )}
                    </button>
                    <div className="w-12 h-12"></div> {/* Placeholder for symmetry */}
                </div>
            </div>
        </div>
    );
};

export default CameraModal;
