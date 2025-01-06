import React, { useRef, useState } from 'react';
import axios from 'axios';
import { ApiKeyModal } from './components/ApiKeyModal';

// Sales stages and default configuration
const stages = [
  { icon: 'library_books', label: 'Preliminaries' },
  { icon: 'visibility', label: 'Situation' },
  { icon: 'error_outline', label: 'Problem' },
  { icon: 'report_problem', label: 'Implication' },
  { icon: 'lightbulb', label: 'Need-Payoff' },
  { icon: 'build', label: 'Capabilities' },
  { icon: 'thumb_up', label: 'Commitment' },
];

const App = () => {
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [ballCounts, setBallCounts] = useState(
    stages.reduce((acc, stage) => {
      acc[stage.label] = { rep: 0, client: 0 };
      return acc;
    }, {})
  );

  const [activeStage, setActiveStage] = useState(null);
  const [highlight, setHighlight] = useState('');

  const [recording, setRecording] = useState(false);
  const [transcriptions, setTranscriptions] = useState([]);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const audioChunksRef = useRef([]);
  const recorderRef = useRef(null);

  const handleApiSave = (key) => {
    setApiKey(key);
    localStorage.setItem('openai_api_key', key);
    setIsApiModalOpen(false);
  };

  // Simulate updating score and triggering flash effect
  const updateScore = (stage, speaker) => {
    // Increment the rep or client counter
    setBallCounts((prev) => ({
      ...prev,
      [stage]: {
        ...prev[stage],
        [speaker]: prev[stage][speaker] + 1,
      },
    }));

    // Trigger flash for the respective color (blue for rep, green for client)
    setHighlight(speaker === 'rep' ? 'blue' : 'green');
    setActiveStage(stage);

    // Reset flash after 1 second
    setTimeout(() => {
      setActiveStage(null);
      setHighlight('');
    }, 300);
  };

  const handleMouseDown = (stage, event) => {
    // Check the button pressed
    if (event.button === 0) {
      // Left click: Increment rep
      updateScore(stage, 'rep');
    } else if (event.button === 2) {
      // Right click: Increment client
      updateScore(stage, 'client');
    }
  };

  const getAudioStream = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const systemDevice = devices.find((device) => device.kind === 'audiooutput' && device.deviceId === 'default');

    if (!systemDevice) {
      console.log('System audio device not found.');
      throw new Error('System audio device not found.');
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: systemDevice.deviceId },
    });

    return stream;
  };

  const analyzeAudio = (audioBlob) => {
    return new Promise((resolve) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const reader = new FileReader();

      reader.onloadend = async () => {
        const arrayBuffer = reader.result;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const rawData = audioBuffer.getChannelData(0);

        let sum = 0;
        for (let i = 0; i < rawData.length; i++) {
          sum += Math.abs(rawData[i]);
        }

        const averageVolume = sum / rawData.length;
        const THRESHOLD = 0.01;
        resolve(averageVolume >= THRESHOLD);
      };

      reader.readAsArrayBuffer(audioBlob);
    });
  };

  // Start Recording
  const startRecording = async () => {
    if (!apiKey) {
      setIsApiModalOpen(true);
      return;
    }

    setRecording(true);
    audioChunksRef.current = [];

    try {
      const stream = await getAudioStream();
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      recorder.start();
      recorderRef.current = recorder;

      setTimeout(() => {
        stopRecording();
      }, 60000);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (recorder) {
      recorder.stop();
      recorder.onstop = sendToWhisper;
    }
    setRecording(false);
  };

  const sendToWhisper = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const hasSound = await analyzeAudio(audioBlob);

    if (!hasSound) {
      console.log('No relevant sound detected.');
      return;
    }

    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    try {
      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const transcription = response.data.text;
      setTranscriptions((prev) => [{ message: transcription }, ...prev]);
    } catch (error) {
      console.error('Error transcribing audio:', error);
    }
  };

  const deleteRecordings = () => {
    setTranscriptions([]);
    audioChunksRef.current = [];
  };

  return (
    <div id="webcrumbs" onContextMenu={(e) => e.preventDefault()}>
      <div className="relative select-none opacity-[95%] h-screen backdrop-blur-sm	w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 rounded-lg border border-gray-500 flex items-center px-4 py-5 text-neutral-50 gap-4">
        {/* Close Button */}
        <button className="w-[24px] h-[24px] rounded-full bg-gray-600 flex items-center justify-center hover:bg-gray-500">
          <span className="material-symbols-outlined text-neutral-50 text-base">close</span>
        </button>

        {/* Sales Stages */}
        <div className="flex flex-wrap gap-3 flex-1 justify-between">
          {stages.map((item, index) => (
            <div
              key={index}
              className={`cursor-pointer relative flex flex-col items-center p-2 rounded-md text-xs shadow-sm border w-[100px] transition-transform duration-200 ${
                activeStage === item.label
                  ? highlight === 'green'
                    ? 'bg-green-900 border-green-500'
                    : 'bg-blue-900 border-blue-500'
                  : 'bg-gray-800 border-gray-500'
              } hover:scale-105 hover:shadow-lg hover:border-white`}
              onMouseDown={(event) => handleMouseDown(item.label, event)}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <p className="mt-1 mb-2 font-semibold text-center">{item.label}</p>

              {/* Rep and Client Scores */}
              <div className="flex gap-1 mt-1 mb-1">
                <span className="w-[16px] h-[16px] rounded-full bg-blue-500 text-[10px] text-center text-black flex items-center justify-center">
                  {ballCounts[item.label].rep}
                </span>
                <span className="w-[16px] h-[16px] rounded-full bg-green-500 text-[10px] text-center text-black flex items-center justify-center">
                  {ballCounts[item.label].client}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Settings Button */}

        {audioChunksRef.current.length > 0 ? (
          <button
            className="w-[24px] h-[24px] rounded-full bg-gray-600 flex items-center justify-center hover:bg-gray-500"
            onClick={deleteRecordings}
          >
            <span className="material-symbols-outlined text-neutral-50 text-base">replay</span>
          </button>
        ) : (
          <button className="w-[24px] h-[24px] rounded-full bg-gray-600 flex items-center justify-center cursor-default">
            <span className="material-symbols-outlined text-neutral-50 opacity-50 text-base">replay</span>
          </button>
        )}
        {recording ? (
          <button
            className="w-[24px] h-[24px] rounded-full bg-red-800 flex items-center justify-center hover:bg-red-700"
            onClick={stopRecording}
          >
            <span className="material-symbols-outlined text-primary-50 text-base">pause</span>
          </button>
        ) : (
          <button
            className="w-[24px] h-[24px] rounded-full bg-red-600 flex items-center justify-center hover:bg-red-500"
            onClick={startRecording}
          >
            <span className="material-symbols-outlined text-primary-50 text-base">mic</span>
          </button>
        )}
        {/* For Testing */}
        <div className="absolute bottom-0 right-1/2">
          {audioChunksRef.current.length > 0 && (
            <div className="mt-6">
              <h3 className="text-white">Recorded Audio (Mic):</h3>
              {audioChunksRef.current.map((chunk, index) => (
                <audio key={index} controls>
                  <source src={URL.createObjectURL(new Blob([chunk], { type: 'audio/wav' }))} />
                </audio>
              ))}
            </div>
          )}

          {transcriptions.length > 0 && (
            <div className="mt-6">
              {transcriptions.map(
                ({ message, speaker }, index) =>
                  message && (
                    <div key={index} className="p-2 bg-gray-800 rounded text-white mb-2">
                      {speaker}: {message}
                    </div>
                  )
              )}
            </div>
          )}
        </div>
        <ApiKeyModal isOpen={isApiModalOpen} onSave={handleApiSave} />
      </div>
    </div>
  );
};

export default App;
