//DOM ready
$(document).ready(function(){

    //populate the table
    getMostCurrentJobs();

})

//functions

function getMostCurrentJobs () {
    
    var tableContent = '';

    //jQuery AJAX call
    $.getJSON('/users/mostrecent', function(data){

        //for each item in JSON, add table row
        $.each(data, function(){

         
            tableContent += '<tr>';
            tableContent += '<td>' + this.House + ' ' + this.StreetName +'</td>';
            tableContent += '<td>' + this.bbl + '</td>';
            tableContent += '<td>' + this.LatestActionDate.slice(0,10) + '</td>';
            tableContent += '<td>' + this.JobType +'</td>';
            tableContent += '<td>' + this.Owner.Name + '</td>';
            tableContent += '</tr>';

        });

        //put tableContent into the existing table
        $('#jobsTable table tbody').html(tableContent);
    });
}

// var dateToString = "" + currentdate.getDate() + "/"
//                 + (currentdate.getMonth()+1)  + "/" 
//                 + currentdate.getFullYear();