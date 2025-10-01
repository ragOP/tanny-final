import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Chatbot from './Chatbot';
import ChatbotTwo from './Chatbottwo';
import ChatbotThree from './ChatbotThree';
import ChatbotFour from './ChatbotFour';
import Chatbotdq from './Chatbotdq';
import Chatbotdq2 from './Chatbotdq2';
import Chatbotdq3 from './Chatbotdq3';
import Chatbotdq4 from './Chatbotdq4';
import Home from './Home';
import Chatbot2 from './Chatbot2';

const App = () => {
  // sds
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Home />} />
        {/* <Route path="/engsf1" element={<Chatbotdq />} />
        <Route path="/engsfdq" element={<Chatbotdq2 />} />
        <Route path="/engsf2200" element={<ChatbotTwo />} /> */}
        <Route path="/food-ths" element={<Chatbotdq2 />} />
        {/* <Route path="/ss-increase" element={<Chatbotdq3 />} />
        <Route path="/rag" element={<Chatbotdq4 />} /> */}
        {/* <Route path="/engsf2200dup" element={<ChatbotFour />} />
        <Route path="/engsafe1" element={<Chatbot2 />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
