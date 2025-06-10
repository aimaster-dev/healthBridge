import { useState, useEffect, useRef } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack
} from 'agora-rtc-react';
import { Video, Mic, MicOff, VideoOff, PhoneOff, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface VideoCallProps {
  channelName: string;
  userName: string;
  onLeave: () => void;
}

const VideoCall = ({ channelName, userName, onLeave }: VideoCallProps) => {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);

  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [selectedMicId, setSelectedMicId] = useState<string>('');
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>('');

  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [users, setUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const remoteRefs = useRef<{ [uid: string]: HTMLDivElement | null }>({});
  const localVideoRef = useRef<HTMLDivElement | null>(null);

  if (!clientRef.current) {
    clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  }
  const client = clientRef.current;

  useEffect(() => {
    const loadDevices = async () => {
      const cams = await AgoraRTC.getCameras();
      const mics = await AgoraRTC.getMicrophones();
      const spks = await AgoraRTC.getPlaybackDevices?.();
      setCameras(cams);
      setMicrophones(mics);
      setSpeakers(spks || []);
      if (cams[0]) setSelectedCameraId(cams[0].deviceId);
      if (mics[0]) setSelectedMicId(mics[0].deviceId);
      if (spks?.[0]) setSelectedSpeakerId(spks[0].deviceId);
    };
    loadDevices();
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    const init = async () => {
      if (!client || client.connectionState !== 'DISCONNECTED') {
        console.warn('Client already connected or connecting');
        return;
      }

      try {
        const uid = `${userName}-${Math.floor(Math.random() * 100000)}`;
        const joinPromise = client.join(import.meta.env.VITE_AGORA_APP_ID, channelName, null, uid);

        if (abortController.signal.aborted) return;
        await joinPromise;

        if (abortController.signal.aborted) return;

        setHasJoined(true);
        client.setClientRole('host');

        toast.success('Connected to video call');

        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType);

          setUsers(prev => {
            const exists = prev.find(u => u.uid === user.uid);
            return exists ? prev : [...prev, user];
          });

          if (mediaType === 'audio') user.audioTrack?.play();
          if (mediaType === 'video') {
            setTimeout(() => {
              const el = remoteRefs.current[user.uid];
              if (el && user.videoTrack) user.videoTrack.play(el);
            }, 300);
          }
        });

        client.on('user-unpublished', user => {
          setUsers(prev => prev.filter(u => u.uid !== user.uid));
        });
      } catch (err) {
        if ((err as any).code !== 'OPERATION_ABORTED') {
          console.error('Error initializing video call:', err);
          toast.error('Failed to connect to video call');
          onLeave();
        }
      }
    };

    init();

    return () => {
      abortController.abort();
      const cleanup = async () => {
        try {
          localAudioTrack?.close();
          localVideoTrack?.close();
          await client.leave();
        } catch (err) {
          console.warn('Error during cleanup:', err);
        }
      };
      void cleanup();
    };
  }, [channelName, userName]);

  useEffect(() => {
    const setupTracks = async () => {
      if (
        !client ||
        !hasJoined ||
        client.connectionState !== 'CONNECTED' ||
        !selectedCameraId ||
        !selectedMicId
      ) return;

      try {
        localAudioTrack?.close();
        localVideoTrack?.close();
        await client.unpublish([localAudioTrack, localVideoTrack].filter(Boolean));

        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({ microphoneId: selectedMicId });
        const videoTrack = await AgoraRTC.createCameraVideoTrack({ cameraId: selectedCameraId });

        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);

        await client.publish([audioTrack, videoTrack]);
      } catch (error) {
        console.error('Error updating tracks:', error);
        toast.error('Could not update media tracks');
      }
    };

    if (selectedCameraId && selectedMicId && hasJoined) {
      setupTracks();
    }
  }, [selectedCameraId, selectedMicId, hasJoined]);

  useEffect(() => {
    if (localVideoTrack && localVideoRef.current) {
      localVideoTrack.play(localVideoRef.current);
    }
  }, [localVideoTrack, isVideoEnabled]);

  const toggleVideo = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleAudio = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!isAudioEnabled);
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const handleLeave = () => {
    localAudioTrack?.close();
    localVideoTrack?.close();
    client.leave();
    onLeave();
    toast.success('Left video call');
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-4">
        <select onChange={e => setSelectedCameraId(e.target.value)} value={selectedCameraId}>
          {cameras.map(c => <option key={c.deviceId} value={c.deviceId}>{c.label}</option>)}
        </select>
        <select onChange={e => setSelectedMicId(e.target.value)} value={selectedMicId}>
          {microphones.map(m => <option key={m.deviceId} value={m.deviceId}>{m.label}</option>)}
        </select>
        <select onChange={e => {
          setSelectedSpeakerId(e.target.value);
          client.setPlaybackDevice?.(e.target.value);
        }} value={selectedSpeakerId}>
          {speakers.map(s => <option key={s.deviceId} value={s.deviceId}>{s.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="relative bg-gray-800/50 rounded-xl overflow-hidden border border-white/10 backdrop-blur-sm">
          <div ref={localVideoRef} className="w-full h-[400px] bg-black" />
          {!isVideoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <UserCircle className="h-20 w-20 text-gray-400" />
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {userName} (You)
          </div>
        </div>

        {users.map(user => (
          <div key={user.uid} className="relative bg-gray-700 rounded overflow-hidden">
            <div
              ref={(el) => {
                remoteRefs.current[user.uid] = el;
              }}
              className="w-full h-[400px]"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-4 justify-center">
        <button onClick={toggleVideo} className="bg-blue-600 px-4 py-2 rounded text-white">
          {isVideoEnabled ? 'Turn Video Off' : 'Turn Video On'}
        </button>
        <button onClick={toggleAudio} className="bg-blue-600 px-4 py-2 rounded text-white">
          {isAudioEnabled ? 'Mute' : 'Unmute'}
        </button>
        <button onClick={handleLeave} className="bg-red-600 px-4 py-2 rounded text-white">
          Leave
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
