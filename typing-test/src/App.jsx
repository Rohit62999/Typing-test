import { useRef, useState, useEffect } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState("Here is ur challange");
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [showHistory, setShowHistory] = useState(false);

  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem('typingHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('typingHistory', JSON.stringify(history));
  }, [history]);

  const fetchRandomText = async () => {
    try {
      const response = await fetch("https://dummyjson.com/quotes/random");
      const data = await response.json();
      setText(data.quote); 
    } catch (error) {
      console.error("Error fetching text:", error);
      setText("Failed to load text. Please check your internet connection.");
    }
  };

  useEffect(() => {
    fetchRandomText();
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 100);
    } else if (timeLeft === 0) {
      clearInterval(interval);
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (userInput.length === 0) return;

    const minutesPassed = (60 - timeLeft) / 60 || 1/60; 
    const wordsTyped = userInput.length / 5;
    const calculatedWpm = Math.round(wordsTyped / minutesPassed);
    setWpm(calculatedWpm);

    let correctChars = 0;
    const inputChars = userInput.split("");
    inputChars.forEach((char, index) => {
      if (char === text[index]) correctChars++;
    });
    
    const calculatedAccuracy = Math.round((correctChars / userInput.length) * 100);
    setAccuracy(calculatedAccuracy);
  }, [userInput, timeLeft, text]);
  
  const handleInputChange = (e) => {
    const val = e.target.value;
    if (timeLeft === 0) return;

    if (!isActive && val.length > 0) {
      setIsActive(true); 
    }
    if (val.length <= text.length) {
      setUserInput(val);
    }
    if (val.length === text.length && text.length > 0) {
      setUserInput("");
      fetchRandomText(); 
    }
  };

  const resetTest = () => {
    if (wpm > 0 || accuracy < 100) {
      const now = new Date();
      const day = now.getDate();
      const monthName = now.toLocaleString([], { month: 'short' });
      const customDateStr = `${day} ${monthName}`;

      const customTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

      const newRecord = {
        id: Date.now().toString(), 
        dateDisplay: customDateStr, 
        timeDisplay: customTimeStr, 
        wpm: wpm,
        accuracy: accuracy
      };
      
      setHistory((prevHistory) => [newRecord, ...prevHistory]);
    }
    setUserInput("");
    setTimeLeft(60);
    setIsActive(false);
    setWpm(0);
    setAccuracy(100);
    setText("Be quiet Man ur next challinge is lading"); 
    fetchRandomText(); 
    if (inputRef.current) inputRef.current.focus();
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('typingHistory');
    setShowHistory(false);
  };

  return (
    <>
    <div className="typing-test-container">
      <h1>⚡ Ur battle Ground😎😎</h1>
      
      <div className="stats-container">
        <div className="stat-box">Time: <span>{timeLeft}s</span></div>
        <div className="stat-box">WPM: <span>{wpm}</span></div>
        <div className="stat-box">Accuracy: <span>{accuracy}%</span></div>
      </div>

      <div className="text-display" onClick={() => inputRef.current.focus()}>
        {text.split("").map((char, index) => {
          let className = "";
          if (index < userInput.length) {
            className = char === userInput[index] ? "correct" : "incorrect";
          }
          return (
            <span key={index} className={className}>
              {char}
            </span>
          );
        })}
      </div>

      <textarea
        ref={inputRef}
        value={userInput}
        onChange={handleInputChange}
        placeholder="Start the battle Guy's"
        disabled={timeLeft === 0}
        className="typing-input"
      />

      <br />
      <button className="reset-btn" onClick={resetTest}>
        Restart
      </button>

      <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
        <button className="reset-btn" onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? "Hide History" : "Show History"}
        </button>

        {showHistory && (
          <div className="history-container" style={{ width: '100%', marginTop: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 className="history-title" style={{ margin: 0 }}>📜 Past Battle Stats</h3>
            
              {history.length > 0 && (
                <button className="reset-btn" onClick={clearHistory} style={{ marginTop: 0, padding: '5px 12px', fontSize: '0.8rem' }}>
                  Clear History
                </button>
              )}
            </div>
            
            <div className="history-list">
              {history.length > 0 ? (
                history.map((run) => (
                  <div key={run.id} className="history-row">
                    <span className="history-time" style={{ fontSize: '0.6rem' }}>Time :{run.timeDisplay||'N/A'}</span>
                    <span className="history-stat">Speed: <strong className="neon-text">{run.wpm} WPM</strong></span>
                    <span className="history-stat">Accuracy: <strong className="neon-text">{run.accuracy}%</strong></span>
                  </div>
                ))
              ) : (
                <div className="history-row" style={{ justifyContent: 'center', color: '#888' }}>
                  <span>No battle till now😔😔!</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}

export default App;