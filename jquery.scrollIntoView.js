/*!
 * $.fn.scrollIntoView - similar to the default browser scrollIntoView
 * The default browser behavior always places the element at the top or bottom of its container. 
 * This override is smart enough to not scroll if the element is already visible.
 *
 * Fix for if the immediate offset-parent is not scrollable
 * 
 * Copyright 2011 Arwid Bancewicz
 * Licensed under the MIT license
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * @date 8 Jan 2013
 * @author Arwid Bancewicz http://arwid.ca
 * @version 0.3
 */
 
(function($) {

    function getViewportHeight(elem)
    {
        var pH = elem.clientHeight;
        var wH = $(window).height();
        
        if ((pH > wH && elem.tagName == "BODY") ||
            (pH == 0 && elem.tagName == "BODY"))
            return wH;
        // case: if body's elements are all absolutely/fixed positioned, use window height
        else 
            return pH;
    }

    function getScrollParent(elem)
    {
        //Find parent of interest, keep track of scroll offsets.
        var scrollOffset = 0;
        var pEl = elem;
        
        // go up parents until we find one that scrolls
        
        while (pEl) {
            // Can we scroll this? (simpler check)
            if (pEl.scrollHeight > getViewportHeight(pEl))
                return pEl;

            // try next parent
            pEl = pEl.parentElement;
        }
        
        return undefined;
    }
    
    $.fn.scrollIntoView = function(duration, easing, complete) {
        if (this.length == 0)
            return;
      
        // The arguments are optional.
        // The first argment can be false for no animation or a duration.
        // The first argment could also be a map of options.
        // Refer to http://api.jquery.com/animate/.
        var opts = $.extend({},
        $.fn.scrollIntoView.defaults);

        // Get options
        if ($.type(duration) == "object") {
            $.extend(opts, duration);
        } else if ($.type(duration) == "number") {
            $.extend(opts, { duration: duration, easing: easing, complete: complete });
        } else if (duration == false) {
            opts.smooth = false;
        }

        // start from the common ancester
        // and find nearest scrollable parent.
        var pEl = this.commonAncestor().get(0);
        pEl = getScrollParent(pEl);
        
        
        // get enclosing offsets relative to scrollable parent.
        var pY = pEl.getBoundingClientRect().top;
        var pH = getViewportHeight(pEl);
        var elTop = Infinity, elBot = -Infinity;
        if (this.length==1)
        {
            var rect = this[0].getBoundingClientRect();
            elTop = rect.top - pY;
            elBot = rect.bottom - pY;
        }
        else this.each(function(i,el){
            var rect = el.getBoundingClientRect();
            elTop = Math.min(elTop, rect.top - pY);
            elBot = Math.max(elBot, rect.bottom - pY);
        });
        
        //Scrolling
        if (elTop < 0) 
            scrollTo(pEl, pEl.scrollTop + elTop); // scroll down
        else if (elBot > pH) 
            scrollTo(pEl, pEl.scrollTop + (elBot - pH)); // scroll up
        else 
            scrollTo(pEl, undefined) // no scroll
        
        function scrollTo(el, scrollTo) {
            if (scrollTo === undefined) {
                if ($.isFunction(opts.complete)) opts.complete.call(el);
            } else if (opts.smooth) {
                $(el).stop().animate({ scrollTop: scrollTo }, opts);
            } else {
                el.scrollTop = scrollTo;
                if ($.isFunction(opts.complete)) opts.complete.call(el);
            }
        }
        return this;
    };
    
    $.fn.scrollIntoView.defaults = {
        smooth: true,
        duration: null,
        easing: $.easing && $.easing.easeOutExpo ? 'easeOutExpo': null,
        // Note: easeOutExpo requires jquery.effects.core.js
        //         otherwise jQuery will default to use 'swing'
        complete: $.noop(),
        step: null,
        specialEasing: {} // cannot be null in jQuery 1.8.3
    };

    /*
     Returns whether the elements are in view
    */
    $.fn.isOutOfView = function(completely) {
        // completely? whether element is out of view completely
        var outOfView = true;
        this.each(function() {
            
            var pEl = getScrollParent(this.parentNode),
                pY = pEl.scrollTop, 
                pH = getViewportHeight(pEl), 
                elY = this.offsetTop, 
                elH = this.offsetHeight;
            if (completely ? (elY) > (pY + pH) : (elY + elH) > (pY + pH)) {}
            else if (completely ? (elY + elH) < pY: elY < pY) {}
            else outOfView = false;
        });
        return outOfView;
    };

    /*
     Returns the common ancestor of the elements.
     It was taken from http://stackoverflow.com/questions/3217147/jquery-first-parent-containing-all-children
     It has received minimal testing.
    */
    $.fn.commonAncestor = function() {
        var parents = [];
        var minlen = Infinity;

        $(this).each(function() {
            var curparents = $(this).parents();
            parents.push(curparents);
            minlen = Math.min(minlen, curparents.length);
        });

        for (var i = 0; i < parents.length; i++) {
            parents[i] = parents[i].slice(parents[i].length - minlen);
        }

        // Iterate until equality is found
        for (var i = 0; i < parents[0].length; i++) {
            var equal = true;
            for (var j in parents) {
                if (parents[j][i] != parents[0][i]) {
                    equal = false;
                    break;
                }
            }
            if (equal) return $(parents[0][i]);
        }
        return $([]);
    }
})(jQuery);
