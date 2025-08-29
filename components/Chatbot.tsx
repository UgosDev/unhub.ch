import React from 'react';
// This file primarily exists to export the ChatMessage type.
// The full component would be much more complex.

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    // Potentially other fields like timestamp, sources, etc.
}

// A placeholder component if it were ever to be rendered directly.
const Chatbot: React.FC = () => {
  return (
    <div>
      {/* Chatbot UI would go here */}
    </div>
  );
};

export default Chatbot;
