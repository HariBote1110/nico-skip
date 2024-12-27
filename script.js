function addReturnToStartButton() {
    // 対象となる「X秒戻る」ボタンを探す
    const rewindButtons = document.querySelectorAll('[aria-label$="秒戻る"]'); // 「秒戻る」で終わるaria-labelを取得
    const skipButtons = document.querySelectorAll('[aria-label$="秒送る"]'); // 「秒戻る」で終わるaria-labelを取得
    const settingButtons = document.querySelectorAll('[aria-label$="設定"]'); // 「設定」で終わるaria-labelを取得

    if (!rewindButtons || rewindButtons.length === 0) {
        console.error("戻るボタンが見つかりません");
        return;
    }
    if (!settingButtons || settingButtons.length === 0) {
        console.error("設定ボタンが見つかりません");
        return;
    }

    // すでに「最初に戻る」ボタンが存在していれば何もしない
    if (document.querySelector('.return-to-start-button')) {
        return; // ログを出力せず、処理を終了
    }

    // 対象のボタンの中で最初に見つかったものを基準にする
    const targetButton = rewindButtons[0];
    const targetButton2 = skipButtons[0];

    // 「最初に戻る」ボタンを作成
    const returnButton = document.createElement('button');
    returnButton.className = 'return-to-start-button';
    returnButton.textContent = "|<";
    returnButton.title = "最初に戻す"; // ホバーテキストを追加

    // 「設定」ボタンを作成
    const autoplayToggle = document.createElement('button');
    autoplayToggle.title = "自動再生を切り替える"; // ホバーテキストを追加

    settingButtons[0].click();

    setTimeout(() => {
        stateCheck(autoplayToggle);
    }, 200);

    // 「最初に戻る」ボタンのクリックイベント
    returnButton.addEventListener('click', () => {
        console.log('最初に戻るボタンがクリックされました');
        simulateClickOnSeekBar(0); // シークバーを操作する関数を呼び出し
    });

    // 「自動再生」ボタンのクリックイベント
    autoplayToggle.addEventListener('click', () => {
        console.log('自動再生トグルがクリックされました');

        settingButtons[0].click();
        setTimeout(() => {
            const element = document.evaluate(
                '//span[contains(text(), "次の動画を自動再生")]',
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            ).singleNodeValue;
            const parent = element.parentNode;
            const nextSibling = parent.nextElementSibling;
            const onbutton = document.getElementById(`${nextSibling.id}:radio:ON`);
            const offbutton = document.getElementById(`${nextSibling.id}:radio:OFF`);
            if (onbutton.dataset.state === `checked`) {
                offbutton.click();
            } else {
                onbutton.click();
            }
            const currentState = onbutton.dataset.state;

            if (currentState === 'unchecked') {
                autoplayToggle.dataset.state = 'checked';
                autoplayToggle.textContent = '-●';
            } else {
                autoplayToggle.dataset.state = 'unchecked';
                autoplayToggle.textContent = '○-';
            }
            setTimeout(() => {
                const CloseButtons = document.querySelectorAll('[aria-label$="Close"]');
                if (!CloseButtons || CloseButtons.length === 0) {
                    console.error("閉じるボタンが見つかりません");
                    return;
                }
                CloseButtons[0].click();
            }, 20);
        }, 20);
    });

    // 対象ボタンの左隣に「最初に戻る」ボタンを配置
    targetButton.parentNode.insertBefore(returnButton, targetButton);

    // 「最初に戻る」ボタンの隣に「設定」ボタンを配置
    targetButton2.parentNode.insertBefore(autoplayToggle, targetButton2.nextSibling);

    console.log("最初に戻るボタンとトグルボタンを追加しました");

    // ユーザーによる設定ボタンクリックを検知
    settingButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            if (event.isTrusted) { // isTrustedでユーザー操作かを確認
                console.log("ユーザーが設定ボタンをクリックしました");
            setTimeout(() => {
                const element = document.evaluate(
                    '//span[contains(text(), "次の動画を自動再生")]',
                    document,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                ).singleNodeValue;
                const parent = element.parentNode;
                const nextSibling = parent.nextElementSibling;
                const onbutton = document.getElementById(`${nextSibling.id}:radio:ON`);
                const offbutton = document.getElementById(`${nextSibling.id}:radio:OFF`);
                onbutton.addEventListener('click', (event) => {
                    if (event.isTrusted) { // isTrustedでユーザー操作かを確認
                        autoplayToggle.dataset.state = 'checked';
                        autoplayToggle.textContent = '-●';
                }})
                offbutton.addEventListener('click', (event) => {
                    if (event.isTrusted) { // isTrustedでユーザー操作かを確認
                        autoplayToggle.dataset.state = 'unchecked';
                        autoplayToggle.textContent = '○-';
                }})
            },20)
            }
        });
    });
}

// 動的にページが変更される場合に対応するための監視
const observer = new MutationObserver(() => {
    // すでにボタンが存在している場合は処理をスキップ
    if (document.querySelector('.return-to-start-button')) {
        return;
    }
    addReturnToStartButton();
});

// ページ全体を監視
observer.observe(document.body, { childList: true, subtree: true });

// 初期読み込み時にもボタンを追加
document.addEventListener('DOMContentLoaded', addReturnToStartButton);

// シークバーを指定したパーセンテージ位置でクリックする関数
function simulateClickOnSeekBar(percent) {
    try {
        const progressBarSelectors = [
            'div.pos_absolute.top_-x0_5.bottom_-x0_5.left_0.right_0.us_none.cursor_pointer',
            'div.pos_absolute.top_-x0_5.bottom_-x0_5.left_0.right_0.select_none.cursor_pointer'
        ];

        let progressBar = null;
        for (const selector of progressBarSelectors) {
            progressBar = document.querySelector(selector);
            if (progressBar) break;
        }

        if (!progressBar) {
            console.error('シークバーが見つかりませんでした。');
            return;
        }

        const rect = progressBar.getBoundingClientRect();
        const clickX = rect.left + percent * rect.width;
        const clickY = rect.top + rect.height / 2;

        function createMouseEvent(type, x, y) {
            return new MouseEvent(type, {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: x,
                clientY: y,
            });
        }

        progressBar.dispatchEvent(createMouseEvent('mousedown', clickX, clickY));
        progressBar.dispatchEvent(createMouseEvent('mouseup', clickX, clickY));
        progressBar.dispatchEvent(createMouseEvent('click', clickX, clickY));

        console.log(`シークバーの ${Math.round(percent * 100)}% の位置をクリックしました。`);

    } catch (error) {
        console.error('シーク操作中にエラーが発生しました:', error);
    }
}

function stateCheck(autoplayToggle) {
    const element = document.evaluate(
        '//span[contains(text(), "次の動画を自動再生")]',
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue;
    const parent = element.parentNode;
    const nextSibling = parent.nextElementSibling;
    const onbutton = document.getElementById(`${nextSibling.id}:radio:ON`);
    console.log(onbutton.dataset.state);
    if (onbutton.dataset.state === `checked`) {
        autoplayToggle.dataset.state = 'checked';
        autoplayToggle.textContent = '-●';
    } else {
        autoplayToggle.dataset.state = 'unchecked';
        autoplayToggle.textContent = '○-';

    }
    setTimeout(() => {
        const CloseButtons = document.querySelectorAll('[aria-label$="Close"]');
        if (!CloseButtons || CloseButtons.length === 0) {
            CloseButtons[0].click();
            console.error("閉じるボタンが見つかりません");
            return;
        }
        CloseButtons[0].click();
    }, 10);
}
