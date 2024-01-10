// // Filtert alle Bilder auf der Webseite heraus, extrahiert die Sources und lässt den Service-Worker einen Alt-Text
// // generieren, der dann unter dem Bild angezeigt wird
// (async () => {
//     const images = document.querySelectorAll("img");
//     console.log(images);

//     images.forEach(async img => {
//         const response = await chrome.runtime.sendMessage({ greeting: 'alt', imgUrl: img.dataset.src });
//         console.log(response.alt);
//         const altText = createDomElement(`
//             <p class="generated-alt-text">${response.alt}</p>
//         `);
//         img.parentNode.insertBefore(altText, img.nextSibling);
//     });

//     const manipuliert = createDomElement(`
//       <h1 class="test">HAHA ICH HAB EUCH MANIPULIERT</h1>
//     `);

//     document.body.append(manipuliert);
// })();

function createDomElement(html) {
    const dom = new DOMParser().parseFromString(html, 'text/html');
    return dom.body.firstElementChild;
}

(async () => {
    const bodyDom = document.querySelector('body');
    console.log(bodyDom);

    const elementsInBody = Array.from(bodyDom.querySelectorAll('h1, h2, h3, p, span'));
    const result = groupElementsBySection(elementsInBody);
    console.log(result);
    // const pDoms = document.querySelectorAll('p');
    // console.log(pDoms);

    // pDoms.forEach(async paragraph => {
    //     const response = await chrome.runtime.sendMessage({ greeting: 'leichteSprache', pText: paragraph.textContent });
    //     console.log(response);
    //     console.log(response.leichteSprache);
    //     const transformedResponse = response.leichteSprache.replace(/[.!?]/g, match => match + '<br><br>').trim();
    //     console.log(transformedResponse);
    //     paragraph.innerHTML = transformedResponse;
    //     paragraph.classList.add("leichte-sprache");
    // });

    result.forEach(async section => {
        const response = await chrome.runtime.sendMessage({ greeting: 'leichteSprache', section: section });
        console.log(response);
        console.log(response.leichteSprache);
        const resArray = response.leichteSprache.elements;
        resArray.forEach(domElement => {
            domElement.innerHTML = domElement.innerText;
            domElement.classList.add("leichte-sprache");
        });
    });
})();


// Function to extract text content from an element
function extractTextContent(elements) {
    const sections = [];
    let currentSection = {};

    elements.forEach(element => {
        const tagName = element.tagName.toLowerCase();
        if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
            if (Object.keys(currentSection).length !== 0) {
                sections.push(currentSection);
            }
            currentSection = {
                htmlElement: element,
                content: {
                    h1: tagName === 'h1' ? element.innerHTML.trim() : '',
                    h2: tagName === 'h2' ? element.innerHTML.trim() : '',
                    h3: tagName === 'h3' ? element.innerHTML.trim() : '',
                    p: ''
                }
            };
        } else if (tagName === 'p' || tagName === 'span') {
            currentSection.content.p += ' ' + element.innerHTML.trim();
        }
    });

    if (Object.keys(currentSection).length !== 0) {
        sections.push(currentSection);
    }

    return sections;
}

function groupElementsBySection(elements) {
    const groupedSections = [];
    let currentSection = { elements: [] };

    elements.forEach(element => {
        const tagName = element.tagName.toLowerCase();
        if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || tagName === 'p' || tagName === 'span') {
            // If new heading or paragraph found, push current section and start a new one
            if (currentSection.elements.length > 0 && (tagName == 'h1' || tagName == 'h2' || tagName == 'h3')) {
                groupedSections.push(currentSection);
                currentSection = { elements: [] };
            }
            currentSection.elements.push(element);
        }
    });

    // Push the last section if it exists
    if (currentSection.elements.length > 0) {
        groupedSections.push(currentSection);
    }

    return groupedSections;
}
