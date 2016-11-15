 $(document).ready(function() {
    notes = $("#notes"); // get references to the 'notes' list
    // clicking the 'New Note' button adds a new note to the list
    $("#btnNew").click(function() {
        addNewNote();
    });

});


// load all notes from data base
 function loadAllNotes() {
 	
 }