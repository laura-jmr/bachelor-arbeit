// Toggle-Werte sind initial false, um Schaden zu minimieren, falls das Updaten der Toggle-Werte nicht richtig ist 
// Funktionen werden dann nämlich nicht ausgeführt
var toggleAltText = false;
var toggleLeichteSprache = false;

// Initialisiert die Toggle-Werte mit den Werten aus dem lokalen Speicher in Chrome
// Sind keine Werte im Speicher hinterlegt, werden die Werte auf false gesetzt
const initializeToggles = async () => {
    await chrome.storage.local.get(["toggleValueAlt"]).then((result) => {
        const storedValue = result["toggleValueAlt"];
        console.log("CS init: toggleValueAlt is ", storedValue);

        if (typeof storedValue == "undefined") {
            console.log("CS init: toggleAltText set to false");
            toggleAltText = false;
        } else {
            toggleAltText = storedValue;
        }
    });
    await chrome.storage.local.get(["toggleEasyLanguage"]).then((result) => {
        const storedValue = result["toggleEasyLanguage"];
        console.log("CS init: toggleEasyLanguage is ", storedValue);

        if (typeof storedValue == "undefined") {
            console.log("CS init: toggleLeichteSprache set to false");
            toggleLeichteSprache = false;
        } else {
            toggleLeichteSprache = storedValue;
        }
    });
};

// // Filtert alle Bilder auf der Webseite heraus, extrahiert die Sources und lässt den Service-Worker einen Alt-Text
// // generieren, der dann unter dem Bild angezeigt wird
// (async () => {
//     if (toggleAltText) {
//         console.log("im Content skript: executing alt text");
//         const images = document.querySelectorAll("img");
//         console.log(images);

//         images.forEach(async img => {
//             const response = await chrome.runtime.sendMessage({ greeting: 'alt', imgUrl: img.dataset.src });
//             console.log(response.alt);
//             const altText = createDomElement(`
//                 <p class="generated-alt-text">${response.alt}</p>
//             `);
//             img.parentNode.insertBefore(altText, img.nextSibling);
//         });

//         const manipuliert = createDomElement(`
//           <h1 class="test">HAHA ICH HAB EUCH MANIPULIERT</h1>
//         `);

//         document.body.append(manipuliert);
//     } else {
//         console.log("im Content skript: not executing alt text");
//     }
// })();

// Erstellt ein DOM-Element
function createDomElement(html) {
    const dom = new DOMParser().parseFromString(html, 'text/html');
    return dom.body.firstElementChild;
}

// (async () => {
//     // const mainDom = document.querySelector('main');
//     // console.log(mainDom);

//     // const elementsInMain = Array.from(mainDom.querySelectorAll('h1, h2, h3, p, span'));
//     // const result = extractTextContent(elementsInMain);
//     // console.log(result);

//     if (toggleLeichteSprache) {
//         console.log("im Content skript: executing leichte sprache");
//         const pDoms = document.querySelectorAll('p');
//         console.log(pDoms);

//         pDoms.forEach(async paragraph => {
//             const response = await chrome.runtime.sendMessage({ greeting: 'leichteSprache', pText: paragraph.textContent });
//             console.log(response);
//             console.log(response.leichteSprache);
//             const transformedResponse = response.leichteSprache.replace(/[.!?]/g, match => match + '<br><br>').trim();
//             console.log(transformedResponse);
//             paragraph.innerHTML = transformedResponse;
//             paragraph.classList.add("leichte-sprache");
//         });
//     } else {
//         console.log("im Content skript: not executing leichte sprache");
//     }
// })();

// Triggert die Bild-Alt-Generierung
// Sucht alle Bilder der Webseite
// Schickt Nachricht mit Bild-Src-URL an den Service-Worker
// Macht aus dem Ergebnis ein <p>-DOM-Element und fügt es unter dem jew. Bild ein
async function executeAltText() {
    if (toggleAltText) {
        console.log("CS executeAltText");
        const images = document.querySelectorAll("img");
        console.log("CS executeAltText: " + images);

        images.forEach(async img => {
            var iUrl;
            if (typeof img.dataset.src !== "undefined") {
                iUrl = img.dataset.src;
            } else if (typeof img.src !== "undefined") {
                iUrl = img.src;
            }
            const response = await chrome.runtime.sendMessage({ greeting: 'alt', imgUrl: iUrl });
            console.log("CS executeAltText: SV responde: " + response.alt.slice(1,-1));
            const altText = createDomElement(`
                <p class="generated-alt-text">${response.alt.slice(1,-1)}</p>
            `);
            img.parentNode.insertBefore(altText, img.nextSibling);
        });

    } else {
        console.log("CS executeAltText: not executing");
    }
}

// Triggert die Leichte-Sprache-Übersetzung
// Sucht alle Paragraphen der Webseite
// Schickt Nachricht mit Text der Paragraphen an den Service-Worker
// Aufarbeitung des Ergebnisses und Überschreibung des alten Textes mit dem Neuen
async function executeLeichteSprache () {
    if (toggleLeichteSprache) {
        console.log("CS executeLeichteSprache");
        const pDoms = document.querySelectorAll('p');
        console.log("CS executeLeichteSprache: " + pDoms);

        pDoms.forEach(async paragraph => {
            const response = await chrome.runtime.sendMessage({ greeting: 'leichteSprache', pText: paragraph.textContent });
            console.log("CS executeLeichteSprache: SV response: " + response.leichteSprache);
            const transformedResponse = response.leichteSprache.replace(/[.!?]/g, match => match + '<br><br>').trim();
            console.log("CS executeLeichteSprache: transformed response: " + transformedResponse);
            paragraph.innerHTML = transformedResponse;
            paragraph.classList.add("leichte-sprache");
        });
    } else {
        console.log("CS executeLeichteSprache: not executing");
    }
}

// Hilfsfunktion, die HTML-Elemente von Texten in Abschnitte gliedert
// Verbindet Überschriften mit jeweiligen darunterstehenden Paragraphen
// Wird genutzt, um Kontext miteinzubeziehen in die Übersetzung
function extractTextContent(elements) {
    console.log("CS extractTextContent");
    const sectionContents = [];
    let currentSection = {};

    elements.forEach(element => {
        const tagName = element.tagName.toLowerCase();
        if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
            // If new heading found, push current section content and start a new section
            if (Object.keys(currentSection).length !== 0) {
                sectionContents.push(currentSection);
            }
            currentSection = {
                h1: tagName === 'h1' ? element.textContent.trim() : '',
                h2: tagName === 'h2' ? element.textContent.trim() : '',
                h3: tagName === 'h3' ? element.textContent.trim() : '',
                p: ''
            };
        } else if (tagName === 'p' || tagName === 'span') {
            // Append text content to the current section's p attribute
            currentSection.p += ' ' + element.textContent.trim();
        }
    });

    // Push the last section if it exists
    if (Object.keys(currentSection).length !== 0) {
        sectionContents.push(currentSection);
    }

    return sectionContents;
}

// Aufruf der Funktionen
initializeToggles().then(() => {
    executeAltText();
    executeLeichteSprache();
});
