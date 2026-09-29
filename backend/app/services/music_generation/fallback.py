"""Algorithmic Fallback Composer.

Generates structured music using rule-based music theory (scales, chord progressions,
rhythm synthesis) and converts notes to audio WAV/MIDI formats.
Guarantees fast, offline, zero-GPU generation fallback.
"""

from __future__ import annotations

import math
import os
import random
import wave
import struct
from typing import Any

from app.services.music_generation.base import MusicGenerationService
from app.utils.storage import StorageService


# Note frequency lookup table (A4 = 440 Hz)
NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
SCALE_INTERVALS = {
    "major": [0, 2, 4, 5, 7, 9, 11],
    "minor": [0, 2, 3, 5, 7, 8, 10],
    "pentatonic": [0, 2, 4, 7, 9],
    "blues": [0, 3, 5, 6, 7, 10],
    "dorian": [0, 2, 3, 5, 7, 9, 10],
}

GENRE_DEFAULT_BPM = {
    "lo-fi": 75,
    "ambient": 70,
    "cinematic": 90,
    "classical": 80,
    "pop": 120,
    "rock": 130,
    "electronic": 128,
    "hip-hop": 92,
    "jazz": 85,
    "folk": 95,
}

MOOD_SCALES = {
    "happy": ("C", "major"),
    "sad": ("A", "minor"),
    "relaxed": ("G", "major"),
    "energetic": ("E", "major"),
    "dark": ("D", "minor"),
    "peaceful": ("F", "major"),
    "inspirational": ("D", "major"),
    "mysterious": ("B", "minor"),
}


def note_to_freq(note_name: str, octave: int = 4) -> float:
    """Convert note name (e.g. 'C', 'F#') and octave to frequency in Hz."""
    note_idx = NOTE_NAMES.index(note_name) if note_name in NOTE_NAMES else 0
    midi_num = (octave + 1) * 12 + note_idx
    return 440.0 * (2.0 ** ((midi_num - 69) / 12.0))


