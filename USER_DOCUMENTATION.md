# Interview Cracked (HD Audio Process) — Complete User Guide & Feature Manual

Welcome to the definitive user manual for **Interview Cracked** (process name: `HD Audio Process` / `Cheating Daddy Groq`). This application is an ultra-stealth, real-time AI copilot engineered for live technical interviews, coding assessments, academic exams, sales calls, executive presentations, and high-stakes business negotiations.

This guide provides an exhaustive walkthrough of every feature, architectural component, shortcut, configuration option, stealth mechanism, and troubleshooting workflow built into the system.

---

## Table of Contents

1. [Architecture & System Overview](#1-architecture--system-overview)
2. [Installation & Platform Setup](#2-installation--platform-setup)
    - [macOS Configuration](#macos-configuration)
    - [Windows Configuration](#windows-configuration)
    - [Linux Configuration](#linux-configuration)
3. [Authentication, Device Locking & Licensing](#3-authentication-device-locking--licensing)
4. [First Launch & Onboarding Experience](#4-first-launch--onboarding-experience)
5. [The User Interface & Navigation](#5-the-user-interface--navigation)
    - [Header Bar & Drag Region](#header-bar--drag-region)
    - [Sidebar Navigation](#sidebar-navigation)
    - [Main Setup View](#main-setup-view)
    - [Live Assistant Overlay View](#live-assistant-overlay-view)
    - [Profile & Resume Management View](#profile--resume-management-view)
    - [Customize & Interface View](#customize--interface-view)
    - [Session History & AI Summary View](#session-history--ai-summary-view)
    - [Advanced Settings & Data Management View](#advanced-settings--data-management-view)
    - [Help & Shortcut Reference View](#help--shortcut-reference-view)
6. [AI Profiles & Prompt Frameworks](#6-ai-profiles--prompt-frameworks)
    - [Job Interview (`interview`)](#job-interview-interview)
    - [Exam Assistant — Groq (`exam-groq`)](#exam-assistant--groq-exam-groq)
    - [Exam Assistant — Gemini (`exam`)](#exam-assistant--gemini-exam)
    - [Product Case Study (`product`)](#product-case-study-product)
    - [Sales Call (`sales`)](#sales-call-sales)
    - [Business Meeting (`meeting`)](#business-meeting-meeting)
    - [Presentation (`presentation`)](#presentation-presentation)
    - [Negotiation (`negotiation`)](#negotiation-negotiation)
7. [Audio Processing & Voice Activity Detection (VAD)](#7-audio-processing--voice-activity-detection-vad)
    - [Dual-Stream Audio Capture Pipeline](#dual-stream-audio-capture-pipeline)
    - [Smart Detection Mode (Automatic VAD)](#smart-detection-mode-automatic-vad)
    - [Manual Control Mode (Push-to-Talk)](#manual-control-mode-push-to-talk)
    - [Speech Language Selection](#speech-language-selection)
8. [Screen Capture & Vision Analysis](#8-screen-capture--vision-analysis)
    - [Manual On-Demand Capture (`Cmd/Ctrl + Enter`)](#manual-on-demand-capture-cmdctrl--enter)
    - [Continuous Auto-Capture (Exam Groq Mode)](#continuous-auto-capture-exam-groq-mode)
    - [Image Quality & Token Optimization](#image-quality--token-optimization)
9. [Stealth Engineering & Anti-Detection Systems](#9-stealth-engineering--anti-detection-systems)
    - [Hardware-Level Content Protection](#hardware-level-content-protection)
    - [Click-Through Transparency (`Cmd/Ctrl + M`)](#click-through-transparency-cmdctrl--m)
    - [Windows Taskbar & Alt-Tab Stripping](#windows-taskbar--alt-tab-stripping)
    - [macOS Mission Control & Dock Concealment](#macos-mission-control--dock-concealment)
    - [Dynamic Process & Window Title Randomization](#dynamic-process--window-title-randomization)
    - [Stealth Profiles (Visible vs Balanced vs Ultra-Stealth)](#stealth-profiles-visible-vs-balanced-vs-ultra-stealth)
10. [Global Keyboard Shortcuts Master Table](#10-global-keyboard-shortcuts-master-table)
11. [Resume Extraction & Context Personalization](#11-resume-extraction--context-personalization)
12. [Real-Time Assistant Capabilities](#12-real-time-assistant-capabilities)
    - [Word-by-Word Streaming & Markdown Rendering](#word-by-word-streaming--markdown-rendering)
    - [Smart Code Block Copying](#smart-code-block-copying)
    - [Interactive Follow-Up Chips](#interactive-follow-up-chips)
    - [Direct Chat Input](#direct-chat-input)
    - [Response History Pagination](#response-history-pagination)
13. [Rate Limiting, Throttling & Auto-Retry Engine](#13-rate-limiting-throttling--auto-retry-engine)
14. [Emergency Erase & Data Sanitization](#14-emergency-erase--data-sanitization)
15. [Troubleshooting & FAQs](#15-troubleshooting--faqs)

---

## 1. Architecture & System Overview

Interview Cracked is built on Electron with a headless Node.js backend communicating via isolated IPC channels with a reactive Web Components frontend (LitElement).

```
                                  +-------------------------------------------------------+
                                  |              Interview Cracked Overlay                |
                                  |   (Frameless, Transparent, Always-on-Top, Invisible)  |
                                  +---------------------------+---------------------------+
                                                              |
                                           IPC Channel (Isolated Context)
                                                              |
                                  +---------------------------v---------------------------+
                                  |                 Main Electron Process                 |
                                  +--------+------------------+------------------+--------+
                                           |                  |                  |
                    +----------------------+                  |                  +----------------------+
                    v                                         v                                         v
       +-------------------------+               +-------------------------+               +-------------------------+
       |   Audio Capture Engine  |               |   Screen Vision Engine  |               |  AI Inference Engines   |
       |  - macOS: SystemAudioDump|              |  - DesktopCapturer      |               |  - Groq Whisper Large V3|
       |  - Win: Loopback Stream |               |  - Qwen 3.8 27B Vision  |               |  - Groq GPT OSS 120B/20B|
       |  - Silero VAD Node      |               |  - Llama 3.2 11B Vision |               |  - Gemini 2.5 Flash/Pro |
       +-------------------------+               +-------------------------+               |  - Gemini Live Preview  |
                                                                                           +-------------------------+
```

### Key Subsystems:

- **Groq High-Speed Pipeline**: Utilizes Groq Cloud TPU infrastructure for near-instant transcription (Whisper Large V3 Turbo) and reasoning with `openai/gpt-oss-120b` and `openai/gpt-oss-20b`.
- **Gemini Live Pipeline**: Utilizes Google GenAI SDK (`@google/genai`) connecting to `gemini-live-2.5-flash-preview` for bidirectional real-time audio and `gemini-2.5-flash` / `gemini-2.5-pro` for deep coding problems.
- **Silero VAD (Voice Activity Detection)**: Real-time neural voice detection filtering pauses, background coughs, and silence without sending junk audio over the wire.
- **Hardware Content Protector**: Instructs OS display servers (Quartz on macOS, DWM on Windows) to exclude the window from screen capturing pipelines.

---

## 2. Installation & Platform Setup

### Prerequisites

- Node.js 18.x or 20.x
- Modern GPU or integrated display supporting hardware transparency

```bash
# Clone the repository
git clone <repository_url>
cd cheating-daddy-groq

# Install dependencies
npm install

# Run application in development mode
npm start
```

### macOS Configuration

1. **Screen & System Audio Recording Permission (Zero-Friction)**:
    - macOS requires screen/audio capture permission to transcribe incoming system audio from Zoom, Teams, Google Meet, or browsers.
    - When starting your first session, macOS automatically shows a native system prompt:
        > _"Audio Helper" would like to record this computer's screen and audio._
    - Click **Open System Settings** (or go to `System Settings` > `Privacy & Security` > `Screen & System Audio Recording`).
    - `Audio Helper` (and `HD Audio Process`) will already appear directly in the list! Simply flip the toggle switch to **ON**.
    - > [!NOTE]
      > Unlike raw binary tools, you **do not** need to click the `+` button, press `Cmd+Shift+G`, or manually paste internal `.app/Contents/Resources/` paths. The bundled `AudioHelper.app` handles registration automatically.
2. **Microphone Permission**:
    - Go to `System Settings` > `Privacy & Security` > `Microphone`.
    - Ensure the application is granted access.
3. **Automatic Binary Self-Healing (`AudioHelper`)**:
    - The application automatically validates, repairs `0755` executable permissions, and removes quarantine attributes from `AudioHelper.app` and `SystemAudioDump` at runtime. Manual `chmod +x` is **not required**.
4. **First-Launch Gatekeeper Flow (Without Apple Developer Account)**:
    - Because the app is ad-hoc signed, macOS may show an _"Unidentified Developer"_ prompt when opening for the first time.
    - Simply **Right-Click (or Control-Click) the app icon > Open > Open**, or go to **System Settings > Privacy & Security** and click **Open Anyway**.
    - Alternatively, install via the automated one-line script which bypasses browser quarantine completely:
        ```bash
        curl -fsSL https://raw.githubusercontent.com/whoroopamgupta/cheating-daddy-groq/main/scripts/install-mac.sh | bash
        ```
5. **Mission Control Behavior**:
    - The application automatically configures itself as an `NSPanel` (`floating` level) and hides from the macOS Dock via `app.dock.hide()`.

### Windows Configuration

1. **Tool Window Injection**:
    - The app executes a native PowerShell helper script (`windowsNative.js`) that injects `WS_EX_TOOLWINDOW` and strips `WS_EX_APPWINDOW`. This guarantees the window never shows up in Alt-Tab, the Taskbar, or Zoom/Teams window picker lists.
2. **Audio Loopback**:
    - System audio is captured via `navigator.mediaDevices.getDisplayMedia({ audio: true, video: true })` using Windows CoreAudio loopback. Ensure your default audio playback device is active.

### Linux Configuration

1. Audio is routed through PulseAudio / PipeWire monitor sources.
2. For Wayland users: If window transparency or content protection behaves unexpectedly, launch Electron with X11 backend:
    ```bash
    ELECTRON_OZONE_PLATFORM_HINT=x11 npm start
    ```

---

## 3. Authentication, Device Locking & Licensing

The application connects to the secure **Interview Cracked** subscription backend via Supabase.

### 1. Account Login

- Enter your registered email address and password on the Login screen.
- The app queries `https://www.interviewcracked.com/api/auth/login` and cross-references plan statuses against Supabase RPC endpoints.

### 2. Device Locking Security

- To prevent credential sharing, licenses are hardware-bound using a persistent machine UUID (generated via OS BIOS serials, MAC addresses, and motherboard GUIDs).
- On initial login, your computer ID is sent to the Supabase RPC function `check_and_lock_device`.
- If an account attempts to log in from a secondary machine, the system denies access:
    > _"This account is securely locked to a different device. Please contact support if you need to transfer your license to a new computer."_

### 3. Expiry Validation

- At startup and every heartbeat cycle, the app validates your subscription expiration date in Indian Standard Time (IST). If expired, the app gracefully returns to the login screen with a renewal prompt.

### 4. Bundled vs Custom API Keys

- **Included Subscription Key**: Most active subscriptions include built-in access to the Groq LLM and Whisper inference endpoints. When active, the API key input is automatically locked with the placeholder:
  `"You are using Interview Cracked API Key"`
- **Bring Your Own Key (BYOK)**: If you are running standalone or utilizing the Gemini Exam mode, enter your personal Groq API key (`gsk_...`) or Google Gemini API key (`AIza...`) directly on the Main View.

---

## 4. First Launch & Onboarding Experience

When launching the application for the first time, a 5-step interactive onboarding carousel guides you through system readiness:

```
+-----------------------------------------------------------------------------+
|                             ONBOARDING SLIDES                               |
+-------+--------------------+------------------------------------------------+
| Slide | Title              | Purpose                                        |
+-------+--------------------+------------------------------------------------+
|   1   | Welcome            | Introduction to real-time audio & vision AI   |
|   2   | Completely Private | Screen-share cloaking verification             |
|   3   | Add Your Context   | Resume text or background information input    |
|   4   | Advanced Features  | Overview of VAD, click-through, and hotkeys    |
|   5   | Ready to Go        | API key setup & launch confirmation            |
+-------+--------------------+------------------------------------------------+
```

> [!TIP]
> You can re-trigger the onboarding tutorial at any time by clicking **Reset Onboarding** or clearing application storage.

---

## 5. The User Interface & Navigation

The interface uses a compact, minimalist, dark-glass overlay styled specifically to take up minimal screen real estate and hover above coding editors, video calls, or browser tabs.

### Header Bar & Drag Region

- **Drag Handle**: The topmost bar (`-webkit-app-region: drag`) allows moving the window anywhere on your display.
- **Status Indicator**: Live dot indicating whether the AI is `Listening`, `Thinking`, `Connected`, or `Cooling down`.
- **Window Controls**: Quick hide, collapse, and quit controls.

### Sidebar Navigation

The left sidebar contains vertical navigation icons:

1. **Main (`main`)**: Start/Stop active sessions, monitor mode, quick API key entry.
2. **Advanced (`advanced`)**: Rate limit throttles, token per minute quotas, stealth content protection toggle, local storage wiping.
3. **Profile (`profile`)**: Resume uploader, AI resume parser, profile role selector, and custom prompt overrides.
4. **Customize (`customize`)**: Background transparency, font transparency, font size, keybind editor, VAD modes, and Google Search toggle.
5. **History (`history`)**: Historical session logs, question lists, AI interview summaries, and title editing.
6. **Help (`help`)**: Quick reference guide and complete keyboard shortcut cheatsheet.

### Main Setup View

- **Mode Indicator**: Displays active profile (e.g., `Job Interview (Groq)` or `Exam Assistant (Gemini)`).
- **API Key Field**: Secure password field for your Groq or Gemini key.
- **Start Session Button**: Prominent action button (or shortcut `Cmd/Ctrl + Enter`).
- **Emergency Restart Indicator**: Reminds you of the restart hotkey (`Cmd/Ctrl + Alt + R`).
- **User Profile Pill**: Shows the authenticated user email and quick Sign Out button.

---

## 6. AI Profiles & Prompt Frameworks

The system features 8 specialized profiles. Each profile injects strict behavioral rules, output constraints, formatting guidelines, and cognitive frameworks into the AI system prompt.

```
+--------------------------+--------------------+-------------------------------------------+
| Profile Key              | Engine / API       | Primary Optimization                      |
+--------------------------+--------------------+-------------------------------------------+
| interview                | Groq / Gemini Live | 3-5 sentence human tone + 6-part LeetCode |
| exam-groq                | Groq GPT OSS 120B  | Instant MCQ + Aptitude + 10s auto-capture |
| exam                     | Gemini 2.5 Flash   | Heavy LeetCode / OA screenshot solving    |
| product                  | Groq GPT OSS 120B  | Senior PM case study (questions + buckets)|
| sales                    | Groq GPT OSS 120B  | Objection handling & consultative closing |
| meeting                  | Groq GPT OSS 120B  | Professional input & collaborative notes  |
| presentation             | Groq GPT OSS 120B  | Public speaking & narrative guidance      |
| negotiation              | Groq GPT OSS 120B  | Win-win negotiation & BATNA strategy      |
+--------------------------+--------------------+-------------------------------------------+
```

### Job Interview (`interview`)

- **Authentic Conversational Tone**: For normal interview questions, responses are strictly capped at **3 to 5 sentences**. It avoids buzzwords, uses everyday language, and sprinkles natural speech cadence (`"Basically,"`, `"Actually,"`, `"You know,"`, `"I mean"`).
- **No AI Preambles**: Never starts with _"Sure!"_, _"I'd be glad to help"_, or _"As an AI"_.
- **Automatic Coding Detection**: When a code editor (LeetCode, HackerRank, CodeSignal) is visible on screen, it automatically pivots to a structured 6-part format:
    1. `Approach: [Approach Name]`
    2. `Intuition`: 2–4 detailed paragraphs explaining the core logic.
    3. `Implementation`: Clean, working, optimized code with **zero comments** inside the code block and exact preservation of the function signature.
    4. `Code Explanation`: Line-by-line breakdown formatted as:
       `Line X: \`code\` - [What it does and why it is needed]`
    5. `Complexity Analysis`: Exact `O(Time)` and `O(Space)` calculations with explanations.
    6. `Algorithm`: Numbered 2–4 step logic summary.
- **Technical/Conceptual Questions**: Conceptual topics (e.g., _"Explain Kubernetes architecture"_) flow naturally from a high-level summary directly into deep mechanics without robotic labels.

### Exam Assistant — Groq (`exam-groq`)

- **Fastest Response Speed**: Powered by Groq TPU acceleration.
- **MCQ Format**: Outputs the answer immediately on the first line:
  `**Answer: B) Nitrogen**`
  Followed by a concise 2–4 sentence verification and elimination of wrong choices.
- **Aptitude & Math**: Shows explicit arithmetic steps and formulas without unnecessary text.
- **Continuous Screen Capture**: Supports an optional background auto-capture trigger every 10 seconds.

### Exam Assistant — Gemini (`exam`)

- Powered by `gemini-2.5-flash` (fast, balanced) or `gemini-2.5-pro` (maximum reasoning for complex graph/tree problems).
- Ideal for Online Assessments (OA) where complex problem statements with multi-constraint requirements need deep OCR parsing.

### Product Case Study (`product`)

- Models a Senior Product Manager / ex-MBB Consultant mindset.
- **Part 1 (Clarifying Questions)**: Asks a maximum of 2–3 critical clarifying questions that materially impact direction.
- **Part 2 (Thinking Out Loud)**: Delivers a structured 3–5 sentence answer using buckets (e.g., customer segment, speed vs quality, short-term vs long-term) without ever naming textbooks frameworks (no "SWOT", "4Ps", or "Porter's").
- **Assumptions Over Certainty**: Uses natural estimation language (`"Roughly 300 million people"`, `"Ballpark 60,000 pharmacies"`).

---

## 7. Audio Processing & Voice Activity Detection (VAD)

The audio system captures both sides of a conversation with zero latency and feeds it through an intelligent filtering engine.

```
[System Audio Dump] ----\
                         +---> [VAD Resampler: 16kHz Mono] ---> [Silero Neural VAD] ---> [Groq Whisper Large V3]
[Microphone Audio]  ----/
```

### Dual-Stream Audio Capture Pipeline

1. **System Loopback**: Captures the interviewer's voice coming through your headphones, Zoom, Google Meet, or Teams.
2. **Microphone Capture**: Captures your local voice with background noise suppression.
3. **Resampling**: All incoming streams are resampled to 16,000 Hz, 16-bit mono PCM (the native standard required by Whisper and Gemini).

### Smart Detection Mode (Automatic VAD)

- **Continuous Monitoring**: Microphone is active at all times.
- **Energy Gating**: Silero VAD analyzes 512-sample audio chunks. Any frame with RMS energy below 500 is classified as silence.
- **Speech Buffering**: Pre-buffers 300ms of audio before speech starts and keeps recording until **1.5 seconds of silence** is detected.
- **Auto-Flush**: Once speech concludes, the audio chunk is immediately packaged, base64 encoded, and transmitted to Groq Whisper for transcription.

### Manual Control Mode (Push-to-Talk)

- **Purpose**: Engineered for interviewers who pause frequently, stutter, or take long breaths mid-sentence.
- **Operation**:
    - The microphone is **MUTED by default**.
    - Press `Cmd/Ctrl + Shift + M` (or click the microphone icon in Assistant View) when the interviewer begins speaking. The mic icon glows green.
    - The app accumulates and buffers all audio across all pauses without prematurely cutting off.
    - Press `Cmd/Ctrl + Shift + M` again when the interviewer finishes. The complete buffer is flushed to Whisper, generating a single, complete answer.

### Speech Language Selection

Supports over 30 languages including:

- English (`en-US`, `en-GB`, `en-IN`, `en-AU`)
- Hindi (`hi-IN`)
- Spanish (`es-ES`, `es-US`)
- French (`fr-FR`, `fr-CA`)
- German (`de-DE`)
- Portuguese (`pt-BR`)
- Japanese (`ja-JP`), Korean (`ko-KR`), Mandarin Chinese (`cmn-CN`)
- Regional Indian Languages: Bengali (`bn-IN`), Gujarati (`gu-IN`), Kannada (`kn-IN`), Malayalam (`ml-IN`), Marathi (`mr-IN`), Tamil (`ta-IN`), Telugu (`te-IN`).

---

## 8. Screen Capture & Vision Analysis

The app can read anything on your monitor—from complex LeetCode descriptions to diagrams and multiple-choice questions.

### Manual On-Demand Capture (`Cmd/Ctrl + Enter`)

- Pressing `Cmd/Ctrl + Enter` (or clicking **📸 Analyze Screen & Answer**) grabs an instant lossless PNG frame of your primary display.
- The image is processed through the vision model (`qwen/qwen3.8-27b` on Groq, or native multimodal vision on Gemini).
- The AI extracts the question text, detects the programming language in the editor, and returns the verified solution immediately.

### Continuous Auto-Capture (Exam Groq Mode)

- In `Customize View` > `Screen Capture Settings`, you can enable:
  `🔄 Auto-Capture Screen (Every 10 seconds)`
- **Ideal for Proctored Tests**: Automatically grabs and analyzes the display every 10 seconds without requiring you to touch the keyboard or mouse.

### Image Quality & Token Optimization

- **High Quality**: Maximum resolution. Ideal for small font sizes or high-DPI Retina/4K displays.
- **Medium Quality** _(Default)_: Optimized balance between token cost and OCR readability.
- **Low Quality**: Heavily compressed; useful when operating under strict API rate limits.

---

## 9. Stealth Engineering & Anti-Detection Systems

Interview Cracked is designed from the ground up to prevent detection by interviewers, proctoring software, and screen recording utilities.

```
+-----------------------------------+-----------------------------------+
| Stealth Vector                    | Implementation Mechanism          |
+-----------------------------------+-----------------------------------+
| Screen Share Cloaking             | OS-level Window ContentProtection |
| Accidental Click Evasion          | Transparent Click-Through Overlay |
| Window Picker / Alt-Tab Evasion   | WS_EX_TOOLWINDOW style injection  |
| macOS Mission Control Evasion     | NSPanel level + Dock hiding       |
| Process List Randomization        | Title & Process Name Obfuscation  |
+-----------------------------------+-----------------------------------+
```

### Hardware-Level Content Protection

- When enabled (default: ON), the application invokes Electron's `mainWindow.setContentProtection(true)`.
- This tells the OS compositing manager (Desktop Window Manager on Windows, Quartz Compositor on macOS) to exclude the application window pixels from screen recording streams.
- **Result**: You can see the window clearly on your monitor, but anyone viewing your screen through Zoom, Google Meet, Microsoft Teams, Discord, Slack, Loom, or OBS will only see the background wallpaper or code editor behind it.

> [!WARNING]
> If you are using third-party USB display adapters (such as DisplayLink docks), Content Protection may cause the window to appear black to you as well. If this happens, disable Content Protection in `Advanced View`.

### Click-Through Transparency (`Cmd/Ctrl + M`)

- When interviewing, an accidental mouse click on the assistant window could steal keyboard focus from your IDE or browser, alerting interviewers that you are interacting with another program.
- Press `Cmd/Ctrl + M` to enable **Click-Through Mode**.
- In this state, the window becomes physically transparent to mouse events (`mainWindow.setIgnoreMouseEvents(true, { forward: true })`). Every mouse click passes straight through the assistant to the application underneath.
- Press `Cmd/Ctrl + M` again to regain interactive control.

### Windows Taskbar & Alt-Tab Stripping

- Proctored browsers and interviewers watching screen shares often inspect the Windows Taskbar or watch for unexpected windows during Alt-Tab switching.
- Interview Cracked executes `windowsNative.js` via PowerShell to set the extended window style `WS_EX_TOOLWINDOW (0x00000080)` and remove `WS_EX_APPWINDOW (0x00040000)`.
- **Result**: The window does not appear in the Taskbar, does not show in Alt-Tab previews, and is hidden from standard process enumeration APIs.

### macOS Mission Control & Dock Concealment

- On macOS, `app.dock.hide()` removes the app icon from the macOS Dock.
- The window is registered as an `NSPanel` floating window, ensuring it does not appear in Mission Control windows or Cmd-Tab app switchers.

### Dynamic Process & Window Title Randomization

- The application periodically and automatically changes its OS window title and internal process identifier.
- Instead of showing up as "Interview Assistant", it disguises itself as mundane system utilities:
    - `Audio Settings`
    - `Task Manager`
    - `Core Audio Driver`
    - `System Sound Service`
    - `Microphone Diagnostic Utility`

### Stealth Profiles

Located in `Customize View` > `Stealth Profile`:

- **Visible**: Content protection disabled, standard window behavior. Good for local testing.
- **Balanced**: Content protection active, normal process metadata.
- **Ultra-Stealth**: Full content protection, toolwindow injection, dock hiding, click-through capability, and randomized titles.

---

## 10. Global Keyboard Shortcuts Master Table

All keyboard shortcuts function globally—even when Interview Cracked is unfocused and you are typing inside VS Code, LeetCode, or a terminal.

| Action                       | macOS Shortcut       | Windows / Linux Shortcut | Description                                             |
| :--------------------------- | :------------------- | :----------------------- | :------------------------------------------------------ |
| **Start / Stop Session**     | `Cmd + Enter`        | `Ctrl + Enter`           | Starts AI listening session or triggers screen capture  |
| **Move Window Up**           | `Alt + Up`           | `Ctrl + Up`              | Nudges the overlay up by 10% of screen height           |
| **Move Window Down**         | `Alt + Down`         | `Ctrl + Down`            | Nudges the overlay down by 10% of screen height         |
| **Move Window Left**         | `Alt + Left`         | `Ctrl + Left`            | Nudges the overlay left by 10% of screen width          |
| **Move Window Right**        | `Alt + Right`        | `Ctrl + Right`           | Nudges the overlay right by 10% of screen width         |
| **Toggle Window Visibility** | `Cmd + \`            | `Ctrl + \`               | Instantly hides or shows the entire application window  |
| **Toggle Click-Through**     | `Cmd + M`            | `Ctrl + M`               | Toggles whether mouse clicks pass through the window    |
| **Toggle Microphone**        | `Cmd + Shift + M`    | `Ctrl + Shift + M`       | Push-to-Talk toggle (Manual VAD mode only)              |
| **Ask Next Step / Capture**  | `Cmd + Enter`        | `Ctrl + Enter`           | Takes screenshot & asks AI for the next step / solution |
| **Previous Response**        | `Cmd + [`            | `Ctrl + [`               | Navigates back to the previous AI answer in history     |
| **Next Response**            | `Cmd + ]`            | `Ctrl + ]`               | Navigates forward to the next AI answer in history      |
| **Latest Response**          | `Cmd + Shift + ]`    | `Ctrl + Shift + ]`       | Jumps straight to the newest AI response in the session |
| **Scroll Response Up**       | `Cmd + Shift + Up`   | `Ctrl + Shift + Up`      | Scrolls the answer view upward by 30%                   |
| **Scroll Response Down**     | `Cmd + Shift + Down` | `Ctrl + Shift + Down`    | Scrolls the answer view downward by 30%                 |
| **Copy AI Response / Code**  | `Cmd + Shift + C`    | `Ctrl + Shift + C`       | Intelligently copies code blocks (or text) to clipboard |
| **Emergency Erase & Quit**   | `Cmd + Shift + E`    | `Ctrl + Shift + E`       | Wipes sensitive data and closes the app instantly       |
| **Clear & Restart Session**  | `Cmd + Alt + R`      | `Ctrl + Alt + R`         | Clears current conversation and reboots session state   |

> [!NOTE]
> Every keyboard shortcut in this table can be customized to your preference in `Customize View` > `Keyboard Shortcuts`.

---

## 11. Resume Extraction & Context Personalization

Interview Cracked can tailor all answers to your personal career history, tech stack, and accomplishments.

```
[Upload PDF / Word / TXT] ---> [Local Text Extraction] ---> [Groq AI Normalizer] ---> [Stored in resumeContext]
                                                                                           |
                                                                                           v
[User Question] --------------------------------------------------------> [Personalized AI Response]
```

### How to Upload Your Resume:

1. Open the sidebar and click **Profile**.
2. Drag and drop your resume (`.pdf`, `.docx`, or `.txt`) into the upload zone or click to browse.
3. The app extracts raw text locally using `pdf-parse` or `mammoth`.
4. The raw text is transmitted to Groq to extract structured professional context:
    - Technical skills & frameworks
    - Work history, companies, and roles
    - Quantified metrics (e.g., _"improved API throughput by 42%"_)
    - Key engineering projects and architectures
5. Once normalized, the status turns green:
   `Active Resume: [filename.pdf] Ready for use in conversations`

### How the AI Uses Your Resume:

When the interviewer asks behavioral or background questions (e.g., _"Tell me about a time you resolved a major production bug"_ or _"Why did you choose PostgreSQL over MongoDB?"_), the AI will extract real projects and metrics from your resume instead of generating generic answers.

---

## 12. Real-Time Assistant Capabilities

During an active session, the **Assistant View** provides clean, readable information with zero distractions.

### Word-by-Word Streaming & Markdown Rendering

- Responses stream in real-time.
- Markdown headers, lists, bold highlights, blockquotes, and tables render smoothly with syntax highlighting powered by `highlight.js`.

### Smart Code Block Copying

- Every code block features a copy button (`📋` -> `✅`).
- When you press the global shortcut `Cmd/Ctrl + Shift + C`, the app executes smart parsing:
    - If code blocks exist in the response, it extracts and concatenates **only the clean code** without explanatory text, making it ready to paste into your IDE.
    - If no code blocks exist, it copies the full text response.

### Interactive Follow-Up Chips

At the bottom of every answer, quick action bubbles provide follow-up options:

- **💡 Explain Deeper**: Explains underlying logic with more depth.
- **⚡ Optimized Approach**: Generates a more time-efficient or space-efficient solution.
- **🧪 With Example**: Provides practical code snippets or real-world examples.
- **🔑 Key Takeaways**: Condenses the previous answer into short bullet points.
- **🆚 Alternatives**: Compares alternative approaches and architectural trade-offs.

### Direct Chat Input

A text input field at the bottom allows typing custom prompts or clarification questions directly to the model without speaking out loud.

---

## 13. Rate Limiting, Throttling & Auto-Retry Engine

When using high-frequency vision capture or extensive audio streaming, API rate limits (such as Groq's Tokens Per Minute limits) can be reached. The application includes built-in protection against rate limits:

```
+-----------------------------------------------------------------------------+
| ⚠️ Rate limit active. Cooldown remaining: 18s. Auto-retrying in background...|
+-----------------------------------------------------------------------------+
```

### Rate Limiting Features:

1. **Dynamic Token Throttling**: Set your maximum allowed tokens per minute (`maxTokensPerMin`, default: 1,000,000) and throttle percentage (`throttleAtPercent`, default: 75%).
2. **Auto-Retry Queue**: When an HTTP 429 response is received from Groq or Gemini, requests enter an internal retry queue with exponential backoff.
3. **Visual Cooldown Banner**: A non-intrusive amber banner alerts you to the exact cooldown seconds remaining. Once the timer reaches zero, the blocked request automatically executes.

---

## 14. Emergency Erase & Data Sanitization

If an interviewer requests that you share your entire display, or if an unexpected screen-sharing prompt occurs, the app provides emergency wiping tools:

### Instant Emergency Hotkey: `Cmd/Ctrl + Shift + E`

1. Instantly hides the window from view.
2. Purges sensitive session data from memory.
3. Completely terminates the application process.

### Manual Deep Purge (`Advanced View` > `Data Management`):

Clicking **🗑️ Clear All Local Data**:

- Clears all `localStorage` keys and cached tokens.
- Clears `sessionStorage`.
- Drops and deletes all IndexedDB conversation databases.
- Deletes application caches.
- Shuts down the process automatically.

---

## 15. Troubleshooting & FAQs

### Q1: The interviewer says they can see a black box where the app should be.

- **Cause**: Some older monitors or virtual display drivers (DisplayLink) cannot properly render hardware content protection.
- **Fix**: Open `Advanced View` > uncheck **Enable content protection (stealth mode)**. Note that disabling this makes the window visible on screen shares, so arrange your screen accordingly.

### Q2: Audio transcription is not picking up the interviewer's voice.

- **Check 1 (macOS Permissions)**: Ensure `Screen & System Audio Recording` permission is granted to `HD Audio Process` in macOS System Settings.
- **Check 2 (Audio Architecture)**: On Apple Silicon (M1/M2/M3/M4), the binary runs natively. On Intel Macs, ensure Rosetta 2 is installed (`softwareupdate --install-rosetta`). The app automatically manages execution permissions for `SystemAudioDump`.
- **Check 3 (Windows)**: Verify that your default audio output device matches the device selected in Windows sound settings.

### Q3: The window is unresponsive to mouse clicks.

- **Cause**: Click-Through Mode is toggled **ON**.
- **Fix**: Press `Cmd/Ctrl + M` to restore normal mouse interaction.

### Q4: I see an error: "This account is securely locked to a different device."

- **Cause**: Your subscription is bound to another computer's hardware UUID.
- **Fix**: Contact Interview Cracked support to reset your device pairing if you have migrated to a new machine.

### Q5: Shortcuts do not work when typing in other applications.

- **macOS Fix**: Go to `System Settings` > `Privacy & Security` > `Accessibility` and grant permission to `HD Audio Process` / `Electron`. Global keyboard hooks require accessibility access on macOS.

---

_Interview Cracked — Built for engineers, by engineers._
