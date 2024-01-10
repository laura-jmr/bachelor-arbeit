/*global chrome*/
import './App.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import * as React from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';



function App() {
  const [alternativeText, setAlternativeText] = React.useState(false);
  const [easyLanguage, setEasyLanguage] = React.useState(false);

  const handleAlternativeTextChange = async () => {
    setAlternativeText((prev) => !prev);
    // Send a message to background script when the alternativeText switch is toggled
    const response = await chrome.runtime.sendMessage({ greeting: 'toggleAltText', toggleValue: alternativeText });
        console.log(response.toggleAltText);
  };

  const handleEasyLanguageChange = async () => {
    setEasyLanguage((prev) => !prev);
    // Send a message to background script when the easyLanguage switch is toggled
    const response = await chrome.runtime.sendMessage({ greeting: 'toggleEasyLanguage', toggleValue: easyLanguage });
        console.log(response.toggleEasyLanguage);
  };

  return (
    <div id="popup-window">
      <FormGroup id="popup-formgroup">
        <FormControlLabel control={<Switch checked={alternativeText} onChange={handleAlternativeTextChange} />} label="Bild-Alternativtexte" />
        <FormControlLabel control={<Switch checked={easyLanguage} onChange={handleEasyLanguageChange}/>} label="Leichte Sprache" />
      </FormGroup>
      <p id="popup-text"><span>An/Aus: </span>Command + B</p>
    </div>
  );
}

export default App;
