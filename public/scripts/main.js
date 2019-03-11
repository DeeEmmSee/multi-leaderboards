$(function() {
    $("#newBoardExpiry").datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        onSelect: function() {
            vue_home_app.newBoardExpiryDate = this.value;
        }
    });
});