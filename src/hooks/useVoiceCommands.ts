import { useState, useEffect, useCallback, useRef } from 'react';
import { sound } from '../lib/soundEffects';

interface VoiceCommandProps {
  onSelectOption?: (index: number) => void;
  onNextQuestion?: () => void;
  onShowHint?: () => void;
  onRepeatQuestion?: () => void;
  enabled?: boolean;
}

export function useVoiceCommands({
  onSelectOption,
  onNextQuestion,
  onShowHint,
  onRepeatQuestion,
  enabled = true,
}: VoiceCommandProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [activeCommand, setActiveCommand] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
        setError(`Voice error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      const text = currentTranscript.trim().toLowerCase();
      setTranscript(text);

      // Parse Command
      if (text.includes('option a') || text.includes('choice a') || text.includes('number 1') || text.startsWith('a') && text.length < 3) {
        setActiveCommand('Option A');
        sound.playVoiceBeep();
        onSelectOption?.(0);
      } else if (text.includes('option b') || text.includes('choice b') || text.includes('number 2') || text.startsWith('b') && text.length < 3) {
        setActiveCommand('Option B');
        sound.playVoiceBeep();
        onSelectOption?.(1);
      } else if (text.includes('option c') || text.includes('choice c') || text.includes('number 3') || text.startsWith('c') && text.length < 3) {
        setActiveCommand('Option C');
        sound.playVoiceBeep();
        onSelectOption?.(2);
      } else if (text.includes('option d') || text.includes('choice d') || text.includes('number 4') || text.startsWith('d') && text.length < 3) {
        setActiveCommand('Option D');
        sound.playVoiceBeep();
        onSelectOption?.(3);
      } else if (text.includes('hint') || text.includes('help')) {
        setActiveCommand('Show Hint');
        sound.playVoiceBeep();
        onShowHint?.();
      } else if (text.includes('next') || text.includes('continue')) {
        setActiveCommand('Next');
        sound.playVoiceBeep();
        onNextQuestion?.();
      } else if (text.includes('repeat') || text.includes('read again')) {
        setActiveCommand('Repeat');
        sound.playVoiceBeep();
        onRepeatQuestion?.();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [onSelectOption, onNextQuestion, onShowHint, onRepeatQuestion]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      setTranscript('');
      setActiveCommand(null);
      recognitionRef.current.start();
      sound.playClick();
    } catch (e) {
      console.warn('Speech recognition start issue:', e);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      setIsListening(false);
      sound.playClick();
    } catch (e) {}
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    transcript,
    activeCommand,
    error,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
  };
}
