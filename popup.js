document.getElementById("create").addEventListener("click", function () {
	//console.log("Create clicked.");
	chrome.runtime.sendMessage ({command:"Create"});
});