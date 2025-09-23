class DOMUtils {
    static createRacerGuiElement(racerId, index) {
        const thisRacer = gameState.racers[racerId];

        const card = document.createElement('div');
        card.className = 'racer-card';
        card.setAttribute('data-racer-id', thisRacer.id);

        // Set CSS custom properties for colors
        const primaryColor = racerColors[thisRacer.colors[0]];
        const secondaryColor = racerColors[thisRacer.colors[1]];
        const tertiaryColor = racerColors[thisRacer.colors[2]];
        
        card.style.setProperty('--primary-color', primaryColor);
        card.style.setProperty('--primary-color-dark', shadeColor(primaryColor, -20));
        card.style.setProperty('--secondary-color', secondaryColor);

        if (typeof index === 'number') {
            const placing = document.createElement('div');
            placing.className = 'placing-badge';
            placing.textContent = index + 1;
            card.appendChild(placing);
        }

        const num = document.createElement('div');
        num.className = 'racer-number';
        num.textContent = thisRacer.id;
        num.style.backgroundColor = tertiaryColor;
        card.appendChild(num);

        const info = document.createElement('div');
        info.className = 'racer-info';
        const name = document.createElement('div');
        name.className = 'racer-name';
        name.textContent = getRacerNameString(thisRacer);
        info.appendChild(name);

        card.appendChild(info);
        return card;
    }
}

