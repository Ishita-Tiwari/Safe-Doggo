var viewport = $(window);
var root = $('html');
var maxScroll;

viewport.on({
    scroll: function () {
        var scrolled = viewport.scrollTop();
        root.css({ fontSize: (scrolled / maxScroll) * 50 });
    },
    resize: function () {
        maxScroll = root.height() - viewport.height() - 10;
    }
}).trigger('resize');