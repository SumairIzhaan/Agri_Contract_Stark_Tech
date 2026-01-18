import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './App.css';

function App() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('Nagpur');
  const [imagePreview, setImagePreview] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('image', acceptedFiles[0]);
    formData.append('location', location);
    
    // Preview
    const preview = URL.createObjectURL(acceptedFiles[0]);
    setImagePreview(preview);

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      
      // Fix: Handle both direct array and {predictions: [...]}
      const preds = result.predictions || result || [];
      setPredictions(preds);
      console.log('API Response:', preds); // DEBUG
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing image');
      setPredictions([]);
    }
    setLoading(false);
  }, [location]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="App">
      <h1>🥬 Fruit/Vegetable Quality Grader</h1>
      
      <div className="upload-section">
        <select value={location} onChange={(e) => setLocation(e.target.value)}>
          <option>Nagpur</option>
          <option>Mumbai</option>
          <option>Pune</option>
        </select>
        
        <div {...getRootProps()} className="dropzone">
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop image here...</p>
          ) : (
            <p>Drag fruit/vegetable photo here or click to select</p>
          )}
        </div>
      </div>

      {imagePreview && (
        <div className="image-preview">
          <img src={imagePreview} alt="Preview" style={{maxWidth: '300px'}} />
        </div>
      )}

      {loading && <div className="loading">🔄 AI Analyzing...</div>}
      
      {/* FIXED: Safe rendering */}
     <div className="results">
  {predictions?.length > 0 && predictions.map((pred, i) => (
    <div key={i} className="result-card">
      <h3>{pred.fruit}</h3>
      <div>Quality: {pred.quality_grade}/10 ⭐</div>
      <div><strong>Your Price: {pred.recommended_price}</strong></div>
    </div>
  ))}
</div>



      {/* DEBUG INFO */}
      
    </div>
  );
}

export default App;
