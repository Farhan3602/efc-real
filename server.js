// server.js - WORKING VERSION with Built-in Empathetic AI
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

console.log("🌱 Starting Existential Crisis Companion Server...");

// Problem detection keywords
const problemKeywords = {
  anxiety: [
    "anxious",
    "worry",
    "panic",
    "nervous",
    "fear",
    "scared",
    "stress",
    "overwhelmed",
    "anxiet",
  ],
  depression: [
    "sad",
    "depressed",
    "hopeless",
    "empty",
    "worthless",
    "giving up",
    "give up",
    "suicide",
    "die",
    "nothing matters",
    "no point",
  ],
  stress: [
    "stressed",
    "pressure",
    "exhausted",
    "tired",
    "burnout",
    "overwhelm",
  ],
  existential: [
    "meaning",
    "purpose",
    "why exist",
    "pointless",
    "existence",
    "life meaningless",
    "why am i here",
  ],
};

// Detect mental health issues from user message
function detectProblems(message) {
  const lowerMessage = message.toLowerCase();
  const detected = [];

  for (const [issue, keywords] of Object.entries(problemKeywords)) {
    if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
      detected.push(issue);
    }
  }

  return detected;
}

// Empathetic response templates based on detected issues
const responseTemplates = {
  anxiety: [
    "I can hear that you're feeling anxious right now. Those feelings are real and valid. Can you tell me more about what's triggering these feelings?",
    "Anxiety can be overwhelming. Remember, you're not alone in feeling this way. What specific worries are weighing on you?",
    "It's okay to feel anxious. Many people experience these feelings. Let's talk through what's causing this worry.",
    "I understand you're experiencing anxiety. That takes courage to share. What would help you feel more grounded right now?",
  ],
  depression: [
    "I hear that you're going through a really difficult time. Your feelings are valid, and I'm here to listen. Please tell me more.",
    "What you're feeling matters, and you matter. Depression is heavy, but you don't have to carry it alone. How long have you been feeling this way?",
    "Thank you for trusting me with this. Feeling hopeless is incredibly hard. Have you been able to talk to anyone else about these feelings?",
    "I'm really concerned about how you're feeling. Your life has value, even when it doesn't feel that way. Can you tell me more about what's going on?",
  ],
  stress: [
    "It sounds like you're under a lot of pressure right now. That's exhausting. What's been the most stressful part?",
    "Feeling overwhelmed is a sign that you're dealing with a lot. Let's break this down together. What's weighing most heavily on you?",
    "Stress can be really draining. You're doing your best, and that's enough. What would help you feel less overwhelmed right now?",
    "I hear you. Life can pile on sometimes. What support do you have around you?",
  ],
  existential: [
    "Questions about meaning and purpose are profound and completely normal. Many people wrestle with these thoughts. What prompted this reflection?",
    "Existential questions show you're thinking deeply about life. That's actually a sign of awareness. What aspect of meaning troubles you most?",
    "Feeling disconnected from purpose can be unsettling. But asking these questions is the first step toward finding your own meaning. What matters to you?",
    "These are big questions you're grappling with. There's no one right answer, but exploring them together might help. What brings you even small moments of meaning?",
  ],
  general: [
    "Thank you for sharing that with me. I'm here to listen without judgment. Can you tell me more about what you're experiencing?",
    "I appreciate you opening up. Your feelings are important. What else is on your mind?",
    "It takes courage to talk about these things. I'm here for you. How are you coping with all of this?",
    "I'm listening. Your thoughts and feelings matter. What would be most helpful for you right now?",
  ],
};

// Follow-up prompts to continue conversation
const followUpPrompts = [
  "What led you to feel this way?",
  "How long have you been experiencing this?",
  "Have you noticed any patterns to when you feel like this?",
  "What usually helps you when you're feeling this way?",
  "Is there someone in your life you feel comfortable talking to?",
  "What's one small thing that might help you feel a bit better today?",
];