class AlgorithmicComposer(MusicGenerationService):
    """Rule-based procedural music composer."""

    def __init__(self):
        self.storage = StorageService()

    def _generate_wav_audio(
        self,
        key: str,
        scale_name: str,
        bpm: int,
        duration_sec: int,
        instruments: list[str],
    ) -> bytes:
        """Synthesize multi-track procedural audio (piano/synth/drums) as WAV bytes."""
        sample_rate = 22050
        num_samples = int(sample_rate * duration_sec)
        audio = [0.0] * num_samples

        scale_offsets = SCALE_INTERVALS.get(scale_name.lower(), SCALE_INTERVALS["major"])
        root_idx = NOTE_NAMES.index(key) if key in NOTE_NAMES else 0

        # Build scale pitch frequencies
        scale_freqs = []
        for octave in [3, 4, 5]:
            for offset in scale_offsets:
                pitch_idx = (root_idx + offset) % 12
                pitch_octave = octave + (root_idx + offset) // 12
                note_name = NOTE_NAMES[pitch_idx]
                scale_freqs.append(note_to_freq(note_name, pitch_octave))

        beat_duration = 60.0 / max(40, bpm)
        quarter_samples = int(sample_rate * beat_duration)

        # 1. Harmonic Chord Progression (Bass / Pads)
        chord_root_indices = [0, 3, 4, 1]  # I - IV - V - ii progression
        chord_duration = quarter_samples * 4

        for sample_idx in range(num_samples):
            t = sample_idx / sample_rate

            # Current chord
            chord_step = (sample_idx // chord_duration) % len(chord_root_indices)
            root_freq = scale_freqs[chord_root_indices[chord_step] % len(scale_freqs)]
            third_freq = scale_freqs[(chord_root_indices[chord_step] + 2) % len(scale_freqs)]
            fifth_freq = scale_freqs[(chord_root_indices[chord_step] + 4) % len(scale_freqs)]

            # Pad synth
            pad_val = 0.12 * (
                math.sin(2 * math.pi * root_freq * t) +
                0.5 * math.sin(2 * math.pi * third_freq * t) +
                0.5 * math.sin(2 * math.pi * fifth_freq * t)
            )

            # Sub-bass
            bass_val = 0.15 * math.sin(2 * math.pi * (root_freq * 0.5) * t)

            # Arpeggiated Melody
            arp_step = (sample_idx // (quarter_samples // 2)) % len(scale_freqs)
            melody_freq = scale_freqs[arp_step % len(scale_freqs)]
            env = math.exp(-((sample_idx % (quarter_samples // 2)) / (sample_rate * 0.15)))
            melody_val = 0.15 * math.sin(2 * math.pi * melody_freq * t) * env

            # Percussion pulse (if drums requested)
            drum_val = 0.0
            if "drums" in instruments or "percussion" in instruments:
                kick_env = math.exp(-((sample_idx % quarter_samples) / (sample_rate * 0.08)))
                drum_val = 0.2 * math.sin(2 * math.pi * 55 * t) * kick_env

            audio[sample_idx] = max(-1.0, min(1.0, pad_val + bass_val + melody_val + drum_val))

        # Convert to 16-bit PCM WAV
        raw_pcm = bytearray()
        for sample in audio:
            int_val = int(sample * 32767)
            raw_pcm.extend(struct.pack("<h", int_val))

        wav_bytes = bytearray()
        # Simple wave file creation
        import io
        buf = io.BytesIO()
        with wave.open(buf, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(sample_rate)
            wf.writeframes(raw_pcm)

        return buf.getvalue()

    def _generate_midi_bytes(
        self,
        key: str,
        scale_name: str,
        bpm: int,
        duration_sec: int,
        instruments: list[str],
    ) -> bytes | None:
        try:
            import pretty_midi
            pm = pretty_midi.PrettyMIDI(initial_tempo=float(max(40, bpm)))
            piano = pretty_midi.Instrument(program=0, name="Piano")
            strings_inst = pretty_midi.Instrument(program=48, name="Strings")
            bass = pretty_midi.Instrument(program=33, name="Bass")

            beat_sec = 60.0 / max(40, bpm)
            total_beats = max(4, int(duration_sec / beat_sec))

            scale_offsets = SCALE_INTERVALS.get(scale_name.lower(), SCALE_INTERVALS["major"])
            root_idx = NOTE_NAMES.index(key) if key in NOTE_NAMES else 0
            root_pitch = 60 + root_idx

            chord_indices = [0, 3, 4, 1]
            for b in range(0, total_beats, 4):
                chord_pos = (b // 4) % len(chord_indices)
                deg = chord_indices[chord_pos]
                deg_offset = scale_offsets[deg % len(scale_offsets)]
                c_root = root_pitch + deg_offset
                c_third = root_pitch + scale_offsets[(deg + 2) % len(scale_offsets)]
                c_fifth = root_pitch + scale_offsets[(deg + 4) % len(scale_offsets)]

                st = b * beat_sec
                et = min(float(duration_sec), (b + 4) * beat_sec)

                piano.notes.append(pretty_midi.Note(velocity=80, pitch=c_root, start=st, end=et))
                piano.notes.append(pretty_midi.Note(velocity=75, pitch=c_third, start=st, end=et))
                piano.notes.append(pretty_midi.Note(velocity=75, pitch=c_fifth, start=st, end=et))

                strings_inst.notes.append(pretty_midi.Note(velocity=65, pitch=c_root + 12, start=st, end=et))
                bass.notes.append(pretty_midi.Note(velocity=90, pitch=c_root - 12, start=st, end=et))

            lead = pretty_midi.Instrument(program=11, name="Melody")
            for b in range(total_beats):
                deg = (b * 2) % len(scale_offsets)
                m_pitch = root_pitch + 12 + scale_offsets[deg]
                st = b * beat_sec
                et = min(float(duration_sec), (b + 0.8) * beat_sec)
                lead.notes.append(pretty_midi.Note(velocity=85, pitch=m_pitch, start=st, end=et))

            pm.instruments.extend([piano, strings_inst, bass, lead])

            import io
            buf = io.BytesIO()
            pm.write(buf)
            return buf.getvalue()
        except Exception as e:
            print(f"[AlgorithmicComposer] MIDI synthesis notice: {e}")
            return None

    async def generate(self, params: dict[str, Any]) -> dict[str, Any]:
        genre = params.get("genre") or "ambient"
        mood = params.get("mood") or "relaxed"

        default_key, default_scale = MOOD_SCALES.get(mood, ("C", "major"))
        key = params.get("key") or default_key
        scale = params.get("scale") or default_scale
        bpm = params.get("bpm") or GENRE_DEFAULT_BPM.get(genre, 90)
        duration = params.get("duration") or 30
        instruments = params.get("instruments") or ["piano", "synth", "strings"]

        # Synthesize audio WAV file
        wav_content = self._generate_wav_audio(key, scale, bpm, duration, instruments)
        wav_filename = f"gen_{random.randint(100000, 999999)}.wav"
        file_url = await self.storage.save_file(wav_content, wav_filename, content_type="audio/wav")

        # Synthesize MIDI file
        midi_url = None
        midi_bytes = self._generate_midi_bytes(key, scale, bpm, duration, instruments)
        if midi_bytes:
            midi_filename = f"gen_{random.randint(100000, 999999)}.mid"
            midi_url = await self.storage.save_file(midi_bytes, midi_filename, content_type="audio/midi")

        structure = {
            "sections": [
                {"name": "Intro", "duration": max(4, duration // 4), "bars": 4},
                {"name": "Main Theme", "duration": max(8, duration // 2), "bars": 8},
                {"name": "Outro", "duration": max(4, duration // 4), "bars": 4},
            ]
        }

        return {
            "audioUrl": file_url,
            "midiUrl": midi_url,
            "duration": duration,
            "bpm": bpm,
            "key": key,
            "scale": scale,
            "instruments": instruments,
            "structure": structure,
            "genre": genre,
            "mood": mood,
            "composer": "AlgorithmicFallbackComposer",
        }
