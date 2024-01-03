import './backgroundtest1.js';
import './backgroundtest2.js';

// zum Togglen der Anzeige der Inhalte der Erweiterung
var display = false;

// Initialisiert das Badge bei Reload und setzt
// den Status auf "OFF" falls keiner bisher gesetzt wurde
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get('badgeState', (data) => {
        const initialBadgeState = data.badgeState || 'OFF'; // Set default value if undefined
        chrome.action.setBadgeText({ text: initialBadgeState });
        toggleDisplay(initialBadgeState);
    });
});

// Toggelt den Badge Status zwischen "OFF" und "ON" und triggert dabei die display-Variable
chrome.action.onClicked.addListener(async (tab) => {
    chrome.storage.local.get(["badgeState"]).then((result) => {
        console.log("badge state is: " + result.badgeState);
        var initialBadgeState = result.badgeState;
        if (typeof initialBadgeState === "undefined") {
            initialBadgeState = "OFF";
        }

        if (initialBadgeState === 'ON') {
            console.log("next state is OFF");
            chrome.action.setBadgeText({ text: "OFF" });
            chrome.storage.local.set({ badgeState: "OFF" });
            toggleDisplay("OFF");
        } else if (initialBadgeState === 'OFF') {
            console.log("next state is ON");
            chrome.action.setBadgeText({ text: "ON" });
            chrome.storage.local.set({ badgeState: "ON" });
            toggleDisplay("ON");
        }
    })
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.reload(tabs[0].id);
    });
});

chrome.commands.onCommand.addListener(async (command) => {
    console.log(`Command "${command}" triggered`);
    if (command === "toggle_active") {
        chrome.storage.local.get(["badgeState"]).then((result) => {
            console.log("badge state is: " + result.badgeState);
            var initialBadgeState = result.badgeState;
            if (typeof initialBadgeState === "undefined") {
                initialBadgeState = "OFF";
            }

            if (initialBadgeState === 'ON') {
                console.log("next state is OFF");
                chrome.action.setBadgeText({ text: "OFF" });
                chrome.storage.local.set({ badgeState: "OFF" });
                toggleDisplay("OFF");
            } else if (initialBadgeState === 'OFF') {
                console.log("next state is ON");
                chrome.action.setBadgeText({ text: "ON" });
                chrome.storage.local.set({ badgeState: "ON" });
                toggleDisplay("ON");
            }
        })
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.reload(tabs[0].id);
        });
    }
});

// Toggeln der display-Variable
const toggleDisplay = (currentState) => {
    display = currentState === 'ON';
    console.log("Display set to:", display);
};

// Funktion, die einen Alt-Text generieren lässt oder 
// einen bereits erstellten Alt-Text aus dem Local Storage läd und an das Content Skript zurückschickt
const generateAltText = async (message, sendResponse) => {
    if (typeof message.imgUrl !== "undefined") {
        // Entkommentieren, um Local Storage zu resetten

        // await chrome.storage.local.clear(function() {
        //     var error = chrome.runtime.lastError;
        //     if (error) {
        //         console.error(error);
        //     }
        //     console.log("cleared")
        // });
        await chrome.storage.local.get(["" + message.imgUrl]).then((result) => {
            console.log(JSON.stringify(result));
            const storedValue = result[message.imgUrl];
            console.log("Value currently is ", storedValue);

            if (typeof storedValue == "undefined") {
                getAlt(message.imgUrl)
                    .then(tags => getGPT(tags, message.imgUrl))
                    .then(alt => {
                        console.log(alt);
                        sendResponse({ alt: alt });
                        return true;
                    })
                    .catch(error => {
                        console.error('Error occurred:', error);
                        sendResponse({ error: error.message });
                        return true;
                    });
            } else {
                console.log(storedValue);
                sendResponse({ alt: storedValue });
                return true;
            }
        });
    } else {
        console.log("Undefined image url")
    }
};

const generateLeichteSprache = async (message, sendResponse) => {
    if (typeof message.pText !== "undefined") {
        // Entkommentieren, um Local Storage zu resetten

        // await chrome.storage.local.clear(function() {
        //     var error = chrome.runtime.lastError;
        //     if (error) {
        //         console.error(error);
        //     }
        //     console.log("cleared")
        // });
        await chrome.storage.local.get(["" + message.pText]).then((result) => {
            console.log(JSON.stringify(result));
            const storedValue = result[message.pText];
            console.log("Value currently is ", storedValue);

            if (typeof storedValue == "undefined") {
                getLeichteSprache(message.pText)
                    .then(res => {
                        console.log("IN GENLEICHTE SPRACHE: " + res);
                        sendResponse({ leichteSprache: res });
                        return true;
                    })
                    .catch(error => {
                        console.error('Error occurred:', error);
                        sendResponse({ error: error.message });
                        return true;
                    });
            } else {
                console.log(storedValue);
                sendResponse({ leichteSprache: storedValue });
                return true;
            }
        });
    } else {
        console.log("Undefined pText")
    }
};

