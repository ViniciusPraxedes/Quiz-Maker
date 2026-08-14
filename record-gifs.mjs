import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const FFMPEG = "C:\\Users\\ViniciusPraxedes\\AppData\\Local\\ms-playwright\\ffmpeg-1011\\ffmpeg-win64.exe";
const gifDir = path.resolve("public/gifs");
fs.mkdirSync(gifDir, { recursive: true });
const tmpRoot = path.resolve(".tmp-gif");
fs.rmSync(tmpRoot, { recursive: true, force: true });
fs.mkdirSync(tmpRoot, { recursive: true });

const OUTLINE_HTML = `
  <h2 id="courseTitleHeader">Becoming an SAP BTP Solution Architect</h2>
  <div class="outline-controls">
    <button class="secondary-btn small-btn">Select All</button>
    <button class="secondary-btn small-btn">Deselect All</button>
  </div>
  <div id="courseOutlineTree" class="outline-tree">
    <div class="outline-unit">
      <div class="outline-unit-header"><input type="checkbox" checked><label>Unit 1: BTP Foundations</label></div>
      <div class="outline-lessons-list">
        <div class="outline-lesson-item"><input type="checkbox" checked><label>Introducing SAP BTP</label></div>
        <div class="outline-lesson-item"><input type="checkbox" checked><label>Exploring the BTP Cockpit</label></div>
      </div>
    </div>
    <div class="outline-unit">
      <div class="outline-unit-header"><input type="checkbox" checked><label>Unit 2: Security Fundamentals</label></div>
      <div class="outline-lessons-list">
        <div class="outline-lesson-item"><input type="checkbox" checked><label>Identity Authentication Service</label></div>
        <div class="outline-lesson-item"><input type="checkbox" checked><label>Role Collections and Roles</label></div>
      </div>
    </div>
    <div class="outline-unit">
      <div class="outline-unit-header"><input type="checkbox" checked><label>Unit 3: Integration Suite</label></div>
      <div class="outline-lessons-list">
        <div class="outline-lesson-item"><input type="checkbox" checked><label>Cloud Integration Basics</label></div>
      </div>
    </div>
  </div>
  <div class="export-actions">
    <button class="secondary-btn small-btn">Export PDF</button>
    <button class="secondary-btn small-btn">Export JSON</button>
    <button class="secondary-btn small-btn">Export Text</button>
  </div>
`;

const STEP2_HTML = `
  <div id="step2" class="step-container">
    <h2>Step 2: Configure Settings</h2>
    <p class="step-description">Select content from the sidebar, then set up difficulty, questions count, and credentials.</p>
    <div class="row-group">
      <div class="input-group half">
        <label>Difficulty</label>
        <select><option>Beginner</option><option selected>Intermediate</option><option>Advanced</option></select>
      </div>
      <div class="input-group half">
        <label>Questions</label>
        <input type="number" value="5">
      </div>
    </div>
    <div class="input-group">
      <label>Gemini Configuration (<a href="#" style="color: var(--accent-start); text-decoration: underline;">Get Key</a>)</label>
      <div id="geminiKeyArea" style="display:flex; gap:10px; align-items:stretch;">
        <input type="password" id="demoGeminiKey" placeholder="Enter API Key" style="flex:1;">
        <button type="button" id="demoLoadModelsBtn" class="secondary-btn" style="padding:0 15px; margin:0;">Load</button>
      </div>
    </div>
    <div class="wizard-actions">
      <button class="secondary-btn">Back</button>
      <button id="demoGenerateBtn" class="primary-btn">Generate Quiz</button>
    </div>
  </div>
`;

const GEMINI_MODEL_AREA_HTML = `
  <select style="flex:1;"><option selected>Gemini 3.5 Flash (Medium)</option></select>
  <button type="button" class="secondary-btn" style="padding:0 15px; margin:0; background:transparent; border:1px solid var(--border-color);">Change Key</button>
`;

const CHECK_ICON = `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

const STEP3_Q_HTML = `
  <div id="step3" class="step-container">
    <div class="player-header">
      <div class="player-header-top">
        <span class="question-indicator">3/5 | Correct: 2</span>
        <button class="theme-btn focus-toggle-btn">\u{1F3AF} Focus Mode</button>
      </div>
      <div class="progress-bar-container"><div class="progress-bar-fill" style="width: 60%;"></div></div>
    </div>
    <div class="question-card">
      <div class="quiz-meta">Unit 2: Security Fundamentals</div>
      <p class="question-text">Which SAP BTP service is primarily used for identity and access management across subaccounts?</p>
      <div class="options-list" id="q-options">
        <div class="option-item" id="q-opt-0"><span class="option-text">SAP Cloud Integration</span></div>
        <div class="option-item" id="q-opt-1"><span class="option-text">SAP Identity Authentication Service (IAS)</span></div>
        <div class="option-item" id="q-opt-2"><span class="option-text">SAP HANA Cloud</span></div>
        <div class="option-item" id="q-opt-3"><span class="option-text">SAP Build Work Zone</span></div>
      </div>
      <div id="q-explanation"></div>
    </div>
    <div class="player-actions">
      <button class="secondary-btn">Previous</button>
      <button class="secondary-btn">Quit Quiz</button>
      <button id="q-next" class="primary-btn">Next</button>
    </div>
  </div>
