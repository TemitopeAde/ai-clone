document.addEventListener("DOMContentLoaded", function() {
  openTab({ currentTarget: document.querySelector(".tab-button") }, "chat");
  openSearchTab(
    { currentTarget: document.querySelector(".search-tab-button") },
    "videos"
  );

  const chatInput = document.getElementById("chat-input");
  chatInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });
});

function openTab(event, tabName) {
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => button.classList.remove('active'));
  event.currentTarget.classList.add('active');

  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => content.classList.remove('active'));
  document.getElementById(tabName).classList.add('active');
}

function openSearchTab(evt, searchTabName) {
  const searchContent = document.getElementsByClassName("search-content");
  for (let i = 0; i < searchContent.length; i++) {
    searchContent[i].style.display = "none";
    searchContent[i].classList.remove("active");
    searchContent[i].innerHTML = ""; // Clear content of the search tab
  }
  const searchTabButtons = document.getElementsByClassName("search-tab-button");
  for (let i = 0; i < searchTabButtons.length; i++) {
    searchTabButtons[i].className = searchTabButtons[i].className.replace(
      " active",
      ""
    );
  }
  document.getElementById(searchTabName).style.display = "block";
  document.getElementById(searchTabName).classList.add("active");
  evt.currentTarget.className += " active";
  loadSearchResults(searchTabName);
}

function loadSearchResults(tabName) {
  const resultsContainer = document.getElementById(tabName);
  resultsContainer.innerHTML = ""; // Clear previous results
  const results = searchResults[tabName]; // Get the relevant results array

  results.forEach(result => {
    if (tabName === "videos") {
      const videoElement = document.createElement("div");
      videoElement.className = "video-item";
      videoElement.innerHTML = `
          <video onclick="openModal('${result.videoSrc}')">
              <source src="${result.videoSrc}" type="video/mp4">
              Your browser does not support the video tag.
          </video>
          <div>
              <h4 class="video-title" onclick="openModal('${result.videoSrc}')">${result.title}</h4>
              <p>${result.description}</p>
          </div>
      `;
      resultsContainer.appendChild(videoElement);
    } else if (tabName === "images") {
      const imageElement = document.createElement("div");
      imageElement.className = "image-item";
      imageElement.innerHTML = `
          <img src="${result.imageSrc}" alt="${result.title}" onclick="openModal('${result.imageSrc}')">
          <div>
              <h4>${result.title}</h4>
              <p>${result.description}</p>
          </div>
      `;
      resultsContainer.appendChild(imageElement);
    } else if (tabName === "audio") {
      const audioElement = document.createElement("div");
      audioElement.className = "audio-item";
      audioElement.innerHTML = `
          <audio controls>
              <source src="${result.audioSrc}" type="audio/mpeg">
              Your browser does not support the audio tag.
          </audio>
          <div>
              <h4>${result.title}</h4>
              <p>${result.description}</p>
          </div>
      `;
      resultsContainer.appendChild(audioElement);
    }
  });
}

function openModal(videoSrc) {
  const modal = document.getElementById("modal");
  const modalVideo = document.getElementById("modal-video");
  modalVideo.src = videoSrc;
  modal.style.display = "flex";
}

function closeModal() {
  const modal = document.getElementById("modal");
  const modalVideo = document.getElementById("modal-video");
  modalVideo.pause();
  modal.style.display = "none";
}

async function sendMessage() {
  const chatInput = document.getElementById("chat-input");
  const message = chatInput.value.trim(); // Remove leading/trailing whitespace

  if (message === "") {
    return; // Do not submit if the input is empty
  }

  chatInput.value = "";
  const response = await getResponse(message);
  displayDiff(response);
}

async function getResponse(message) {
  // Mock response based on the input message
  if (message.toLowerCase().includes("refugee")) {
    return billDrafts.refugee;
  } else if (message.toLowerCase().includes("make the language more formal")) {
    return billDrafts.formalRefugee;
  }
  return "No draft found for the given prompt.";
}

let currentDraft = "";
let previousDraft = "";

function diffStrings(oldStr, newStr) {
  const dmp = new diff_match_patch();
  const diffs = dmp.diff_main(oldStr, newStr);
  dmp.diff_cleanupSemantic(diffs);

  const html = diffs
    .map(part => {
      const [type, text] = part;
      switch (type) {
        case 1:
          return `<span class="inserted">${text}</span>`;
        case -1:
          return `<span class="deleted">${text}</span>`;
        default:
          return text;
      }
    })
    .join("");

  return html;
}

function displayDiff(newText) {
  const diffViewer = document.getElementById("diff-viewer");
  const acceptButton = document.getElementById("accept-changes");
  const rejectButton = document.getElementById("reject-changes");

  const diffHtml = diffStrings(currentDraft, newText);
  diffViewer.innerHTML = diffHtml;

  // Check if there are any differences
  const hasInsertedOrDeleted =
    diffHtml.includes('class="deleted"') ||
    diffHtml.includes('class="inserted"');
  if (hasInsertedOrDeleted && currentDraft !== "") {
    acceptButton.style.display = "block";
    rejectButton.style.display = "block";
  } else {
    acceptButton.style.display = "none";
    rejectButton.style.display = "none";
  }

  // Update previousDraft before changing currentDraft
  if (currentDraft !== "" && newText !== currentDraft) {
    previousDraft = currentDraft;
  }

  // Update currentDraft to the new text
  currentDraft = newText;
}

function acceptChanges() {
  displayDiff(currentDraft);
}

function rejectChanges() {
  displayDiff(previousDraft);
}

function triggerFileUpload() {
  const fileInput = document.getElementById("file-upload");
  fileInput.click();
}
