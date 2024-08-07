paceOptions = {
    ajax: true,
    document: true,
    eventLag: false,
};

Pace.on("done", function () {
    $(".p")
        .delay(500)
        .animate({ top: "30%", opacity: "0" }, 3000, $.bez([0.19, 1, 0.22, 1]));

    $("#preloader")
        .delay(1500)
        .animate({ top: "-100%" }, 2000, $.bez([0.19, 1, 0.22, 1]));

    TweenMax.from(".firstline", 2, {
        delay: 1.5,
        y: 10,
        opacity: 0,
        ease: Expo.easeInOut,
    });
    TweenMax.from(".secondline", 2, {
        delay: 1.9,
        y: 10,
        opacity: 0,
        ease: Expo.easeInOut,
    });
    TweenMax.from(".button", 2, {
        delay: 2,
        opacity: 0,
        ease: Expo.easeInOut,
    });
    TweenMax.from(".social-media-links", 2, {
        delay: 1.5,
        opacity: 0,
        ease: Expo.easeInOut,
    });
    TweenMax.from(".globe-block", 2, {
        delay: 1.5,
        opacity: 0,
        ease: Expo.easeInOut,
    });
});
$(function () {
    var TxtRotate = function (el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = "";
        this.tick();
        this.isDeleting = false;
    };

    TxtRotate.prototype.tick = function () {
        var i = this.loopNum % this.toRotate.length;
        var fullTxt = this.toRotate[i];

        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.el.innerHTML = '<span class="wrap">' + this.txt + "</span>";

        var that = this;
        var delta = 200 - Math.random() * 100;

        if (this.isDeleting) {
            delta /= 2;
        }

        if (!this.isDeleting && this.txt === fullTxt) {
            delta = this.period;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === "") {
            this.isDeleting = false;
            this.loopNum++;
            delta = 100;
        }

        setTimeout(function () {
            that.tick();
        }, delta);
    };

    window.onload = function () {
        var elements = document.getElementsByClassName("txt-rotate");
        for (var i = 0; i < elements.length; i++) {
            var toRotate = elements[i].getAttribute("data-rotate");
            var period = elements[i].getAttribute("data-period");
            if (toRotate) {
                new TxtRotate(elements[i], JSON.parse(toRotate), period);
            }
        }
        // INJECT CSS
        var css = document.createElement("style");
        css.type = "text/css";
        css.innerHTML =
            ".txt-rotate > .wrap { border-right: 0em solid #666 ; }";
        document.body.appendChild(css);
    };
});
