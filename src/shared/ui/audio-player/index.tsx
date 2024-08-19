import { FC, useEffect, useRef, useState } from "react";

interface AudioPlayerProps {
    src: string;
}

export const AudioPlayer: FC<AudioPlayerProps> = ({ src }) => {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const rangeRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const audio = audioRef.current;

        if (!audio) return;

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            updateRangeBackground(audio.currentTime);
        };

        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("timeupdate", handleTimeUpdate);

        return () => {
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("timeupdate", handleTimeUpdate);
        };
    }, []);

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const newTime = parseFloat(e.target.value);
        audio.currentTime = newTime;
        setCurrentTime(newTime);
        updateRangeBackground(newTime);
    };

    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    const updateRangeBackground = (currentTime: number) => {
        if (rangeRef.current) {
            const percentage = (currentTime / duration) * 100;
            rangeRef.current.style.setProperty(
                "--value-percentage",
                `${percentage}%`,
            );
        }
    };

    return (
        <div className="flex items-center space-x-4">
            <audio ref={audioRef} src={src} />

            <button
                onClick={togglePlayPause}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-gray focus:outline-none"
            >
                {isPlaying ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6"
                    >
                        <path
                            fillRule="evenodd"
                            d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z"
                            clipRule="evenodd"
                        />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6"
                    >
                        <path
                            fillRule="evenodd"
                            d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                            clipRule="evenodd"
                        />
                    </svg>
                )}
            </button>

            <div className={"flex w-full flex-col gap-2"}>
                <input
                    type="range"
                    ref={rangeRef}
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={handleSliderChange}
                    className="flex-grow"
                />

                <div className="flex items-center justify-between text-xs">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
};
