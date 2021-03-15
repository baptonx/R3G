$('document').ready(function(){
    ShowFr();
    $("#en").click(ShowEn);
    $("#fr").click(ShowFr);
    $('a[href^="#"]').on('click', function(evt){
        evt.preventDefault();
        var target = $(this).attr('href');
        $('html, body')
            .stop()
            .animate({scrollTop: $(target).offset().top}, 1000 );
    });
});

function ShowEn(){
    $("en").show();
    $("fr").hide();
}
function  ShowFr(){
    $("fr").show();
    $("en").hide();
}
