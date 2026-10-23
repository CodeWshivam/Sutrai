import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  Square, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  FileCheck, 
  MapPin, 
  Navigation, 
  Globe, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Info,
  Camera,
  Video,
  CloudRain,
  ShieldCheck
} from 'lucide-react';
import { EvidenceItem, LocationData, WeatherData } from '../types';
import { apiClient } from '../services/apiClient';
import { SignalPath } from '../components/common/SignalPath';

interface WorkspacePreset {
  title: string;
  category: string;
  text: string;
  location: string;
}

export const WorkspacePage: React.FC = () => {
  const navigate = useNavigate();

  // 1. Text description state
  const [description, setDescription] = useState('');

  // 2. Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Live speech-to-text transcript state
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const speechRecognitionRef = useRef<any>(null);

  // Evidence files state
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceItem[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  // Parallel map from EvidenceItem.id → raw File/Blob for backend upload
  const rawFilesRef = useRef<Map<string, File>>(new Map());

  // 4. Location state
  const [locationAddress, setLocationAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isLocationUnknown, setIsLocationUnknown] = useState(false);
  const [locatingGPS, setLocatingGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Live Weather preview state
  const [weatherPreview, setWeatherPreview] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // 5. Language & Consent state
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [sensitiveConsent, setSensitiveConsent] = useState(false);

  // 6. Review step & Processing state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  // Store the audio blob so we can send it to the backend
  const audioBlobRef = useRef<Blob | null>(null);
  // Idempotency: Unique client submission ID to prevent duplicate incidents on retry
  const clientSubmissionIdRef = useRef<string>(`sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);

  // Live weather update effect
  useEffect(() => {
    if (isLocationUnknown || !locationAddress.trim()) {
      setWeatherPreview(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsLoadingWeather(true);
      const data = await apiClient.getWeather({ location: locationAddress });
      setWeatherPreview(data);
      setIsLoadingWeather(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [locationAddress, isLocationUnknown]);

  const languages = [
    'English',
    'Hindi (हिंदी)',
    'Kannada (ಕನ್ನಡ)',
    'Tamil (தமிழ்)',
    'Telugu (తెలుగు)',
    'Marathi (मराठी)',
    'Bengali (বাংলা)',
    'Gujarati (ગુજરાતી)',
    'Malayalam (മലയാളം)',
    'Odia (ଓଡ଼ିଆ)',
    'Punjabi (ਪੰਜਾਬੀ)',
  ];

  const presets: WorkspacePreset[] = [
    {
      title: 'Medical / Cardiac Emergency',
      category: 'Medical',
      text: 'My father suddenly collapsed clutching his chest. Pain radiating to left shoulder and cold sweat. He is conscious but struggling to breathe. Please send an ambulance with defibrillator.',
      location: 'Flat 402, Shanti Nilaya Apartments, Indiranagar',
    },
    {
      title: 'Flooded Bus Underpass',
      category: 'Transport',
      text: 'Panathur railway underbridge is submerged under 4 feet of rain water. School bus with children is stalled and cannot reverse due to gridlock behind.',
      location: 'Panathur Railway Underpass, Balagere Road',
    },
    {
      title: 'Sewage in Drinking Water',
      category: 'Civic',
      text: 'Foul-smelling murky black sewage water coming out of municipal drinking taps in 6 apartment complexes. Multiple children falling ill with vomiting.',
      location: '7th Cross, Vyalikaval, Malleshwaram, Ward 14',
    },
    {
      title: 'Broken Wheelchair Ramp',
      category: 'Accessibility',
      text: 'Concrete access ramp at Gate 2 National College exam center is cracked with 6-inch vertical drop. 14 students with disabilities unable to reach examination hall.',
      location: 'National College Campus, Basavanagudi',
    },
  ];

  // Voice recording timer effect
  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isRecording]);

  // Audio Waveform Visualizer on Canvas
  useEffect(() => {
    if (!isRecording || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.beginPath();
      ctx.moveTo(0, centerY);
      for (let x = 0; x < width; x += 4) {
        const amplitude = 12 * Math.sin((x * 0.05) + phase) * Math.sin(phase * 0.8);
        ctx.lineTo(x, centerY + amplitude);
      }
      ctx.strokeStyle = '#43E6D3';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      phase += 0.12;
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording]);

  // Start real browser voice recording + Web Speech API live transcript
  const handleStartRecording = async () => {
    setRecordingError(null);
    setLiveTranscript('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Audio recording is not supported in this browser environment.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioBlobRef.current = audioBlob;
        const url = URL.createObjectURL(audioBlob);
        setAudioBlobUrl(url);

        // Add to evidence items
        const evId = `ev-rec-${Date.now()}`;
        const audioFile = new File([audioBlob], `voice_recording_${new Date().toISOString().slice(11, 19).replace(/:/g, '')}.webm`, { type: 'audio/webm' });
        rawFilesRef.current.set(evId, audioFile);
        const newEvidence: EvidenceItem = {
          id: evId,
          name: audioFile.name,
          type: 'audio/webm',
          sizeBytes: audioBlob.size,
          previewUrl: url,
          uploadedAt: new Date().toISOString(),
          category: 'audio_recording',
          extractedSnippet: liveTranscript.trim() 
            ? `Live Transcript: "${liveTranscript.slice(0, 160)}..."` 
            : 'Live voice recording — sent to Gemini multimodal pipeline for transcription & analysis.',
        };
        setEvidenceFiles((prev) => [newEvidence, ...prev]);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      // Initialize Web Speech API for real-time live transcription
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          const rec = new SpeechRec();
          rec.continuous = true;
          rec.interimResults = true;
          const langMap: Record<string, string> = {
            'English': 'en-IN',
            'Hindi (हिंदी)': 'hi-IN',
            'Tamil (தமிழ்)': 'ta-IN',
            'Telugu (తెలుగు)': 'te-IN',
            'Kannada (ಕನ್ನಡ)': 'kn-IN',
            'Bengali (বাংলা)': 'bn-IN',
            'Marathi (मराठी)': 'mr-IN',
            'Gujarati (ગુજરાતી)': 'gu-IN',
            'Malayalam (മലയാളം)': 'ml-IN',
            'Punjabi (ਪੰਜਾਬੀ)': 'pa-IN',
          };
          rec.lang = langMap[selectedLanguage] || 'en-IN';

          rec.onresult = (e: any) => {
            let str = '';
            for (let i = 0; i < e.results.length; i++) {
              str += e.results[i][0].transcript + ' ';
            }
            setLiveTranscript(str.trim());
          };

          rec.onerror = (e: any) => {
            console.warn('SpeechRecognition warning:', e.error);
          };

          rec.start();
          speechRecognitionRef.current = rec;
        } catch (sErr) {
          console.warn('Speech recognition start failed:', sErr);
        }
      }
    } catch (err: any) {
      console.warn('Microphone error:', err);
      setRecordingError(
        err.name === 'NotAllowedError'
          ? 'Microphone permission was denied. You can still upload recorded audio files below.'
          : err.message || 'Unable to access microphone in this environment. Upload an audio file instead.'
      );
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
      speechRecognitionRef.current = null;
    }
  };

  const handleDeleteRecording = () => {
    if (audioBlobUrl) {
      URL.revokeObjectURL(audioBlobUrl);
      setAudioBlobUrl(null);
    }
    audioBlobRef.current = null;
    setRecordingSeconds(0);
    setLiveTranscript('');
    setEvidenceFiles((prev) => {
      prev.filter((f) => f.category === 'audio_recording').forEach((f) => rawFilesRef.current.delete(f.id));
      return prev.filter((f) => f.category !== 'audio_recording');
    });
  };

  // File Upload Handling (Images, PDFs, Audio, Video, Text)
  const handleFileUpload = (files: FileList | null) => {
    setUploadError(null);
    if (!files || files.length === 0) return;

    const allowedExtensions = [
      '.png', '.jpg', '.jpeg', '.webp', 
      '.pdf', '.txt', '.csv', 
      '.mp3', '.wav', '.m4a', '.ogg',
      '.mp4', '.webm', '.mov'
    ];
    const maxSizeBytes = 25 * 1024 * 1024; // 25 MB

    const newItems: EvidenceItem[] = [];

    Array.from(files).forEach((file) => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        setUploadError(`Unsupported file format "${file.name}". Allowed: Images, PDFs, Audio, Video, Text.`);
        return;
      }
      if (file.size > maxSizeBytes) {
        setUploadError(`File "${file.name}" exceeds 25 MB limit.`);
        return;
      }

      let category: EvidenceItem['category'] = 'document';
      if (file.type.startsWith('image/')) category = 'photo';
      else if (file.type.startsWith('audio/')) category = 'audio_file';
      else if (file.type.startsWith('video/')) category = 'video_clip';
      else if (file.type.includes('pdf')) category = 'document';
      else category = 'text_log';

      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;

      const evId = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      rawFilesRef.current.set(evId, file);

      newItems.push({
        id: evId,
        name: file.name,
        type: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        previewUrl,
        uploadedAt: new Date().toISOString(),
        category,
        extractedSnippet: `${category.toUpperCase()}: Attached for cross-examination via Gemini multimodal pipeline.`,
      });
    });

    setEvidenceFiles((prev) => [...newItems, ...prev]);
  };

  const handleRemoveFile = (id: string) => {
    setEvidenceFiles((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      rawFilesRef.current.delete(id);
      return prev.filter((i) => i.id !== id);
    });
  };

  // Browser Geolocation / GPS handling
  const handleDetectGPS = () => {
    setLocatingGPS(true);
    setGpsError(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocatingGPS(false);
          setIsLocationUnknown(false);
          setGpsError(null);
          setLocationAddress(`GPS Coordinates (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
          setLandmark('High-Precision GPS Lock (within 15m)');
        },
        (err) => {
          setLocatingGPS(false);
          console.warn('Geolocation denied or unavailable', err);
          if (err.code === 1) {
            setGpsError('GPS permission was denied by browser. Please enter street location manually or toggle "Exact location unavailable".');
          } else {
            setGpsError('GPS signal timed out or is unavailable on this device. Please enter address manually.');
          }
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      setLocatingGPS(false);
      setGpsError('Geolocation is not supported by your browser.');
    }
  };

  // Load a preset
  const handleApplyPreset = (preset: WorkspacePreset) => {
    setDescription(preset.text);
    setLocationAddress(preset.location);
    setIsLocationUnknown(false);
  };

  // Final Submission Workflow
  const handleReviewAndSubmit = () => {
    if (!description.trim() && evidenceFiles.length === 0) {
      setUploadError('Please provide a written description or attach at least one voice/photo evidence file.');
      return;
    }
    setShowReviewModal(true);
  };

  const handleExecuteAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisStep(1);

    // Collect actual File objects from the ref map
    const filesToUpload: File[] = evidenceFiles
      .map((ev) => rawFilesRef.current.get(ev.id))
      .filter((f): f is File => f !== undefined);

    const locationData: LocationData = {
      address: isLocationUnknown ? 'Unknown Geographic Point' : (locationAddress.trim() || 'Location to be confirmed'),
      landmark: isLocationUnknown ? undefined : landmark,
      source: isLocationUnknown ? 'unknown' : 'user_input',
      isUnknown: isLocationUnknown,
    };

    // Show animated reasoning steps
    const step2Timer = setTimeout(() => setAnalysisStep(2), 700);
    const step3Timer = setTimeout(() => setAnalysisStep(3), 1400);

    try {
      const result = await apiClient.analyzeSubmission(
        description,
        selectedLanguage,
        locationData,
        filesToUpload,
        sensitiveConsent,
        clientSubmissionIdRef.current
      );
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      setIsAnalyzing(false);
      navigate(`/results/${result.incident.id}`);
    } catch (err: any) {
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      setIsAnalyzing(false);
      setAnalysisError(err.message || 'Analysis failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-cloud py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Workspace Title & Progress Bar */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cobalt bg-cobalt/10 px-3 py-1 rounded-full border border-cobalt/20">
                Multimodal Input Studio
              </span>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-midnight tracking-tight mt-1.5">
                Ingest & Examine Real-World Signals
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Submit audio, photos, PDFs, or descriptions simultaneously. SutrAI structures the data without forced rigid questionnaires.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-mono bg-white dark:bg-midnight-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Ready for Ingestion</span>
              </span>
            </div>
          </div>

          {/* Signal Path Banner */}
          <SignalPath currentStage="capture" interactive={false} />
        </div>

        {/* Quick Presets Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-subtle-card space-y-2">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-aqua" />
            <span>Load Quick Real-World Demo Scenario:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
              >
                <span className="font-semibold text-midnight">{preset.title}</span>
                <span className="text-[10px] text-slate-500 font-mono">({preset.category})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Studio Grid: Input Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Left Columns: Text & Voice Recording (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Written Description Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-subtle-card space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="description" className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cobalt" />
                  <span>1. Detailed Description / Transcript</span>
                </label>
                <span className="text-xs font-mono text-slate-400">
                  {description.length} characters
                </span>
              </div>

              <textarea
                id="description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what is occurring, observed symptoms, physical hazards, affected people, or immediate dangers..."
                className="w-full text-sm rounded-xl border border-slate-200 p-3.5 focus:border-cobalt focus:ring-2 focus:ring-cobalt/20 focus:outline-none transition-all placeholder:text-slate-400 resize-y"
              />
            </div>

            {/* Live Browser Voice Recording Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-subtle-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-aqua" />
                  <span>2. Live Browser Audio Recording</span>
                </div>
                {isRecording && (
                  <span className="flex items-center gap-1.5 text-xs font-mono text-coral font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-coral" />
                    REC [{Math.floor(recordingSeconds / 60)}:{('0' + (recordingSeconds % 60)).slice(-2)}]
                  </span>
                )}
              </div>

              {/* Waveform Canvas & Controls */}
              <div className="p-4 rounded-xl bg-midnight-950 border border-slate-800 text-white space-y-3">
                <div className="h-16 w-full flex items-center justify-center bg-slate-900/60 rounded-lg overflow-hidden relative">
                  {isRecording ? (
                    <canvas ref={canvasRef} width={420} height={64} className="w-full h-full" />
                  ) : audioBlobUrl ? (
                    <div className="flex items-center gap-2 text-xs font-mono text-aqua">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Audio Recording Stored ({recordingSeconds}s)</span>
                    </div>
                  ) : (
                    <div className="text-xs font-mono text-slate-500">
                      Press "Start Recording" to capture real voice signals
                    </div>
                  )}
                </div>

                {/* Recording Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="px-4 py-2 rounded-xl bg-cobalt hover:bg-cobalt-hover text-white text-xs font-semibold shadow-glow-cobalt transition-all flex items-center gap-2"
                      >
                        <Mic className="w-3.5 h-3.5 text-aqua" />
                        <span>{audioBlobUrl ? 'Record Again' : 'Start Recording'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStopRecording}
                        className="px-4 py-2 rounded-xl bg-coral hover:bg-coral-hover text-white text-xs font-bold transition-all flex items-center gap-2 animate-pulse"
                      >
                        <Square className="w-3.5 h-3.5" />
                        <span>Stop Recording</span>
                      </button>
                    )}

                    {audioBlobUrl && !isRecording && (
                      <button
                        type="button"
                        onClick={handleDeleteRecording}
                        className="p-2 text-slate-400 hover:text-coral transition-colors rounded-lg bg-slate-900 border border-slate-800"
                        title="Delete recording"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {audioBlobUrl && !isRecording && (
                    <audio controls src={audioBlobUrl} className="h-8 max-w-[200px]" />
                  )}
                </div>

                {/* Live Speech Recognition Transcript Box */}
                {liveTranscript && (
                  <div className="p-3 bg-midnight-900 border border-aqua/30 rounded-xl space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-aqua flex items-center gap-1.5 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        Live Speech Transcript (Real-time Web Speech)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setDescription((prev) => (prev ? prev + '\n\n' + liveTranscript : liveTranscript));
                        }}
                        className="text-[11px] font-semibold text-aqua hover:underline"
                      >
                        Append to Description
                      </button>
                    </div>
                    <textarea
                      value={liveTranscript}
                      onChange={(e) => setLiveTranscript(e.target.value)}
                      rows={2}
                      className="w-full text-xs bg-slate-950/80 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-aqua resize-none font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Friendly Recording Error / Fallback info */}
              {recordingError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Browser Voice Fallback: </span>
                    {recordingError}
                  </div>
                </div>
              )}
            </div>

            {/* File Uploads Drag & Drop Dropzone */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-subtle-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-cobalt" />
                  <span>3. Attach Ground Evidence (Photos, PDFs, Video, Audio)</span>
                </div>
                <span className="text-xs text-slate-500">Max 25MB / file</span>
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFileUpload(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all space-y-3 group focus:outline-none focus:ring-2 focus:ring-cobalt ${
                  isDragging
                    ? 'border-cobalt bg-cobalt/10 ring-2 ring-cobalt/40 shadow-glow-cobalt'
                    : 'border-slate-300 dark:border-slate-700 hover:border-cobalt/80 bg-white dark:bg-midnight-900 hover:bg-slate-50 dark:hover:bg-midnight-850 shadow-sm'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-midnight-800 border border-slate-200 dark:border-slate-700 shadow-sm mx-auto flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-cobalt group-hover:scale-105 transition-all">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Click to browse files or drag and drop here
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Photos (.png, .jpg), Documents (.pdf, .txt), Audio (.mp3, .wav), Video (.mp4, .webm)
                  </p>
                </div>

                {/* Direct Camera Capture Action & Video Badge */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-midnight-800 hover:bg-slate-100 dark:hover:bg-midnight-700 text-slate-800 dark:text-slate-100 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Camera className="w-3.5 h-3.5 text-cobalt" />
                    <span>Take Photo (Camera)</span>
                  </button>
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">•</span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Video footage supported</span>
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,application/pdf,audio/*,video/*,.txt,.csv"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
              </div>

              {uploadError && (
                <div className="p-3 bg-coral/10 border border-coral/30 rounded-xl text-xs text-coral font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Uploaded Evidence List */}
              {evidenceFiles.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-mono font-semibold text-slate-500">
                    Attached Files ({evidenceFiles.length}):
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {evidenceFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/80 text-xs gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {file.previewUrl ? (
                            <img
                              src={file.previewUrl}
                              alt={file.name}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-600">
                              {file.category === 'photo' ? (
                                <ImageIcon className="w-4 h-4 text-aqua" />
                              ) : file.category === 'audio_recording' || file.category === 'audio_file' ? (
                                <Mic className="w-4 h-4 text-amber-500" />
                              ) : (
                                <FileCheck className="w-4 h-4 text-cobalt" />
                              )}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">
                              {file.name}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {(file.sizeBytes / 1024).toFixed(0)} KB • {file.category}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.id)}
                          className="p-1.5 text-slate-400 hover:text-coral transition-colors rounded-lg hover:bg-white"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Context, Location, Language & Processing CTA (1 col) */}
          <div className="space-y-6">
            {/* Location Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-coral" />
                  <span>Incident Location</span>
                </div>

                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={locatingGPS || isLocationUnknown}
                  className="text-xs font-semibold text-cobalt hover:text-cobalt-hover flex items-center gap-1 disabled:opacity-50"
                >
                  <Navigation className={`w-3.5 h-3.5 ${locatingGPS ? 'animate-spin' : ''}`} />
                  <span>{locatingGPS ? 'Detecting...' : 'Auto GPS'}</span>
                </button>
              </div>

              {gpsError && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-snug">{gpsError}</p>
                </div>
              )}

              {!isLocationUnknown ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Street Address / Junction
                    </label>
                    <input
                      type="text"
                      value={locationAddress}
                      onChange={(e) => setLocationAddress(e.target.value)}
                      placeholder="e.g. 14th Cross, Indiranagar"
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-cobalt focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Prominent Landmark
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Opposite Metro Pillar 128"
                      className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-cobalt focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-800">Location Flagged as Unknown</div>
                  <p className="text-[11px] text-slate-500">
                    SutrAI will formulate recommendations while actively asking for nearby landmarks.
                  </p>
                </div>
              )}

              {/* Unknown Location Toggle */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Exact location unavailable?</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLocationUnknown}
                    onChange={(e) => setIsLocationUnknown(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-coral"></div>
                </label>
              </div>
            </div>

            {/* Live Environmental Weather Context Card */}
            {weatherPreview && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-subtle-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <CloudRain className="w-4 h-4 text-aqua" />
                    <span>Live Environmental Context</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    Open-Meteo Live
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-display font-bold text-midnight">
                      {weatherPreview.temperature}°C
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{weatherPreview.condition}</div>
                      <div className="text-[11px] text-slate-500">{weatherPreview.locationName}</div>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-500 font-mono">
                    <div>Wind: {weatherPreview.windSpeed} km/h</div>
                    <div>Rain: {weatherPreview.precipitation} mm</div>
                  </div>
                </div>

                {weatherPreview.severeHazards.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">{weatherPreview.severeHazards[0].type}: </span>
                      {weatherPreview.severeHazards[0].safetyGuidance}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Language & Consent Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle-card space-y-4">
              <div>
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2">
                  <Globe className="w-4 h-4 text-cobalt" />
                  <span>Report Language</span>
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white text-slate-800 focus:border-cobalt focus:outline-none cursor-pointer"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sensitive Information Consent */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sensitiveConsent}
                    onChange={(e) => setSensitiveConsent(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-cobalt focus:ring-cobalt"
                  />
                  <span className="text-xs text-slate-600 leading-snug">
                    I consent to processing sensitive incident and observational details for the sole purpose of emergency & civic triage.
                  </span>
                </label>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleReviewAndSubmit}
                disabled={!sensitiveConsent}
                className="w-full py-4 px-6 rounded-2xl bg-cobalt hover:bg-cobalt-hover disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white font-display font-bold text-base shadow-glow-cobalt transition-all duration-200 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none disabled:shadow-none"
              >
                <Sparkles className="w-5 h-5 text-aqua" />
                <span>Understand and Recommend Action</span>
              </button>

              {!sensitiveConsent ? (
                <p className="text-[11px] text-center text-amber-600 dark:text-amber-400 font-medium">
                  Please tick the consent checkbox above to enable submission.
                </p>
              ) : (
                <p className="text-[11px] text-center text-slate-500">
                  Next: Review extracted evidence before launching analysis.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Before Processing Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-aqua" />
                <h3 className="text-lg font-display font-bold text-midnight">
                  Review Submission Before Ingestion
                </h3>
              </div>
              {!isAnalyzing && (
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Review Summary Card */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                  Description Excerpt:
                </span>
                <p className="text-slate-800 line-clamp-3">
                  {description || 'No written text provided (Audio / Photo evidence only).'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                    Location:
                  </span>
                  <p className="font-medium text-slate-900 truncate">
                    {isLocationUnknown ? 'Unknown Point' : locationAddress}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                    Evidence Files:
                  </span>
                  <p className="font-medium text-slate-900">
                    {evidenceFiles.length} file(s) attached
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-cobalt/5 border border-cobalt/20 rounded-xl text-slate-700 dark:text-slate-200 flex items-center gap-2 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-cobalt dark:text-aqua flex-shrink-0" />
                <span>AI Ingestion Pipeline: Multimodal cross-examination with resilient offline fallback.</span>
              </div>
            </div>

            {/* Loading / Action Section */}
            {isAnalyzing ? (
              <div className="py-4 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-cobalt/20 border-t-cobalt rounded-full animate-spin mx-auto" />
                <div className="text-xs font-mono font-semibold text-slate-700">
                  {analysisStep === 1 && 'Ingesting multimodal audio & visual tokens...'}
                  {analysisStep === 2 && 'Examining cross-evidence consistency & civic registries...'}
                  {analysisStep === 3 && 'Routing optimal intervention and responsible agency...'}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pt-2">
                {analysisError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-mono flex items-start gap-2">
                    <span className="mt-0.5">⚠</span>
                    <span>{analysisError}</span>
                  </div>
                )}
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowReviewModal(false); setAnalysisError(null); }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Edit Input
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteAnalysis}
                    className="px-6 py-2.5 rounded-xl bg-cobalt hover:bg-cobalt-hover text-white text-xs font-bold shadow-glow-cobalt flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-aqua" />
                    <span>{analysisError ? 'Retry Analysis' : 'Confirm & Run Analysis'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
