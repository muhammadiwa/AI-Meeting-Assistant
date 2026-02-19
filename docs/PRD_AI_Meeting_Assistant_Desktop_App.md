# PRODUCT REQUIREMENT DOCUMENT (PRD)

## AI MEETING ASSISTANT DESKTOP APP (AI Note Taker)

---

## 1. PRODUCT OVERVIEW

AI Meeting Assistant Desktop App (AI Note Taker) adalah aplikasi desktop
berbasis Electron yang berfungsi untuk:

-   Mendengarkan percakapan meeting online secara real-time
-   Mengubah percakapan menjadi transcript menggunakan Deepgram
    Streaming API
-   Menganalisa percakapan meeting menggunakan OpenAI GPT
-   Menghasilkan:
    -   Real-time meeting summary
    -   Action item detection
    -   Decision tracking
    -   Deadline detection
    -   Talking point suggestion
    -   Post-meeting follow-up email
    -   Speaker diarization & identification
    -   Sentiment analysis

Aplikasi bekerja dengan cara menangkap:

-   System Audio Output (Zoom / Meet / Teams)
-   Microphone Input (User Voice)

Tanpa perlu join meeting sebagai bot.

---

## 2. OBJECTIVES

-   Membantu user mencatat meeting secara otomatis
-   Mengurangi kehilangan informasi penting
-   Mendeteksi tugas dan keputusan selama meeting
-   Menghasilkan notulensi meeting otomatis
-   Meningkatkan efisiensi komunikasi tim
-   Menyediakan searchable meeting history
-   Memungkinkan export ke berbagai format

---

## 3. TARGET USERS

-   Software Engineers
-   Product Managers
-   Sales Team
-   Consultants
-   Project Managers
-   Remote Workers
-   Startup Teams

---

## 4. PROBLEM STATEMENT

Meeting online seringkali:

-   Tidak terdokumentasi dengan baik
-   Banyak action item yang terlupakan
-   Tidak jelas siapa yang bertanggung jawab
-   Tidak memiliki summary resmi
-   Sulit mencari kembali informasi dari meeting lama

Manual note-taking:

-   Mengganggu fokus meeting
-   Tidak akurat
-   Memakan waktu
-   Tidak bisa menangkap semua detail

---

## 5. SOLUTION OVERVIEW

Aplikasi akan:

1.  Menangkap system audio meeting + microphone
2.  Merge kedua audio stream menjadi mono stream
3.  Mengirim audio ke Deepgram Streaming API
4.  Mendapatkan transcript real-time dengan speaker diarization
5.  Buffer transcript menggunakan Rolling Context Window
6.  Mengirim transcript ke OpenAI secara streaming
7.  Mengekstrak insight meeting (actions, decisions, risks, sentiment)
8.  Menampilkan insight secara live via overlay window
9.  Menyimpan meeting session ke local database
10. Menghasilkan comprehensive summary setelah meeting selesai
11. Export hasil ke Markdown / Email / Copy

---

## 6. CORE FEATURES

### 6.1 Real-Time Audio Capture

Capture:

-   System Audio (Meeting Participants)
-   Microphone Audio (User)

Menggunakan:

-   Electron `desktopCapturer` API
-   `navigator.mediaDevices.getUserMedia()`

Permission Handling:

-   macOS: Screen Recording permission
-   Windows: No special permission required
-   Graceful fallback jika permission ditolak

---

### 6.2 Audio Mixer Engine

Menggabungkan:

-   Mic Input
-   System Audio Output

Menjadi:

-   Single Mono Audio Stream (PCM 16-bit, 16kHz)

Menggunakan:

-   Web Audio API (`AudioContext`, `MediaStreamSource`, `ChannelMerger`)

---

### 6.3 Real-Time Speech-to-Text (Deepgram)

Audio stream dikirim ke:

Deepgram Streaming WebSocket API

Konfigurasi:

-   Model: Nova-2
-   `smart_format=true`
-   `diarize=true`
-   `punctuate=true`
-   `interim_results=true`
-   `utterance_end_ms=1000`

Output:

-   Live Transcript (partial + final)
-   Speaker Diarization (Speaker 0, Speaker 1, etc.)
-   Word-level timestamps

Connection Management:

-   KeepAlive heartbeat
-   Auto-reconnect with exponential backoff
-   Local audio queue during reconnection (no data loss)

---

### 6.4 Transcript Buffer & Context Window

Transcript akan:

