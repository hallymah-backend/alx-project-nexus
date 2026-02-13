import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [polls, setPolls] = useState([]);
  const [selectedOption, setSelectedOption] = useState({});
  const [results, setResults] = useState({});

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/polls/')
      .then(res => setPolls(res.data))
      .catch(err => console.log(err));
  }, []);

  const vote = (pollId, optionId) => {
    axios.post(`http://127.0.0.1:8000/api/polls/${pollId}/vote/`, { option_id: optionId })
      .then(() => fetchResults(pollId))
      .catch(err => alert(err.response.data.error));
  };

  const fetchResults = (pollId) => {
    axios.get(`http://127.0.0.1:8000/api/polls/${pollId}/results/`)
      .then(res => setResults(prev => ({ ...prev, [pollId]: res.data })))
      .catch(err => console.log(err));
  };

  return (
    <div className="p-4 min-h-screen bg-red-50">
      
      <h1 className="text-2xl font-bold mb-4">Online Polls</h1>
      {polls.map(poll => (
        <div key={poll.id} className="mb-6 border p-4 rounded">
          <h2 className="text-xl">{poll.question}</h2>
          {poll.options.map(opt => (
            <div key={opt.id} className="flex items-center my-1">
              <button onClick={() => vote(poll.id, opt.id)} className="mr-2 bg-blue-500 text-white px-2 py-1 rounded">
                Vote
              </button>
              <span>{opt.text}</span>
            </div>
          ))}
          <button onClick={() => fetchResults(poll.id)} className="mt-2 bg-green-500 text-white px-2 py-1 rounded">Show Results</button>
          {results[poll.id] && (
            <ul className="mt-2">
              {results[poll.id].map(r => (
                <li key={r.id}>{r.text}: {r.vote_count} votes</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export default App;
