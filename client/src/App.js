// client/src/App.js - MODERN SLEEK DESIGN
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import {
  database,
  ref,
  set,
  get,
  remove,
  query,
  orderByChild,
  limitToLast,
} from "./firebase";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [conditionInfo, setConditionInfo] = useState(null);
  const [detectedIssues, setDetectedIssues] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);

  // Mood Tracking State
  const [moods, setMoods] = useState([]);
  const [currentMood, setCurrentMood] = useState(5);
  const [moodNotes, setMoodNotes] = useState("");

  // Journal State
  const [journals, setJournals] = useState([]);
  const [journalTitle, setJournalTitle] = useState("");
  const [journalContent, setJournalContent] = useState("");
  const [showJournalList, setShowJournalList] = useState(false);

  // Sound state
  const [forestPlaying, setForestPlaying] = useState(false);
  const [wavePlaying, setWavePlaying] = useState(false);
  const [rainPlaying, setRainPlaying] = useState(false);
  const forestAudioRef = useRef(null);
  const waveAudioRef = useRef(null);
  const rainAudioRef = useRef(null);

  // Breathing exercise state
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState("inhale");
  const [breathingProgress, setBreathingProgress] = useState(0);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Welcome message when chat opens
  useEffect(() => {
    if (chatOpen && messages.length === 0) {
      setMessages([
        {
          sender: "bot",
          text: "Hello, I'm here to listen and support you. This is a safe space to share your thoughts and feelings. What's on your mind today?",
          timestamp: new Date(),
        },
      ]);
    }
  }, [chatOpen, messages.length]);

  // Load moods from Firebase
  useEffect(() => {
    loadMoods();
  }, []);

  // Load journals from Firebase
  useEffect(() => {
    loadJournals();
  }, []);

  // Breathing exercise effect
  useEffect(() => {
    let interval;
    if (breathingActive) {
      const cycleDuration = 19000; // 4+7+8 = 19 seconds
      const startTime = Date.now();

      interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) % cycleDuration;
        const progress = (elapsed / cycleDuration) * 100;
        setBreathingProgress(progress);

        if (progress < 21) setBreathingPhase("inhale");
        else if (progress < 58) setBreathingPhase("hold");
        else setBreathingPhase("exhale");
      }, 100);
    } else {
      setBreathingProgress(0);
      setBreathingPhase("inhale");
    }

    return () => clearInterval(interval);
  }, [breathingActive]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      sender: "user",
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/chat", {
        message: input,
        conversationHistory: messages,
      });

      const botMessage = {
        sender: "bot",
        text: response.data.reply,
        timestamp: new Date(),
        detectedIssues: response.data.detectedIssues,
      };

      setMessages((prev) => [...prev, botMessage]);

      if (
        response.data.detectedIssues &&
        response.data.detectedIssues.length > 0
      ) {
        setDetectedIssues(response.data.detectedIssues);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        sender: "bot",
        text: "I'm having trouble connecting right now, but I'm here for you. Could you try again?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  const fetchConditionInfo = async (condition) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/mental-health-info/${condition}`
      );
      setConditionInfo(response.data);
      setSelectedCondition(condition);
    } catch (error) {
      console.error("Error fetching condition info:", error);
    }
  };

  // Improved audio functions with error handling
  const toggleForestSound = async () => {
    try {
      if (forestPlaying) {
        forestAudioRef.current?.pause();
        setForestPlaying(false);
      } else {
        // Stop other sounds
        waveAudioRef.current?.pause();
        rainAudioRef.current?.pause();
        setWavePlaying(false);
        setRainPlaying(false);

        // Set volume and play
        if (forestAudioRef.current) {
          forestAudioRef.current.volume = 0.5;
          await forestAudioRef.current.play();
          setForestPlaying(true);
        }
      }
    } catch (error) {
      console.error("Error with forest sound:", error);
      setForestPlaying(false);
    }
  };

  const toggleWaveSound = async () => {
    try {
      if (wavePlaying) {
        waveAudioRef.current?.pause();
        setWavePlaying(false);
      } else {
        // Stop other sounds
        forestAudioRef.current?.pause();
        rainAudioRef.current?.pause();
        setForestPlaying(false);
        setRainPlaying(false);

        if (waveAudioRef.current) {
          waveAudioRef.current.volume = 0.5;
          await waveAudioRef.current.play();
          setWavePlaying(true);
        }
      }
    } catch (error) {
      console.error("Error with wave sound:", error);
      setWavePlaying(false);
    }
  };

  const toggleRainSound = async () => {
    try {
      if (rainPlaying) {
        rainAudioRef.current?.pause();
        setRainPlaying(false);
      } else {
        // Stop other sounds
        forestAudioRef.current?.pause();
        waveAudioRef.current?.pause();
        setForestPlaying(false);
        setWavePlaying(false);

        if (rainAudioRef.current) {
          rainAudioRef.current.volume = 0.5;
          await rainAudioRef.current.play();
          setRainPlaying(true);
        }
      }
    } catch (error) {
      console.error("Error with rain sound:", error);
      setRainPlaying(false);
    }
  };

  const toggleBreathing = () => {
    setBreathingActive(!breathingActive);
  };

  // ========== MOOD TRACKING FUNCTIONS ==========

  const saveMood = async () => {
    if (!moodNotes.trim()) {
      alert("Please add notes for your mood");
      return;
    }

    const moodEntry = {
      mood: currentMood,
      notes: moodNotes,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      timestamp: new Date().getTime(),
    };

    try {
      const moodKey = Date.now().toString();
      await set(ref(database, `moods/${moodKey}`), moodEntry);

      console.log("✅ Mood saved to Firebase!");
      setMoodNotes("");
      setCurrentMood(5);
      loadMoods();
      alert("✅ Mood tracked successfully!");
    } catch (error) {
      console.error("Error saving mood:", error);
      alert("❌ Error saving mood. Please try again.");
    }
  };

  const loadMoods = async () => {
    try {
      const moodsRef = ref(database, "moods");
      const snapshot = await get(moodsRef);

      if (snapshot.exists()) {
        const moodsData = snapshot.val();
        const moodsList = Object.entries(moodsData).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        setMoods(moodsList.sort((a, b) => b.timestamp - a.timestamp));
      } else {
        setMoods([]);
      }
    } catch (error) {
      console.error("Error loading moods:", error);
    }
  };

  const deleteMood = async (moodId) => {
    if (window.confirm("Delete this mood entry?")) {
      try {
        await remove(ref(database, `moods/${moodId}`));
        loadMoods();
        alert("✅ Mood deleted!");
      } catch (error) {
        console.error("Error deleting mood:", error);
      }
    }
  };

  // ========== JOURNAL FUNCTIONS ==========

  const saveJournal = async () => {
    if (!journalTitle.trim() || !journalContent.trim()) {
      alert("Please add title and content for your journal");
      return;
    }

    const journalEntry = {
      title: journalTitle,
      content: journalContent,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      timestamp: new Date().getTime(),
    };

    try {
      const journalKey = Date.now().toString();
      await set(ref(database, `journals/${journalKey}`), journalEntry);

      console.log("✅ Journal saved to Firebase!");
      setJournalTitle("");
      setJournalContent("");
      loadJournals();
      alert("✅ Journal entry saved successfully!");
    } catch (error) {
      console.error("Error saving journal:", error);
      alert("❌ Error saving journal. Please try again.");
    }
  };

  const loadJournals = async () => {
    try {
      const journalsRef = ref(database, "journals");
      const snapshot = await get(journalsRef);

      if (snapshot.exists()) {
        const journalsData = snapshot.val();
        const journalsList = Object.entries(journalsData).map(
          ([key, value]) => ({
            id: key,
            ...value,
          })
        );
        setJournals(journalsList.sort((a, b) => b.timestamp - a.timestamp));
      } else {
        setJournals([]);
      }
    } catch (error) {
      console.error("Error loading journals:", error);
    }
  };

  const deleteJournal = async (journalId) => {
    if (window.confirm("Delete this journal entry?")) {
      try {
        await remove(ref(database, `journals/${journalId}`));
        loadJournals();
        alert("✅ Journal deleted!");
      } catch (error) {
        console.error("Error deleting journal:", error);
      }
    }
  };

  const getMoodEmoji = (mood) => {
    if (mood <= 2) return "😢";
    if (mood <= 4) return "😐";
    if (mood <= 7) return "🙂";
    return "😊";
  };

  const getMoodColor = (mood) => {
    if (mood <= 2) return "#ef4444";
    if (mood <= 4) return "#f59e0b";
    if (mood <= 7) return "#10b981";
    return "#00d9ff";
  };

  const openChat = () => {
    setChatOpen(true);
    setActiveTab("chat");
  };

  const closeChat = () => {
    setChatOpen(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-main">
            <h1>🌱 Existential Crisis Companion</h1>
            <p className="subtitle">
              Your safe space for reflection and support
            </p>
          </div>
          <div className="header-stats">
            <div className="stat">
              <span className="stat-number">{moods.length}</span>
              <span className="stat-label">Moods</span>
            </div>
            <div className="stat">
              <span className="stat-number">{journals.length}</span>
              <span className="stat-label">Journals</span>
            </div>
          </div>
        </div>
      </header>

      <nav className="tab-nav">
        <button
          className={activeTab === "home" ? "active" : ""}
          onClick={() => {
            setActiveTab("home");
            setChatOpen(false);
          }}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-text">Home</span>
        </button>
        <button
          className={activeTab === "chat" ? "active" : ""}
          onClick={openChat}
        >
          <span className="nav-icon">💬</span>
          <span className="nav-text">Chat</span>
        </button>
        <button
          className={activeTab === "mood" ? "active" : ""}
          onClick={() => {
            setActiveTab("mood");
            setChatOpen(false);
          }}
        >
          <span className="nav-icon">😊</span>
          <span className="nav-text">Mood</span>
        </button>
        <button
          className={activeTab === "journal" ? "active" : ""}
          onClick={() => {
            setActiveTab("journal");
            setChatOpen(false);
          }}
        >
          <span className="nav-icon">📔</span>
          <span className="nav-text">Journal</span>
        </button>
        <button
          className={activeTab === "info" ? "active" : ""}
          onClick={() => {
            setActiveTab("info");
            setChatOpen(false);
          }}
        >
          <span className="nav-icon">📚</span>
          <span className="nav-text">Resources</span>
        </button>
        <button
          className={activeTab === "sounds" ? "active" : ""}
          onClick={() => {
            setActiveTab("sounds");
            setChatOpen(false);
          }}
        >
          <span className="nav-icon">🎵</span>
          <span className="nav-text">Relax</span>
        </button>
      </nav>

      {/* Hidden audio elements */}
      {/* Enhanced audio elements with multiple fallback sources */}
      <audio ref={forestAudioRef} loop preload="metadata">
        <source
          src="https://cdn.pixabay.com/download/audio/2023/10/04/audio_1c8bdc0d2d.mp3?filename=forest-with-birds-and-insects-2.mp3"
          type="audio/mpeg"
        />
        <source
          src="https://cdn.pixabay.com/download/audio/2022/01/18/audio_fbeac2ca00.mp3?filename=birds-singing-in-and-leaves-rustling-with-the-wind-14557.mp3"
          type="audio/mpeg"
        />
      </audio>
      <audio ref={waveAudioRef} loop preload="metadata">
        <source
          src="https://assets.mixkit.co/sfx/preview/mixkit-ocean-waves-loop-1240.mp3"
          type="audio/mpeg"
        />
        <source
          src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3"
          type="audio/mpeg"
        />
      </audio>
      <audio ref={rainAudioRef} loop preload="metadata">
        <source
          src="https://assets.mixkit.co/sfx/preview/mixkit-rain-loop-1246.mp3"
          type="audio/mpeg"
        />
        <source
          src="https://soundbible.com/grab.php?id=2217&type=mp3"
          type="audio/mpeg"
        />
      </audio>

      <main className="main-content">
        {activeTab === "home" && !chatOpen && (
          <div className="home-container">
            <div className="welcome-card glass">
              <div className="welcome-content">
                <h2>Welcome to Your Safe Space</h2>
                <p>
                  A compassionate companion for your mental wellness journey
                </p>
                <button className="cta-button pulse" onClick={openChat}>
                  Start Conversation
                </button>
              </div>
              <div className="welcome-visual">
                <div className="floating-emoji">🌱</div>
                <div className="floating-emoji">💭</div>
                <div className="floating-emoji">✨</div>
              </div>
            </div>

            <div className="features-grid">
              <div className="feature-card glass" onClick={openChat}>
                <div className="feature-icon">🤖</div>
                <h3>AI Support</h3>
                <p>
                  Empathetic conversations with intelligent problem detection
                </p>
                <div className="feature-arrow">→</div>
              </div>
              <div
                className="feature-card glass"
                onClick={() => setActiveTab("mood")}
              >
                <div className="feature-icon">😊</div>
                <h3>Mood Tracking</h3>
                <p>Track your emotional journey with daily mood logs</p>
                <div className="feature-arrow">→</div>
              </div>
              <div
                className="feature-card glass"
                onClick={() => setActiveTab("journal")}
              >
                <div className="feature-icon">📔</div>
                <h3>Journal Writing</h3>
                <p>Express yourself through private journal entries</p>
                <div className="feature-arrow">→</div>
              </div>
              <div
                className="feature-card glass"
                onClick={() => setActiveTab("sounds")}
              >
                <div className="feature-icon">🎧</div>
                <h3>Relax & Breathe</h3>
                <p>Calming nature sounds and breathing exercises</p>
                <div className="feature-arrow">→</div>
              </div>
            </div>

            <div className="crisis-card glass">
              <div className="crisis-header">
                <span className="crisis-icon">🚨</span>
                <h3>In Crisis?</h3>
              </div>
              <p>
                If you're experiencing a mental health crisis, please reach out
                immediately:
              </p>
              <div className="crisis-contacts">
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <span>US: 988 (24/7)</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">💬</span>
                  <span>Text HOME to 741741</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* FULL SCREEN CHAT MODAL */}
        {chatOpen && (
          <div className="chat-modal glass">
            <div className="chat-modal-header">
              <div className="chat-title">
                <div className="chat-avatar">💬</div>
                <div>
                  <h2>Companion Chat</h2>
                  <p>Always here to listen</p>
                </div>
              </div>
              <button className="close-chat" onClick={closeChat}>
                ✕
              </button>
            </div>

            {detectedIssues.length > 0 && (
              <div className="detected-issues glass">
                <div className="issue-icon">💙</div>
                <div className="issue-content">
                  <p>I noticed you might be experiencing:</p>
                  <strong>{detectedIssues.join(", ")}</strong>
                </div>
                <button
                  className="issue-learn-more"
                  onClick={() => {
                    setActiveTab("info");
                    setChatOpen(false);
                    fetchConditionInfo(detectedIssues[0]);
                  }}
                >
                  Learn More
                </button>
              </div>
            )}

            <div className="messages-container">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                  <div className="message-bubble">
                    <p>{msg.text}</p>
                    <span className="timestamp">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="message bot">
                  <div className="message-bubble">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="input-section">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your message..."
                disabled={loading}
              />
              <button
                className="send-button"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
              >
                <span>➤</span>
              </button>
            </div>
          </div>
        )}
        {/* MOOD TRACKING TAB */}
        {activeTab === "mood" && !chatOpen && (
          <div className="mood-container">
            <div className="section-header">
              <h2>Mood Tracker</h2>
              <p>Track your daily emotional state</p>
            </div>

            <div className="mood-content">
              <div className="mood-input-card glass">
                <h3>How are you feeling today?</h3>

                <div className="mood-selector">
                  <div
                    className="mood-display"
                    style={{ color: getMoodColor(currentMood) }}
                  >
                    <span className="mood-emoji">
                      {getMoodEmoji(currentMood)}
                    </span>
                    <span className="mood-value">{currentMood}/10</span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={currentMood}
                    onChange={(e) => setCurrentMood(Number(e.target.value))}
                    className="mood-slider"
                    style={{
                      background: `linear-gradient(90deg, #ef4444, #f59e0b, #10b981, #00d9ff)`,
                    }}
                  />

                  <div className="mood-labels">
                    <span>😢 Very Bad</span>
                    <span>😐 Neutral</span>
                    <span>😊 Very Good</span>
                  </div>
                </div>

                <textarea
                  value={moodNotes}
                  onChange={(e) => setMoodNotes(e.target.value)}
                  placeholder="Add notes about your mood... What triggered this feeling? What are you thinking about?"
                  className="mood-notes"
                  rows="4"
                />

                <button className="save-button" onClick={saveMood}>
                  💾 Save Mood
                </button>
              </div>

              <div className="mood-history-section">
                <h3>Your Mood History</h3>
                {moods.length === 0 ? (
                  <div className="empty-state glass">
                    <div className="empty-icon">📊</div>
                    <p>No mood entries yet</p>
                    <p className="empty-subtitle">
                      Start tracking your mood today!
                    </p>
                  </div>
                ) : (
                  <div className="mood-history-grid">
                    {moods.map((mood) => (
                      <div
                        key={mood.id}
                        className="mood-card glass"
                        style={{ borderLeftColor: getMoodColor(mood.mood) }}
                      >
                        <div className="mood-card-header">
                          <div className="mood-emoji-small">
                            {getMoodEmoji(mood.mood)}
                          </div>
                          <div
                            className="mood-score"
                            style={{ color: getMoodColor(mood.mood) }}
                          >
                            {mood.mood}/10
                          </div>
                        </div>
                        <p className="mood-card-notes">{mood.notes}</p>
                        <div className="mood-card-footer">
                          <span className="mood-datetime">
                            {mood.date} • {mood.time}
                          </span>
                          <button
                            className="delete-button"
                            onClick={() => deleteMood(mood.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* JOURNAL TAB */}
        {activeTab === "journal" && !chatOpen && (
          <div className="journal-container">
            <div className="section-header">
              <h2>Journal</h2>
              <p>Express yourself through writing</p>
            </div>

            <div className="journal-content">
              {!showJournalList ? (
                <div className="journal-editor glass">
                  <input
                    type="text"
                    value={journalTitle}
                    onChange={(e) => setJournalTitle(e.target.value)}
                    placeholder="Journal Entry Title..."
                    className="journal-title"
                  />
                  <textarea
                    value={journalContent}
                    onChange={(e) => setJournalContent(e.target.value)}
                    placeholder="Write your thoughts, feelings, and reflections here... There's no judgment, only support."
                    className="journal-content-input"
                    rows="12"
                  />
                  <div className="journal-actions">
                    <button className="save-button" onClick={saveJournal}>
                      💾 Save Entry
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => setShowJournalList(true)}
                    >
                      📚 View All Entries ({journals.length})
                    </button>
                  </div>
                </div>
              ) : (
                <div className="journal-list">
                  <div className="journal-list-header">
                    <h3>Your Journal Entries</h3>
                    <button
                      className="secondary-button"
                      onClick={() => setShowJournalList(false)}
                    >
                      ✍️ Write New Entry
                    </button>
                  </div>
                  {journals.length === 0 ? (
                    <div className="empty-state glass">
                      <div className="empty-icon">📔</div>
                      <p>No journal entries yet</p>
                      <p className="empty-subtitle">Start writing today!</p>
                    </div>
                  ) : (
                    <div className="journal-grid">
                      {journals.map((journal) => (
                        <div key={journal.id} className="journal-card glass">
                          <div className="journal-card-header">
                            <h4>{journal.title}</h4>
                            <span className="journal-datetime">
                              {journal.date}
                            </span>
                          </div>
                          <p className="journal-card-content">
                            {journal.content.substring(0, 120)}...
                          </p>
                          <div className="journal-card-footer">
                            <span className="journal-time">{journal.time}</span>
                            <button
                              className="delete-button"
                              onClick={() => deleteJournal(journal.id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {/* MENTAL HEALTH RESOURCES TAB */}
        {activeTab === "info" && !chatOpen && (
          <div className="info-container">
            <div className="section-header">
              <h2>Mental Health Resources</h2>
              <p>
                Understanding these conditions is the first step toward healing
              </p>
            </div>

            <div className="condition-grid">
              <button
                className={`condition-card glass ${
                  selectedCondition === "anxiety" ? "active" : ""
                }`}
                onClick={() => fetchConditionInfo("anxiety")}
              >
                <div className="condition-icon">😰</div>
                <h3>Anxiety</h3>
                <p>Excessive worry and fear</p>
              </button>
              <button
                className={`condition-card glass ${
                  selectedCondition === "depression" ? "active" : ""
                }`}
                onClick={() => fetchConditionInfo("depression")}
              >
                <div className="condition-icon">😔</div>
                <h3>Depression</h3>
                <p>Persistent sadness and loss of interest</p>
              </button>
              <button
                className={`condition-card glass ${
                  selectedCondition === "ptsd" ? "active" : ""
                }`}
                onClick={() => fetchConditionInfo("ptsd")}
              >
                <div className="condition-icon">💭</div>
                <h3>PTSD</h3>
                <p>Trauma-related stress</p>
              </button>
              <button
                className={`condition-card glass ${
                  selectedCondition === "bipolar" ? "active" : ""
                }`}
                onClick={() => fetchConditionInfo("bipolar")}
              >
                <div className="condition-icon">🎭</div>
                <h3>Bipolar</h3>
                <p>Mood swings between highs and lows</p>
              </button>
              <button
                className={`condition-card glass ${
                  selectedCondition === "existential" ? "active" : ""
                }`}
                onClick={() => fetchConditionInfo("existential")}
              >
                <div className="condition-icon">🌌</div>
                <h3>Existential</h3>
                <p>Questions about meaning and purpose</p>
              </button>
            </div>

            {conditionInfo && (
              <div className="condition-details glass">
                <div className="condition-header">
                  <h2>{conditionInfo.name}</h2>
                  <div className="condition-badge">{conditionInfo.name}</div>
                </div>
                <p className="condition-description">
                  {conditionInfo.description}
                </p>

                <div className="info-sections">
                  <div className="info-section">
                    <h3>📋 Common Symptoms</h3>
                    <div className="symptoms-list">
                      {conditionInfo.symptoms.map((symptom, index) => (
                        <span key={index} className="symptom-tag">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="info-section">
                    <h3>🛡️ Coping Strategies</h3>
                    <ul className="strategies-list">
                      {conditionInfo.copingStrategies.map((strategy, index) => (
                        <li key={index}>{strategy}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="info-section help-section">
                    <h3>🆘 When to Seek Help</h3>
                    <p>{conditionInfo.whenToSeekHelp}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SOUNDS & BREATHING TAB */}
        {activeTab === "sounds" && !chatOpen && (
          <div className="sounds-container">
            <div className="section-header">
              <h2>Relaxation Space</h2>
              <p>Find your calm with sounds and breathing exercises</p>
            </div>

            <div className="relaxation-content">
              <div className="sounds-section">
                <h3>Calming Sounds</h3>
                <div className="sound-grid">
                  <div
                    className={`sound-card glass ${
                      forestPlaying ? "playing" : ""
                    }`}
                  >
                    <div className="sound-visual">🌲</div>
                    <div className="sound-content">
                      <h4>Forest Sounds</h4>
                      <p>Gentle rustling leaves and birdsong</p>
                      <div className="volume-control">
                        <span>🔈</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          onChange={(e) => {
                            if (forestAudioRef.current) {
                              forestAudioRef.current.volume = e.target.value;
                            }
                          }}
                          className="volume-slider"
                        />
                        <span>🔊</span>
                      </div>
                    </div>
                    <button
                      className="sound-button"
                      onClick={toggleForestSound}
                    >
                      {forestPlaying ? "⏸ Pause" : "▶ Play"}
                    </button>
                  </div>

                  <div
                    className={`sound-card glass ${
                      wavePlaying ? "playing" : ""
                    }`}
                  >
                    <div className="sound-visual">🌊</div>
                    <div className="sound-content">
                      <h4>Ocean Waves</h4>
                      <p>Rhythmic waves washing ashore</p>
                      <div className="volume-control">
                        <span>🔈</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          onChange={(e) => {
                            if (waveAudioRef.current) {
                              waveAudioRef.current.volume = e.target.value;
                            }
                          }}
                          className="volume-slider"
                        />
                        <span>🔊</span>
                      </div>
                    </div>
                    <button className="sound-button" onClick={toggleWaveSound}>
                      {wavePlaying ? "⏸ Pause" : "▶ Play"}
                    </button>
                  </div>

                  <div
                    className={`sound-card glass ${
                      rainPlaying ? "playing" : ""
                    }`}
                  >
                    <div className="sound-visual">🌧️</div>
                    <div className="sound-content">
                      <h4>Rainfall</h4>
                      <p>Soothing rain and gentle thunder</p>
                      <div className="volume-control">
                        <span>🔈</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          onChange={(e) => {
                            if (rainAudioRef.current) {
                              rainAudioRef.current.volume = e.target.value;
                            }
                          }}
                          className="volume-slider"
                        />
                        <span>🔊</span>
                      </div>
                    </div>
                    <button className="sound-button" onClick={toggleRainSound}>
                      {rainPlaying ? "⏸ Pause" : "▶ Play"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="breathing-section">
                <div className="breathing-card glass">
                  <div className="breathing-header">
                    <h3>🫁 Breathing Exercise</h3>
                    <button
                      className={`breathing-toggle ${
                        breathingActive ? "active" : ""
                      }`}
                      onClick={toggleBreathing}
                    >
                      {breathingActive ? "Stop" : "Start"}
                    </button>
                  </div>

                  <div className="breathing-visual">
                    <div className="breathing-circle">
                      <div
                        className="breathing-animation"
                        data-phase={breathingPhase}
                        style={{
                          transform: `scale(${
                            breathingPhase === "inhale"
                              ? 1.2
                              : breathingPhase === "hold"
                              ? 1.1
                              : 1
                          })`,
                          opacity: breathingActive ? 1 : 0.7,
                        }}
                      >
                        <span className="breathing-phase">
                          {breathingPhase}
                        </span>
                        <div className="breathing-timer">
                          {breathingPhase === "inhale" && "4s"}
                          {breathingPhase === "hold" && "7s"}
                          {breathingPhase === "exhale" && "8s"}
                        </div>
                        <div className="breathing-progress">
                          <div
                            className="progress-fill"
                            style={{ width: `${breathingProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="breathing-steps">
                    <div
                      className={`step ${
                        breathingPhase === "inhale" ? "active" : ""
                      }`}
                    >
                      <span className="step-number">1</span>
                      <div className="step-content">
                        <p>Breathe in through nose</p>
                        <strong>4 seconds</strong>
                      </div>
                    </div>
                    <div
                      className={`step ${
                        breathingPhase === "hold" ? "active" : ""
                      }`}
                    >
                      <span className="step-number">2</span>
                      <div className="step-content">
                        <p>Hold your breath</p>
                        <strong>7 seconds</strong>
                      </div>
                    </div>
                    <div
                      className={`step ${
                        breathingPhase === "exhale" ? "active" : ""
                      }`}
                    >
                      <span className="step-number">3</span>
                      <div className="step-content">
                        <p>Exhale through mouth</p>
                        <strong>8 seconds</strong>
                      </div>
                    </div>
                  </div>

                  <p className="breathing-tip">
                    💡 Try this with calming sounds for maximum relaxation
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer glass">
        <p>💙 Remember: You're not alone. This too shall pass.</p>
        <p className="disclaimer">
          This app provides support but is not a substitute for professional
          mental health care.
        </p>
      </footer>
    </div>
  );
}

export default App;
