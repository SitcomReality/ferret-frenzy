        const flag = document.createElement('div');
        flag.className = 'racer-flag';
        const swatchPrimary = document.createElement('span');
        swatchPrimary.className = 'swatch swatch-primary';
        swatchPrimary.style.backgroundColor = primaryColor;
        const swatchSecondary = document.createElement('span');
        swatchSecondary.className = 'swatch swatch-secondary';
        swatchSecondary.style.backgroundColor = secondaryColor;
        flag.appendChild(swatchPrimary);
        flag.appendChild(swatchSecondary);
        info.appendChild(flag);

