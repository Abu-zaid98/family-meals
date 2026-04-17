import { useState, useRef, useCallback } from 'react';

interface UseVoiceInputOptions {
  onTranscript: (text: string) => void;
  language?: string;
}

interface StartRecordingOptions {
  initialText?: string;
  separator?: string;
}

export function useVoiceInput({ onTranscript, language = 'ar-PS' }: UseVoiceInputOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const shouldKeepListeningRef = useRef(false);
  const seedTextRef = useRef('');
  const separatorRef = useRef(' ');
  const finalTranscriptRef = useRef('');

  const stopStream = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  };

  const startRecording = useCallback(async ({ initialText = '', separator = ' ' }: StartRecordingOptions = {}) => {
    setError(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('الإملاء الصوتي غير مدعوم في هذا المتصفح. جرّب Chrome أو Edge.');
      return;
    }

    try {
      if (!streamRef.current) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      shouldKeepListeningRef.current = true;
      seedTextRef.current = initialText.trim();
      separatorRef.current = separator;
      finalTranscriptRef.current = '';

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognitionRef.current = recognition;

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += `${t.trim()} `;
          } else {
            interim += t;
          }
        }

        const parts = [
          seedTextRef.current,
          finalTranscriptRef.current.trim(),
          interim.trim(),
        ].filter(Boolean);

        onTranscript(parts.join(separatorRef.current).trim());
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          setError(`حدث خطأ في التعرّف على الصوت: ${event.error}`);
          shouldKeepListeningRef.current = false;
          stopStream();
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        if (!shouldKeepListeningRef.current) {
          stopStream();
          setIsRecording(false);
          return;
        }

        try {
          recognition.start();
        } catch {
          shouldKeepListeningRef.current = false;
          stopStream();
          setIsRecording(false);
        }
      };

      recognition.start();
      setIsRecording(true);
    } catch (err: any) {
      setError(err.message || 'تعذّر الوصول إلى الميكروفون');
      shouldKeepListeningRef.current = false;
      stopStream();
    }
  }, [language, onTranscript]);

  const stopRecording = useCallback(() => {
    shouldKeepListeningRef.current = false;
    recognitionRef.current?.stop();
    stopStream();
    setIsRecording(false);
  }, []);

  const clearAudio = useCallback(() => {
    setError(null);
  }, []);

  return { isRecording, error, startRecording, stopRecording, clearAudio };
}