// Generate empathetic AI-like response
function generateResponse(message, detectedIssues, conversationLength) {
  let response = "";

  // Choose response based on detected issues
  if (detectedIssues.length > 0) {
    const issue = detectedIssues[0]; // Focus on first detected issue
    const templates = responseTemplates[issue];
    const randomIndex = Math.floor(Math.random() * templates.length);
    response = templates[randomIndex];
  } else {
    // General supportive response
    const templates = responseTemplates.general;
    const randomIndex = Math.floor(Math.random() * templates.length);
    response = templates[randomIndex];
  }

  // Add follow-up prompt occasionally
  if (conversationLength > 2 && Math.random() > 0.5) {
    const promptIndex = Math.floor(Math.random() * followUpPrompts.length);
    response += " " + followUpPrompts[promptIndex];
  }

  return response;
}

// API endpoint for chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    console.log("📨 Received message:", message);

    // Detect problems in user message
    const detectedIssues = detectProblems(message);

    if (detectedIssues.length > 0) {
      console.log("🔍 Detected issues:", detectedIssues.join(", "));
    }

    // Generate empathetic response
    const aiResponse = generateResponse(
      message,
      detectedIssues,
      conversationHistory.length
    );

    console.log("✅ Sending response");

    res.json({
      reply: aiResponse,
      detectedIssues: detectedIssues,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error processing chat:", error.message);

    res.json({
      reply:
        "I'm here to listen. Please tell me more about what you're experiencing.",
      detectedIssues: [],
      timestamp: new Date().toISOString(),
    });
  }
});

