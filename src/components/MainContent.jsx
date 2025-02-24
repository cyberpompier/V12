import React from 'react';

function MainContent() {
  const content = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`);

  return (
    <main className="main-content">
      {content.map((item, index) => (
        <p key={index}>{item}</p>
      ))}
    </main>
  );
}

export default MainContent;
