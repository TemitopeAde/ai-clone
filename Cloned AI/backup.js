document.addEventListener("DOMContentLoaded", function() {
    openTab({ currentTarget: document.querySelector(".tab-button") }, "chat");
    openSearchTab(
      { currentTarget: document.querySelector(".search-tab-button") },
      "videos"
    );
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
  
  function diffStrings(oldStr, newStr) {
    const oldWords = oldStr.split(/\s+/);
    const newWords = newStr.split(/\s+/);
  
    const dp = Array(oldWords.length + 1)
      .fill(null)
      .map(() => Array(newWords.length + 1).fill(0));
  
    for (let i = 1; i <= oldWords.length; i++) {
      for (let j = 1; j <= newWords.length; j++) {
        if (oldWords[i - 1] === newWords[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
  
    let i = oldWords.length,
      j = newWords.length;
    const result = [];
  
    while (i > 0 && j > 0) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        result.unshift(oldWords[i - 1]);
        i--;
        j--;
      } else if (dp[i - 1][j] >= dp[i][j - 1]) {
        result.unshift(`<span class="deleted">${oldWords[i - 1]}</span>`);
        i--;
      } else {
        result.unshift(`<span class="inserted">${newWords[j - 1]}</span>`);
        j--;
      }
    }
  
    while (i > 0) {
      result.unshift(`<span class="deleted">${oldWords[i - 1]}</span>`);
      i--;
    }
  
    while (j > 0) {
      result.unshift(`<span class="inserted">${newWords[j - 1]}</span>`);
      j--;
    }
  
    return result.join(" ");
  }
  
  function displayDiff(newText, showDiff = true) {
    const diffViewer = document.getElementById("diff-viewer");
    const acceptButton = document.getElementById("accept-changes");
  
    if (showDiff) {
      const diffHtml = diffStrings(currentDraft, newText);
      diffViewer.innerHTML = diffHtml;
  
      // Check if there are any differences
      if (
        diffHtml.includes('class="deleted"') ||
        diffHtml.includes('class="inserted"')
      ) {
        acceptButton.style.display = "block";
      } else {
        acceptButton.style.display = "none";
      }
    } else {
      diffViewer.innerHTML = newText;
      acceptButton.style.display = "none";
    }
  
    currentDraft = newText;
  }
  
  // Initial setup
  let currentDraft = "";
  function acceptChanges() {
    displayDiff(currentDraft, false);
  }
  
  // Example of setting the initial draft and new text for testing
  currentDraft = "";
  const newText = "This is an example of the new text with changes.";
  
  // Display the difference
  // displayDiff(newText);
  
  function acceptChanges() {
    displayDiff(currentDraft, false);
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
  