// Reagiert auf die Message vom Content Skript
chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        if (display) {
            console.log("executing add listener")
            if (message.greeting === 'alt') {
                console.log("Im background worker: " + message.imgUrl);
                generateAltText(message, sendResponse);
                return true;
            } else if (message.greeting === 'leichteSprache') {
                console.log("Im background worker: " + message.pText);
                generateLeichteSprache(message, sendResponse);
                return true;
            }
        } else {
            console.log("not executing add listener")
        }
    }
);

// Hilfsfunktion zur Erstellung eines Alt-Textes
// Schickt eine Anfrage an die ChatGPT-API mit der von der Imagga-API erstellten Tags-Liste und definierten 
// User- und System-Prompts, wobei ein User-Prompt die Anfrage ist und der System-Prompt angibt, wie die Response aussehen soll
async function getGPT(tags, imageUrl) {
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const apiKey = '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';
    const user_prompt = `Write me an ALT text for an image with the following tag-list which are image classification tags with confidences: ${JSON.stringify(tags)}`;
    const system_prompt = "You answer in a single short sentence that describes the image best.";

    console.log("prompt for chatgpt: " + user_prompt);
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                "model": "gpt-3.5-turbo",
                "messages": [{
                    "role": "system",
                    "content": system_prompt
                }, {
                    "role": "user",
                    "content": user_prompt
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const altResponse = await response.json();
        console.log("Alt: ", altResponse);
        const contentResponse = altResponse.choices[0].message.content;
        console.log(contentResponse);
        await chrome.storage.local.set({ [imageUrl]: JSON.stringify(contentResponse) }).then(() => {
            console.log("Set filtered taglist for " + imageUrl + " to chrome local storage");
        });
        return contentResponse;
    } catch (error) {
        console.error('Error in getGPT:', error);
        throw error;
    }
}

async function getLeichteSprache(pText) {
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const apiKey = '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';
    const user_prompt = `Convert the following text to fullfill the guidelines for "Leichte Sprache": ${pText}`;
    const system_prompt = "Your answer fullfills the guidelines for 'Leichte Sprache'. You extract the main information of the text and display them in a very comprehensible form. You only use independent clauses without commas.";

    console.log("prompt for chatgpt: " + user_prompt);
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                "model": "gpt-3.5-turbo",
                "messages": [{
                    "role": "system",
                    "content": system_prompt
                }, {
                    "role": "user",
                    "content": user_prompt
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseJson = await response.json();
        const contentResponse = responseJson.choices[0].message.content;
        console.log(contentResponse);
        await chrome.storage.local.set({ [pText]: JSON.stringify(contentResponse) }).then(() => {
            console.log("Set leichte sprache to chrome local storage");
        });
        return contentResponse;
    } catch (error) {
        console.error('Error in getGPT:', error);
        throw error;
    }
}

// Hilfsfunktion zur Erstellung eines Alt-Textes
// Macht eine API-Anfrage an die Imagga-API mit einer öffentlich zugänglichen URL eines Bildes,
// um dieses zu Klassifizieren und entsprechende Tags mit Confidences (Wahrscheinlichkeiten) in einer Liste zu bekommen
async function getAlt(imageUrl) {
    const apiKey = 'acc_025ad8174b1b40c';
    const apiSecret = '04823e797b9cff03b2c41f5313652b1e';

    const url = 'https://api.imagga.com/v2/tags?image_url=' + encodeURIComponent(imageUrl);
    const authorizationHeader = `Basic ${btoa(`${apiKey}:${apiSecret}`)}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': authorizationHeader
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.status + " " + response.statusText);
        }

        const data = await response.json();
        const tags = data.result.tags;
        const filteredTags = tags.filter(tag => tag.confidence > 20);
        const transformedTags = filteredTags.map(entry => {
            return {
                confidence: entry.confidence,
                tag: entry.tag.en
            };
        });
        return JSON.stringify(transformedTags);
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error;
    }
}