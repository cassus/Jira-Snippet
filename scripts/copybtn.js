chrome.runtime.onMessage.addListener(notify);

function getIssueId() {
  const searchParam = "selectedIssue=";
  let issueKey;

  if (document.URL.includes(searchParam)) {
    let match = document.URL.match(/\&selectedIssue=(.*?)(?=&|$)/)[1];
    issueKey = match;
  } else {
    let match = document.title.match(/\[(.*?)\]/)[1];
    issueKey = match;
  }

  return issueKey;
}

function getIssueDataAndWriteToClipboard(issueId)
{
  const restCallForIssue = `${window.location.origin}/rest/api/3/issue/`;

  fetch(`${restCallForIssue}${issueId}`)
  .then((response) => response.json())
  .then((data) => {
    const issueKey = data['key'];
    const issueTitle = data['fields']['summary'];
    const issueDescription = data['fields']['description'];
    const issueType = data['fields']['issuetype'].name;
    const issuePriority = data['fields']['priority'].name;
    const issueStatus = data['fields']['status'].name;
    const issueReporter = data['fields']['reporter'].displayName;
    const issueAssignee = data['fields']['assignee'] ? data['fields']['assignee'].displayName : 'Unassigned';

    storageGet('format').then(function (storageData) {
      const format = storageData.format || '[{key}] {title}';
      const outputText = format
        .replaceAll('{key}', issueKey)
        .replaceAll('{title}', issueTitle)
        .replaceAll('{description}', issueDescription)
        .replaceAll('{type}', issueType)
        .replaceAll('{priority}', issuePriority)
        .replaceAll('{status}', issueStatus)
        .replaceAll('{reporter}', issueReporter)
        .replaceAll('{assignee}', issueAssignee)
      
        navigator.clipboard.writeText(outputText);
    });
  });
}

function notify(message)
{
  getIssueDataAndWriteToClipboard(message.issueId);
}

function createButton(parent) {

  const issueId = getIssueId();

  if(issueId == null)
  {
    console.log("Error: No Issue id found!");
    return;
  }
  
  const buttonText = 'Jira Snippet';
  const button = document.createElement("button");
  button.textContent = buttonText;
  button.id = "CopyBtnJiraId";
  button.className = "CopyBtnForJira";
  parent.appendChild(button);

  button.onclick = function () {
        getIssueDataAndWriteToClipboard(issueId);
        button.textContent = 'Text has been copied!';
        setTimeout(function () {
          button.textContent = buttonText;
        }, 2000);
  };
}

var observer = new MutationObserver(function (mutations, me) {
  var parent = document.getElementsByClassName('gn0msi-0 cqZBrb')[0] ??
               document.getElementsByClassName('_otyr1y44 _ca0q1y44 _u5f3idpf _n3td1y44 _19bvidpf _1e0c116y')[0];
  
  if (parent) {
    if (!document.getElementById('CopyBtnJiraId')) {
      createButton(parent);
    }
    return;
  }
});

observer.observe(document, {
  childList: true,
  subtree: true
});

