import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import apiService from '../services/apiService';
import { IoMic } from 'react-icons/io5';

const VoiceRecorder = ({ onSend, receiverId, groupId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setDuration(0);
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob) return;

    const formData = new FormData();
    formData.append('voice', audioBlob, 'voice-message.webm');
    formData.append('duration', duration);
    if (receiverId) formData.append('receiverId', receiverId);
    if (groupId) formData.append('groupId', groupId);

    try {
      const response = await apiService.client.post(
        `/api/v1/message/voice`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      onSend(response.data.message);
      setAudioBlob(null);
      setDuration(0);
      toast.success('Voice message sent!');
    } catch (error) {
      console.error('Error sending voice message:', error);
      toast.error('Failed to send voice message');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (audioBlob) {
    return (
      <div className="absolute bottom-20 left-4 right-4 z-50 flex items-center gap-3 p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
        <audio src={URL.createObjectURL(audioBlob)} controls className="flex-1" />
        <span className="text-sm text-white font-medium">{formatDuration(duration)}</span>
        <button
          onClick={sendVoiceMessage}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:scale-105 transition shadow-lg font-semibold"
        >
          Send
        </button>
        <button
          onClick={cancelRecording}
          className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition shadow-lg"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="absolute bottom-20 left-4 right-4 z-50 flex items-center gap-4 p-4 bg-white/10 backdrop-blur-xl border border-red-500/50 rounded-2xl shadow-2xl">
        <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
        <span className="flex-1 text-white font-medium text-lg">Recording... {formatDuration(duration)}</span>
        <button
          onClick={stopRecording}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-lg font-semibold"
        >
          Stop
        </button>
        <button
          onClick={cancelRecording}
          className="px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition shadow-lg"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={startRecording}
      className="text-white text-xl p-2 rounded-full hover:bg-white/20 transition"
      title="Record voice message"
    >
      <IoMic />
    </button>
  );
};

export default VoiceRecorder;
