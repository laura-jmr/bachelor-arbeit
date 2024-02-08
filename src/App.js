/*global chrome*/
import './App.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import React, { useState, useEffect } from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';



function App() {
  const [alternativeText, setAlternativeText] = useState(false);
  const [easyLanguage, setEasyLanguage] = useState(false);

  useEffect(() => {
    // Fetch initial values from Chrome local storage
    chrome.runtime.sendMessage({ greeting: 'getInitialValues' }, (response) => {
      setAlternativeText(response.initialAltText);
      setEasyLanguage(response.initialEasyLanguage);
    });
  }, []);
  const sendMessageToBackgroundEasyLanguage = async () => {
    // Send a message to background script when the alternativeText switch is toggled
    const response = await chrome.runtime.sendMessage({ greeting: 'toggleEasyLanguage', toggleEasyLanguage: easyLanguage });
    console.log("Im Send Message Alt: " + response.toggleEasyLanguage);
    console.log("Im Send Message Alt Typ: " + typeof response.toggleEasyLanguage);
    return response;
  };

  const sendMessageToBackgroundAlt = async () => {
    // Send a message to background script when the alternativeText switch is toggled
    const response = await chrome.runtime.sendMessage({ greeting: 'toggleAltText', toggleValueAlt: alternativeText });
    console.log("Im Send Message Alt: " + response.toggleValueAlt);
    console.log("Im Send Message Alt Typ: " + typeof response.toggleValueAlt);
    return response;
  };

  const handleAlternativeTextChange = async () => {
    console.log("Before sendMessageToBackgroundAlt");
    const response = await sendMessageToBackgroundAlt();
    console.log("After sendMessageToBackgroundAlt", response);
    console.log("Im Handle on Change Alt: " + response.toggleValueAlt);
    setAlternativeText(response.toggleValueAlt);
  };


  const handleEasyLanguageChange = async () => {
    // Send a message to background script when the easyLanguage switch is toggled
    const response = await sendMessageToBackgroundEasyLanguage();
    console.log("Im Handle on Change Alt: " + response.toggleEasyLanguage);
    setEasyLanguage(response.toggleEasyLanguage);
  };

  return (
    <div id="popup-window">
      <img src='font-are-awesome-universal-accessibility.png' alt='accessibility icon'/>
      <h1>Barrierefreiheit Browser-Exension</h1>
      <h2>Einstellungen</h2>
      <p>Hier stellen Sie die Funktionen an oder aus.</p>
      <FormGroup id="popup-formgroup">
        <FormControlLabel control={<Switch checked={alternativeText} onChange={handleAlternativeTextChange} />} label="Bild-Alt-Generierung" />
        <FormControlLabel control={<Switch checked={easyLanguage} onChange={handleEasyLanguageChange} />} label="Leichte-Sprache-Übersetzung" />
      </FormGroup>
      <p id="popup-text"><span>An/Aus: </span>Command + B</p>
    </div>
  );
}

export default App;