`;

const STEP4_HTML = `
  <div id="step4" class="step-container">
    <div class="summary-header"><h2>Quiz Results</h2></div>
    <div class="score-dashboard">
      <div class="circular-progress" style="--score-percent: 80%;"><div class="score-value"><span>80%</span></div></div>
      <div class="rating-info">
        <div class="score-ratio-badge">Score: <span>4/5</span> Correct</div>
        <h3>Outstanding Performance!</h3>
        <p>Excellent job! You have fully mastered these SAP learning modules.</p>
      </div>
    </div>
    <div class="review-list">
      <div class="review-item">
        <div class="review-question-header">
          <h4>Unit 2: Security Fundamentals | Q3: Which SAP BTP service is primarily used for identity and access management across subaccounts?</h4>
          <span class="correctness-badge correct">Correct</span>
        </div>
        <div class="review-answers-grid">
          <div class="review-answer-line user-answer correct"><strong>Your Answer: </strong> SAP Identity Authentication Service (IAS)</div>
        </div>
      </div>
      <div class="review-item">
        <div class="review-question-header">
          <h4>Unit 1: BTP Foundations | Q4: What is the primary purpose of the BTP Cockpit?</h4>
          <span class="correctness-badge incorrect">Incorrect</span>
        </div>
        <div class="review-answers-grid">
          <div class="review-answer-line user-answer incorrect"><strong>Your Answer: </strong> Hosting production databases</div>
          <div class="review-answer-line correct-answer"><strong>Correct Answer: </strong> Managing subaccounts, entitlements, and service instances</div>
        </div>
      </div>
    </div>
    <div class="wizard-actions summary-footer">
      <button class="secondary-btn">Retake Quiz</button>
      <button class="primary-btn">Start New Quiz</button>
    </div>
  </div>
`;

const FETCH_LOADER_HTML = `
  <div id="statusContainer" class="status-box loading">
    <div class="loader-spinner"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 C12 2 13.5 8 18 9 C13.5 10 12 16 12 16 C12 16 10.5 10 6 9 C10.5 8 12 2 12 2Z" fill="#6366f1"/></svg></div>
    <p>Fetching and parsing course structure... Please wait.</p>
  </div>
`;

const GENERATE_LOADER_HTML = `
  <div id="statusContainer" class="status-box loading">
    <div class="gemini-loader-wrapper">
      <span class="particle"></span><span class="particle"></span><span class="particle"></span><span class="particle"></span><span class="particle"></span>
      <div class="loader-spinner"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 C12 2 13.5 8 18 9 C13.5 10 12 16 12 16 C12 16 10.5 10 6 9 C10.5 8 12 2 12 2Z" fill="#a855f7"/></svg></div>
    </div>
    <p>Generating relevant questions...</p>
    <div class="progress-bar-container" style="margin-top: 15px; width: 80%; max-width: 300px; margin-left: auto; margin-right: auto;">
      <div class="progress-bar-fill" style="width: 75%;"></div>
    </div>
  </div>
