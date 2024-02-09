import './backgroundtest1.js';
import './backgroundtest2.js';

// Initialisiert das Badge bei Reload und setzt
// den Status auf "OFF" falls keiner bisher gesetzt wurde
chrome.runtime.onInstalled.addListener(() => {
    checkBadge();
});

// chrome.commands.onCommand.addListener(async (command) => {
//     console.log(`Command "${command}" triggered`);
//     if (command === "toggle_active") {
//         chrome.storage.local.get(["badgeState"]).then((result) => {
//             console.log("badge state is: " + result.badgeState);
//             var initialBadgeState = result.badgeState;
//             if (typeof initialBadgeState === "undefined") {
//                 initialBadgeState = "OFF";
//             }

//             if (initialBadgeState === 'ON') {
//                 console.log("next state is OFF");
//                 chrome.action.setBadgeText({ text: "OFF" });
//                 chrome.storage.local.set({ badgeState: "OFF" });
//                 toggleDisplay("OFF");
//             } else if (initialBadgeState === 'OFF') {
//                 console.log("next state is ON");
//                 chrome.action.setBadgeText({ text: "ON" });
//                 chrome.storage.local.set({ badgeState: "ON" });
//                 toggleDisplay("ON");
//             }
//         })
//         chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//             chrome.tabs.reload(tabs[0].id);
//         });
//     }
// });

const checkBadge = async () => {
    var checkAlt = false;
    var checkEA = false;
    await chrome.storage.local.get(["toggleValueAlt"]).then((result) => {
        const storedValue = result["toggleValueAlt"];

        if (typeof storedValue == "undefined") {
            checkAlt = false;
        } else {
            checkAlt = storedValue;
        }
    });
    await chrome.storage.local.get(["toggleEasyLanguage"]).then((result) => {
        const storedValue = result["toggleEasyLanguage"];

        if (typeof storedValue == "undefined") {
            checkEA = false;
        } else {
            checkEA = storedValue;
        }
    });

    if (checkAlt || checkEA) {
        chrome.action.setBadgeText({ text: "ON" });
    } else {
        chrome.action.setBadgeText({ text: "OFF" });
    }
};

// Funktion, die einen Alt-Text generieren lässt oder 
// einen bereits erstellten Alt-Text aus dem Local Storage läd und an das Content Skript zurückschickt
const generateAltText = async (message, sendResponse) => {
    console.log("SV generateAltText");
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
            const storedValue = result[message.imgUrl];
            console.log("SV generateAltText: storedValue for " + message.imgUrl + " is " + storedValue);

            if (typeof storedValue == "undefined") {
                getAlt(message.imgUrl)
                    .then(tags => getGPT(tags, message.imgUrl))
                    .then(alt => {
                        console.log("SV generateAltText: generated alt text is " + alt);
                        sendResponse({ alt: alt });
                        return true;
                    })
                    .catch(error => {
                        console.error('SV generateAltText: Error occurred:', error);
                        sendResponse({ error: error.message });
                        return true;
                    });
            } else {
                sendResponse({ alt: storedValue });
                return true;
            }
        });
    } else {
        console.log("Undefined image url")
    }
};

const generateLeichteSprache = async (message, sendResponse) => {
    console.log("SV generateLeichteSprache");
    if (typeof message.pText !== "undefined") {
        // Entkommentieren, um Local Storage zu resetten

        await chrome.storage.local.clear(function() {
            var error = chrome.runtime.lastError;
            if (error) {
                console.error(error);
            }
            console.log("cleared")
        });
        await chrome.storage.local.get(["" + message.pText]).then((result) => {
            const storedValue = result[message.pText];
            console.log("SV generateLeichteSprache: storedValue for " + message.pText + " is " + storedValue);

            if (typeof storedValue == "undefined") {
                getLeichteSprache(message.pText)
                    .then(res => {
                        console.log("SV generateLeichteSprache: result " + res);
                        sendResponse({ leichteSprache: res });
                        return true;
                    })
                    .catch(error => {
                        console.error('SV generateLeichteSprache: Error occurred:', error);
                        sendResponse({ error: error.message });
                        return true;
                    });
            } else {
                sendResponse({ leichteSprache: storedValue });
                return true;
            }
        });
    } else {
        console.log("'SV generateLeichteSprache: Undefined pText")
    }
};

