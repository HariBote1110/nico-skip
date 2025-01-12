function addReturnToStartButton() {
    const buttons = {
        rewind: document.querySelector('[aria-label$="秒戻る"]'),
        skip: document.querySelector('[aria-label$="秒送る"]'),
        setting: document.querySelector('[aria-label$="設定"]'),
    };

    if (!buttons.rewind || !buttons.setting) {
        console.error("必要なボタンが見つかりません");
        return;
    }

    if (document.querySelector('.return-to-start-button')) return;

    const createButton = (className, title, textContent = '', onClick) => {
        const button = document.createElement('button');
        button.className = className;
        button.title = title;
        button.textContent = textContent;
        button.addEventListener('click', onClick);
        return button;
    };

    const returnButton = createButton('return-to-start-button', "最初に戻す", "|<", () => {
        console.log('最初に戻るボタンがクリックされました');
        simulateClickOnSeekBar(0);
    });

    const autoplayToggle = createButton('autoplay-toggle', "自動再生を切り替える", '', (event) => {
        toggleSettingOption('次の動画を自動再生', autoplayToggle);
    });

    const repeatButton = createButton('loop-button', "ループ再生", '', (event) => {
        toggleSettingOption('リピート再生', repeatButton);
    });

    buttons.rewind.parentNode.insertBefore(returnButton, buttons.rewind);
    buttons.skip.parentNode.insertBefore(autoplayToggle, buttons.skip.nextSibling);
    autoplayToggle.parentNode.insertBefore(repeatButton, autoplayToggle.nextSibling);

    console.log("最初に戻るボタンとトグルボタンを追加しました");
    setTimeout(() => {
        initializeButtonStates(autoplayToggle, repeatButton, 0,buttons.setting)
    },500)

    buttons.setting.addEventListener('click', (event) => {
        if (event.isTrusted) {
            setTimeout(() => initializeButtonStates(autoplayToggle, repeatButton, 1), 20);
            console.log("ユーザーが設定をクリック")
        }
    });
}

function toggleSettingOption(labelText, button,Trusted) {
    console.log(`${labelText}トグルがクリックされました`);

    document.querySelector('[aria-label$="設定"]').click();
    setTimeout(() => {
        const option = document.evaluate(
            `//span[contains(text(), "${labelText}")]`,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;

        if (!option) return;

        const parent = option.parentNode;
        const nextSibling = parent.nextElementSibling;
        const onButton = document.getElementById(`${nextSibling.id}:radio:ON`);
        const offButton = document.getElementById(`${nextSibling.id}:radio:OFF`);

        if (onButton.dataset.state === 'checked') {
            offButton.click();
            button.dataset.state = 'unchecked';
        } else {
            onButton.click();
            button.dataset.state = 'checked';
        }

        updateButtonVisuals(button, labelText, button.dataset.state === 'checked');
        if (Trusted === 0) {
            setTimeout(closeSettings, 20);
        }
    }, 20);
}

function updateButtonVisuals(button, labelText, isChecked) {
    if (labelText === '次の動画を自動再生') {
        button.textContent = isChecked ? '-●' : '○-';
    } else if (labelText === 'リピート再生') {
        const loopIcon = isChecked ? 'images/loop.png' : 'images/loop2.png';
        button.style.backgroundImage = `url(${browser.runtime.getURL(loopIcon)})`;
    }
}

function initializeButtonStates(autoplayToggle, repeatButton,Trusted,settingButton) {
    settingButton.click();
    const setButtonState = (labelText, button) => {
        setTimeout(() => {
            const option = document.evaluate(
                `//span[contains(text(), "${labelText}")]`,
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            ).singleNodeValue;
            if (!option) return;
            const parent = option.parentNode;
            const nextSibling = parent.nextElementSibling;
            const onButton = document.getElementById(`${nextSibling.id}:radio:ON`);
    
            button.dataset.state = onButton.dataset.state === 'checked' ? 'checked' : 'unchecked';
            updateButtonVisuals(button, labelText, button.dataset.state === 'checked');
        },10)
    };

    setButtonState('次の動画を自動再生', autoplayToggle);
    setButtonState('リピート再生', repeatButton);
    if (Trusted === 0) {
        setTimeout(closeSettings, 50);
    }
}

function simulateClickOnSeekBar(percent) {
    const progressBar = document.querySelector('div.cursor_pointer');

    if (!progressBar) {
        console.error('シークバーが見つかりませんでした');
        return;
    }

    const rect = progressBar.getBoundingClientRect();
    const clickX = rect.left + percent * rect.width;
    const clickY = rect.top + rect.height / 2;

    ['mousedown', 'mouseup', 'click'].forEach(eventType => {
        progressBar.dispatchEvent(new MouseEvent(eventType, {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: clickX,
            clientY: clickY,
        }));
    });

    console.log(`シークバーの ${Math.round(percent * 100)}% の位置をクリックしました。`);
}

function closeSettings() {
    const closeButton = document.querySelector('[aria-label$="Close"]');
    if (closeButton) closeButton.click();
}

const observer = new MutationObserver(() => {
    if (!document.querySelector('.return-to-start-button')) {
        addReturnToStartButton();
    }
});

observer.observe(document.body, { childList: true, subtree: true });

document.addEventListener('DOMContentLoaded', addReturnToStartButton);