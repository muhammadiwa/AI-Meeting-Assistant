# PRODUCT REQUIREMENT DOCUMENT (PRD)

## AI MEETING ASSISTANT DESKTOP APP

------------------------------------------------------------------------

## 1. PRODUCT OVERVIEW

AI Meeting Assistant Desktop App adalah aplikasi desktop berbasis
Electron yang berfungsi untuk:

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

Aplikasi bekerja dengan cara menangkap:

-   System Audio Output (Zoom / Meet / Teams)
-   Microphone Input (User Voice)

Tanpa perlu join meeting sebagai bot.

------------------------------------------------------------------------

## 2. OBJECTIVES

-   Membantu user mencatat meeting secara otomatis
-   Mengurangi kehilangan informasi penting
-   Mendeteksi tugas dan keputusan selama meeting
-   Menghasilkan notulensi meeting otomatis
-   Meningkatkan efisiensi komunikasi tim

------------------------------------------------------------------------

## 3. TARGET USERS

-   Software Engineers
-   Product Managers
-   Sales Team
-   Consultants
-   Project Managers
-   Remote Workers
-   Startup Teams

------------------------------------------------------------------------

## 4. PROBLEM STATEMENT

Meeting online seringkali:

-   Tidak terdokumentasi dengan baik
-   Banyak action item yang terlupakan
-   Tidak jelas siapa yang bertanggung jawab
-   Tidak memiliki summary resmi

Manual note-taking:

-   Mengganggu fokus meeting
-   Tidak akurat
-   Memakan waktu

------------------------------------------------------------------------

## 5. SOLUTION OVERVIEW

Aplikasi akan:

1.  Menangkap system audio meeting
2.  Mengirim audio ke Deepgram Streaming API
3.  Mendapatkan transcript real-time
4.  Mengirim transcript ke OpenAI
5.  Mengekstrak insight meeting
6.  Menampilkan insight secara live
7.  Menghasilkan summary setelah meeting selesai

------------------------------------------------------------------------

## 6. CORE FEATURES

### 6.1 Real-Time Audio Capture

Capture:

-   System Audio (Meeting Participants)
-   Microphone Audio (User)

Menggunakan:

-   navigator.mediaDevices.getDisplayMedia()
-   navigator.mediaDevices.getUserMedia()

------------------------------------------------------------------------

### 6.2 Audio Mixer Engine

Menggabungkan:

-   Mic Input
-   System Audio Output

Menjadi:

-   Single Mono Audio Stream

Menggunakan:

-   Web Audio API

------------------------------------------------------------------------

### 6.3 Real-Time Speech-to-Text (Deepgram)

Audio stream dikirim ke:

Deepgram Streaming WebSocket API

Output:

-   Live Transcript
-   Speaker Diarization (Speaker 0, Speaker 1, etc.)

------------------------------------------------------------------------

### 6.4 Transcript Chunk Buffer

Transcript akan:

-   Rolling Context Window (60s buffer, 30s overlap)
-   dikirim ke OpenAI GPT secara streaming

------------------------------------------------------------------------

### 6.5 Meeting Intelligence Engine (OpenAI)

LLM akan mengekstrak:

-   Action Items
-   Decisions
-   Deadlines
-   Assigned Tasks
-   Risks
-   Discussion Topics
-   Speaker Sentiment (Positive/Negative/Neutral)
-   Role Detection (Manager vs Engineer inference)

Output dalam format JSON:

``` json
{
  "summary": "",
  "decisions": [],
  "action_items": [],
  "risks": [],
  "next_steps": []
}
```

------------------------------------------------------------------------

### 6.6 Real-Time Insight Panel

Overlay window akan menampilkan:

-   Action items
-   Talking points
-   Detected decisions
-   Deadlines
-   Review Mode (Approve/Reject items)
-   Quiet Mode (Suppress frequent popups)

------------------------------------------------------------------------

### 6.7 Rolling Summary Generator

Update summary secara:

-   incremental
-   real-time

------------------------------------------------------------------------

### 6.8 Post Meeting Generator

Generate:

-   Full Meeting Summary
-   Meeting Minutes
-   Follow-Up Email Draft
-   Task List

------------------------------------------------------------------------

## 7. FUNCTIONAL REQUIREMENTS

  ID     Requirement
  ------ ---------------------------
  FR1    Capture system audio
  FR2    Capture microphone audio
  FR3    Merge audio streams
  FR4    Stream audio to Deepgram
  FR5    Receive transcript
  FR6    Buffer transcript
  FR7    Send transcript to OpenAI
  FR8    Extract meeting insights
  FR9    Display insights live
  FR10   Generate meeting summary

------------------------------------------------------------------------

## 8. NON-FUNCTIONAL REQUIREMENTS

  Requirement          Target
  -------------------- ----------
  Latency              \< 2 sec
  STT Delay            \< 500ms
  Insight generation   \< 5 sec
  CPU usage            \< 40%
  Memory               \< 1GB
  Startup time         \< 3 sec

------------------------------------------------------------------------

## 9. SYSTEM ARCHITECTURE

### Desktop Layer

-   Electron Main Process
-   Renderer Process
-   Audio Capture Module
-   Overlay Window

------------------------------------------------------------------------

### AI Processing Layer

-   Deepgram Streaming API
-   OpenAI GPT-4o

------------------------------------------------------------------------

### Processing Pipeline

    Mic Input + System Audio
              ↓
    Audio Mixer
              ↓
    Deepgram WS Streaming
              ↓
    Transcript
              ↓
    Chunk Buffer
              ↓
    OpenAI GPT
              ↓
    Insight Extractor
              ↓
    Overlay UI

------------------------------------------------------------------------

## 10. TECH STACK

  Layer              Tech
  ------------------ ---------------
  Desktop            Electron
  STT                Deepgram
  LLM                OpenAI
  Language           TypeScript
  UI                 React
  Audio Processing   Web Audio API
  Transport          WebSocket

------------------------------------------------------------------------

## 11. USER FLOW

1.  User launches app
2.  Start Meeting Session
3.  Capture mic + system audio
4.  Stream to Deepgram
5.  Receive transcript
6.  Send transcript to OpenAI
7.  Generate insights
8.  Display insights live
9.  End Meeting
10. Generate Summary

------------------------------------------------------------------------

## 12. SUCCESS METRICS

-   Transcript Accuracy
-   Insight Detection Accuracy
-   Latency
-   Summary Quality
-   Action Item Detection Rate

------------------------------------------------------------------------

## 13. FUTURE IMPROVEMENTS

-   Multi-language support
-   CRM Integration
-   Jira Integration
-   Slack Integration
-   Calendar Integration

------------------------------------------------------------------------

## 14. OPEN SOURCE GOALS

-   Modular architecture
-   Plugin-based LLM support
-   Configurable STT provider
-   Cross-platform support
