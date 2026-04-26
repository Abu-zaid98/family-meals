import { useState, useRef, useCallback } from 'react';
import { getErrorMessage } from '../utils/errors';

interface UseVoiceInputOptions {
  onTranscript: (text: string) => void;
  language?: string;
}

interface StartRecordingOptions {
  initialText?: string;
  separator?: string;
}

const STT_API_KEY = import.meta.env.VITE_STT_API_KEY;
const STT_API_URL = import.meta.env.VITE_STT_API_URL || 'https://api.groq.com/openai/v1/audio/transcriptions';
const STT_MODEL = import.meta.env.VITE_STT_MODEL || 'whisper-large-v3';

export function useVoiceInput({ onTranscript, language = 'ar' }: UseVoiceInputOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isProcessingRef = useRef(false);
  
  const seedTextRef = useRef('');
  const separatorRef = useRef(' ');
  const finalTranscriptRef = useRef('');

  const stopStream = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  };

  const processAudioChunk = async (audioBlob: Blob) => {
    // Avoid processing very small chunks (less than 2KB) which are usually silence/noise
    if (audioBlob.size < 2000 || !STT_API_KEY || STT_API_KEY === 'your_api_key_here') return;

    try {
      isProcessingRef.current = true;
      const formData = new FormData();
      
      // Determine file extension based on mime type
      const extension = audioBlob.type.includes('webm') ? 'webm' : 'mp4';
      formData.append('file', audioBlob, `audio.${extension}`);
      formData.append('model', STT_MODEL);
      formData.append('language', language.split('-')[0]); // Whisper expects 'ar' not 'ar-PS'
      formData.append('response_format', 'json');

      const response = await fetch(STT_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STT_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }

      const result = await response.json();
      const newText = result.text?.trim();

      if (newText) {
        finalTranscriptRef.current += (finalTranscriptRef.current ? separatorRef.current : '') + newText;
        
        const fullText = [
          seedTextRef.current,
          finalTranscriptRef.current,
        ].filter(Boolean).join(separatorRef.current);

        onTranscript(fullText);
      }
    } catch (err) {
      console.error('STT Processing Error:', err);
      // We don't necessarily want to stop recording on a single chunk failure
      // unless it's a persistent auth error.
    } finally {
      isProcessingRef.current = false;
    }
  };

  const startRecording = useCallback(async ({ initialText = '', separator = ' ' }: StartRecordingOptions = {}) => {
    setError(null);
    
    if (!STT_API_KEY || STT_API_KEY === 'your_api_key_here') {
      setError('يرجى ضبط مفتاح API (VITE_STT_API_KEY) في ملف .env لتفعيل التعرف على الصوت.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      seedTextRef.current = initialText.trim();
      separatorRef.current = separator;
      finalTranscriptRef.current = '';

      // Check supported mime types
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          processAudioChunk(event.data);
        }
      };

      // Start recording and request data every 4 seconds for a "live" feel
      recorder.start(4000); 
      setIsRecording(true);
    } catch (err) {
      setError(getErrorMessage(err, 'تعذّر الوصول إلى الميكروفون. تأكد من إعطاء الصلاحيات اللازمة.'));
      stopStream();
    }
  }, [language, onTranscript]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    stopStream();
    setIsRecording(false);
  }, []);

  const clearAudio = useCallback(() => {
    setError(null);
  }, []);

  return { isRecording, error, startRecording, stopRecording, clearAudio };
}
