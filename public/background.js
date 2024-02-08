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
        console.log("checkBadge alt currently is ", storedValue);

        if (typeof storedValue == "undefined") {
            console.log("checkAlt set to false");
            checkAlt = false;
        } else {
            console.log("checkAlt set to sv: " + storedValue);
            checkAlt = storedValue;
        }
    });
    await chrome.storage.local.get(["toggleEasyLanguage"]).then((result) => {
        const storedValue = result["toggleEasyLanguage"];
        console.log("checkBadge ea currently is ", storedValue);

        if (typeof storedValue == "undefined") {
            console.log("checkEA set to false");
            checkEA = false;
        } else {
            console.log("checkEA set to sv: " + storedValue);
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
    if (typeof message.section !== "undefined") {
        // Entkommentieren, um Local Storage zu resetten

        await chrome.storage.local.clear(function() {
            var error = chrome.runtime.lastError;
            if (error) {
                console.error(error);
            }
            console.log("cleared")
        });


        // await chrome.storage.local.get(["" + message.pText]).then((result) => {
        //     console.log(JSON.stringify(result));
        //     const storedValue = result[message.pText];
        //     console.log("Value currently is ", storedValue);

        //     if (typeof storedValue == "undefined") {
        //         getLeichteSprache(message.pText)
        //             .then(res => {
        //                 console.log("IN GENLEICHTE SPRACHE: " + res);
        //                 sendResponse({ leichteSprache: res });
        //                 return true;
        //             })
        //             .catch(error => {
        //                 console.error('Error occurred:', error);
        //                 sendResponse({ error: error.message });
        //                 return true;
        //             });
        //     } else {
        //         console.log(storedValue);
        //         sendResponse({ leichteSprache: storedValue });
        //         return true;
        //     }
        // });

        chrome.storage.local.get(["" + message.section]).then((result) => {
            console.log(JSON.stringify(result));
            const storedValue = result[message.section];
            console.log("Value currently is ", storedValue);

            if (typeof storedValue == "undefined") {
                getLeichteSprache(message.section)
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

const getInitialValues = async (sendResponse) => {
    var resultInitialAltText = false;
    var resultInitialEasyLanguage = false;

    await chrome.storage.local.get(["toggleValueAlt"]).then((result) => {
        console.log(JSON.stringify(result));
        const storedValue = result["toggleValueAlt"];
        console.log("Value currently is ", storedValue);

        if (typeof storedValue == "undefined") {
            console.log("resultInitialAltText set to false");
            resultInitialAltText = false;
        } else {
            resultInitialAltText = storedValue;
        }
    });
    await chrome.storage.local.get(["toggleEasyLanguage"]).then((result) => {
        console.log(JSON.stringify(result));
        const storedValue = result["toggleEasyLanguage"];
        console.log("Value currently is ", storedValue);

        if (typeof storedValue == "undefined") {
            console.log("resultInitialEasyLanguage set to false");
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
        console.log("Updated toggle alt value from " + message.toggleValueAlt + " to " + updatedToggleValueAlt);
        await chrome.storage.local.set({ ["toggleValueAlt"]: updatedToggleValueAlt }).then(() => {
            console.log("Updated toggle value alt text chrome local storage");
        });
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.reload(tabs[0].id);
        });
        sendResponse({ toggleValueAlt: updatedToggleValueAlt });
        return true;
    } else {
        console.log("Undefined toggleValueAlt");
    }
};
const updateToggleEasyLanguage = async (message, sendResponse) => {
    if (typeof message.toggleEasyLanguage !== "undefined") {
        const updatedToggleValueEasyLanguagge = !message.toggleEasyLanguage;
        console.log("Updated toggle alt value from " + message.toggleEasyLanguage + " to " + updatedToggleValueEasyLanguagge);
        await chrome.storage.local.set({ ["toggleEasyLanguage"]: updatedToggleValueEasyLanguagge }).then(() => {
            console.log("Updated toggle value easy language chrome local storage");
        });
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.reload(tabs[0].id);
        });
        sendResponse({ toggleEasyLanguage: updatedToggleValueEasyLanguagge });
        return true;
    } else {
        console.log("Undefined toggleEasyLanguage");
    }
};

// Reagiert auf die Message vom Content Skript
chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {

        if (message.greeting === 'alt') {
            console.log("Im background worker: " + message.imgUrl);
            generateAltText(message, sendResponse);
            return true;
        } else if (message.greeting === 'leichteSprache') {
            console.log("Im background worker: " + message.pText);
            generateLeichteSprache(message, sendResponse);
            return true;
        } else if (message.greeting === 'getInitialValues') {
            console.log("Im background worker: get initial values");
            getInitialValues(sendResponse);
            checkBadge();
            return true;
        }
        else if (message.greeting === 'toggleAltText') {
            console.log("Im background worker: " + message.toggleValueAlt);
            updateToggleAltText(message, sendResponse);
            checkBadge();
            return true;
        }
        else if (message.greeting === 'toggleEasyLanguage') {
            console.log("Im background worker: " + message.toggleEasyLanguage);
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
    // const user_prompt = `Überarbeite den folgenden Text entsprechend der Richtlinien für "Leichte Sprache": ${pText}`;
    const user_prompt = `Ich schicke dir ein JSON Element, welches HTML Elemente im Attribut "elements" enthält. Die Elemente sind sortiert nach Überschrift und entsprechenden Text zu der Überschrift. Es kann sein, dass ein Text keine Überschrift hat. Dies erkennst du an dem Tag des HTML-Objektes. Wandle den Text-Inhalt der HTML Elemente in Leichte Sprache um und achte dabei auf den semantischen Kontext: ${JSON.stringify(pText)}`;
    // const system_prompt = "Your answer fullfills the guidelines for 'Leichte Sprache'. You extract the main information of the text and display them in a very comprehensible form. You only use independent clauses without commas.";
    const leichteSpracheRegeln = {
        'Wörter':
            [
                "Benutzen Sie einfache Wörter.",
                "Benutzen Sie Wörter, die etwas genau beschreiben.",
                "Benutzen Sie bekannte Wörter.",
                "Verzichten Sie auf Fach-Wörter und Fremd-Wörter.",
                "Benutzen Sie immer die gleichen Wörter für die gleichen Dinge.",
                "Benutzen Sie kurze Wörter.",
                "Verzichten Sie auf Abkürzungen.",
                "Benutzen Sie Verben.",
                "Benutzen Sie aktive Wörter.",
                "Vermeiden Sie den Genitiv.",
                "Vermeiden Sie den Konjunktiv.",
                "Benutzen Sie positive Sprache.",
                "Vermeiden Sie Rede-Wendungen und bildliche Sprache."
            ],
        'Zahlen und Zeichen':
            [
                "Schreiben Sie Zahlen so, wie die meisten Menschen sie kennen.",
                "Vermeiden Sie alte Jahres-Zahlen.",
                "Vermeiden Sie hohe Zahlen und Prozent-Zahlen.",
                "Meistens sind Ziffern einfacher als Worte.",
                "Schreiben Sie Telefon-Nummern mit Leer-Zeichen.",
                "Vermeiden Sie Sonder-Zeichen.",
                "Wenn Sie ein Sonder-Zeichen benutzen müssen: Dann erklären sie das Zeichen."
            ],
        'Sätze':
            [
                "Schreiben Sie kurze Sätze.",
                "Machen Sie in jedem Satz nur eine Aussage.",
                "Benutzen Sie einen einfachen Satz-Bau.",
                "Am Anfang vom Satz dürfen auch diese Worte stehen: Aber, Oder, Wenn, Weil, Und."
            ],
        'Texte':
            [
                "Sprechen Sie die Leser und Leserinnen persönlich an.",
                "Benutzen Sie die Anrede Sie.",
                "Vermeiden Sie Fragen im Text.",
                "Schreiben Sie alles zusammen, was zusammen gehört.",
                "Vermeiden Sie Verweise",
                "Sie dürfen einen Text beim Schreiben in Leichter Sprache verändern.",
                "Sie dürfen Dinge erklären.",
                "Sie dürfen Hinweise geben.",
                "Sie dürfen Beispiele schreiben.",
                "Sie dürfen die Reihen-Folge ändern.",
                "Sie dürfen Teile vom Textes weglassen, wenn diese Teile nicht wichtig sind."
            ],
        'Gestaltung und Bilder':
            [
                "Schreiben Sie jeden neuen Satz in eine neue Zeile.",
                "Trennen Sie keine Wörter am Ende einer Zeile.",
                "Machen Sie viele Absätze und Überschriften.",
                "Schreiben Sie eine Adresse so wie auf einem Brief."
            ]
    }
    // const system_prompt = `Du antwortest nur mit dem überarbeitetem Text. Deine Antwort entspricht den folgenden Regeln für Leichte Sprache: ${leichteSpracheRegeln}`;
    const system_prompt = `Du antwortest nur mit dem geänderten JSON. Du darfst nur die Werte im Textinhalt ändern. Deine Antwort entspricht den folgenden Regeln für Leichte Sprache: ${leichteSpracheRegeln}`;

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