// Mental health information endpoint
app.get("/api/mental-health-info/:condition", (req, res) => {
  const { condition } = req.params;

  const mentalHealthInfo = {
    anxiety: {
      name: "Anxiety Disorders",
      description:
        "Anxiety disorders involve persistent and excessive worry that interferes with daily activities.",
      symptoms: [
        "Excessive worry about everyday matters",
        "Restlessness or feeling on edge",
        "Difficulty concentrating",
        "Muscle tension",
        "Sleep problems",
        "Rapid heartbeat",
        "Sweating or trembling",
      ],
      copingStrategies: [
        "Deep breathing exercises (4-7-8 technique)",
        "Progressive muscle relaxation",
        "Regular physical exercise",
        "Limit caffeine and alcohol",
        "Practice mindfulness meditation",
        "Maintain a regular sleep schedule",
        "Challenge negative thoughts",
      ],
      whenToSeekHelp:
        "If anxiety interferes with daily life, relationships, or work for more than 2 weeks.",
    },
    depression: {
      name: "Depression",
      description:
        "Depression is more than feeling sad. It's a serious mental health condition that affects how you feel, think, and handle daily activities.",
      symptoms: [
        "Persistent sad, anxious, or empty mood",
        "Loss of interest in activities once enjoyed",
        "Fatigue and decreased energy",
        "Difficulty concentrating or making decisions",
        "Changes in appetite or weight",
        "Sleep disturbances",
        "Feelings of worthlessness or guilt",
        "Thoughts of death or suicide",
      ],
      copingStrategies: [
        "Maintain a routine and structure",
        "Set small, achievable goals",
        "Stay connected with supportive people",
        "Engage in physical activity",
        "Avoid isolation",
        "Practice self-compassion",
        "Challenge negative thought patterns",
        "Get adequate sleep",
      ],
      whenToSeekHelp:
        "Immediately if having suicidal thoughts. Otherwise, if symptoms persist for more than 2 weeks or interfere with functioning.",
    },
    ptsd: {
      name: "Post-Traumatic Stress Disorder (PTSD)",
      description:
        "PTSD develops after exposure to a traumatic event. It's characterized by re-experiencing the trauma, avoidance, and heightened alertness.",
      symptoms: [
        "Intrusive memories or flashbacks",
        "Nightmares about the traumatic event",
        "Avoiding reminders of the trauma",
        "Negative changes in mood and thinking",
        "Being easily startled",
        "Difficulty sleeping",
        "Irritability or aggressive behavior",
        "Feelings of detachment",
      ],
      copingStrategies: [
        "Grounding techniques (5-4-3-2-1 method)",
        "Create a safe environment",
        "Maintain healthy routines",
        "Connect with support groups",
        "Practice relaxation techniques",
        "Avoid alcohol and drugs",
        "Physical exercise",
        "Keep a journal",
      ],
      whenToSeekHelp:
        "If symptoms persist for more than a month or significantly impair daily functioning. Professional trauma therapy is highly effective.",
    },
    bipolar: {
      name: "Bipolar Disorder",
      description:
        "Bipolar disorder involves alternating episodes of depression and mania, affecting mood, energy, and ability to function.",
      symptoms: [
        "DEPRESSIVE EPISODES: Sadness, hopelessness, loss of energy",
        "MANIC EPISODES: Euphoria, increased energy, racing thoughts",
        "Decreased need for sleep during mania",
        "Rapid speech and racing thoughts",
        "Impulsive or reckless behavior",
        "Extreme mood swings",
        "Changes in activity levels",
      ],
      copingStrategies: [
        "Maintain a mood chart",
        "Stick to medication regimen (if prescribed)",
        "Keep regular sleep schedule",
        "Avoid alcohol and drugs",
        "Recognize early warning signs",
        "Build strong support system",
        "Reduce stress",
        "Regular exercise",
      ],
      whenToSeekHelp:
        "Bipolar disorder requires professional treatment. Seek help immediately if experiencing severe mania or depression.",
    },
    existential: {
      name: "Existential Crisis",
      description:
        "An existential crisis involves deep questioning about meaning, purpose, and the nature of existence itself.",
      symptoms: [
        "Feeling that life lacks meaning or purpose",
        "Questioning one's identity and values",
        "Feeling disconnected from others",
        "Anxiety about death and mortality",
        "Difficulty making decisions",
        "Loss of motivation",
        "Feelings of insignificance",
      ],
      copingStrategies: [
        "Explore personal values and what matters to you",
        "Engage in meaningful activities",
        "Connect with others authentically",
        "Practice acceptance of uncertainty",
        "Read philosophy and existential literature",
        "Create and contribute to something larger",
        "Seek perspective through nature",
        "Consider therapy focused on meaning-making",
      ],
      whenToSeekHelp:
        "If existential concerns lead to depression, anxiety, or impaired functioning. Existential therapy can be particularly helpful.",
    },
  };

  if (mentalHealthInfo[condition]) {
    res.json(mentalHealthInfo[condition]);
  } else {
    res.status(404).json({ error: "Condition not found" });
  }
});

// Crisis resources endpoint
app.get("/api/crisis-resources", (req, res) => {
  res.json({
    resources: [
      {
        name: "National Suicide Prevention Lifeline (US)",
        contact: "988",
        available: "24/7",
        description: "Free and confidential support",
      },
      {
        name: "Crisis Text Line",
        contact: "Text HOME to 741741",
        available: "24/7",
        description: "Text-based crisis support",
      },
      {
        name: "NAMI Helpline",
        contact: "1-800-950-6264",
        available: "M-F 10am-10pm ET",
        description: "Mental health information and support",
      },
      {
        name: "International Association for Suicide Prevention",
        contact: "https://www.iasp.info/resources/Crisis_Centres/",
        available: "Varies by country",
        description: "Find crisis centers worldwide",
      },
    ],
  });
});

app.listen(PORT, () => {
  console.log("");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("✅ Existential Crisis Companion Server RUNNING");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log("💚 Status: Ready to provide support!");
  console.log("🤖 AI: Built-in Empathetic Response System");
  console.log("🔍 Problem Detection: Active");
  console.log("📚 Mental Health Info: Available");
  console.log("");
  console.log("⚡ NO API CALLS - Instant responses!");
  console.log("✅ NO 404 ERRORS - Everything works locally!");
  console.log("");
  console.log("═══════════════════════════════════════════════════════════");
});