-   Di-buffer menggunakan Rolling Context Window
    -   Window size: 60 detik
    -   Overlap: 30 detik
    -   Trigger interval: setiap 15 detik atau pada sentence finalization
-   Dikirim ke OpenAI GPT secara streaming
-   Deduplicated saat digabung ke final summary

---

### 6.5 Meeting Intelligence Engine (OpenAI)

LLM akan mengekstrak:

-   Action Items (with assignee, deadline, priority)
-   Decisions (with context)
-   Deadlines (with associated task)
-   Assigned Tasks (who → what)
-   Risks & Blockers
-   Discussion Topics / Key Points
-   Speaker Sentiment (Positive / Negative / Neutral)
-   Role Detection (Manager vs Engineer inference)
-   Follow-up Questions (ambiguities detected)

Output dalam format JSON:

``` json
{
  "summary": "",
  "decisions": [
    {
      "text": "",
      "speaker": "",
      "confidence": 0.8,
      "timestamp": ""
    }
  ],
  "action_items": [
    {
      "task": "",
      "assignee": "",
      "deadline": "",
      "priority": "high|medium|low",
      "status": "pending"
    }
  ],
  "risks": [
    {
      "description": "",
      "severity": "high|medium|low"
    }
  ],
  "key_points": [],
  "sentiment": {
    "overall": "positive|neutral|negative",
    "speakers": {}
  },
  "follow_ups": [],
  "next_steps": []
}
```

Model Strategy:

-   Real-time extraction: GPT-4o-mini (cost-efficient, low latency)
-   Post-meeting summary: GPT-4o (higher quality)
-   Structured output via OpenAI JSON mode

---

### 6.6 Real-Time Insight Panel (Overlay)

Overlay window akan menampilkan:

-   Live transcript with speaker labels
-   Action items (real-time detected)
-   Talking points / suggestions
-   Detected decisions
-   Deadlines
-   Risk alerts

Modes:

-   **Live Mode:** Full overlay with transcript + insights
-   **Quiet Mode:** Minimal — only critical alerts (action items, risks)
-   **Review Mode:** Post-meeting checklist — approve/reject/edit items

Interaction:

-   Pin important insights
-   Reject false positives
-   Edit detected items inline
-   Draggable & resizable window

---

### 6.7 Rolling Summary Generator

Update summary secara:

-   Incremental (setiap chunk baru)
-   Real-time (streaming ke UI)
-   Deduplicated (no repeated insights)

---

### 6.8 Post Meeting Generator

Generate:

-   Full Meeting Summary (Executive + Detailed)
-   Meeting Minutes (structured format)
-   Follow-Up Email Draft
-   Task List (with assignee & deadline)
-   Key Decisions Document

Export options:

-   Copy to clipboard (Markdown)
-   Download as .md file
-   Copy as email-friendly HTML

---

### 6.9 Meeting History & Storage

-   Local database (SQLite via `better-sqlite3` or IndexedDB)
-   Store: transcript, insights, summary, metadata per session
-   Searchable meeting history
-   Meeting metadata: title, date, duration, participants

---

### 6.10 Settings & Configuration

-   API Key management (Deepgram, OpenAI)
-   Audio device selection (mic, system audio source)
-   LLM model selection
-   Language preference
-   Overlay position & behavior preferences
-   Data retention settings

---

## 7. FUNCTIONAL REQUIREMENTS

| ID   | Requirement                              | Priority |
|------|------------------------------------------|----------|
| FR1  | Capture system audio                     | P0       |
| FR2  | Capture microphone audio                 | P0       |
| FR3  | Merge audio streams                      | P0       |
| FR4  | Stream audio to Deepgram                 | P0       |
| FR5  | Receive transcript with diarization      | P0       |
| FR6  | Rolling context window buffer            | P0       |
| FR7  | Stream transcript to OpenAI              | P0       |
| FR8  | Extract meeting insights (JSON)          | P0       |
| FR9  | Display insights live via overlay        | P0       |
| FR10 | Generate post-meeting summary            | P0       |
| FR11 | Save meeting session to local DB         | P1       |
| FR12 | Meeting history & search                 | P1       |
| FR13 | Export summary (Markdown/Email)           | P1       |
| FR14 | Settings page                            | P1       |
| FR15 | Review mode (approve/reject items)       | P1       |
| FR16 | WebSocket reconnection logic             | P0       |
| FR17 | Speaker name mapping                     | P2       |
| FR18 | Quiet mode toggle                        | P2       |

---

