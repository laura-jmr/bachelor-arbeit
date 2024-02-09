/*global chrome*/
import './App.css';
// Schriftarten werden für die MUI-Bibliothek benötigt
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import React, { useState, useEffect } from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';



function App() {
  // Toggle der Funktion der Bild-Alt-Generierung
  const [alternativeText, setAlternativeText] = useState(false);
  
  // Toggle der Funktion der Leichte-Sprache-Übersetzung
  const [easyLanguage, setEasyLanguage] = useState(false);

  useEffect(() => {
    // Fetcht initale Werte der Toggles aus dem lokalen Speicher von Chrome
    chrome.runtime.sendMessage({ greeting: 'getInitialValues' }, (response) => {
      console.log("App.js getInitialValues: alt is " + response.initialAltText + " leichte sprache is " + response.initialEasyLanguage)
      setAlternativeText(response.initialAltText);
      setEasyLanguage(response.initialEasyLanguage);
    });
  }, []);

  // Ausgelagerte Funktion für onChange-Methode des Leichte-Sprache-Toggles
  // Wird benötigt, um asynchrone Aufrufe und Weiterverarbeitung fehlerfrei zu handlen
  // Schickt eine Nachricht an den Service-Worker mit neuem Toggle-Wert
  const sendMessageToBackgroundEasyLanguage = async () => {
    const response = await chrome.runtime.sendMessage({ greeting: 'toggleEasyLanguage', toggleEasyLanguage: easyLanguage });
    console.log("App.js toggleEasyLanguage: response is " + response.toggleEasyLanguage);
    console.log("App.js toggleEasyLanguage: response type is " + typeof response.toggleEasyLanguage);
    return response;
  };

  // Ausgelagerte Funktion für onChange-Methode des Bild-Alt-Toggles
  // Wird benötigt, um asynchrone Aufrufe und Weiterverarbeitung fehlerfrei zu handlen
  // Schickt eine Nachricht an den Service-Worker mit neuem Toggle-Wert
  const sendMessageToBackgroundAlt = async () => {
    const response = await chrome.runtime.sendMessage({ greeting: 'toggleAltText', toggleValueAlt: alternativeText });
    console.log("App.js toggleAltText: response is " + response.toggleValueAlt);
    console.log("App.js toggleAltText: response type is " + typeof response.toggleValueAlt);
    return response;
  };

  // onChange-Methode des Bild-Alt-Toggles im Interface
  const handleAlternativeTextChange = async () => {
    console.log("App.js handleAlternativeTextChange");
    const response = await sendMessageToBackgroundAlt();
    setAlternativeText(response.toggleValueAlt);
  };

// onChange-Methode des Leichte-Sprache-Toggles im Interface
  const handleEasyLanguageChange = async () => {
    console.log("App.js handleEasyLanguageChange");
    const response = await sendMessageToBackgroundEasyLanguage();
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
