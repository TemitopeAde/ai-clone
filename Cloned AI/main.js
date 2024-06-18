document.addEventListener("DOMContentLoaded", function () {
  openTab({ currentTarget: document.querySelector(".tab-button") }, "chat");
  openSearchTab({ currentTarget: document.querySelector(".search-tab-button") }, "videos");
});

function openTab(evt, tabName) {
  const tabContent = document.getElementsByClassName("tab-content");
  for (let i = 0; i < tabContent.length; i++) {
      tabContent[i].style.display = "none";
      tabContent[i].classList.remove("active");
  }
  const tabButtons = document.getElementsByClassName("tab-button");
  for (let i = 0; i < tabButtons.length; i++) {
      tabButtons[i].className = tabButtons[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  document.getElementById(tabName).classList.add("active");
  evt.currentTarget.className += " active";
}

function openSearchTab(evt, searchTabName) {
  const searchContent = document.getElementsByClassName("search-content");
  for (let i = 0; i < searchContent.length; i++) {
      searchContent[i].style.display = "none";
      searchContent[i].classList.remove("active");
  }
  const searchTabButtons = document.getElementsByClassName("search-tab-button");
  for (let i = 0; i < searchTabButtons.length; i++) {
      searchTabButtons[i].className = searchTabButtons[i].className.replace(" active", "");
  }
  document.getElementById(searchTabName).style.display = "block";
  document.getElementById(searchTabName).classList.add("active");
  evt.currentTarget.className += " active";
  loadSearchResults(searchTabName);
}

function loadSearchResults(tabName) {
  const resultsContainer = document.getElementById(tabName);
  resultsContainer.innerHTML = "";
  const results = searchResults[tabName];
  results.forEach(result => {
      if (tabName === "videos") {
          const videoElement = document.createElement("div");
          videoElement.innerHTML = `
              <div class="video-item">
                  <img src="${result.thumbnail}" onclick="openModal('${result.videoSrc}')">
                  <div>
                      <h4>${result.title}</h4>
                      <p>${result.description}</p>
                  </div>
              </div>
          `;
          resultsContainer.appendChild(videoElement);
      }
      // Add similar blocks for images and audio
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
  const message = chatInput.value;
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

function diffStrings(oldStr, newStr) {
  const dmp = new diff_match_patch();
  const diffs = dmp.diff_main(oldStr, newStr);
  dmp.diff_cleanupSemantic(diffs);

  const html = diffs.map(part => {
      const [type, text] = part;
      switch (type) {
          case 1: return `<span class="inserted">${text}</span>`;
          case -1: return `<span class="deleted">${text}</span>`;
          default: return text;
      }
  }).join('');

  return html;
}

function displayDiff(newText) {
  const diffViewer = document.getElementById("diff-viewer");
  const acceptButton = document.getElementById("accept-changes");

  const diffHtml = diffStrings(currentDraft, newText);
  diffViewer.innerHTML = diffHtml;

  // Check if there are any differences
  const hasInsertedOrDeleted = diffHtml.includes('class="deleted"') || diffHtml.includes('class="inserted"');
  if (hasInsertedOrDeleted && currentDraft !== "") {
      acceptButton.style.display = "block";
  } else {
      acceptButton.style.display = "none";
  }

  // Only update currentDraft when there are changes
  if (currentDraft === "") {
      currentDraft = newText;
  }
}

function acceptChanges() {
  displayDiff(currentDraft, false);
}

function rejectChanges() {
  // Restore the previous draft
  displayDiff(previousDraft);
  currentDraft = previousDraft;
}