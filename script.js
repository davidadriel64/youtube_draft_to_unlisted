(() => {
    const MODE = 'publish_drafts'; // 'publish_drafts' / 'sort_playlist';
    const DEBUG_MODE = true; // true / false, enable for more context
    const MADE_FOR_KIDS = false; // true / false;
    const VISIBILITY = 'Unlisted'; // 'Public' / 'Private' / 'Unlisted'
    
    const SORTING_KEY = (one, other) => {
        return one.name.localeCompare(other.name, undefined, {numeric: true, sensitivity: 'base'});
    };

    
    const TIMEOUT_STEP_MS = 20;
    const DEFAULT_ELEMENT_TIMEOUT_MS = 15500;
    function debugLog(...args) {
        if (!DEBUG_MODE) {
            return;
        }
        console.log(...args);
    }
    const sleep = (ms) => new Promise((resolve, _) => setTimeout(resolve, ms));

    async function waitForElement(selector, baseEl, timeoutMs) {
        if (timeoutMs === undefined) {
            timeoutMs = DEFAULT_ELEMENT_TIMEOUT_MS;
        }
        if (baseEl === undefined) {
            baseEl = document;
        }
        let timeout = timeoutMs;
        while (timeout > 0) {
            let element = baseEl.querySelector(selector);
            if (element !== null) {
                return element;
            }
            await sleep(TIMEOUT_STEP_MS);
            timeout -= TIMEOUT_STEP_MS;
        }
        debugLog(`could not find ${selector} inside`, baseEl);
        return null;
    }

    function click(element) {
        const event = document.createEvent('MouseEvents');
        event.initMouseEvent('mousedown', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        element.dispatchEvent(event);
        element.click();
        debugLog(element, 'clicked');
    }

    // ----------------------------------
    // PUBLISH STUFF
    // ----------------------------------
    const VISIBILITY_PUBLISH_ORDER = {
        'Private': 0,
        'Unlisted': 1,
        'Public': 2,
    };

    // SELECTORS
    // ---------
    const VIDEO_ROW_SELECTOR = 'ytcp-video-row';
    const DRAFT_MODAL_SELECTOR = '.style-scope.ytcp-uploads-dialog';
    const DRAFT_BUTTON_SELECTOR = '.edit-draft-button';
    const MADE_FOR_KIDS_SELECTOR = '#made-for-kids-group';
    const RADIO_BUTTON_SELECTOR = 'tp-yt-paper-radio-button';
    const VISIBILITY_STEPPER_SELECTOR = '#step-badge-5';
    const VISIBILITY_STEPPER_SELECTOR_MONETIZATION = '#step-badge-1';
    const VISIBILITY_STEPPER_SELECTOR_AD_SUITABILITY = '#step-badge-2';
    const MID_ROLL_BUTTON_SELECTOR = '#mid-roll-button';
    const VISIBILITY_PAPER_BUTTONS_SELECTOR = 'tp-yt-paper-radio-group';
    const CLICK_MONETIZATION_BUTTON_SELECTOR = 'div.m10n-text.clickable.style-scope.ytcp-video-monetization';
    const MONETIZATION_OPTION_ON_SELECTOR = '#radio-on'; // Ajusta el selector según la estructura del menú
    const DONE_BUTTON_SELECTOR = '#save-button'; // Ajusta si el selector es diferente
    const SAVE_BUTTON_SELECTOR = '#done-button';
    const SUCCESS_ELEMENT_SELECTOR = 'ytcp-video-thumbnail-with-info';
    const DIALOG_SELECTOR = 'ytcp-dialog.ytcp-video-share-dialog > tp-yt-paper-dialog:nth-child(1)';
    const DIALOG_CLOSE_BUTTON_SELECTOR = 'tp-yt-iron-icon';

    class SuccessDialog {
        constructor(raw) {
            this.raw = raw;
        }

        async closeDialogButton() {
            return await waitForElement(DIALOG_CLOSE_BUTTON_SELECTOR, this.raw);
        }

        async close() {
            click(await this.closeDialogButton());
            await sleep(50);
            debugLog('closed');
        }
    }

    class VisibilityModal {
        constructor(raw) {
            this.raw = raw;
        }

        async radioButtonGroup() {
            return await waitForElement(VISIBILITY_PAPER_BUTTONS_SELECTOR, this.raw);
        }

        async visibilityRadioButton() {
            const group = await this.radioButtonGroup();
            const value = VISIBILITY_PUBLISH_ORDER[VISIBILITY];
            return [...group.querySelectorAll(RADIO_BUTTON_SELECTOR)][value];
        }

        async setVisibility() {
            click(await this.visibilityRadioButton());
            debugLog(`visibility set to ${VISIBILITY}`);
            await sleep(50);
        }

        async saveButton() {
            return await waitForElement(SAVE_BUTTON_SELECTOR, this.raw);
        }
        async isSaved() {
            await waitForElement(SUCCESS_ELEMENT_SELECTOR, document);
        }
        async dialog() {
            return await waitForElement(DIALOG_SELECTOR);
        }
        async save() {
            click(await this.saveButton());
            debugLog('saved');
            sleep(2500);
            return;
        }
    }

    class DraftModal {
        constructor(raw) {
            this.raw = raw;
        }

        async madeForKidsToggle() {
            return await waitForElement(MADE_FOR_KIDS_SELECTOR, this.raw);
        }

        async madeForKidsPaperButton() {
            const nthChild = MADE_FOR_KIDS ? 1 : 2;
            return await waitForElement(`${RADIO_BUTTON_SELECTOR}:nth-child(${nthChild})`, this.raw);
        }

        async selectMadeForKids() {
            click(await this.madeForKidsPaperButton());
            await sleep(50);
            debugLog(`"Made for kids" set as ${MADE_FOR_KIDS}`);
        }


        async visibilityStepper() {
            return await waitForElement(VISIBILITY_STEPPER_SELECTOR, this.raw);
        }

        async visibilityStepperMonetization() {
            return await waitForElement(VISIBILITY_STEPPER_SELECTOR_MONETIZATION, this.raw);
        }

        async clickSelector() {
            console.log('Buscando el botón de monetización...');
            const monetizationButton = await waitForElement(CLICK_MONETIZATION_BUTTON_SELECTOR, this.raw);
            if (monetizationButton) {
                console.log('Botón de monetización encontrado.');
                click(monetizationButton);
            } else {
                console.log('No se pudo encontrar el botón de monetización.');
            }
            
            await sleep(500); // Espera para que el menú se despliegue
    
            console.log('Buscando la opción "On"...');
            const monetizationOptionOn = document.querySelector(MONETIZATION_OPTION_ON_SELECTOR);
            if (monetizationOptionOn) {
                console.log('Opción "On" encontrada.');
                click(monetizationOptionOn);
            } else {
                console.log('No se pudo encontrar la opción "On".');
            }
    
            await sleep(1500); // Espera para que la opción sea seleccionada
    
            console.log('Buscando el botón "Done"...');
            const doneButton =  document.querySelector(DONE_BUTTON_SELECTOR);
            if (doneButton) {
                console.log('Botón "Done" encontrado.');
                click(doneButton);
            } else {
                console.log('No se pudo encontrar el botón "Done".');
            }
            await sleep(1500);
        }

        async visibilityAd(){
            return await waitForElement(VISIBILITY_STEPPER_SELECTOR_AD_SUITABILITY, this.raw);
        }
    
        async checkAd(){
            const ad = document.querySelector(".all-none-checkbox.style-scope.ytpp-self-certification-questionnaire");
            if (ad) {
                click(ad);
            }
            await sleep(4500);
            const ad2 = document.getElementById("submit-questionnaire-button");
            if (ad2) {
                click(ad2);
            }
        }

        async goToVisibility() {
            debugLog('going to Visibility');
            await sleep(2500);
            click(await this.visibilityStepper());
            const visibility = new VisibilityModal(this.raw);
            await sleep(50);
            await waitForElement(VISIBILITY_PAPER_BUTTONS_SELECTOR, visibility.raw);
            return visibility;
        }
    }

    class VideoRow {
        constructor(raw) {
            this.raw = raw;
        }

        get editDraftButton() {
            return waitForElement(DRAFT_BUTTON_SELECTOR, this.raw, 20);
        }

        async openDraft() {
            debugLog('focusing draft button');
            click(await this.editDraftButton);
            return new DraftModal(await waitForElement(DRAFT_MODAL_SELECTOR));
        }
    }


    function allVideos() {
        return [...document.querySelectorAll(VIDEO_ROW_SELECTOR)].map((el) => new VideoRow(el));
    }

    async function editableVideos() {
        let editable = [];
        for (let video of allVideos()) {
            if ((await video.editDraftButton) !== null) {
                editable = [...editable, video];
            }
        }
        return editable;
    }

    async function publishDrafts() {
        const videos = await editableVideos();
        debugLog(`found ${videos.length} videos`);
        debugLog('starting in 1500ms');
        await sleep(1500);
        for (let index = 0; index < videos.length; index++) {
            const draft = await videos[index].openDraft();
            debugLog({
                draft
            });
            await sleep(1500);
            await draft.selectMadeForKids();
            await click(await draft.visibilityStepperMonetization());
            await draft.clickSelector();
            await click(await draft.visibilityAd());
            await sleep(2500);
            await draft.checkAd();
            await sleep(3500);
            const visibility = await draft.goToVisibility();
            await sleep(1500);
            await visibility.setVisibility();
            await sleep(1500);
            const dialog = await visibility.save();
            await sleep(7500);
        }
    }

    // ----------------------------------
    // SORTING STUFF
    // ----------------------------------
    const SORTING_MENU_BUTTON_SELECTOR = 'button';
    const SORTING_ITEM_MENU_SELECTOR = 'tp-yt-paper-listbox#items';
    const SORTING_ITEM_MENU_ITEM_SELECTOR = 'ytd-menu-service-item-renderer';
    const MOVE_TO_TOP_INDEX = 4;
    const MOVE_TO_BOTTOM_INDEX = 5;

    class SortingDialog {
        constructor(raw) {
            this.raw = raw;
        }

        async anyMenuItem() {
            const item =  await waitForElement(SORTING_ITEM_MENU_ITEM_SELECTOR, this.raw);
            if (item === null) {
                throw new Error("could not locate any menu item");
            }
            return item;
        }

        menuItems() {
            return [...this.raw.querySelectorAll(SORTING_ITEM_MENU_ITEM_SELECTOR)];
        }

        async moveToTop() {
            click(this.menuItems()[MOVE_TO_TOP_INDEX]);
        }

        async moveToBottom() {
            click(this.menuItems()[MOVE_TO_BOTTOM_INDEX]);
        }
    }
    class PlaylistVideo {
        constructor(raw) {
            this.raw = raw;
        }
        get name() {
            return this.raw.querySelector('#video-title').textContent;
        }
        async dialog() {
            return this.raw.querySelector(SORTING_MENU_BUTTON_SELECTOR);
        }

        async openDialog() {
            click(await this.dialog());
            const dialog = new SortingDialog(await waitForElement(SORTING_ITEM_MENU_SELECTOR));
            await dialog.anyMenuItem();
            return dialog;
        }

    }
    async function playlistVideos() {
        return [...document.querySelectorAll('ytd-playlist-video-renderer')]
            .map((el) => new PlaylistVideo(el));
    }
    async function sortPlaylist() {
        debugLog('sorting playlist');
        const videos = await playlistVideos();
        debugLog(`found ${videos.length} videos`);
        videos.sort(SORTING_KEY);
        const videoNames = videos.map((v) => v.name);

        let index = 1;
        for (let name of videoNames) {
            debugLog({index, name});
            const video = videos.find((v) => v.name === name);
            const dialog = await video.openDialog();
            await dialog.moveToBottom();
            await sleep(1500);
            index += 1;
        }

    }


    // ----------------------------------
    // ENTRY POINT
    // ----------------------------------
    ({
        'publish_drafts': publishDrafts,
        'sort_playlist': sortPlaylist,
    })[MODE]();


})();