## 8. NON-FUNCTIONAL REQUIREMENTS

| Requirement        | Target       |
|--------------------|--------------|
| E2E Latency        | < 3 sec      |
| STT Delay          | < 500ms      |
| Insight generation | < 5 sec      |
| CPU usage          | < 40%        |
| Memory             | < 500MB      |
| Startup time       | < 3 sec      |
| Reconnect time     | < 2 sec      |
| Audio quality      | 16kHz mono   |

---

## 9. SYSTEM ARCHITECTURE

### Desktop Layer

-   Electron Main Process (IPC, audio permissions, window management)
-   Renderer Process (React UI)
-   Audio Capture Module (desktopCapturer + getUserMedia)
-   Audio Mixer (Web Audio API)
-   Overlay Window (BrowserWindow, alwaysOnTop)

---

### AI Processing Layer

-   Deepgram Streaming API (WebSocket)
-   OpenAI GPT-4o / GPT-4o-mini (REST streaming)

---

### Data Layer

-   Local SQLite / IndexedDB
-   Electron-store (encrypted settings & API keys)

---

### Processing Pipeline

```
Mic Input + System Audio
          ↓
    Audio Mixer (Web Audio API)
          ↓
    MediaRecorder (PCM chunks)
          ↓
    Deepgram WebSocket Streaming
          ↓
    Transcript (with speaker labels)
          ↓
    Rolling Context Window (60s/30s overlap)
          ↓
    OpenAI GPT Streaming
          ↓
    Insight Extractor (JSON structured output)
          ↓
    State Store (Zustand)
          ↓
    Overlay UI + Dashboard
          ↓
    Local Database (persist)
```

---

## 10. TECH STACK

| Layer              | Technology                      |
|--------------------|---------------------------------|
| Desktop            | Electron                        |
| Frontend           | React + TypeScript              |
| Build Tool         | Vite                            |
| Styling            | TailwindCSS + shadcn/ui         |
| State Management   | Zustand                         |
| STT                | Deepgram Nova-2                 |
| LLM                | OpenAI GPT-4o / GPT-4o-mini    |
| Audio Processing   | Web Audio API                   |
| Transport          | WebSocket (Deepgram), REST (OpenAI) |
| Local Storage      | SQLite / IndexedDB              |
| Settings Store     | electron-store (encrypted)      |
| Packaging          | electron-builder                |
| Animation          | Framer Motion                   |

---

## 11. USER FLOW

### 11.1 Start Meeting Session

1.  User launches app
2.  User clicks "Start Meeting"
3.  (Optional) User enters meeting title
4.  App requests audio permissions
5.  App captures mic + system audio
6.  Audio mixer merges streams
7.  WebSocket connects to Deepgram
8.  Recording indicator appears (pulsing red dot)

### 11.2 During Meeting (Live)

9.  Deepgram returns real-time transcript
10. Transcript appears in overlay (speaker-labeled)
11. Every 15s: Rolling context sent to OpenAI
12. Insights extracted and displayed (action items, decisions)
13. User can pin/reject/edit detected items
14. Rolling summary updates continuously

### 11.3 End Meeting

15. User clicks "End Meeting"
16. App sends full transcript to GPT-4o for final summary
17. Review Mode activates — user approves/rejects items
18. Meeting saved to local database
19. Export options presented (Markdown, Email, Copy)

---

## 12. SUCCESS METRICS

-   Transcript Accuracy (target: >90% WER)
-   Insight Detection Accuracy (target: >85%)
-   End-to-End Latency (target: <3s)
-   Summary Quality (user rating >4/5)
-   Action Item Detection Rate (target: >90%)
-   User Retention (weekly active usage)
-   Export Usage Rate

---

## 13. FUTURE IMPROVEMENTS

-   Multi-language support
-   CRM Integration (Salesforce, HubSpot)
-   Jira / Linear Integration
-   Slack Integration (post summary to channel)
-   Calendar Integration (auto-associate with events)
-   RAG — "Ask your meetings" feature
-   AI conversation memory across meetings
-   Custom prompt templates
-   Team collaboration (shared meeting notes)
-   Cloud sync

---

## 14. OPEN SOURCE GOALS

-   Modular architecture (pluggable components)
-   Plugin-based LLM support (swap OpenAI → Anthropic → local)
-   Configurable STT provider (swap Deepgram → Whisper → AssemblyAI)
-   Cross-platform support (Windows, macOS, Linux)
-   Community-contributed prompt templates
