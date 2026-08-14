// Declare client-side context execution for Next.js App Router
"use client";

// Import standard React hooks from core library
import { useState, useEffect, useRef } from "react";

// Define the main default page component
export default function Page() {
  // Setup theme state tracking mode
  const [theme, setTheme] = useState("light-mode");
  // Setup sound muted boolean state tracking
  const [muted, setMuted] = useState(false);
  // Setup sound volume level numerical scale
  const [volume, setVolume] = useState(0.5);
  // Setup active wizard step number tracking
  const [step, setStep] = useState(1);
  // Setup course URL input field text value state
  const [courseUrl, setCourseUrl] = useState("");
  // Setup difficulty selection dropdown option value state
  const [difficulty, setDifficulty] = useState("Intermediate");
  // Setup total quiz questions count state
  const [qCount, setQCount] = useState(5);
  // Setup Gemini API key password input value state
  const [geminiApiKey, setGeminiApiKey] = useState("");
  // Setup Gemini model selector string value state
  const [geminiModel, setGeminiModel] = useState("gemini-3.5-flash");
  // Setup available models array container state
  const [availableModels, setAvailableModels] = useState([]);
  // Setup models loading state indicator
  const [loadingModels, setLoadingModels] = useState(false);
  // Setup models loaded verification indicator
  const [modelsLoaded, setModelsLoaded] = useState(false);
  // Setup quiz generation process spinner indicator
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  // Setup status alert block messages and type values
  const [status, setStatus] = useState(null);
  // Setup course syllabus title header text state
  const [courseTitle, setCourseTitle] = useState("Course Syllabus");
  // Setup course syllabus outline data tree state
  const [outline, setOutline] = useState([]);
  // Setup checklist of selected lessons state
  const [selectedLessons, setSelectedLessons] = useState(new Set());
  // Setup generated quiz questions data container state
  const [quizData, setQuizData] = useState([]);
  // Setup active question pointer index state
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  // Setup user answers log history array state
  const [userAnswers, setUserAnswers] = useState([]);
  // Setup distraction-free focus mode active state
  const [focusMode, setFocusMode] = useState(false);
  // Setup abort controller reference state for cancellation
  const [abortController, setAbortController] = useState(null);
  // Setup sound controller object reference pointer
  const soundControllerRef = useRef(null);

  // Sync the master document body styling classes with theme state
  useEffect(() => {
    // Overwrite body className with theme state
    document.body.className = theme;
  // Trigger hook on theme value modifications
  }, [theme]);

  // Sync scrollbar locking classes depending on quiz active step
  useEffect(() => {
    // Check if the current step is the active quiz player
    if (step === 3) {
      // Add scroll lock class to body tag
      document.body.classList.add("quiz-active");
      // Add scroll lock class to HTML element tag
      document.documentElement.classList.add("quiz-active");
    // Fallback if not on quiz player step
    } else {
      // Remove scroll lock class from body tag
      document.body.classList.remove("quiz-active");
      // Remove scroll lock class from HTML element tag
      document.documentElement.classList.remove("quiz-active");
    // End step check conditional
    }
  // Trigger hook on step value modifications
  }, [step]);

  // Sync distraction-free styling classes based on focus mode state
  useEffect(() => {
    // Check if focus mode is active and on the quiz player
    if (focusMode && step === 3) {
      // Add focus class to body tag
      document.body.classList.add("focus-mode-active");
    // Fallback if conditions are not satisfied
    } else {
      // Remove focus class from body tag
      document.body.classList.remove("focus-mode-active");
    // End focus mode checking block
    }
  // Trigger hook on focusMode or step value modifications
  }, [focusMode, step]);

  // Initialize synthesized sound effects ref container
  useEffect(() => {
    // Set sound controller properties definitions
    soundControllerRef.current = {
      // Set default mute value
      muted: false,
      // Set default volume level scale
      volume: 0.5,
      // Set audio context pointer container
      audioCtx: null,
      // Helper function to initialize audio context
      init() {
        // Check if context is null and viewport matches browser context
        if (!this.audioCtx && typeof window !== "undefined") {
          // Initialize AudioContext API
          this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        // End context initialization check
        }
        // Check if audio context is in suspended state
        if (this.audioCtx && this.audioCtx.state === "suspended") {
          // Resume audio context execution
          this.audioCtx.resume();
        // End suspended check
        }
      // End of audio context initializer
      },
      // Setter method to adjust volume
      setVolume(val) {
        // Set local volume property
        this.volume = val;
      // End setVolume setter
      },
      // Setter method to adjust mute state
      setMuted(isMuted) {
        // Set local mute property
        this.muted = isMuted;
      // End setMuted setter
      },
      // Play correct answer chime sound
      playCorrect() {
        // Exit if muted or volume is set to zero
        if (this.muted || this.volume <= 0) return;
        // Ensure audio context is ready
        this.init();
        // Create oscillator node
        const osc = this.audioCtx.createOscillator();
        // Create gain envelope node
        const gainNode = this.audioCtx.createGain();
        // Connect oscillator to gain node
        osc.connect(gainNode);
        // Connect gain node to destination speakers
        gainNode.connect(this.audioCtx.destination);
        // Set oscillator waveform type
        osc.type = "triangle";
        // Set first frequency value
        osc.frequency.setValueAtTime(523.25, this.audioCtx.currentTime);
        // Slide to second frequency value
        osc.frequency.setValueAtTime(659.25, this.audioCtx.currentTime + 0.1);
        // Slide to third frequency value
        osc.frequency.setValueAtTime(783.99, this.audioCtx.currentTime + 0.2);
        // Set initial gain volume
        gainNode.gain.setValueAtTime(this.volume * 0.15, this.audioCtx.currentTime);
        // Fade out volume to silent
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.4);
        // Start oscillator tone generation
        osc.start();
        // Stop oscillator after duration
        osc.stop(this.audioCtx.currentTime + 0.4);
      // End playCorrect block
      },
      // Play incorrect answer buzzer sound
      playIncorrect() {
        // Exit if muted or volume is set to zero
        if (this.muted || this.volume <= 0) return;
        // Ensure audio context is ready
        this.init();
        // Create oscillator node
        const osc = this.audioCtx.createOscillator();
        // Create gain envelope node
        const gainNode = this.audioCtx.createGain();
        // Connect oscillator to gain node
        osc.connect(gainNode);
        // Connect gain node to destination speakers
        gainNode.connect(this.audioCtx.destination);
        // Set oscillator waveform type
        osc.type = "sawtooth";
        // Set first frequency value
        osc.frequency.setValueAtTime(150, this.audioCtx.currentTime);
        // Slide down to second frequency value
        osc.frequency.setValueAtTime(100, this.audioCtx.currentTime + 0.15);
        // Set initial gain volume
        gainNode.gain.setValueAtTime(this.volume * 0.15, this.audioCtx.currentTime);
        // Fade out volume to silent
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.3);
        // Start oscillator tone generation
        osc.start();
        // Stop oscillator after duration
        osc.stop(this.audioCtx.currentTime + 0.3);
      // End playIncorrect block
      },
      // Play triumphant fanfare celebration audio file
      playFanfare() {
        // Exit if muted or volume is set to zero
        if (this.muted || this.volume <= 0) return;
        // Instantiate standard HTML5 audio element
        const audio = new Audio("/celebration.webm");
        // Scale audio element volume
        audio.volume = this.volume * 0.15;
        // Play audio file
        audio.play().catch((e) => console.log("Audio play blocked:", e));
      // End playFanfare block
      }
    // Close sound controller object
    };
  // Close mount effect block
  }, []);

  // Update sound controller reference values on state modifications
  useEffect(() => {
    // Check if the sound controller reference is initialized
    if (soundControllerRef.current) {
      // Set volume parameter in reference
      soundControllerRef.current.setVolume(volume);
      // Set mute parameter in reference
      soundControllerRef.current.setMuted(muted);
    // End reference initialization validation
    }
  // Trigger hook on volume or muted state modifications
  }, [volume, muted]);

  // Clean up any active confetti canvas elements on navigation step change
  useEffect(() => {
    // Check if step is not the results dashboard screen
    if (step !== 4) {
      // Query canvas element by ID
      const canvas = document.getElementById("confetti-canvas");
      // Check if canvas exists
      if (canvas) {
        // Remove the canvas element from DOM
        canvas.remove();
      // End canvas check
      }
    // End step check
    }
  // Trigger hook on step value modifications
  }, [step]);

  // Helper function to show status messages in status box
  const showStatus = (htmlContent, type) => {
    // Update status state with HTML markup and severity class type
    setStatus({ html: htmlContent, type });
  // Close showStatus block
  };

  // Helper function to toggle theme mode state value
  const toggleTheme = () => {
    // Toggling the theme string between light and dark mode classes
    setTheme(theme === "light-mode" ? "dark-mode" : "light-mode");
  // Close toggleTheme block
  };

  // Asynchronous helper function to query and load Gemini models list
  const loadAvailableModels = async (keyInput) => {
    // Assign targeting API key string value from parameters or state
    const key = keyInput || geminiApiKey;
    // Set models loading state indicator to true
    setLoadingModels(true);
    // Construct parameters payload object
    const payload = { gemini_api_key: key };
    // Try block to perform API fetch
    try {
      // Send POST request fetching available models
      const response = await fetch("/api/models", {
        // Specify POST method
        method: "POST",
        // Pass JSON headers
        headers: { "Content-Type": "application/json" },
        // Pass stringified JSON parameters body
        body: JSON.stringify(payload),
      // Close fetch options block
      });
      // Parse response body as JSON
      const data = await response.json();
      // Verify if lookup was successful
      if (data.success && data.models.length > 0) {
        // Hardcode models containing encoded thinking levels to match configurations
        const hardcodedModels = [
          // Gemini 3.5 Flash Medium option
          { id: "gemini-3.5-flash|MEDIUM", name: "Gemini 3.5 Flash (Medium)" },
          // Gemini 3.5 Flash High option
          { id: "gemini-3.5-flash|HIGH", name: "Gemini 3.5 Flash (High)" },
          // Gemini 3.5 Flash Low option
          { id: "gemini-3.5-flash|LOW", name: "Gemini 3.5 Flash (Low)" },
          // Gemini 3.1 Pro Low option
          { id: "gemini-3.1-pro-preview|LOW", name: "Gemini 3.1 Pro (Low)" },
          // Gemini 3.1 Pro High option
          { id: "gemini-3.1-pro-preview|HIGH", name: "Gemini 3.1 Pro (High)" },
        // Close models options list array
        ];
        // Populate available models options list
        setAvailableModels(hardcodedModels);
        // Set models loaded indicator to true
        setModelsLoaded(true);
        // Clear status alert
        setStatus(null);
      // Fallback on logical backend lookup failures
      } else {
        // Clear models state list
        setAvailableModels([]);
        // Show server warning message details
        showStatus(data.error || "Failed to load models. Try again.", "error");
      // Close success validation block
      }
    // Catch network communication exceptions
    } catch (error) {
      // Clear models state list
      setAvailableModels([]);
      // Show connection error alert
      showStatus(`Failed to load models: ${error.message}`, "error");
    // Finally block to restore loader indicators
    } finally {
      // Set models loading indicator to false
      setLoadingModels(false);
    // Close try-catch-finally block
    }
  // Close loadAvailableModels function block
  };

  // Helper handler for loading course syllabus outline
  const handleLoadOutline = async () => {
    // Validate if course URL input is empty
    if (!courseUrl.trim()) {
      // Display validation warning message
      showStatus("Please enter a Course URL or slug to load the outline.", "error");
      // Exit execution
      return;
    // End validation check block
    }
    // Show spinner loader state
    // Show Gemini-style sparkle spinner with fetch message
    showStatus('<div class="loader-spinner"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#a855f7"/></linearGradient></defs><path d="M12 2 C12 2 13.5 8 18 9 C13.5 10 12 16 12 16 C12 16 10.5 10 6 9 C10.5 8 12 2 12 2Z" fill="url(#g1)"/><path d="M19 2 C19 2 19.8 4.5 22 5 C19.8 5.5 19 8 19 8 C19 8 18.2 5.5 16 5 C18.2 4.5 19 2 19 2Z" fill="url(#g1)" opacity="0.7"/><path d="M5 16 C5 16 5.8 18.5 8 19 C5.8 19.5 5 22 5 22 C5 22 4.2 19.5 2 19 C4.2 18.5 5 16 5 16Z" fill="url(#g1)" opacity="0.6"/></svg></div><p>Fetching and parsing course structure... Please wait.</p>', "loading");
    // Construct parameters payload object
    const payload = {
      // Inject course URL
      course_url: courseUrl.trim(),
    // Close payload dictionary
    };
    // Try block to perform fetch
    try {
      // Send POST request fetching outline syllabus
      const response = await fetch("/api/fetch-course-outline", {
        // Specify POST method
        method: "POST",
        // Pass JSON headers
        headers: { "Content-Type": "application/json" },
        // Pass stringified JSON parameters body
        body: JSON.stringify(payload),
      // Close fetch options block
      });
      // Parse response body as JSON
      const data = await response.json();
      // Verify if outlines fetch was successful
      if (data.success) {
        // Set page course title header text
        setCourseTitle(data.title);
        // Set outline syllabus data tree
        setOutline(data.outline);
        // Initialize list to hold all lesson URLs
        const allLessonUrls = [];
        // Loop through outline units
        for (const unit of data.outline) {
          // Loop through unit lessons list
          for (const lesson of unit.lessons) {
            // Add lesson URL to URLs array
            allLessonUrls.push(lesson.url);
          // Close lessons loop
          }
        // Close units loop
        }
        // Set all lesson URLs checked by default
        setSelectedLessons(new Set(allLessonUrls));
        // Clear loading status panel
        setStatus(null);
        // Move to step 2 configuration step screen
        setStep(2);
      // Fallback on logical server failures
      } else {
        // Show server outline error details to user
        showStatus(`Error: ${data.error}`, "error");
      // Close success validation block
      }
    // Catch connection exceptions
    } catch (error) {
      // Show communication failure alert
      showStatus(`Failed to communicate with local server: ${error.message}`, "error");
    // Close try-catch block
    }
  // Close handleLoadOutline block
  };

  // Helper function to adjust checking states of individual lessons list checkboxes
  const handleLessonClick = (lessonUrl, unitLessons, parentUnitCheckboxId) => {
    // Instantiate a new Set copy from selectedLessons state
    const nextSet = new Set(selectedLessons);
    // Check if the lesson URL is currently checked
    if (nextSet.has(lessonUrl)) {
      // Uncheck it by removing from set list
      nextSet.delete(lessonUrl);
    // If lesson is unchecked
    } else {
      // Check it by adding to set list
      nextSet.add(lessonUrl);
    // Close checked check block
    }
    // Update selectedLessons checklist state
    setSelectedLessons(nextSet);
  // Close handleLessonClick block
  };

  // Helper function to toggle checkbox selections of units and child lessons list
  const handleUnitClick = (unitLessons, checked) => {
    // Instantiate a new Set copy from selectedLessons state
    const nextSet = new Set(selectedLessons);
    // Loop through each child lesson in the unit
    unitLessons.forEach((lesson) => {
      // Check if unit parent checkbox was checked
      if (checked) {
        // Set all child lesson checkboxes checked
        nextSet.add(lesson.url);
      // If unit parent checkbox was unchecked
      } else {
        // Uncheck all child lesson checkboxes
        nextSet.delete(lesson.url);
      // Close checked status check block
      }
    // Close child lessons iteration loop
    });
    // Update selectedLessons checklist state
    setSelectedLessons(nextSet);
  // Close handleUnitClick block
  };

  // Select all checkboxes in the outline tree list
  const handleSelectAll = () => {
    // Initialize list to hold all lesson URLs
    const allLessonUrls = [];
    // Loop through outline units
    for (const unit of outline) {
      // Loop through unit lessons list
      for (const lesson of unit.lessons) {
        // Add lesson URL to array
        allLessonUrls.push(lesson.url);
      // Close lessons loop
      }
    // Close units loop
    }
    // Set all lesson URLs checked
    setSelectedLessons(new Set(allLessonUrls));
  // Close handleSelectAll block
  };

  // Deselect all checkboxes in the outline tree list
  const handleDeselectAll = () => {
    // Clear checklist of selected lessons completely
    setSelectedLessons(new Set());
  // Close handleDeselectAll block
  };

  // Helper action to handle back navigation and cancel active generation
  const handleBackToStep1 = () => {
    // Check if an active abort controller is present
    if (abortController) {
      // Cancel fetch requests using controller
      abortController.abort();
    // End active controller check block
    }
    // Navigate step back to URL input step
    setStep(1);
  // Close handleBackToStep1 block
  };

  // Interactive full screen canvas confetti animations
  const launchConfetti = () => {
    // Check if viewport matches client browser context
    if (typeof window === "undefined") return;
    // Create new canvas element node
    const canvas = document.createElement("canvas");
    // Assign unique identification selector
    canvas.id = "confetti-canvas";
    // Overlay canvas floating fixed on viewport
    canvas.style.position = "fixed";
    // Place canvas top edge to top of window
    canvas.style.top = "0";
    // Place canvas left edge to left of window
    canvas.style.left = "0";
    // Scale canvas to full viewport width
    canvas.style.width = "100vw";
    // Scale canvas to full viewport height
    canvas.style.height = "100vh";
    // Disable user clicks interactions on canvas layer
    canvas.style.pointerEvents = "none";
    // Set z-index stack layer to front of window
    canvas.style.zIndex = "9999";
    // Append the canvas overlay directly to document body
    document.body.appendChild(canvas);
    // Extract 2D graphics rendering context from canvas
    const ctx = canvas.getContext("2d");
    // Synchronize canvas buffer width to window width
    canvas.width = window.innerWidth;
    // Synchronize canvas buffer height to window height
    canvas.height = window.innerHeight;
    // Define festive bright colors array
    const colors = ["#f43f5e", "#3b82f6", "#10b981", "#eab308", "#a855f7", "#06b6d4"];
    // Initialize container for particle items
    const particles = [];
    // Populate particle items
    for (let i = 0; i < 150; i++) {
      // Add individual particle object properties
      particles.push({
        // Set random horizontal position coordinate
        x: Math.random() * canvas.width,
        // Set random vertical start coordinates above window
        y: Math.random() * canvas.height - canvas.height,
        // Set random horizontal fall velocity
        vx: Math.random() * 4 - 2,
        // Set random vertical fall velocity
        vy: Math.random() * 5 + 3,
        // Select random color
        color: colors[Math.floor(Math.random() * colors.length)],
        // Set random particle radius size dimensions
        r: Math.random() * 4 + 4,
        // Set initial rotation angle
        rotation: Math.random() * 360,
        // Set rotation velocity increment
        rotationSpeed: Math.random() * 4 - 2,
      // Close particle object dictionary
      });
    // Close particles populate loop
    }
    // Animation arpeggio update loops function
    function update() {
      // Clear canvas drawing context viewport boundaries
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Iterate through list of particles
      particles.forEach((p) => {
        // Adjust horizontal position coordinate
        p.x += p.vx;
        // Adjust vertical position coordinate
        p.y += p.vy;
        // Adjust rotation angle
        p.rotation += p.rotationSpeed;
        // Check if particle has fallen below bottom of screen
        if (p.y - p.r > canvas.height) {
          // Reset vertical position coordinate back above screen
          p.y = -p.r;
          // Assign random horizontal position coordinate
          p.x = Math.random() * canvas.width;
        // End height reset validation check
        }
        // Save current context drawing state matrix
        ctx.save();
        // Move coordinates matrix pivot to particle position
        ctx.translate(p.x, p.y);
        // Rotate context drawing matrix using particle angle values
        ctx.rotate((p.rotation * Math.PI) / 180);
        // Set colors properties value
        ctx.fillStyle = p.color;
        // Draw rectangle shape
        ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        // Restore context drawing state matrix
        ctx.restore();
      // End particle update loop callback
      });
      // Verify if canvas element is still connected to DOM
      if (document.getElementById("confetti-canvas")) {
        // Request next animation frame updates
        requestAnimationFrame(update);
      // End canvas verification check
      }
    // End update function block
    }
    // Start animation loops
    update();
  // Close launchConfetti block
  };

  // Helper action to trigger quiz generation from settings configuration
  const handleGenerateQuiz = async () => {
    // Check if quiz generation process is already active to abort it
    if (generatingQuiz) {
      // Validate if abort controller is initialized
      if (abortController) {
        // Terminate active generation fetch request
        abortController.abort();
      // End abort validation block
      }
      // Exit generation handler
      return;
    // End check for active generation
    }
    // Convert selectedLessons Set properties values to an array
    const rawUnits = Array.from(selectedLessons);
    // Validate if any lesson was checked by the user
    if (rawUnits.length === 0) {
      // Display validation warning message
      showStatus("Please select at least one lesson before generating the quiz.", "error");
      // Exit execution
      return;
    // End checklist verification block
    }
    // Set quiz generation indicator to true
    setGeneratingQuiz(true);
    // Instantiate new AbortController instance
    const controller = new AbortController();
    // Save controller reference pointer to state
    setAbortController(controller);
    // Define AI thinking process messages array
    const thinkingMessages = [
      // Step 1 prompt thinking message
      "Initializing AI model...",
      // Step 2 prompt thinking message
      "Analyzing course content...",
      // Step 3 prompt thinking message
      "Extracting key learning objectives...",
      // Step 4 prompt thinking message
      "Generating relevant questions...",
      // Step 5 prompt thinking message
      "Formulating plausible distractors...",
      // Step 6 prompt thinking message
      "Validating answers and explanations...",
      // Step 7 prompt thinking message
      "Finalizing quiz structure...",
    // Close messages list
    ];
    // Setup message pointer index
    let msgIndex = 0;
    // Set initial loading state with progress bar
    showStatus(
      `
      <div class="gemini-loader-wrapper">
        <span class="particle"></span>
        <span class="particle"></span>
        <span class="particle"></span>
        <span class="particle"></span>
        <span class="particle"></span>
        <div class="loader-spinner"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#a855f7"/></linearGradient></defs><path d="M12 2 C12 2 13.5 8 18 9 C13.5 10 12 16 12 16 C12 16 10.5 10 6 9 C10.5 8 12 2 12 2Z" fill="url(#g2)"/><path d="M19 2 C19 2 19.8 4.5 22 5 C19.8 5.5 19 8 19 8 C19 8 18.2 5.5 16 5 C18.2 4.5 19 2 19 2Z" fill="url(#g2)" opacity="0.7"/><path d="M5 16 C5 16 5.8 18.5 8 19 C5.8 19.5 5 22 5 22 C5 22 4.2 19.5 2 19 C4.2 18.5 5 16 5 16Z" fill="url(#g2)" opacity="0.6"/></svg></div>
      </div>
      <p id="loadingMessageText">${thinkingMessages[0]}</p>
      <div class="progress-bar-container" style="margin-top: 15px; width: 80%; max-width: 300px; margin-left: auto; margin-right: auto;">
        <div id="generationProgressBar" class="progress-bar-fill" style="width: 5%; transition: width 1s ease;"></div>
      </div>
      `,
      "loading"
    );
    // Start interval to rotate thinking process messages
    const messageInterval = setInterval(() => {
      // Increment messages index circularly
      msgIndex = (msgIndex + 1) % thinkingMessages.length;
      // Query text element
      const msgEl = document.getElementById("loadingMessageText");
      // Query progress bar element
      const progressEl = document.getElementById("generationProgressBar");
      // Check if text element exists
      if (msgEl) {
        // Update text content with next index message
        msgEl.textContent = thinkingMessages[msgIndex];
        // Check if progress bar exists
        if (progressEl) {
          // Parse current width value float
          let currentWidth = parseFloat(progressEl.style.width);
          // Limit artificial progress width to 95 percent
          if (currentWidth < 95) {
            // Increment progress width asymptotically slower towards 95 percent
            let nextWidth = currentWidth + (95 - currentWidth) * 0.15;
            // Apply incremented width style to progress bar
            progressEl.style.width = `${nextWidth}%`;
          // End width limit check
          }
        // End progress bar validation check
        }
      // End text element validation check
      }
    // Specify 2.5 seconds loop interval duration
    }, 2500);
    // Construct parameters payload object
    const payload = {
      // Pass selected lesson URLs array
      unit_ids: rawUnits,
      // Pass difficulty level
      difficulty,
      // Pass questions count count parameter
      count: parseInt(qCount, 10),
      // Pass Gemini API key
      gemini_api_key: geminiApiKey.trim(),
      // Pass Gemini model identifier
      gemini_model: geminiModel,
    // Close payload dictionary
    };
    // Try block to perform fetch
    try {
      // Send POST request triggering quiz generation
      const response = await fetch("/api/generate-quiz", {
        // Specify POST method
        method: "POST",
        // Pass JSON headers
        headers: { "Content-Type": "application/json" },
        // Pass stringified JSON parameters body
        body: JSON.stringify(payload),
        // Pass abort controller cancellation signal
        signal: controller.signal,
      // Close fetch options block
      });
      // Parse response body as JSON
      const data = await response.json();
      // Verify if quiz generation succeeded
      if (data.success) {
        // Set quiz questions data container state
        setQuizData(data.quiz);
        // Initialize user answers array with null values
        setUserAnswers(Array(data.quiz.length).fill(null));
        // Reset active question index to 0
        setActiveQuestionIndex(0);
        // Hide explanation details panel by default
        setShowExplanation(false);
        // Clear status logs panel
        setStatus(null);
        // Move directly to step 3 interactive player screen
        setStep(3);
      // Fallback on logical server generation failures
      } else {
        // Display server error details warning
        showStatus(`Error: ${data.error}`, "error");
      // Close success validation block
      }
    // Catch fetch/network errors or cancellations
    } catch (error) {
      // Check if catch block was triggered due to user abort
      if (error.name === "AbortError") {
        // Display cancellation confirmation message
        showStatus("Quiz generation was cancelled.", "error");
      // Fallback if exception is standard connection failure
      } else {
        // Display communication failure alert
        showStatus(`Failed to communicate with local server: ${error.message}`, "error");
      // Close abort error validation block
      }
    // Finally block to clear loops and restore buttons
    } finally {
      // Clear thinking messages rotator interval
      clearInterval(messageInterval);
      // Reset abort controller pointer state
      setAbortController(null);
      // Set quiz generation indicator to false
      setGeneratingQuiz(false);
    // Close try-catch-finally block
    }
  // Close handleGenerateQuiz block
  };

  // Helper state to check if explanation details are expanded
  const [showExplanation, setShowExplanation] = useState(false);

  // Helper calculation to count correct selections user recorded
  const getCorrectAnswersCount = () => {
    // Initialize correct counter accumulator
    let correctCount = 0;
    // Iterate through user answers list
    userAnswers.forEach((ans, idx) => {
      // Check if answer is correct
      if (ans !== null && ans === quizData[idx].correct_answer) {
        // Increment correct count
        correctCount++;
      // End correct check block
      }
    // End answers iterator
    });
    // Return correct count
    return correctCount;
  // Close getCorrectAnswersCount block
  };

  // Handler action triggered when user clicks an option item in the player
  const handleOptionSelect = (option) => {
    // Exit if the active question has already been answered
    if (userAnswers[activeQuestionIndex] !== null) return;
    // Instantiate a new copy of user answers log array
    const nextAnswers = [...userAnswers];
    // Record selected option in array index
    nextAnswers[activeQuestionIndex] = option;
    // Update userAnswers log state
    setUserAnswers(nextAnswers);
    // Evaluate correctness check
    const isCorrect = option === quizData[activeQuestionIndex].correct_answer;
    // Check if selected option matches correct answer
    if (isCorrect) {
      // Play correct chime sound synthesized effect
      soundControllerRef.current.playCorrect();
    // Fallback if selection is incorrect
    } else {
      // Play incorrect buzzer sound synthesized effect
      soundControllerRef.current.playIncorrect();
    // Close correctness check block
    }
    // Expand the explanation details panel automatically
    setShowExplanation(true);
  // Close handleOptionSelect block
  };

  // Navigate to the next question in the player list
  const handleNextQuestion = () => {
    // Check if the current question is the last question in the quiz
    if (activeQuestionIndex === quizData.length - 1) {
      // Calculate overall results score and display summary
      handleShowSummary();
    // Fallback if not last question
    } else {
      // Increment active question pointer index
      setActiveQuestionIndex(activeQuestionIndex + 1);
      // Hide explanation details panel for next question
      setShowExplanation(false);
    // End last question checking block
    }
  // Close handleNextQuestion block
  };

  // Navigate back to the previous question in the player list
  const handlePrevQuestion = () => {
    // Check if question index is positive
    if (activeQuestionIndex > 0) {
      // Decrement active question pointer index
      setActiveQuestionIndex(activeQuestionIndex - 1);
      // Automatically show the explanation for the previous answered question
      setShowExplanation(true);
    // Close index check block
    }
  // Close handlePrevQuestion block
  };

  // Quit active quiz gameplay and return to configurations step
  const handleQuitQuiz = () => {
    // Clear generated quiz data
    setQuizData([]);
    // Clear user answered questions list
    setUserAnswers([]);
    // Reset active question index pointer
    setActiveQuestionIndex(0);
    // Return step to configuration settings screen
    setStep(2);
  // Close handleQuitQuiz block
  };

  // Transition player screen state to display final score summary dashboard
  const handleShowSummary = () => {
    // Calculate correct answers count
    const correctCount = getCorrectAnswersCount();
    // Calculate quiz total questions count
    const total = quizData.length;
    // Calculate final score percentage
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    // Check if the final score is perfect
    if (percentage === 100) {
      // Trigger fanfare sound effect
      soundControllerRef.current.playFanfare();
      // Trigger full screen canvas confetti animation
      launchConfetti();
    // Close perfect score verification block
    }
    // Navigate step to score summary screen
    setStep(4);
  // Close handleShowSummary block
  };

  // Re-initialize active quiz player gameplay using same questions list
  const handleRetakeQuiz = () => {
    // Map through quiz data to shuffle options for each question
    const shuffledQuiz = quizData.map((question) => {
      // Create a copy of the options array
      const shuffledOptions = [...question.options];
      // Perform Fisher-Yates shuffle on the options
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
        // Pick a random index
        const j = Math.floor(Math.random() * (i + 1));
        // Swap elements
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
      }
      // Return new question object with shuffled options
      return { ...question, options: shuffledOptions };
    });
    // Update quiz data with the newly shuffled options
    setQuizData(shuffledQuiz);
    // Reset user answers logs to null values
    setUserAnswers(Array(shuffledQuiz.length).fill(null));
    // Reset active question index pointer to 0
    setActiveQuestionIndex(0);
    // Hide explanation details panel
    setShowExplanation(false);
    // Return step back to quiz player screen
    setStep(3);
  // Close handleRetakeQuiz block
  };

  // Cancel current generated quiz and return to URL input step
  const handleStartNewQuiz = () => {
    // Clear generated quiz data from state
    setQuizData([]);
    // Clear user answers logs from state
    setUserAnswers([]);
    // Reset active question index pointer
    setActiveQuestionIndex(0);
    // Return step back to configuration settings screen
    setStep(2);
  // Close handleStartNewQuiz block
  };

  // Asynchronous helper function to fetch selected course content text
  const fetchSelectedCourseContent = async () => {
    // Convert selectedLessons Set properties values to an array
    const rawUnits = Array.from(selectedLessons);
    // Validate if any lesson is checked
    if (rawUnits.length === 0) {
      // Display validation warning message
      showStatus("Please select at least one lesson before exporting.", "error");
      // Exit and return null
      return null;
    // End selection check block
    }
    // Show spinner loader state
    // Show Gemini-style sparkle spinner with export message
    showStatus('<div class="loader-spinner"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#a855f7"/></linearGradient></defs><path d="M12 2 C12 2 13.5 8 18 9 C13.5 10 12 16 12 16 C12 16 10.5 10 6 9 C10.5 8 12 2 12 2Z" fill="url(#g3)"/><path d="M19 2 C19 2 19.8 4.5 22 5 C19.8 5.5 19 8 19 8 C19 8 18.2 5.5 16 5 C18.2 4.5 19 2 19 2Z" fill="url(#g3)" opacity="0.7"/><path d="M5 16 C5 16 5.8 18.5 8 19 C5.8 19.5 5 22 5 22 C5 22 4.2 19.5 2 19 C4.2 18.5 5 16 5 16Z" fill="url(#g3)" opacity="0.6"/></svg></div><p>Fetching course contents for export... Please wait.</p>', "loading");
    // Construct parameters payload object
    const payload = {
      // Pass selected lesson URLs array
      unit_ids: rawUnits,
    // Close payload dictionary
    };
    // Try block to perform content fetch
    try {
      // Send POST request fetching content
      const response = await fetch("/api/fetch-course-content", {
        // Specify POST method
        method: "POST",
        // Pass JSON headers
        headers: { "Content-Type": "application/json" },
        // Pass stringified JSON parameters body
        body: JSON.stringify(payload),
      // Close fetch options block
      });
      // Parse response body as JSON
      const data = await response.json();
      // Verify if fetch was successful
      if (data.success) {
        // Hide loader status box container
        setStatus(null);
        // Return course content details array
        return data.content;
      // Fallback on logical backend lookup failures
      } else {
        // Display server error details
        showStatus(`Error: ${data.error}`, "error");
        // Return null
        return null;
      // Close success validation block
      }
    // Catch fetch/network exceptions
    } catch (error) {
      // Display communication failure alert
      showStatus(`Failed to communicate with local server: ${error.message}`, "error");
      // Return null
      return null;
    // Finally block to restore loader indicators
    } finally {
      // Empty operation
    // Close try-catch-finally block
    }
  // Close fetchSelectedCourseContent block
  };

  // Helper action to trigger JSON document exports on click
  const handleExportJson = async () => {
    // Fetch course contents text using helper scraper
    const content = await fetchSelectedCourseContent();
    // Validate if content was successfully retrieved
    if (content) {
      // Prepare JSON export structure object
      const exportData = {
        // Store course title
        course_title: courseTitle,
        // Store course lessons content array
        lessons: content,
      // Close export data object
      };
      // Convert export data to formatted JSON string
      const jsonString = JSON.stringify(exportData, null, 2);
      // Create new blob containing the JSON string
      const blob = new Blob([jsonString], { type: "application/json" });
      // Create temporary link element node
      const link = document.createElement("a");
      // Create object URL pointing to blob
      link.href = URL.createObjectURL(blob);
      // Set download file name format using course title slug
      link.download = `course_content_${courseTitle.replace(/[^a-z0-9_-]/gi, "_")}.json`;
      // Click the link programmatically to trigger browser file download
      link.click();
    // End content validation block
    }
  // Close handleExportJson block
  };

  // Helper action to trigger Plain Text document exports on click
  const handleExportText = async () => {
    // Fetch course contents text using helper scraper
    const content = await fetchSelectedCourseContent();
    // Validate if content was successfully retrieved
    if (content) {
      // Initialize array containing course title header lines
      let textParts = [
        // Add course title label
        `Course: ${courseTitle}`,
        // Add export source attribution line
        "Exported from SAP Learning Journey Quiz Generator",
        // Add blank line divider
        "",
      // Close initial text parts array elements
      ];
      // Loop through each lesson content object
      content.forEach((lesson) => {
        // Add divider line
        textParts.push("================================================================================");
        // Add lesson title line
        textParts.push(`Lesson: ${lesson.title}`);
        // Add divider line
        textParts.push("================================================================================");
        // Add actual lesson text content
        textParts.push(lesson.text);
        // Add blank line divider
        textParts.push("");
      // Close lesson loop callback
      });
      // Join accumulated text parts with newline characters
      const textString = textParts.join("\n");
      // Create new plain text blob with UTF-8 character encoding
      const blob = new Blob([textString], { type: "text/plain;charset=utf-8" });
      // Create temporary link element node
      const link = document.createElement("a");
      // Create object URL pointing to blob
      link.href = URL.createObjectURL(blob);
      // Set download file name format using course title slug
      link.download = `course_content_${courseTitle.replace(/[^a-z0-9_-]/gi, "_")}.txt`;
      // Click the link programmatically to trigger browser file download
      link.click();
    // End content validation block
    }
  // Close handleExportText block
  };

  // Helper action to trigger PDF document print layouts on click
  const handleExportPdf = async () => {
    // Fetch course contents text using helper scraper
    const content = await fetchSelectedCourseContent();
    // Validate if content was successfully retrieved
    if (content) {
      // Open new blank browser window target
      const printWindow = window.open("", "_blank");
      // Initialize HTML document boilerplate lines array
      let htmlParts = [
        // Set standard doctype declaration
        "<!DOCTYPE html>",
        // Add root HTML tag
        "<html>",
        // Add head section tag
        "<head>",
        // Add charset configuration meta tag
        '<meta charset="utf-8">',
        // Set document tab title
        `<title>${courseTitle}</title>`,
        // Add font preconnect link
        '<link rel="preconnect" href="https://fonts.googleapis.com">',
        // Add font cross-origin preconnect link
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
        // Load Outfit font styles
        '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">',
        // Open styles definition block
        "<style>",
        // Set layout print CSS variables rules
        "body { font-family: 'Outfit', sans-serif; color: #0f172a; line-height: 1.6; padding: 2rem; max-width: 800px; margin: 0 auto; background-color: #ffffff; }",
        // Set main title typography styles
        "h1 { font-size: 2.2rem; font-weight: 800; margin-bottom: 0.5rem; color: #005DE5; border-bottom: 2px solid #005DE5; padding-bottom: 0.5rem; }",
        // Set course metadata description styles
        ".course-meta { font-size: 1rem; color: #64748b; margin-bottom: 2rem; }",
        // Set individual lesson sections page formatting spacing
        ".lesson-section { margin-bottom: 3rem; page-break-inside: avoid; }",
        // Set lesson title styles
        ".lesson-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.25rem; }",
        // Set lesson body text styles
        ".lesson-text { font-size: 1rem; color: #334155; white-space: pre-wrap; }",
        // Configure print media queries
        "@media print { body { padding: 0; } .lesson-section { page-break-after: always; } .lesson-section:last-child { page-break-after: avoid; } }",
        // Close style block
        "</style>",
        // Close head section tag
        "</head>",
        // Add body tag
        "<body>",
        // Add heading course title block
        `<h1>${courseTitle}</h1>`,
        // Add generation source label subtext
        '<div class="course-meta">Exported from SAP Learning Journey Quiz Generator</div>',
      // Close initial html parts array elements
      ];
      // Loop through each lesson content object
      content.forEach((lesson) => {
        // Open lesson container section tag
        htmlParts.push('<div class="lesson-section">');
        // Add lesson title header
        htmlParts.push(`<div class="lesson-title">${lesson.title}</div>`);
        // Add lesson body text content
        htmlParts.push(`<div class="lesson-text">${lesson.text}</div>`);
        // Close lesson container section tag
        htmlParts.push("</div>");
      // Close lesson loop callback
      });
      // Open script tag block
      htmlParts.push("<script>");
      // Add print dialog trigger on page load
      htmlParts.push("window.onload = function() { window.print(); };");
      // Close script tag block
      htmlParts.push("</script>");
      // Close body tag
      htmlParts.push("</body>");
      // Close html root tag
      htmlParts.push("</html>");
      // Join HTML lines array into single page markup string
      const htmlString = htmlParts.join("\n");
      // Write HTML document string to new window stream
      printWindow.document.write(htmlString);
      // Close output stream triggering rendering
      printWindow.document.close();
    // End content validation block
    }
  // Close handleExportPdf block
  };

  // Calculate statistics percentages
  const correctCount = getCorrectAnswersCount();
  // Set total count value
  const totalQuestions = quizData.length;
  // Calculate percentage values
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Render the page markup JSX
  return (
    // Outer wrap container for layout alignment
    <div className="container">
      {/* Background radial aura glow decorative block */}
      <div className="glass-bg"></div>

      {/* Main app header block */}
      <header className="app-header">
        {/* Logo container area */}
        <div className="logo-area">
          {/* Main title heading */}
          <h1>
            SAP Learning Journey <span>Quiz Generator</span>
          </h1>
        {/* Close logo container */}
        </div>

        {/* Header control buttons and togglers block */}
        <div className="header-controls">
          {/* Sound control buttons row container */}
          <div className="sound-controls">
            {/* Audio toggle button element */}
            <button
              id="muteToggle"
              className="icon-btn"
              title="Mute/Unmute Sounds"
              onClick={() => setMuted(!muted)}
            >
              {/* Display mute speaker icon based on state */}
              {muted ? "🔇" : "🔊"}
            {/* Close mute toggle button */}
            </button>
            {/* Slider input to adjust volume level */}
            <input
              type="range"
              id="volumeSlider"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              className="volume-slider"
              title="Volume Control"
              onChange={(e) => {
                // Parse slider volume value
                const val = parseFloat(e.target.value);
                // Set volume state
                setVolume(val);
                // Auto unmute if volume goes positive
                if (val > 0 && muted) {
                  // Set mute state false
                  setMuted(false);
                // Auto mute if volume goes to zero
                } else if (val === 0 && !muted) {
                  // Set mute state true
                  setMuted(true);
                // End mute/volume synchronization
                }
              }}
            />
          {/* Close sound-controls container */}
          </div>

          {/* Theme mode switcher button element */}
          <button id="themeToggle" className="theme-btn" onClick={toggleTheme}>
            {/* Display moon/sun icon labels depending on theme */}
            {theme === "light-mode" ? "🌙 Toggle Dark Mode" : "☀️ Toggle Light Mode"}
          {/* Close theme toggle button */}
          </button>
        {/* Close header-controls container */}
        </div>
      {/* Close app-header container */}
      </header>

      {/* Main application wizard layout area */}
      <main className={`wizard-layout ${step > 1 ? "has-sidebar" : ""}`}>
        {/* Outline sidebar visible from step 2 onwards */}
        <aside
          id="outlineSidebar"
          className={`outline-sidebar glass-panel ${step === 1 ? "hidden" : ""} ${
            step >= 3 ? "read-only" : ""
          }`}
        >
          {/* Syllabus header title */}
          <h2 id="courseTitleHeader">{courseTitle}</h2>
          {/* Checkboxes selection select all/deselect all controls row container */}
          <div className="outline-controls">
            {/* Select all buttons element */}
            <button
              id="selectAllBtn"
              className="secondary-btn small-btn"
              onClick={handleSelectAll}
            >
              Select All
            {/* Close select all button */}
            </button>
            {/* Deselect all buttons element */}
            <button
              id="deselectAllBtn"
              className="secondary-btn small-btn"
              onClick={handleDeselectAll}
            >
              Deselect All
            {/* Close deselect all button */}
            </button>
          {/* Close outline-controls container */}
          </div>

          {/* Syllabus tree outline checkbox list container */}
          <div id="courseOutlineTree" className="outline-tree">
            {/* Loop through each unit object in syllabus outline state */}
            {outline.map((unit, unitIdx) => {
              // Calculate lessons URLs in this unit
              const unitLessons = unit.lessons || [];
              // Determine if all lessons in this unit are selected
              const allChecked = unitLessons.every((l) => selectedLessons.has(l.url));
              // Render individual unit container block
              return (
                <div key={unitIdx} className="outline-unit">
                  {/* Unit header row containing checkbox and title */}
                  <div className="outline-unit-header">
                    {/* Unit parent checkbox */}
                    <input
                      type="checkbox"
                      id={`unit-chk-${unitIdx}`}
                      checked={allChecked}
                      onChange={(e) => handleUnitClick(unitLessons, e.target.checked)}
                    />
                    {/* Unit checkbox helper text label */}
                    <label htmlFor={`unit-chk-${unitIdx}`}>{unit.title}</label>
                  {/* Close outline-unit-header container */}
                  </div>

                  {/* Child lessons checklist block under unit */}
                  <div className="outline-lessons-list">
                    {/* Loop through each child lesson object in unit */}
                    {unitLessons.map((lesson, lessonIdx) => {
                      // Check if lesson URL is checked
                      const isChecked = selectedLessons.has(lesson.url);
                      // Render individual lesson item checkbox row
                      return (
                        <div key={lessonIdx} className="outline-lesson-item">
                          {/* Lesson checkbox */}
                          <input
                            type="checkbox"
                            className="lesson-chk"
                            id={`lesson-chk-${unitIdx}-${lessonIdx}`}
                            checked={isChecked}
                            onChange={() =>
                              handleLessonClick(lesson.url, unitLessons, `unit-chk-${unitIdx}`)
                            }
                          />
                          {/* Lesson checkbox label */}
                          <label htmlFor={`lesson-chk-${unitIdx}-${lessonIdx}`}>
                            {lesson.title}
                          </label>
                        {/* Close outline-lesson-item container */}
                        </div>
                      );
                    })}
                  {/* Close outline-lessons-list container */}
                  </div>
                {/* Close outline-unit container */}
                </div>
              );
            })}
          {/* Close courseOutlineTree container */}
          </div>

          {/* Export document actions wrapper */}
          <div className="export-actions">
            {/* Export print PDF document button */}
            <button id="exportPdfBtn" className="secondary-btn small-btn" onClick={handleExportPdf}>
              Export PDF
            {/* Close export PDF button */}
            </button>
            {/* Export JSON document button */}
            <button id="exportJsonBtn" className="secondary-btn small-btn" onClick={handleExportJson}>
              Export JSON
            {/* Close export JSON button */}
            </button>
            {/* Export Plain Text document button */}
            <button id="exportTextBtn" className="secondary-btn small-btn" onClick={handleExportText}>
              Export Text
            {/* Close export text button */}
            </button>
          {/* Close export-actions container */}
          </div>
        {/* Close outlineSidebar container */}
        </aside>

        {/* Central interactive wizard card element */}
        <div
          id="wizardCard"
          className={`wizard-card glass-panel ${step === 3 ? "quiz-active" : ""}`}
          style={{ "--score-percent": `${percentage}%` }}
        >
          {/* Step 1 Page Content layout container */}
          {step === 1 && (
            <div id="step1" className="step-container">
              {/* Heading title */}
              <h2>Step 1: Load Course Outline</h2>
              {/* Sizing description guide text */}
              <p className="step-description">
                Enter an SAP Learning Journey course URL or slug to fetch its syllabus structure.
              </p>
              {/* Input layout group */}
              <div className="input-group">
                {/* Input text label */}
                <label htmlFor="courseUrlInput">SAP Course URL or Slug</label>
                {/* Input text field */}
                <input
                  type="text"
                  id="courseUrlInput"
                  placeholder="e.g., becoming-an-sap-btp-solution-architect"
                  value={courseUrl}
                  onChange={(e) => setCourseUrl(e.target.value)}
                />
              {/* Close input-group container */}
              </div>
              {/* Trigger button element to fetch syllabus outlines */}
              <button id="loadOutlineBtn" className="primary-btn" onClick={handleLoadOutline}>
                Load Course Outline
              {/* Close load outline button */}
              </button>

              {/* How it works preview gallery showcasing the rest of the wizard flow */}
              <div className="how-it-works">
                {/* Section heading label */}
                <h3>How It Works</h3>
                {/* Animated gif cards grid container, each looping the key interaction for that step */}
                <div className="how-it-works-grid">
                  {/* Step 1 preview card */}
                  <div className="how-it-works-card">
                    <span className="how-it-works-badge">1</span>
                    <img src="/gifs/step1-load-outline.gif" alt="Enter a course URL or slug to load its syllabus" />
                    <p><strong>Load Outline —</strong> Enter a course URL or slug to fetch its syllabus</p>
                  {/* Close preview card */}
                  </div>
                  {/* Step 2 preview card */}
                  <div className="how-it-works-card">
                    <span className="how-it-works-badge">2</span>
                    <img src="/gifs/step2-configure.gif" alt="Select lessons, then configure difficulty, question count, and Gemini model" />
                    <p><strong>Configure —</strong> Pick lessons, difficulty, question count, and your Gemini model</p>
                  {/* Close preview card */}
                  </div>
                  {/* Step 3 preview card */}
                  <div className="how-it-works-card">
                    <span className="how-it-works-badge">3</span>
                    <img src="/gifs/step3-quiz-player.gif" alt="Take the generated quiz with instant explanations" />
                    <p><strong>Take the Quiz —</strong> Answer questions with instant explanations and sources</p>
                  {/* Close preview card */}
                  </div>
                  {/* Step 4 preview card */}
                  <div className="how-it-works-card">
                    <span className="how-it-works-badge">4</span>
                    <img src="/gifs/step4-results.gif" alt="Review your score and detailed results breakdown" />
                    <p><strong>Review Results —</strong> See your score and a full question-by-question breakdown</p>
                  {/* Close preview card */}
                  </div>
                {/* Close how-it-works-grid container */}
                </div>
              {/* Close how-it-works container */}
              </div>
            {/* Close step 1 container */}
            </div>
          )}

          {/* Step 2 Page Content layout container */}
          {step === 2 && (
            <div id="step2" className="step-container">
              {/* Heading title */}
              <h2>Step 2: Configure Settings</h2>
              {/* Description guide text */}
              <p className="step-description">
                Select content from the sidebar, then set up difficulty, questions count, and
                credentials.
              </p>
              {/* Difficulty and count row layout */}
              <div className="row-group">
                {/* Left column layout */}
                <div className="input-group half">
                  {/* Select dropdown label */}
                  <label htmlFor="difficulty">Difficulty</label>
                  {/* Difficulty option dropdown list selector */}
                  <select
                    id="difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    {/* Beginner option */}
                    <option value="Beginner">Beginner</option>
                    {/* Intermediate option */}
                    <option value="Intermediate">Intermediate</option>
                    {/* Advanced option */}
                    <option value="Advanced">Advanced</option>
                  {/* Close difficulty selector */}
                  </select>
                {/* Close input-group container */}
                </div>
                {/* Right column layout */}
                <div className="input-group half">
                  {/* Input number label */}
                  <label htmlFor="qCount">Questions</label>
                  {/* Question counts numeric input field */}
                  <input
                    type="number"
                    id="qCount"
                    min="1"
                    max="15"
                    value={qCount}
                    onChange={(e) => setQCount(e.target.value)}
                  />
                {/* Close input-group container */}
                </div>
              {/* Close row-group container */}
              </div>

              {/* Gemini configuration credentials inputs */}
              <div className="input-group">
                {/* API Key inputs label */}
                <label>
                  Gemini Configuration (
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    style={{ color: "var(--accent-start)", textDecoration: "underline" }}
                  >
                    Get Key
                  </a>
                  )
                {/* Close label tag */}
                </label>

                {/* API key password text input wrapper */}
                {!modelsLoaded ? (
                  <div id="geminiKeyWrapper" style={{ display: "flex", gap: "10px", alignItems: "stretch" }}>
                    {/* API Key input field */}
                    <input
                      type="password"
                      id="geminiApiKey"
                      placeholder="Enter API Key"
                      style={{ flex: 1 }}
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                    />
                    {/* Load button to pull available models list */}
                    <button
                      id="loadModelsBtn"
                      type="button"
                      className="secondary-btn"
                      style={{ padding: "0 15px", margin: "0" }}
                      disabled={loadingModels}
                      onClick={() => loadAvailableModels()}
                    >
                      {/* Show loading text on button when request is active */}
                      {loadingModels ? "Loading..." : "Load"}
                    {/* Close load models button */}
                    </button>
                  {/* Close geminiKeyWrapper container */}
                  </div>
                ) : (
                  // Model select dropdown wrapper
                  <div id="geminiModelWrapper" style={{ display: "flex", gap: "10px", alignItems: "stretch" }}>
                    {/* Model select list selector */}
                    <select
                      id="geminiModel"
                      style={{ flex: 1 }}
                      value={geminiModel}
                      onChange={(e) => setGeminiModel(e.target.value)}
                    >
                      {/* Loop through available models state list */}
                      {availableModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    {/* Close geminiModel selector */}
                    </select>
                    {/* Change key button to return to password input field */}
                    <button
                      id="changeKeyBtn"
                      type="button"
                      className="secondary-btn"
                      style={{
                        padding: "0 15px",
                        margin: "0",
                        background: "transparent",
                        border: "1px solid var(--border-color)",
                      }}
                      onClick={() => setModelsLoaded(false)}
                    >
                      Change Key
                    {/* Close change key button */}
                    </button>
                  {/* Close geminiModelWrapper container */}
                  </div>
                )}
              {/* Close input-group container */}
              </div>

              {/* Step 2 action button navigation bar */}
              <div className="wizard-actions">
                {/* Back to Step 1 button */}
                <button
                  id="backToStep1"
                  className="secondary-btn"
                  disabled={generatingQuiz}
                  onClick={handleBackToStep1}
                >
                  Back
                {/* Close back button */}
                </button>
                {/* Trigger quiz generation button */}
                <button
                  id="generateBtn"
                  className={`primary-btn ${generatingQuiz ? "cancel-mode" : ""}`}
                  onClick={handleGenerateQuiz}
                >
                  {/* Adjust button label during generation process */}
                  {generatingQuiz ? "Cancel Generation" : "Generate Quiz"}
                {/* Close generate button */}
                </button>
              {/* Close wizard-actions container */}
              </div>
            {/* Close step 2 container */}
            </div>
          )}

          {/* Step 3 Page Content layout container (Quiz Player) */}
          {step === 3 && quizData.length > 0 && (
            <div id="step3" className="step-container">
              {/* Player metrics progress header */}
              <div className="player-header">
                {/* Progress metadata label */}
                <div className="player-header-top">
                  <span id="questionIndicator" className="question-indicator">
                    {activeQuestionIndex + 1}/{quizData.length} | Correct: {getCorrectAnswersCount()}
                  </span>
                  {/* Distraction-free focus mode toggle button element */}
                  <button
                    id="focusToggleBtn"
                    className="theme-btn focus-toggle-btn"
                    title="Toggle Focus Mode"
                    onClick={() => setFocusMode(!focusMode)}
                  >
                    {/* Toggle button label */}
                    {focusMode ? "🎯 Exit Focus" : "🎯 Focus Mode"}
                  {/* Close focus toggle button */}
                  </button>
                {/* Close player-header-top container */}
                </div>
                {/* Horizontal progress track line container */}
                <div className="progress-bar-container">
                  {/* Dynamic fill showing progress completion */}
                  <div
                    id="progressBarFill"
                    className="progress-bar-fill"
                    style={{ width: `${((activeQuestionIndex + 1) / quizData.length) * 100}%` }}
                  />
                {/* Close progress-bar-container */}
                </div>
              {/* Close player-header container */}
              </div>

              {/* Active question layout card */}
              <div id="activeQuestionCard" className="question-card">
                {/* Extract active question item properties */}
                {(() => {
                  // Get active question item object
                  const item = quizData[activeQuestionIndex];
                  // Get recorded selection answer for the active question
                  const recordedAnswer = userAnswers[activeQuestionIndex];
                  // Return question details markup
                  return (
                    <>
                      {/* Unit title source tag label */}
                      <div className="quiz-meta">{item.unit_title}</div>
                      {/* Question content text paragraph */}
                      <p className="question-text">{item.question}</p>
                      {/* Choices options list container */}
                      <div className="options-list">
                        {/* Loop through each option in question choices array */}
                        {item.options.map((option, optIdx) => {
                          // Determine selection states styling classes
                          const isSelected = option === recordedAnswer;
                          // Determine if this choice is the correct answer
                          const isCorrectOpt = option === item.correct_answer;
                          // Setup conditional styling class names
                          let stateClass = "";
                          // Check if user answered
                          if (recordedAnswer !== null) {
                            // Highlight selected option correct/incorrect
                            if (isSelected) {
                              // Set correct green or incorrect red classes
                              stateClass = isCorrectOpt ? "selected correct" : "selected incorrect";
                            // Outline correct option green even if user selected wrong
                            } else if (isCorrectOpt) {
                              // Set correct class
                              stateClass = "correct";
                            // End selected check
                            }
                          // If not answered yet
                          } else if (isSelected) {
                            // Set selected highlight class
                            stateClass = "selected";
                          // End answered check
                          }
                          // Render individual choice item click block
                          return (
                            <div
                              key={optIdx}
                              className={`option-item ${stateClass}`}
                              onClick={() => handleOptionSelect(option)}
                            >
                              {/* Option content text */}
                              <span className="option-text">{option}</span>
                              {/* Display correct/incorrect icons on selection */}
                              {recordedAnswer !== null && isSelected && (
                                <span className={`option-icon ${isCorrectOpt ? "correct-icon" : "incorrect-icon"}`}>
                                  {isCorrectOpt ? (
                                    <svg
                                      viewBox="0 0 24 24"
                                      width="32"
                                      height="32"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="4.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  ) : (
                                    <svg
                                      viewBox="0 0 24 24"
                                      width="32"
                                      height="32"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="4.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <line x1="18" y1="6" x2="6" y2="18" />
                                      <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                  )}
                                </span>
                              )}
                            {/* Close option-item container */}
                            </div>
                          );
                        })}
                      {/* Close options-list container */}
                      </div>

                      {/* Explanation details details box */}
                      {recordedAnswer !== null && showExplanation && (
                        <details className="explanation-panel" open>
                          {/* Summary click toggle banner */}
                          <summary
                            className="explanation-summary"
                            onClick={(e) => {
                              // Prevent browser default details expand collapse toggling behavior
                              e.preventDefault();
                              // Toggle explanation expansion panel state
                              setShowExplanation(!showExplanation);
                            }}
                          >
                            Explanation & Source
                          </summary>
                          {/* Details text contents wrapper */}
                          <div className="explanation-content">
                            {/* Explanation description */}
                            <strong>Explanation: </strong> {item.explanation}
                            {/* Line dividers */}
                            <br />
                            <br />
                            {/* Source reference URL link */}
                            <strong>Source: </strong>
                            <a href={item.source_url} target="_blank" rel="noreferrer">
                              {item.unit_title}
                            </a>
                          {/* Close explanation-content container */}
                          </div>
                        {/* Close explanation-panel container */}
                        </details>
                      )}
                    </>
                  );
                })()}
              {/* Close activeQuestionCard container */}
              </div>

              {/* Player buttons navigation controls bar */}
              <div className="player-actions">
                {/* Previous question button */}
                <button
                  id="prevQuestionBtn"
                  className="secondary-btn"
                  disabled={activeQuestionIndex === 0}
                  onClick={handlePrevQuestion}
                >
                  Previous
                {/* Close previous button */}
                </button>
                {/* Quit quiz play button */}
                <button id="quitQuizBtn" className="secondary-btn" onClick={handleQuitQuiz}>
                  Quit Quiz
                {/* Close quit button */}
                </button>
                {/* Next or Finish question button */}
                <button
                  id="nextQuestionBtn"
                  className="primary-btn"
                  disabled={userAnswers[activeQuestionIndex] === null}
                  onClick={handleNextQuestion}
                >
                  {/* Adjust label on last question */}
                  {activeQuestionIndex === quizData.length - 1 ? "Finish" : "Next"}
                {/* Close next button */}
                </button>
              {/* Close player-actions container */}
              </div>
            {/* Close step 3 container */}
            </div>
          )}

          {/* Step 4 Page Content layout container (Score Summary) */}
          {step === 4 && (
            <div id="step4" className="step-container">
              {/* Summary page title */}
              <div className="summary-header">
                <h2>Quiz Results</h2>
              {/* Close summary-header container */}
              </div>

              {/* Metric score evaluation dashboard */}
              <div className="score-dashboard">
                {/* Conic progress donut graph visualizer */}
                <div className="circular-progress">
                  {/* Inside percentage text label indicators */}
                  <div className="score-value">
                    <span id="percentScore">{percentage}%</span>
                  {/* Close score-value container */}
                  </div>
                {/* Close circular-progress container */}
                </div>
                {/* Evaluation text column layouts */}
                <div className="rating-info">
                  {/* Pill ratio correct badges */}
                  <div className="score-ratio-badge">
                    Score:{" "}
                    <span>
                      <span id="correctScore">{correctCount}</span>/
                      <span id="totalQuestionsCount">{totalQuestions}</span>
                    </span>{" "}
                    Correct
                  {/* Close score-ratio-badge container */}
                  </div>
                  {/* Dynamic performance title feedback */}
                  <h3 id="ratingTitle">
                    {percentage === 100
                      ? "🎉 Outstanding Performance! 🏆"
                      : percentage >= 80
                      ? "Outstanding Performance!"
                      : percentage >= 50
                      ? "Good Effort!"
                      : "Keep Practicing!"}
                  {/* Close ratingTitle header */}
                  </h3>
                  {/* Dynamic description feedback messages */}
                  <p id="ratingFeedback">
                    {percentage === 100
                      ? "🥳 Excellent job! You have fully mastered these SAP learning modules. 🌟"
                      : percentage >= 80
                      ? "Excellent job! You have fully mastered these SAP learning modules."
                      : percentage >= 50
                      ? "Great attempt. Review the explanations below to patch your knowledge gaps."
                      : "Read the unit outline and explanations carefully, then try retaking the quiz."}
                  {/* Close ratingFeedback description */}
                  </p>
                {/* Close rating-info container */}
                </div>
              {/* Close score-dashboard container */}
              </div>

              {/* Review data logs questions checklist container */}
              <div id="quizReviewList" className="review-list">
                {/* Loop through each question object in quizData state */}
                {quizData.map((item, idx) => {
                  // Evaluate correctness check
                  const isCorrect = userAnswers[idx] === item.correct_answer;
                  // Render individual reviewed log item panel
                  return (
                    <div key={idx} className="review-item">
                      {/* Header banner showing unit title and correctness status */}
                      <div className="review-question-header">
                        {/* Title text */}
                        <h4>
                          {item.unit_title} | Q{idx + 1}: {item.question}
                        </h4>
                        {/* Pill badge showing status */}
                        <span className={`correctness-badge ${isCorrect ? "correct" : "incorrect"}`}>
                          {isCorrect ? "Correct" : "Incorrect"}
                        {/* Close correctness badge */}
                        </span>
                      {/* Close review-question-header container */}
                      </div>

                      {/* Answer comparisons grid container */}
                      <div className="review-answers-grid">
                        {/* User choice line */}
                        <div className={`review-answer-line user-answer ${isCorrect ? "correct" : "incorrect"}`}>
                          <strong>Your Answer: </strong> {userAnswers[idx] || "Unanswered"}
                        {/* Close user answer line container */}
                        </div>
                        {/* Highlight correct answer if user got it wrong */}
                        {!isCorrect && (
                          <div className="review-answer-line correct-answer">
                            <strong>Correct Answer: </strong> {item.correct_answer}
                          {/* Close correct answer line container */}
                          </div>
                        )}
                      {/* Close review-answers-grid container */}
                      </div>

                      {/* Review details explanation details box */}
                      <details className="explanation-panel" open>
                        {/* Summary banner toggle */}
                        <summary className="explanation-summary">Explanation & Source</summary>
                        {/* Details content */}
                        <div className="explanation-content">
                          <strong>Explanation: </strong> {item.explanation}
                          {/* Divider line spacing */}
                          <br />
                          <br />
                          {/* Source reference URL link */}
                          <strong>Source: </strong>
                          <a href={item.source_url} target="_blank" rel="noreferrer">
                            {item.unit_title}
                          </a>
                        {/* Close explanation-content container */}
                        </div>
                      {/* Close explanation panel details */}
                      </details>
                    {/* Close review-item container */}
                    </div>
                  );
                })}
              {/* Close quizReviewList container */}
              </div>

              {/* Step 4 action button navigation footer */}
              <div className="wizard-actions summary-footer">
                {/* Replay generated questions button */}
                <button id="retakeQuizBtn" className="secondary-btn" onClick={handleRetakeQuiz}>
                  Retake Quiz
                {/* Close retake button */}
                </button>
                {/* Return to Step 2 configurator button */}
                <button id="startNewQuizBtn" className="primary-btn" onClick={handleStartNewQuiz}>
                  Start New Quiz
                {/* Close start new quiz button */}
                </button>
              {/* Close wizard-actions container */}
              </div>
            {/* Close step 4 container */}
            </div>
          )}

          {/* Loader status indicator box */}
          {status && (
            <div
              id="statusContainer"
              className={`status-box ${status.type}`}
              dangerouslySetInnerHTML={{ __html: status.html }}
            />
          )}
        {/* Close wizardCard container */}
        </div>
      {/* Close wizard-layout container */}
      </main>
    {/* Close container container */}
    </div>
  );
// Close Page function block
}