`;

async function setupCursor(page) {
  await page.evaluate(() => {
    if (document.getElementById("__fake_cursor")) return;
    const el = document.createElement("div");
    el.id = "__fake_cursor";
    Object.assign(el.style, {
      position: "fixed",
      width: "22px",
      height: "22px",
      borderRadius: "50%",
      background: "rgba(0,93,229,0.9)",
      border: "3px solid #ffffff",
      boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
      pointerEvents: "none",
      zIndex: 999999,
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%) scale(1)",
      transition: "left 0.45s cubic-bezier(0.4,0,0.2,1), top 0.45s cubic-bezier(0.4,0,0.2,1), transform 0.15s ease",
    });
    document.body.appendChild(el);
  });
}

async function moveTo(page, selector) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) return;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.evaluate(
    ({ x, y }) => {
      const el = document.getElementById("__fake_cursor");
      el.style.left = x + "px";
      el.style.top = y + "px";
    },
    { x, y }
  );
  await page.waitForTimeout(500);
}

async function pulse(page) {
  await page.evaluate(() => {
    const el = document.getElementById("__fake_cursor");
    el.style.transform = "translate(-50%, -50%) scale(0.55)";
    setTimeout(() => {
      el.style.transform = "translate(-50%, -50%) scale(1)";
    }, 160);
  });
  await page.waitForTimeout(240);
}

async function setWizardCard(page, html) {
  await page.evaluate((html) => {
    document.querySelector(".wizard-card").innerHTML = html;
  }, html);
}

async function appendStatus(page, html) {
  await page.evaluate((html) => {
    document.querySelector(".wizard-card").insertAdjacentHTML("beforeend", html);
  }, html);
}

async function enableSidebar(page) {
  await page.evaluate((asideHtml) => {
    document.querySelector(".wizard-layout").classList.add("has-sidebar");
    const aside = document.querySelector(".outline-sidebar");
    aside.classList.remove("hidden");
    aside.innerHTML = asideHtml;
  }, OUTLINE_HTML);
}

const browser = await chromium.launch();

async function recordClip(name, fn) {
  const dir = path.join(tmpRoot, name);
  fs.mkdirSync(dir, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    recordVideo: { dir, size: { width: 1280, height: 900 } },
  });
  const page = await context.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await setupCursor(page);
  await page.waitForTimeout(400);
  await fn(page);
  await page.waitForTimeout(500);
  await page.close();
  await context.close();
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".webm"));
  return path.join(dir, files[0]);
}

function toGif(webmPath, gifName) {
  const palette = path.join(tmpRoot, `${gifName}-palette.png`);
  const out = path.join(gifDir, `${gifName}.gif`);
  execFileSync(FFMPEG, [
    "-y", "-i", webmPath,
    "-vf", "fps=12,scale=480:-1:flags=lanczos,palettegen=stats_mode=diff",
    palette,
  ]);
  execFileSync(FFMPEG, [
    "-y", "-i", webmPath, "-i", palette,
    "-filter_complex", "fps=12,scale=480:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer",
    out,
  ]);
  console.log("Saved", out);
}

// Step 1: real typing + click + loading spinner
const step1Video = await recordClip("step1", async (page) => {
  await moveTo(page, "#courseUrlInput");
  await page.click("#courseUrlInput");
  await page.type("#courseUrlInput", "becoming-an-sap-btp-solution-architect", { delay: 32 });
  await page.waitForTimeout(350);
  await moveTo(page, "#loadOutlineBtn");
  await pulse(page);
  await appendStatus(page, FETCH_LOADER_HTML);
  await page.waitForTimeout(1400);
});
toGif(step1Video, "step1-load-outline");

// Step 2: enter key, load models, generate quiz
const step2Video = await recordClip("step2", async (page) => {
  await enableSidebar(page);
  await setWizardCard(page, STEP2_HTML);
  await page.waitForTimeout(400);
  await moveTo(page, "#demoGeminiKey");
  await page.click("#demoGeminiKey");
  await page.type("#demoGeminiKey", "AIzaSyDemoKeyPlaceholder1234567", { delay: 18 });
  await page.waitForTimeout(250);
  await moveTo(page, "#demoLoadModelsBtn");
  await pulse(page);
  await page.evaluate((html) => {
    document.getElementById("geminiKeyArea").innerHTML = html;
  }, GEMINI_MODEL_AREA_HTML);
  await page.waitForTimeout(600);
  await moveTo(page, "#demoGenerateBtn");
  await pulse(page);
  await appendStatus(page, GENERATE_LOADER_HTML);
  await page.waitForTimeout(1400);
});
toGif(step2Video, "step2-configure");

// Step 3: select an option, reveal explanation
const step3Video = await recordClip("step3", async (page) => {
  await enableSidebar(page);
  await setWizardCard(page, STEP3_Q_HTML);
  await page.waitForTimeout(400);
  await moveTo(page, "#q-opt-1");
  await pulse(page);
  await page.evaluate(
    ({ checkIcon }) => {
      const opt = document.getElementById("q-opt-1");
      opt.classList.add("selected", "correct");
      opt.insertAdjacentHTML("beforeend", `<span class="option-icon correct-icon">${checkIcon}</span>`);
      document.getElementById("q-explanation").innerHTML = `
        <details class="explanation-panel" open>
          <summary class="explanation-summary">Explanation & Source</summary>
          <div class="explanation-content">
            <strong>Explanation: </strong> SAP Identity Authentication Service (IAS) centralizes authentication and single sign-on across BTP subaccounts.
            <br><br><strong>Source: </strong><a href="#">Unit 2: Security Fundamentals</a>
          </div>
        </details>`;
    },
    { checkIcon: CHECK_ICON }
  );
  await page.waitForTimeout(1500);
  await moveTo(page, "#q-next");
  await pulse(page);
});
toGif(step3Video, "step3-quiz-player");

// Step 4: results dashboard, scroll through review list
const step4Video = await recordClip("step4", async (page) => {
  await enableSidebar(page);
  await setWizardCard(page, STEP4_HTML);
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    document.querySelector(".review-list")?.scrollTo({ top: 300, behavior: "smooth" });
  });
  await page.waitForTimeout(1500);
});
toGif(step4Video, "step4-results");

await browser.close();
fs.rmSync(tmpRoot, { recursive: true, force: true });
console.log("Done.");
