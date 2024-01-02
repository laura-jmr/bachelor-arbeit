// Filtert alle Bilder auf der Webseite heraus, extrahiert die Sources und lässt den Service-Worker einen Alt-Text
// generieren, der dann unter dem Bild angezeigt wird
(async () => {
    const images = document.querySelectorAll("img");
    console.log(images);

    images.forEach(async img => {
        const response = await chrome.runtime.sendMessage({ greeting: 'alt', imgUrl: img.dataset.src });
        console.log(response.alt);
        const altText = createDomElement(`
            <p class="generated-alt-text">${response.alt}</p>
        `);
        img.parentNode.insertBefore(altText, img.nextSibling);
    });

    const manipuliert = createDomElement(`
      <h1 class="test">HAHA ICH HAB EUCH MANIPULIERT</h1>
    `);

    document.body.append(manipuliert);
})();

function createDomElement(html) {
    const dom = new DOMParser().parseFromString(html, 'text/html');
    return dom.body.firstElementChild;
}