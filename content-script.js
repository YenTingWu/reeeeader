const CLASS_NAMES = {
  BODY_ACTIVE: "____REEEEADER_body_active",
  CONTAINER: "____REEEEADER_container",
  MODAL: "____REEEEADER_modal",
  MODAL_DIALOG: "____REEEEADER_modal-dialog",
  MODAL_MAIN: "____REEEEADER_modal-main",
  MODAL_CONTENT_CONTAINER: "____REEEEADER_content-container",
  MODAL_CLOSE_BUTTON: "____REEEEADER_modal-close-button",
  BUTTON: "____REEEEADER_button",
  FLEX: "____REEEEADER_flex",
  BOUNDARY: "____REEEEADER_boundary",
  FONT_CONTAINER: "____REEEEADER_font-container",
  FONT_BUTTON: "____REEEEADER_font-button",
  FONT_OPTION_CONTAINER: "____REEEEADER_font-option-container",
  FONT_OPTION_LIST: "____REEEEADER_font-option-list",
  FONT_OPTION: "____REEEEADER_font-option",

  // Font Family Class Names
  FONT_LOTO: "____REEEEADER_Loto",
  FONT_INTER: "____REEEEADER_Inter",
};

const FONT_OPTION_LIST = [
  { name: "Loto", className: CLASS_NAMES.FONT_LOTO },
  { name: "Inter", className: CLASS_NAMES.FONT_INTER },
];

