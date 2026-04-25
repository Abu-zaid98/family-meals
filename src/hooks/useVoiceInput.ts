import { useState, useRef, useCallback } from 'react';
import { getErrorMessage } from '../utils/errors';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface BrowserSpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: BrowserSpeechRecognitionConstructor;
  webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
}

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

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
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

    const recognitionWindow = window as SpeechRecognitionWindow;
    const SpeechRecognition = recognitionWindow.SpeechRecognition || recognitionWindow.webkitSpeechRecognition;
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

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
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

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
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
    } catch (error) {
      setError(getErrorMessage(error, 'تعذّر الوصول إلى الميكروفون'));
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
