import React, { useEffect, useState } from 'react';
import Meyda from 'meyda';

const MFCCPage = () => {
  const [mfccFeatures, setMfccFeatures] = useState([]);
  const [audioContext, setAudioContext] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recording, setRecording] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(context);
    }
  }, []);

  const startRecording = async () => {
    if (!audioContext) return;
  
    try {
      // Create or resume AudioContext
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
  
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
  
      recorder.ondataavailable = async (event) => {
        const audioBlob = event.data;
        const arrayBuffer = await audioBlob.arrayBuffer();
        const buffer = await audioContext.decodeAudioData(arrayBuffer);
  
        const src = audioContext.createBufferSource();
        src.buffer = buffer;
  
        const analyzer = Meyda.createMeydaAnalyzer({
          audioContext: audioContext,
          source: src,
          bufferSize: 512,
          featureExtractors: ['mfcc'],
          callback: (features) => {
            setMfccFeatures(features.mfcc);
          },
        });
  
        setMediaRecorder(recorder);
        src.start();
        analyzer.start();
      };
  
      recorder.start();
      setRecording(true);
  
      // Stop recording after 10 seconds
      setTimeout(() => {
        recorder.stop();
        setRecording(false);
      }, 10000);
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };
  const handleSaveToDB = async () => {
    try {
      const response = await fetch('/api/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          mfccFeatures: mfccFeatures,
        }),
      });
      const result = await response.json();
      alert("Done now refresh the page!! sorry for inconvenience")
      setAudioContext(null)
      setMediaRecorder(null)
      setMfccFeatures([])
      setName("")
      setRecording(false)
      console.log(result.message);
    } catch (error) {
      console.error("Error saving data to the database.", error);
    }
  };

  return (
    <div>
      <center>
        <input
          type="text"
          name="name"
          id="name"
          className='p-3 mt-10 text-black font-bold'
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </center>
      <br />
      <center>
        <button onClick={startRecording} className='bg-red-400 p-3' disabled={recording}>
          {recording ? 'Recording...' : 'Start Recording'}
        </button>
        <br />
        <button className='bg-blue-900 p-4' onClick={handleSaveToDB} disabled={mfccFeatures.length === 0}>
          Save to Database
        </button>
      </center>
      
    </div>
  );
};

export default MFCCPage;