(() => {
  let isOpen = false;
  let isModalOpen = false;
  let isLanguagePickerOpen = false;

  chrome.runtime.onMessage.addListener((request, _sender, response) => {
    const { type } = request;

    switch (type) {
      case "ICON_CLICKED":
        if (isOpen === false) {
          isOpen = true;

          init();
          // send a message to the background script
          response({ message: "opened" });
        } else {
          reset();
          // send a message to the background script
          response({ message: "closed" });
        }
        break;
      default:
        break;
    }
  });

  const init = () => {
    appendEventListeners();
    createContainer();
    insertCSS("styles/styles.css");
  };

  const reset = () => {
    isOpen = false;
    isModalOpen = false;
    removeAllEventListeners();
    removeContainer();
    removeInsertedCSS("styles/styles.css");
    document.body.classList.remove(CLASS_NAMES.BODY_ACTIVE);
  };

  const appendEventListeners = () => {
    document.body.addEventListener("mouseover", handleBodyMouseOver);
    document.body.addEventListener("mouseout", handleBodyMouseLeave);
    document.body.addEventListener("click", handleBodyClick);
  };

  const removeAllEventListeners = () => {
    document.body.removeEventListener("mouseover", handleBodyMouseOver);
    document.body.removeEventListener("mouseout", handleBodyMouseLeave);
    document.body.removeEventListener("click", handleBodyClick);
  };

  const handleBodyMouseOver = (e) => {
    if (isModalOpen) return;

    e.preventDefault();
    const container = document.querySelector(`.${CLASS_NAMES.CONTAINER}`);
    const boundary = drawBoundary(e);

    container.appendChild(boundary);
  };

  const handleBodyMouseLeave = () => {
    if (isModalOpen) return;

    const boundary = document.querySelector(`.${CLASS_NAMES.BOUNDARY}`);
    boundary.parentNode.removeChild(boundary);
  };

  const handleBodyClick = async (e) => {
    if (isModalOpen) return;
    e.preventDefault();

    isModalOpen = true;

    // Create CloseButton
    const closeButton = document.createElement("button");

    closeButton.classList.add(
      CLASS_NAMES.BUTTON,
      CLASS_NAMES.MODAL_CLOSE_BUTTON
    );
    closeButton.innerText = "X";
    closeButton.addEventListener("click", handleCloseButtonClick);

    // Language Button
    const fontPicker = createFontPicker();

    // Create ContainerContainer
    const contentContainer = document.createElement("article");
    contentContainer.classList.add(CLASS_NAMES.MODAL_CONTENT_CONTAINER);
    const newNode = e.target.cloneNode(true);
    contentContainer.appendChild(newNode);

    // Create Main
    const main = document.createElement("main");
    main.classList.add(CLASS_NAMES.MODAL_MAIN);
    main.appendChild(fontPicker);
    main.appendChild(contentContainer);

    // Create ModalDialog
    const modalDialog = document.createElement("div");
    modalDialog.classList.add(CLASS_NAMES.MODAL_DIALOG);

    modalDialog.appendChild(main);
    modalDialog.appendChild(closeButton);

    const modal = document.querySelector(`.${CLASS_NAMES.MODAL}`);

    // To show the modal
    modal.classList.add(CLASS_NAMES.FLEX);
    // To prevent the body from scrolling. Also remove margin and padding
    document.body.classList.add(CLASS_NAMES.BODY_ACTIVE);

    modal.appendChild(modalDialog);
  };

  const handleLanguageButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const fontOptionContainer = document.querySelector(
      `.${CLASS_NAMES.FONT_OPTION_CONTAINER}`
    );

    if (isLanguagePickerOpen) {
      isLanguagePickerOpen = false;
      fontOptionContainer.classList.remove("show");
    } else {
      isLanguagePickerOpen = true;
      fontOptionContainer.classList.add("show");
    }
  };

  const handleOptionClick = (e) => {
    const modalClass = e.currentTarget.dataset.modalClass;

    const modal = document.querySelector(`.${CLASS_NAMES.MODAL}`);
    const allClasses = FONT_OPTION_LIST.map((option) => option.className);
    modal.classList.remove(...allClasses);

    modal.classList.add(modalClass);
  };

  const handleCloseButtonClick = (e) => {
    e.preventDefault();
    // Prevent the event from bubbling up the DOM tree, preventing body click event
    e.stopPropagation();

    isModalOpen = false;

    const container = document.querySelector(`.${CLASS_NAMES.CONTAINER}`);
    const modal = document.querySelector(`.${CLASS_NAMES.MODAL}`);

    // Reset all containers
    removeAllChildNodes(container);
    removeAllChildNodes(modal);

    modal.classList.remove(CLASS_NAMES.FLEX);
    document.body.classList.remove(CLASS_NAMES.BODY_ACTIVE);
  };

  const createContainer = () => {
    const container = document.createElement("div");
    const modal = document.createElement("div");

    container.classList.add(CLASS_NAMES.CONTAINER);
    modal.classList.add(CLASS_NAMES.MODAL, CLASS_NAMES.FONT_INTER);

    container.style.width = document.body.width + "px";
    modal.style.width = document.body.width + "px";

    document.body.appendChild(container);
    document.body.appendChild(modal);
  };

  const removeContainer = () => {
    const container = document.querySelector(`.${CLASS_NAMES.CONTAINER}`);
    const modal = document.querySelector(`.${CLASS_NAMES.MODAL}`);
    container.parentNode.removeChild(container);
    modal.parentNode.removeChild(modal);
  };

  const drawBoundary = (e) => {
    const rect = e.target.getBoundingClientRect();
    const bodyStyle = window.getComputedStyle(document.body);

    const boundary = document.createElement("div");
    boundary.classList.add(CLASS_NAMES.BOUNDARY);

    boundary.style.top = `${
      rect.top + window.scrollY - parseCSSAmountIntoPixels(bodyStyle.marginTop)
    }px`;
    boundary.style.left = `${
      rect.left +
      window.scrollX -
      parseCSSAmountIntoPixels(bodyStyle.marginLeft)
    }px`;
    boundary.style.height = rect.height + "px";
    boundary.style.width = rect.width + "px";

    return boundary;
  };

  const createFontPicker = () => {
    // Language Button
    const fontPicker = document.createElement("div");
    fontPicker.classList.add(CLASS_NAMES.FONT_CONTAINER);
    const img = document.createElement("img");
    img.src = chrome.runtime.getURL("./assets/language.svg");
    img.classList.add(CLASS_NAMES.BUTTON, CLASS_NAMES.FONT_BUTTON);
    img.alt = "language-button";
    img.width = 48;
    img.height = 48;
    fontPicker.addEventListener("click", handleLanguageButtonClick);

    const fontOptionContainer = document.createElement("div");
    const fontOptionList = document.createElement("div");

    fontOptionContainer.classList.add(CLASS_NAMES.FONT_OPTION_CONTAINER);

    fontOptionList.classList.add(CLASS_NAMES.FONT_OPTION_LIST);

    for (const option of FONT_OPTION_LIST) {
      const fontOption = document.createElement("div");
      const { name, className } = option;

      const fontOptionClass = [CLASS_NAMES.FONT_OPTION];
      fontOption.classList.add(...fontOptionClass);

      fontOption.innerText = name;
      fontOption.setAttribute("data-modal-class", className);
      fontOption.addEventListener("click", handleOptionClick);

      fontOptionList.appendChild(fontOption);
    }

    fontOptionContainer.appendChild(fontOptionList);
    fontPicker.appendChild(fontOptionContainer);

    fontPicker.appendChild(img);

    return fontPicker;
  };

  const parseCSSAmountIntoPixels = (str) => {
    const { value, unit } = parseCSSAmountOfLength(str);
    if (unit === "px") return value;
    if (unit === "rem") return value * 16;

    throw new Error(`Invalid CSS amount or length: ${str}`);
  };

  const parseCSSAmountOfLength = (str) => {
    const match = str.match(/(\d+)(px|rem)/);
    if (!match) {
      throw new Error(`Invalid CSS amount or length: ${str}`);
    }

    return {
      value: parseInt(match[1], 10),
      unit: match[2],
    };
  };

  const insertCSS = (path) => {
    const head = document.querySelector("head");
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL(path);
    link.id = path;
    head.appendChild(link);
  };

  const removeInsertedCSS = (path) => {
    const link = document.getElementById(path);
    link.parentNode.removeChild(link);
  };

  const removeAllChildNodes = (node) => {
    for (const childNode of node.childNodes) {
      node.removeChild(childNode);
    }
  };
})();
