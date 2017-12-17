if(window.addEventListener) {
	window.addEventListener( "load" , shareButtonReadSyncer, false );
}else{
	window.attachEvent( "onload", shareButtonReadSyncer );
}

function shareButtonReadSyncer(){
// Facebook
window.fbAsyncInit = function() {
  FB.init({
    appId      : '1758420817800910',
    xfbml      : true,
    version    : 'v2.11'
  });
  FB.AppEvents.logPageView();
};

(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "https://connect.facebook.net/en_US/sdk.js";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));
// はてなブックマーク
var scriptTag = document.createElement("script");
scriptTag.type = "text/javascript"
scriptTag.src = "https://b.st-hatena.com/js/bookmark_button.js";
scriptTag.async = true;
document.getElementsByTagName("head")[0].appendChild(scriptTag);


}
