function addReturnToStartButton() {
    const rewindButtons = document.querySelectorAll('[aria-label$="秒戻る"]');
    const skipButtons = document.querySelectorAll('[aria-label$="秒送る"]');
    const settingButtons = document.querySelectorAll('[aria-label$="設定"]');

    if (!rewindButtons.length || !settingButtons.length) {
        console.error("必要なボタンが見つかりません");
        return;
    }

    if (document.querySelector('.return-to-start-button')) return;

    const targetButton = rewindButtons[0];
    const targetButton2 = skipButtons[0];

    const returnButton = document.createElement('button');
    returnButton.className = 'return-to-start-button';
    returnButton.textContent = "|<";
    returnButton.title = "最初に戻す";

    const autoplayToggle = document.createElement('button');
    autoplayToggle.title = "自動再生を切り替える";

    settingButtons[0].click();
    setTimeout(() => stateCheck(autoplayToggle), 200);

    returnButton.addEventListener('click', () => {
        console.log('最初に戻るボタンがクリックされました');
        simulateClickOnSeekBar(0);
    });

    autoplayToggle.addEventListener('click', (event) => {
        if (event.isTrusted) {
            toggleAutoplay(autoplayToggle, settingButtons[0]);
        }
    });

    targetButton.parentNode.insertBefore(returnButton, targetButton);
    targetButton2.parentNode.insertBefore(autoplayToggle, targetButton2.nextSibling);

    console.log("最初に戻るボタンとトグルボタンを追加しました");

    settingButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            if (event.isTrusted) {
                setTimeout(() => updateAutoplayState(autoplayToggle), 20);
            }
        });
    });
}

function toggleAutoplay(autoplayToggle, settingButton) {
    console.log('自動再生トグルがクリックされました');

    settingButton.click();
    setTimeout(() => {
        const element = document.evaluate(
            '//span[contains(text(), "次の動画を自動再生")]',
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;

        if (!element) return;

        const parent = element.parentNode;
        const nextSibling = parent.nextElementSibling;
        const onButton = document.getElementById(`${nextSibling.id}:radio:ON`);
        const offButton = document.getElementById(`${nextSibling.id}:radio:OFF`);

        if (onButton.dataset.state === 'checked') {
            offButton.click();
            autoplayToggle.dataset.state = 'unchecked';
            autoplayToggle.textContent = '○-';
        } else {
            onButton.click();
            autoplayToggle.dataset.state = 'checked';
            autoplayToggle.textContent = '-●';
        }

        setTimeout(() => closeSettings(), 20);
    }, 20);
}

function updateAutoplayState(autoplayToggle) {
    const element = document.evaluate(
        '//span[contains(text(), "次の動画を自動再生")]',
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue;

    if (!element) return;

    const parent = element.parentNode;
    const nextSibling = parent.nextElementSibling;
    const onButton = document.getElementById(`${nextSibling.id}:radio:ON`);
    const offButton = document.getElementById(`${nextSibling.id}:radio:OFF`);

    onButton.addEventListener('click', (event) => {
        if (event.isTrusted) {
            autoplayToggle.dataset.state = 'checked';
            autoplayToggle.textContent = '-●';
        }
    });

    offButton.addEventListener('click', (event) => {
        if (event.isTrusted) {
            autoplayToggle.dataset.state = 'unchecked';
            autoplayToggle.textContent = '○-';
        }
    });
}

function closeSettings() {
    const closeButton = document.querySelector('[aria-label$="Close"]');
    if (closeButton) closeButton.click();
}

// This function of the code is "ニコニコ動画で操作追加" by KT | MIT license
function simulateClickOnSeekBar(percent) {
    const progressBar = document.querySelector(
        'div.pos_absolute.top_-x0_5.bottom_-x0_5.left_0.right_0.us_none.cursor_pointer,' +
        'div.pos_absolute.top_-x0_5.bottom_-x0_5.left_0.right_0.select_none.cursor_pointer'
    );

    if (!progressBar) {
        console.error('シークバーが見つかりませんでした');
        return;
    }

    const rect = progressBar.getBoundingClientRect();
    const clickX = rect.left + percent * rect.width;
    const clickY = rect.top + rect.height / 2;

    const createMouseEvent = (type, x, y) => new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
    });

    ['mousedown', 'mouseup', 'click'].forEach(eventType => {
        progressBar.dispatchEvent(createMouseEvent(eventType, clickX, clickY));
    });

    console.log(`シークバーの ${Math.round(percent * 100)}% の位置をクリックしました。`);
}

function stateCheck(autoplayToggle) {
    const element = document.evaluate(
        '//span[contains(text(), "次の動画を自動再生")]',
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue;

    if (!element) return;

    const parent = element.parentNode;
    const nextSibling = parent.nextElementSibling;
    const onButton = document.getElementById(`${nextSibling.id}:radio:ON`);

    if (onButton.dataset.state === 'checked') {
        autoplayToggle.dataset.state = 'checked';
        autoplayToggle.textContent = '-●';
    } else {
        autoplayToggle.dataset.state = 'unchecked';
        autoplayToggle.textContent = '○-';
    }

    closeSettings();
}

const observer = new MutationObserver(() => {
    if (!document.querySelector('.return-to-start-button')) {
        addReturnToStartButton();
    }
});

observer.observe(document.body, { childList: true, subtree: true });

document.addEventListener('DOMContentLoaded', addReturnToStartButton);