const getInitialValues = async (sendResponse) => {
    var resultInitialAltText = false;
    var resultInitialEasyLanguage = false;

    await chrome.storage.local.get(["toggleValueAlt"]).then((result) => {
        const storedValue = result["toggleValueAlt"];

        if (typeof storedValue == "undefined") {
            resultInitialAltText = false;
        } else {
            resultInitialAltText = storedValue;
        }
    });
    await chrome.storage.local.get(["toggleEasyLanguage"]).then((result) => {
        const storedValue = result["toggleEasyLanguage"];

        if (typeof storedValue == "undefined") {
            resultInitialEasyLanguage = false;
        } else {
            resultInitialEasyLanguage = storedValue;
        }
    });

    sendResponse({ initialAltText: resultInitialAltText, initialEasyLanguage: resultInitialEasyLanguage })
    return true;
};

const updateToggleAltText = async (message, sendResponse) => {
    if (typeof message.toggleValueAlt !== "undefined") {
        const updatedToggleValueAlt = !message.toggleValueAlt;
        await chrome.storage.local.set({ ["toggleValueAlt"]: updatedToggleValueAlt }).then(() => {
            console.log("SV updateToggleAltText: Updated");
        });
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.reload(tabs[0].id);
        });
        sendResponse({ toggleValueAlt: updatedToggleValueAlt });
        return true;
    } 
};

const updateToggleEasyLanguage = async (message, sendResponse) => {
    if (typeof message.toggleEasyLanguage !== "undefined") {
        const updatedToggleValueEasyLanguagge = !message.toggleEasyLanguage;
        await chrome.storage.local.set({ ["toggleEasyLanguage"]: updatedToggleValueEasyLanguagge }).then(() => {
            console.log("SV updateToggleEasyLanguage: Updated");
        });
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.reload(tabs[0].id);
        });
        sendResponse({ toggleEasyLanguage: updatedToggleValueEasyLanguagge });
        return true;
    } 
};

// Reagiert auf die Message vom Content Skript
chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {

        if (message.greeting === 'alt') {
            console.log("SV message income: alt " + message.imgUrl);
            generateAltText(message, sendResponse);
            return true;
        } else if (message.greeting === 'leichteSprache') {
            console.log("SV message income: leichte sprache " + message.pText);
            generateLeichteSprache(message, sendResponse);
            return true;
        } else if (message.greeting === 'getInitialValues') {
            console.log("SV message income: init ");
            getInitialValues(sendResponse);
            checkBadge();
            return true;
        }
        else if (message.greeting === 'toggleAltText') {
            console.log("SV message income: toggle alt " + message.toggleValueAlt);
            updateToggleAltText(message, sendResponse);
            checkBadge();
            return true;
        }
        else if (message.greeting === 'toggleEasyLanguage') {
            console.log("SV message income: toggle leichte sprache " + message.toggleEasyLanguage);
            updateToggleEasyLanguage(message, sendResponse);
            checkBadge();
            return true;
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

    console.log("SV getGPT: user prompt" + user_prompt);
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
        const contentResponse = altResponse.choices[0].message.content;
        console.log("SV getGPT: response " + contentResponse);
        await chrome.storage.local.set({ [imageUrl]: JSON.stringify(contentResponse) }).then(() => {
            console.log("SV getGPT: updated " + imageUrl + " to chrome local storage");
        });
        return contentResponse;
    } catch (error) {
        console.error('SV getGPT: Error', error);
        throw error;
    }
}

async function getLeichteSprache(pText) {
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const apiKey = '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';
    const user_prompt = `Convert the following text to fullfill the guidelines for "Leichte Sprache": ${pText}`;
    const system_prompt = "Your answer fullfills the guidelines for 'Leichte Sprache'. You extract the main information of the text and display them in a very comprehensible form. You only use independent clauses without commas.";

    console.log("SV getLeichteSprache: user prompt" + user_prompt);
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
            console.log("SV getLeichteSprache: updated " + pText + " to chrome local storage");
        });
        return contentResponse;
    } catch (error) {
        console.error('SV getLeichteSprache: Error', error);
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
        console.log("SV getAlt: result " + transformedTags);
        return JSON.stringify(transformedTags);
    } catch (error) {
        console.error("SV getAlt: error for " + imageUrl+ " " + error);
        throw error;
    }
}
