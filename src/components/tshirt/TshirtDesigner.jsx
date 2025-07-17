'use client';

import React, { useRef, useState } from 'react';

const COLOR_PRESETS = [
  '#3498db', '#ffffff', '#000000', '#e74c3c',
  '#2ecc71', '#f39c12', '#9b59b6', '#34495e'
];
const GRADIENT_DIRECTIONS = [
  { label: 'Horizontal', value: 'to right' },
  { label: 'Vertical', value: 'to bottom' },
  { label: 'Diagonal', value: '135deg' },
];
const ROTATION_ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
const MAX_GRADIENT_COLORS = 4;

export default function TshirtDesigner() {
  const [shirtColor, setShirtColor] = useState('#3498db');
  const [gradientEnabled, setGradientEnabled] = useState(false);
  const [gradientColors, setGradientColors] = useState([
    '#3498db', '#2ecc71', '#f39c12', '#9b59b6'
  ]);
  const [gradientColorEnabled, setGradientColorEnabled] = useState([true, true, false, false]);
  const [gradientDirection, setGradientDirection] = useState('to right');
  const [activePreset, setActivePreset] = useState(0);
  const [customText, setCustomText] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(24);
  const [horizontal, setHorizontal] = useState(50);
  const [vertical, setVertical] = useState(40);
  const [rotationIdx, setRotationIdx] = useState(0);
  const textInputRef = useRef(null);
  const [isFront, setIsFront] = useState(true);
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  const [customColors, setCustomColors] = useState(['#3498db']);
  const [selectedCustomColorIdx, setSelectedCustomColorIdx] = useState(0);

  React.useEffect(() => {
    const idx = COLOR_PRESETS.findIndex(c => c.toLowerCase() === shirtColor.toLowerCase());
    setActivePreset(idx);
  }, [shirtColor]);

  const handlePresetClick = (color, idx) => {
    setShirtColor(color);
    setActivePreset(idx);
    setGradientEnabled(false);
  };

  const handleShirtColorChange = (e) => {
    setShirtColor(e.target.value);
    setGradientEnabled(false);
  };

  const handleAddCustomColor = () => {
    setCustomColors(prev => [...prev, '#ffffff']);
    setSelectedCustomColorIdx(customColors.length);
    setShirtColor('#ffffff');
    setGradientEnabled(false);
  };

  const handleRemoveCustomColor = (idx) => {
    setCustomColors(prev => prev.filter((_, i) => i !== idx));
    if (selectedCustomColorIdx === idx) {
      setSelectedCustomColorIdx(0);
      setShirtColor(customColors[0] || '#3498db');
    } else if (selectedCustomColorIdx > idx) {
      setSelectedCustomColorIdx(selectedCustomColorIdx - 1);
    }
  };

  const handleCustomColorChange = (idx, color) => {
    setCustomColors(prev => {
      const next = [...prev];
      next[idx] = color;
      return next;
    });
    setSelectedCustomColorIdx(idx);
    setShirtColor(color);
    setGradientEnabled(false);
  };

  const handleGradientColorChange = (idx, color) => {
    setGradientColors(prev => {
      const next = [...prev];
      next[idx] = color;
      return next;
    });
    setGradientEnabled(true);
  };

  const handleGradientColorEnable = (idx, enabled) => {
    setGradientColorEnabled(prev => {
      const next = [...prev];
      next[idx] = enabled;
      return next;
    });
  };

  const handleGradientDirectionChange = (e) => {
    setGradientDirection(e.target.value);
    setGradientEnabled(true);
  };

  const handleTextChange = (e) => {
    setCustomText(e.target.value);
  };

  const handleTextColorChange = (e) => {
    setTextColor(e.target.value);
  };

  const handleTextSizeChange = (e) => {
    setTextSize(Number(e.target.value));
  };

  const handleHorizontalChange = (e) => {
    setHorizontal(Number(e.target.value));
  };

  const handleVerticalChange = (e) => {
    setVertical(Number(e.target.value));
  };

  const clearText = () => {
    setCustomText('');
    if (textInputRef.current) textInputRef.current.value = '';
  };

  // 360-degree rotation logic
  const rotateLeft = () => setRotationIdx((prev) => (prev - 1 + ROTATION_ANGLES.length) % ROTATION_ANGLES.length);
  const rotateRight = () => setRotationIdx((prev) => (prev + 1) % ROTATION_ANGLES.length);

  // Mouse drag rotation logic
  const dragState = useRef({ dragging: false, startX: 0, startIdx: 0 });
  const handleMouseDown = (e) => {
    dragState.current.dragging = true;
    dragState.current.startX = e.clientX;
    dragState.current.startIdx = rotationIdx;
  };
  const handleMouseUp = () => {
    dragState.current.dragging = false;
  };
  const handleMouseMove = (e) => {
    if (!dragState.current.dragging) return;
    const dx = e.clientX - dragState.current.startX;
    let steps = Math.round(dx / 20);
    let newIdx = (dragState.current.startIdx + steps) % ROTATION_ANGLES.length;
    if (newIdx < 0) newIdx += ROTATION_ANGLES.length;
    setRotationIdx(newIdx);
    // Switch front/back at 180°
    setIsFront(newIdx < 6 || newIdx > 17); // 0-150 front, 180-330 back
  };

  // Helper for SVG gradient
  const getSvgGradient = () => {
    if (!gradientEnabled) return shirtColor;
    if (gradientDirection === 'to right') {
      return `url(#svgGradientHorizontal)`;
    } else if (gradientDirection === 'to bottom') {
      return `url(#svgGradientVertical)`;
    } else {
      return `url(#svgGradientDiagonal)`;
    }
  };

  // Helper for CSS gradient preview
  const getCssGradient = () => {
    if (!gradientEnabled) return shirtColor;
    let dir = gradientDirection;
    if (dir === '135deg') dir = '135deg';
    return `linear-gradient(${dir}, ${shirtColor}, ${gradientColor2})`;
  };

  // Export logic
  const exportImage = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 1000;
    // Simulate 360 by rotating the t-shirt shape
    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate((ROTATION_ANGLES[rotationIdx] * Math.PI) / 180);
    ctx.translate(-canvas.width/2, -canvas.height/2);
    // Gradient fill
    let fillStyle = shirtColor;
    if (gradientEnabled) {
      let grad;
      if (gradientDirection === 'to right') {
        grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
      } else if (gradientDirection === 'to bottom') {
        grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      } else {
        grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      }
      const stops = gradientColors.filter((_, i) => gradientColorEnabled[i]);
      stops.forEach((color, i) => {
        grad.addColorStop(i / (stops.length - 1), color);
      });
      fillStyle = grad;
    }
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.moveTo(160, 240);
    ctx.lineTo(160, 900);
    ctx.quadraticCurveTo(160, 960, 240, 960);
    ctx.lineTo(560, 960);
    ctx.quadraticCurveTo(640, 960, 640, 900);
    ctx.lineTo(640, 240);
    ctx.lineTo(700, 300);
    ctx.lineTo(700, 400);
    ctx.lineTo(640, 400);
    ctx.lineTo(640, 240);
    ctx.lineTo(560, 120);
    ctx.lineTo(440, 120);
    ctx.quadraticCurveTo(400, 80, 360, 120);
    ctx.lineTo(240, 120);
    ctx.lineTo(160, 240);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    // Add text
    const textToRender = isFront ? frontText : backText;
    if (textToRender.trim() !== '') {
      ctx.save();
      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.rotate((ROTATION_ANGLES[rotationIdx] * Math.PI) / 180);
      ctx.translate(-canvas.width/2, -canvas.height/2);
      ctx.fillStyle = textColor;
      ctx.font = `bold ${Math.round((textSize/400)*canvas.width)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const x = (horizontal / 100) * canvas.width;
      const y = (vertical / 100) * canvas.height;
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 4;
      ctx.fillText(textToRender, x, y);
      ctx.shadowBlur = 0;
      ctx.restore();
    }
    const link = document.createElement('a');
    link.download = 'tshirt-design-' + Date.now() + '.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container" style={{background: 'white', borderRadius: 20, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', overflow: 'hidden', width: '95%', maxWidth: 1200, height: '90vh', display: 'flex'}}>
      <div className="controls-panel" style={{width: 350, background: '#f8f9fa', padding: 30, overflowY: 'auto', borderRight: '1px solid #e9ecef'}}>
        <div className="title" style={{fontSize: 28, fontWeight: 700, color: '#2c3e50', marginBottom: 30, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10}}>
          <span role="img" aria-label="tshirt">👕</span> T-Shirt Designer
        </div>
        <div className="control-group" style={{marginBottom: 30}}>
          <h3 style={{color: '#34495e', marginBottom: 15, fontSize: 18, fontWeight: 600}}>Shirt Color</h3>
          <div className="input-group" style={{marginBottom: 20}}>
            <label style={{display: 'block', marginBottom: 8, fontWeight: 500, color: '#555'}}>Custom Colors:</label>
            {customColors.map((color, idx) => (
              <div key={idx} style={{display: 'flex', alignItems: 'center', marginBottom: 8}}>
                <input
                  type="color"
                  value={color}
                  onChange={e => handleCustomColorChange(idx, e.target.value)}
                  style={{width: 40, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'none', marginRight: 8, border: selectedCustomColorIdx === idx ? '2px solid #667eea' : '2px solid #ddd'}}
                  onClick={() => { setSelectedCustomColorIdx(idx); setShirtColor(color); setGradientEnabled(false); }}
                />
                <button onClick={() => handleRemoveCustomColor(idx)} style={{marginLeft: 4, background: '#eee', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#c00', fontWeight: 700, width: 28, height: 28, display: customColors.length > 1 ? 'block' : 'none'}}>&times;</button>
              </div>
            ))}
            <button onClick={handleAddCustomColor} style={{marginTop: 4, background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '6px 12px', fontWeight: 600}}>+ Add Color</button>
          </div>
          <div className="color-presets" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 15}}>
            {COLOR_PRESETS.map((color, idx) => (
              <div
                key={color}
                className={`color-preset${activePreset === idx ? ' active' : ''}`}
                style={{background: color, width: 40, height: 40, borderRadius: 8, border: `2px solid ${activePreset === idx ? '#667eea' : '#ddd'}`, cursor: 'pointer', transition: 'transform 0.2s', transform: activePreset === idx ? 'scale(1.1)' : 'scale(1)'}}
                data-color={color}
                onClick={() => handlePresetClick(color, idx)}
              />
            ))}
          </div>
          <div className="input-group" style={{marginTop: 20}}>
            <label style={{display: 'block', marginBottom: 8, fontWeight: 500, color: '#555'}}>
              <input type="checkbox" checked={gradientEnabled} onChange={e => setGradientEnabled(e.target.checked)} /> Enable Gradient
            </label>
            {gradientEnabled && (
              <>
                {[...Array(MAX_GRADIENT_COLORS)].map((_, idx) => (
                  <div key={idx} style={{marginBottom: 8}}>
                    <label style={{display: 'block', fontWeight: 500, color: '#555'}}>Color {idx+1}:</label>
                    <input type="color" value={gradientColors[idx]} onChange={e => handleGradientColorChange(idx, e.target.value)} style={{width: '100%', height: 40, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'none'}} />
                    {(idx === 2 || idx === 3) && (
                      <label style={{marginLeft: 8}}>
                        <input type="checkbox" checked={gradientColorEnabled[idx]} onChange={e => handleGradientColorEnable(idx, e.target.checked)} /> Enable
                      </label>
                    )}
                  </div>
                ))}
                <label style={{display: 'block', marginBottom: 8, fontWeight: 500, color: '#555', marginTop: 8}}>Direction:</label>
                <select value={gradientDirection} onChange={handleGradientDirectionChange} style={{width: '100%', padding: 8, borderRadius: 8}}>
                  {GRADIENT_DIRECTIONS.map(dir => (
                    <option key={dir.value} value={dir.value}>{dir.label}</option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>
        <div className="control-group" style={{marginBottom: 30}}>
          <h3 style={{color: '#34495e', marginBottom: 15, fontSize: 18, fontWeight: 600}}>Custom Text</h3>
          <div className="input-group" style={{marginBottom: 20}}>
            <label style={{display: 'block', marginBottom: 8, fontWeight: 500, color: '#555'}}>Front Text:</label>
            <input type="text" ref={textInputRef} value={frontText} onChange={e => setFrontText(e.target.value)} placeholder="Your front text here..." maxLength={20} style={{width: '100%', padding: 12, border: '2px solid #e9ecef', borderRadius: 8, fontSize: 14}} />
          </div>
          <div className="input-group" style={{marginBottom: 20}}>
            <label style={{display: 'block', marginBottom: 8, fontWeight: 500, color: '#555'}}>Back Text:</label>
            <input type="text" value={backText} onChange={e => setBackText(e.target.value)} placeholder="Your back text here..." maxLength={20} style={{width: '100%', padding: 12, border: '2px solid #e9ecef', borderRadius: 8, fontSize: 14}} />
          </div>
          <button className="btn" onClick={clearText} style={{width: '100%', padding: 12, background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer', transition: 'transform 0.2s'}}>Clear Text</button>
        </div>
        <div className="control-group" style={{marginBottom: 30}}>
          <h3 style={{color: '#34495e', marginBottom: 15, fontSize: 18, fontWeight: 600}}>Text Position</h3>
          <div className="input-group" style={{marginBottom: 20}}>
            <label style={{display: 'block', marginBottom: 8, fontWeight: 500, color: '#555'}}>Horizontal: <span className="slider-value" style={{color: '#667eea', fontWeight: 600}}>{horizontal}</span>%</label>
            <input type="range" min={0} max={100} value={horizontal} onChange={handleHorizontalChange} style={{width: '100%'}} />
          </div>
          <div className="input-group" style={{marginBottom: 20}}>
            <label style={{display: 'block', marginBottom: 8, fontWeight: 500, color: '#555'}}>Vertical: <span className="slider-value" style={{color: '#667eea', fontWeight: 600}}>{vertical}</span>%</label>
            <input type="range" min={20} max={70} value={vertical} onChange={handleVerticalChange} style={{width: '100%'}} />
          </div>
        </div>
        <div className="control-group" style={{marginBottom: 30}}>
          <h3 style={{color: '#34495e', marginBottom: 15, fontSize: 18, fontWeight: 600}}>360° View</h3>
          <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
            <button onClick={rotateLeft} style={{fontSize: 24, border: 'none', background: '#eee', borderRadius: 8, cursor: 'pointer', width: 40, height: 40}}>&lt;</button>
            <span style={{fontWeight: 600}}>{ROTATION_ANGLES[rotationIdx]}°</span>
            <button onClick={rotateRight} style={{fontSize: 24, border: 'none', background: '#eee', borderRadius: 8, cursor: 'pointer', width: 40, height: 40}}>&gt;</button>
          </div>
        </div>
        <div className="control-group" style={{marginBottom: 30}}>
          <h3 style={{color: '#34495e', marginBottom: 15, fontSize: 18, fontWeight: 600}}>View</h3>
          <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
            <button onClick={() => setIsFront(true)} style={{fontWeight: isFront ? 700 : 400, background: isFront ? '#667eea' : '#eee', color: isFront ? 'white' : '#333', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '8px 16px'}}>Front</button>
            <button onClick={() => setIsFront(false)} style={{fontWeight: !isFront ? 700 : 400, background: !isFront ? '#667eea' : '#eee', color: !isFront ? 'white' : '#333', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '8px 16px'}}>Back</button>
          </div>
        </div>
      </div>
      <div className="preview-panel" style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(45deg, #f0f2f5, #ffffff)', position: 'relative'}}>
        <div className="tshirt-container" style={{position: 'relative', width: 400, height: 500, borderRadius: 20}}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <svg
            className="tshirt"
            viewBox="0 0 400 500"
            xmlns="http://www.w3.org/2000/svg"
            style={{width: '100%', height: '100%', position: 'relative', filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.2))', transform: `rotate(${ROTATION_ANGLES[rotationIdx]}deg)`}}
          >
            <defs>
              <linearGradient id="svgGradientHorizontal" x1="0%" y1="0%" x2="100%" y2="0%">
                {gradientColors.map((color, i) => gradientColorEnabled[i] && (
                  <stop key={i} offset={`${(gradientColors.filter((_, j) => gradientColorEnabled[j]).indexOf(color)/(gradientColors.filter((_, j) => gradientColorEnabled[j]).length-1))*100}%`} stopColor={color} />
                ))}
              </linearGradient>
              <linearGradient id="svgGradientVertical" x1="0%" y1="0%" x2="0%" y2="100%">
                {gradientColors.map((color, i) => gradientColorEnabled[i] && (
                  <stop key={i} offset={`${(gradientColors.filter((_, j) => gradientColorEnabled[j]).indexOf(color)/(gradientColors.filter((_, j) => gradientColorEnabled[j]).length-1))*100}%`} stopColor={color} />
                ))}
              </linearGradient>
              <linearGradient id="svgGradientDiagonal" x1="0%" y1="0%" x2="100%" y2="100%">
                {gradientColors.map((color, i) => gradientColorEnabled[i] && (
                  <stop key={i} offset={`${(gradientColors.filter((_, j) => gradientColorEnabled[j]).indexOf(color)/(gradientColors.filter((_, j) => gradientColorEnabled[j]).length-1))*100}%`} stopColor={color} />
                ))}
              </linearGradient>
            </defs>
            <path
              className="tshirt-base"
              d="M70 110 C70 110 75 85 80 80 C85 75 95 70 105 70 L120 70 C125 65 130 50 140 45 C150 40 160 35 170 35 L230 35 C240 35 250 40 260 45 C270 50 275 65 280 70 L295 70 C305 70 315 75 320 80 C325 85 330 110 330 110 L365 125 C370 127 375 130 378 135 C380 140 380 145 380 150 L380 175 C380 180 378 185 375 187 C372 189 365 190 360 190 L330 190 L330 440 C330 460 325 470 315 475 C305 480 295 480 285 480 L115 480 C105 480 95 480 85 475 C75 470 70 460 70 440 L70 190 L40 190 C35 190 28 189 25 187 C22 185 20 180 20 175 L20 150 C20 145 20 140 22 135 C25 130 30 127 35 125 L70 110 Z"
              fill={getSvgGradient()}
              style={{transition: 'fill 0.3s'}}
            />
            <path fill="rgba(0,0,0,0.1)" d="M140 45 C150 40 160 35 170 35 L230 35 C240 35 250 40 260 45 C255 55 245 65 235 70 L165 70 C155 65 145 55 140 45 Z"/>
            <path fill="rgba(0,0,0,0.1)" d="M70 110 L35 125 C30 127 25 130 22 135 C25 130 30 127 35 125 L70 110 L70 140 L40 140 L40 190 L70 190 L70 140 Z"/>
            <path fill="rgba(0,0,0,0.1)" d="M330 110 L365 125 C370 127 375 130 378 135 C375 130 370 127 365 125 L330 110 L330 140 L360 140 L360 190 L330 190 L330 140 Z"/>
          </svg>
          {((isFront && frontText.trim() !== '') || (!isFront && backText.trim() !== '')) && (
            <div
              className="text-overlay"
              style={{
                position: 'absolute',
                top: `${vertical}%`,
                left: `${horizontal}%`,
                transform: 'translate(-50%, -50%)',
                fontFamily: 'Arial Black, Arial, sans-serif',
                fontWeight: 'bold',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                maxWidth: 250,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                pointerEvents: 'none',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                color: textColor,
                fontSize: textSize,
                display: 'block',
              }}
            >
              {isFront ? frontText : backText}
            </div>
          )}
        </div>
        <div className="export-controls" style={{position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 15}}>
          <button className="export-btn" onClick={exportImage} style={{padding: '10px 20px', background: 'white', border: '2px solid #667eea', color: '#667eea', borderRadius: 25, cursor: 'pointer', fontWeight: 600, transition: 'all 0.3s'}}>📸 Download Image</button>
        </div>
      </div>
    </div>
  );
} 