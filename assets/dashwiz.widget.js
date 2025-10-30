;
(function ($, window, document, undefined) {

    //"use strict"; // jshint ;_;

    var pluginName = 'dashwiz';

    function Plugin(element, options) {
        /**
         * Variables.
         **/
        this.obj = $(element);
        this.o = $.extend({}, $.fn[pluginName].defaults, options);
        this.objId = this.obj.attr('id');
        this.widget = this.obj.find(this.o.widgets);
        this.collapseIcons = this.o.collapseIcons.split('|');
        this.fullscreenIcons = this.o.fullscreenIcons.split('|');
        this._checks = [];

        this.init();
    };

    Plugin.prototype = {

        /**
         * Important settings like storage and touch support.l
         *
         * @param:
         **/
        _settings: function () {

            var self = this;

            //*****************************************************************//
            ////////////////////////// TOUCH SUPPORT ////////////////////////////
            //*****************************************************************//

            /**
             * Check for touch support and set right click events.
             **/
            if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
                clickEvent = 'touchstart';
                //click tap
            } else {
                clickEvent = 'click';
            }

        },

        /**
         * Function for the indicator image.
         *
         * @param:
         **/
        _runLoaderWidget: function (elm) {
            var self = this;
            if (self.o.indicator === true) {
                elm.parents(self.o.widgets)
                    .find('.dashwiz-loader').show()
                    .stop(true, true)
                    .fadeIn(100)
                    .delay(self.o.indicatorTime)
                    .fadeOut(100);
            }
        },

        /**
         * Save all settings to the localStorage.
         *
         * @param:
         **/
        _saveSettingsWidget: function () {

            var self = this;

            self._settings();

            var storeSettings = [];

            self.obj.find(self.o.widgets)
                .each(function () {
                    var storeSettingsStr = {};
                    storeSettingsStr['id'] = $(this)
                        .attr('id');
                    storeSettingsStr['hidden'] = ($(this)
                        .is(':hidden') ? 1 : 0);
                    storeSettingsStr['collapsed'] = ($(this)
                        .hasClass('dashwiz-collapsed') ? 1 : 0);
                    storeSettings.push(storeSettingsStr);
                });

            var storeSettingsObj = JSON.stringify({
                'widget': storeSettings
            });

            /**
             * Run the callback function.
             **/
            this.obj.trigger('dashwiz:save', storeSettingsObj);
//            if (typeof self.o.onSave == 'function') {
//                self.o.onSave.call(this, null, storeSettingsObj);
//            }
        },

        /**
         * Save positions to the localStorage.
         *
         * @param:
         **/
        _savePositionWidget: function () {

            var self = this;

            self._settings();

            var mainArr = [];

            self.obj.find(self.o.grid + '.sortable-grid')
                .each(function () {
                    var subArr = [];
                    $(this)
                        .children(self.o.widgets)
                        .each(function () {
                            var subObj = {};
                            subObj['id'] = $(this)
                                .attr('id');
                            subArr.push(subObj);
                        });
                    var out = {
                        'section': subArr
                    }
                    mainArr.push(out);
                });

            var storePositionObj = JSON.stringify({
                'grid': mainArr
            });

            self.obj.trigger('dashwiz:save', storePositionObj);
//                if (typeof self.o.onSave == 'function') {
//                    self.o.onSave.call(this, null, storePositionObj);
//                }
        },

        /**
         * Code that we run at the start.
         *
         * @param:
         **/
        init: function () {

            var self = this;
            
            self._settings();
            

            /**
             * Force users to use an id(it's needed for the local storage).
             **/
            if (!$('#' + self.objId)
                .length) {
                alert('It looks like your using a class instead of an ID, dont do that!')
            }

            /**
             * Add RTL support.
             **/
            if (self.o.rtl === true) {
                $('body')
                    .addClass('rtl');
            }

            /**
             * This will add an extra class that we use to store the
             * widgets in the right order.(savety)
             **/

            $(self.o.grid)
                .each(function () {
                    if ($(this)
                        .find(self.o.widgets)
                        .length) {
                        $(this)
                            .addClass('sortable-grid');
                    }
                });

            //*****************************************************************//
            //////////////////////// SET POSITION WIDGET ////////////////////////
            //*****************************************************************//

            /**
             * Run if data is present.
             **/
            var jsonPosition = false;
            if (self.o.defaultPositions !== null) {
                jsonPosition = JSON.parse(self.o.defaultPositions);
            }

            if (jsonPosition !== false) {
                /**
                 * Loop the data, and put every widget on the right place.
                 **/
                for (var key in jsonPosition.grid) {
                    var changeOrder = self.obj.find(self.o.grid + '.sortable-grid')
                        .eq(key);
                    for (var key2 in jsonPosition.grid[key].section) {
                        changeOrder.append($('#' + jsonPosition.grid[key].section[key2].id));
                    }
                }

            }

            //*****************************************************************//
            /////////////////////// SET SETTINGS WIDGET /////////////////////////
            //*****************************************************************//

            /**
             * Run if data is present.
             **/
            var jsonSettings = false;
            if (self.o.defaultSettings !== null) {
                jsonSettings = JSON.parse(self.o.defaultSettings);
            }

            if (jsonSettings !== false) {

                /**
                 * Loop the data and hide/show the widgets and set the inputs in
                 * panel to checked(if hidden) and add an indicator class to the div.
                 * Loop all labels and update the widget titles.
                 **/
                for (var key in jsonSettings.widget) {
                    var widgetId = $('#' + jsonSettings.widget[key].id);

                    /**
                     * Hide/show widget.
                     **/
                    if (jsonSettings.widget[key].hidden == 1) {
                        widgetId.hide(1)
                            .attr('data-dashwiz-hidden', true);
                    } else {
                        widgetId.show(1)
                            .removeAttr('data-dashwiz-hidden');
                    }

                    /**
                     * Toggle content widget.
                     **/
                    if (jsonSettings.widget[key].collapsed == 1) {
                        widgetId.addClass('dashwiz-collapsed')
                            .children('.dashwiz-body')
                            .hide(1);
                    }
                }
            }

            //*****************************************************************//
            ////////////////////////// LOOP AL WIDGETS //////////////////////////
            //*****************************************************************//
            
            /**
             * This will add/edit/remove the settings to all widgets
             **/
            self.widget.each(function () {

                var tWidget = $(this);
                var thisHeader = $(this).children('.dashwiz-header');
                var tWidgetId = tWidget.attr('id');
            
                self._checks[tWidgetId] = {
                    widget: tWidget,
                    title: thisHeader.find(self.o.titleContainer).text(),
                    hidden: false,
                    removable: thisHeader.children('[data-dashwiz-action="delete"]').length > 0
                };
                
                /**
                 * Dont double wrap(check).
                 **/
                if (!thisHeader.parent()
                    .attr('role')) {

                    /**
                     * Hide the widget if the dataset 'dashwiz-hidden' is set to true.
                     **/
                    if (tWidget.data('dashwiz-hidden') === true) {
                        self._checks[tWidgetId].hidden = true;
                        tWidget.hide();
                    }

                    /**
					 * Hide the content of the widget if the dataset
					 * 'widget-collapsed' is set to true.
					 **/
                    if (tWidget.data('widget-collapsed') === true) {
                        tWidget.addClass('dashwiz-collapsed')
                            .children('.dashwiz-body')
                            .hide();
                    }

                    collapseBtn = tWidget.find('[data-dashwiz-action="collapse"]');
                    if (collapseBtn.length) {
                        if (tWidget.hasClass('dashwiz-collapsed')) {
                            var icon = self.collapseIcons[1];
                            var removeIcon = self.collapseIcons[0];
                        } else {
                            var icon = self.collapseIcons[0];
                            var removeIcon = self.collapseIcons[1];
                        }
                        collapseBtn.find(self.o.iconTag).removeClass(removeIcon).addClass(icon);
                    }
                    
                    fullscreenBtn = tWidget.find('[data-dashwiz-action="fullscreen"]');
                    if (fullscreenBtn.length) {
                        if (tWidget.hasClass('dashwiz-fullscreen')) {
                            var icon = self.fullscreenIcons[1];
                        } else {
                            var icon = self.fullscreenIcons[0];
                        }
                        fullscreenBtn.find(self.o.iconTag).addClass(icon);
                    }
                    
                    /**
                     * Adding a helper class to all sortable widgets, this will be
                     * used to find the widgets that are sortable, it will skip the widgets
                     * that have the dataset 'widget-sortable="false"' set to false.
                     **/
                    if (self.o.sortable === true && tWidget.data('widget-sortable') === undefined) {
                        tWidget.addClass('dashwiz-sortable');
                    }

                    /**
                     * Prepend the image to the widget header.
                     **/
                    thisHeader.append($('<span/>', {
                        class: 'dashwiz-loader',
                        html: $('<' + self.o.iconTag + '/>', {
                                   class: self.o.refreshIcon
                                })
                    }));

                    /**
                     * Adding roles to some parts.
                     **/
                    tWidget.attr('role', 'widget')
                        .children('div')
                        .attr('role', 'content')
                        .prev('.dashwiz-header')
                        .attr('role', 'heading')
                        .children('div')
                        .attr('role', 'menu');
                }
            });

            /**
             * Hide all buttons if option is set to true.
             **/
            if (self.o.buttonsHidden === true) {
                $(self.o.controlsContainer)
                    .hide();
            }

//            $(".dashwiz .dashwiz-header [rel=tooltip]")
//                .tooltip();

            //******************************************************************//
            ////////////////////////////// SORTABLE //////////////////////////////
            //******************************************************************//

            /**
             * jQuery UI soratble, this allows users to sort the widgets.
             * Notice that this part needs the jquery-ui core to work.
             **/
            if (self.o.sortable === true) {
                var sortItem = self.obj.find('.sortable-grid')
                    .not('[data-dashwiz-excludegrid]');
                sortItem.sortable({
                    items: sortItem.find('.dashwiz-sortable'),
                    connectWith: sortItem,
                    placeholder: self.o.placeholderClass,
                    cursor: 'move',
                    revert: true,
                    opacity: self.o.opacity,
                    delay: 200,
                    cancel: '#dashwiz-fullscreen-mode > div',
                    zIndex: 10000,
                    handle: self.o.dragHandle,
                    forcePlaceholderSize: true,
                    forceHelperSize: true,
                    update: function (event, ui) {
                        /* run pre-loader in the widget */
                        self._runLoaderWidget(ui.item.children());
                        /* store the positions of the plugins */
                        self._savePositionWidget();
                        /**
                         * Run the callback function.
                         **/
                        self.obj.trigger('dashwiz:change', ui.item);
//                        if (typeof self.o.onChange == 'function') {
//                            self.o.onChange.call(this, ui.item);
//                        }
                    }
                });
            }

            //*****************************************************************//
            ////////////////////////// BUTTONS VISIBLE //////////////////////////
            //*****************************************************************//

            /**
             * Show and hide the widget control buttons, the buttons will be
             * visible if the users hover over the widgets header. At default the
             * buttons are always visible.
             **/
            if (self.o.buttonsHidden === true) {

                /**
                 * Show and hide the buttons.
                 **/
                self.widget.children('.dashwiz-header')
                    .hover(function () {
                        $(this)
                            .children(self.o.controlsContainer)
                            .stop(true, true)
                            .fadeTo(100, 1.0);
                    }, function () {
                        $(this)
                            .children(self.o.controlsContainer)
                            .stop(true, true)
                            .fadeTo(100, 0.0);
                    });
            }

            //*****************************************************************//
            ///////////////////////// CLICKEVENTS //////////////////////////
            //*****************************************************************//

            self._clickEvents();

            //*****************************************************************//
            ///////////////////// DELETE LOCAL STORAGE KEYS /////////////////////
            //*****************************************************************//

            /**
             * Delete the settings key.
             **/
            $(self.o.deleteSettingsKey)
                .on(clickEvent, this, function (e) {
                    e.preventDefault();
                });

            /**
             * Delete the position key.
             **/
            $(self.o.deletePositionKey)
                .on(clickEvent, this, function (e) {
                    e.preventDefault();
                });

            self._toggler();
            
            $(self.o.togglerContainer).on('click', '[data-dashwiz-widget-id]', function() {
                $widget = $('#' + $(this).data('dashwiz-widget-id'));
//                    if(!$(this).prop('checked')) {
//                        $('[data-dashwiz-action="delete"]', $widget).click();
//                    } else {
                    $widget.show(1);
                    self._checks[$widget.attr('id')].hidden = false;
                    self._saveSettingsWidget();
                    self._toggler();
//                    }
            });

            $('#'+self.objId).on('dashwiz:delete', function(ev, widget) {
                $widget = $(widget);
                $widgetId = $widget.attr('id');
                self._checks[$widgetId].hidden = true;
                self._toggler();
//                if (self.obj.find($widgetId)) {
                    
//                    $(self.o.togglerContainer).find('[data-dashwiz-id=\'' + $widgetId + '\']')
//                        .parent().remove();
//                }
            });
        },
        
        _toggler: function() {
            //*****************************************************************//
            ///////////////////////// WIDGETS TOGGLER  //////////////////////////
            //*****************************************************************//
            
            var self = this;

            self._settings();
            
            if (self.o.togglerContainer !== false && self.obj.find('[data-dashwiz-action="delete"]').length) {
                var togglerId = self.obj.attr('id') + '-toggler';
                $(self.o.togglerContainer).html('');
                var checks = self._checks;
                var data = {portlets: []};
                for (var c in checks) {
                    if (checks[c].widget.find('[data-dashwiz-action="delete"]').length > 0) {
                        if (self.o.togglerHideOnHidden) {
                            if (checks[c].hidden) {
                                data.portlets.push({
                                    label: checks[c].title,
                                    widgetId: c,
                                    togglerId: togglerId + '--' + c,
                                    disabled: '',
                                    hidden: checks[c].hidden
                                });
                            }
                        } else {
                            data.portlets.push({
                                label: checks[c].title,
                                widgetId: c,
                                togglerId: togglerId + '--' + c,
                                disabled: !checks[c].hidden ? 'disabled' : '',
                                hidden: checks[c].hidden
                            });
                        }
                    }
                }
                
                var template = Handlebars.compile(self.o.togglerTemplate);
                var html = template(data);
                
                var $toggler = $(html).prop({
                    id: togglerId,
                }).addClass('dashwiz-toggler');
                
                if (data.portlets.length == 0) {
                    $toggler.find(self.o.togglerElement).prop({disabled: true});
                }
                
                $(self.o.togglerContainer).append($toggler);
            }
        },

        /**
         * All of the click events.
         *
         * @param:
         **/
        _clickEvents: function () {

            var self = this;

            self._settings();

            //*****************************************************************//
            /////////////////////////// TOGGLE WIDGETS //////////////////////////
            //*****************************************************************//

            /**
             * Allow users to toggle the content of the widgets.
             **/
            self.widget.on(clickEvent, '[data-dashwiz-action="collapse"]', function (e) {

                var tWidget = $(this);
                var pWidget = tWidget.parents(self.o.widgets);

                /**
                 * Run function for the indicator image.
                 **/
                self._runLoaderWidget(tWidget);

                /**
                 * Change the class and hide/show the widgets content.
                 **/
                if (pWidget.hasClass('dashwiz-collapsed')) {
                    tWidget.find(self.o.iconTag)
                        .removeClass(self.collapseIcons[1])
                        .addClass(self.collapseIcons[0]);
                    pWidget.removeClass('dashwiz-collapsed')
                        .children('[role=content]')
                        .slideDown(self.o.collapseSpeed, function () {
                            self._saveSettingsWidget();
                        });
                } else {
                    tWidget.find(self.o.iconTag)
                        .removeClass(self.collapseIcons[0])
                        .addClass(self.collapseIcons[1]);
                    pWidget.addClass('dashwiz-collapsed')
                        .children('[role=content]')
                        .slideUp(self.o.collapseSpeed, function () {
                            self._saveSettingsWidget();
                        });
                }

                /**
                 * Run the callback function.
                 **/
                tWidget.trigger('dashwiz:toggle', pWidget);
//                if (typeof self.o.onToggle == 'function') {
//                    self.o.onToggle.call(this, pWidget);
//                }

                e.preventDefault();
            });

            //*****************************************************************//
            ///////////////////////// FULLSCREEN WIDGETS ////////////////////////
            //*****************************************************************//

            /**
             * Set fullscreen height function.
             **/
            function heightFullscreen() {
                if ($('#dashwiz-fullscreen-mode')
                    .length) {

                    /**
                     * Setting height variables.
                     **/
                    var heightWindow = $(window)
                        .height();
                    var heightHeader = $('#dashwiz-fullscreen-mode')
                        .find(self.o.widgets)
                        .children('.dashwiz-header')
                        .height();

                    /**
                     * Setting the height to the right widget.
                     **/
                    $('#dashwiz-fullscreen-mode')
                        .find(self.o.widgets)
                        .children('.dashwiz-body')
                        .height(heightWindow - heightHeader - 15);
                }
            }

            /**
             * On click go to fullscreen mode.
             **/
            self.widget.on(clickEvent, '[data-dashwiz-action="fullscreen"]', function (e) {
                var thisWidget = $(this)
                    .parents(self.o.widgets);
                var thisWidgetContent = thisWidget.children('.dashwiz-body');

                /**
                * Run function for the indicator image.
                **/
                self._runLoaderWidget($(this));

                /**
                 * Wrap the widget and go fullsize.
                 **/
                if ($('#dashwiz-fullscreen-mode').length) {
                    /**
                     * Remove class from the body.
                     **/
                    $('.nooverflow')
                        .removeClass('nooverflow');

                    /**
                     * Unwrap the widget, remove the height, set the right
                     * fulscreen button back, and show all other buttons.
                     **/
                    thisWidget.unwrap('div')
                        .children('.dashwiz-body')
                        .removeAttr('style')
                        .end()
                        .find('[data-dashwiz-action="fullscreen"]')
                        .children(self.o.iconTag)
                        .removeClass(self.fullscreenIcons[1])
                        .addClass(self.fullscreenIcons[0])
                        .parents(self.o.controlsContainer)
                        .find(self.o.controlsType)
                        .show();

                    /**
                     * Reset collapsed widgets.
                     **/
                    if (thisWidgetContent.hasClass('dashwiz-visible')) {
                        thisWidgetContent.hide()
                            .removeClass('dashwiz-visible');
                    }

                } else {

                    /**
                     * Prevent the body from scrolling.
                     **/
                    $('body')
                        .addClass('nooverflow');

                    /**
					 * Wrap, append it to the body, show the right button
					 * and hide all other buttons.
					 **/
                    
                    thisWidget.wrap('<div id="dashwiz-fullscreen-mode"/>')
//                        .parent()
                        .find('[data-dashwiz-action="fullscreen"]')
                        .children(self.o.iconTag)
                        .removeClass(self.fullscreenIcons[0])
                        .addClass(self.fullscreenIcons[1])
                        .parents(self.o.controlsContainer)
                        .find(self.o.controlsType).not("[data-dashwiz-action='fullscreen']")
                        .hide();

                    /**
                     * Show collapsed widgets.
                     **/
                    if (thisWidgetContent.is(':hidden')) {
                        thisWidgetContent.show()
                            .addClass('dashwiz-visible');
                    }
                }

                /**
                 * Run the set height function.
                 **/
                heightFullscreen();

                /**
                 * Run the callback function.
                 **/
                thisWidget.trigger('dashwiz:fullScreen', thisWidget);
                if (typeof self.o.onFullscreen == 'function') {
                    self.o.onFullscreen.call(this, thisWidget);
                }

                e.preventDefault();
            });

            /**
             * Run the set fullscreen height function when the screen resizes.
             **/
            $(window)
                .resize(function () {

                    /**
                     * Run the set height function.
                     **/
                    heightFullscreen();
                });

            //*****************************************************************//
            /////////////////////////// DELETE WIDGETS //////////////////////////
            //*****************************************************************//

            /**
             * Allow users to delete the widgets.
             **/
            self.widget.on(clickEvent, '[data-dashwiz-action="delete"]', function (e) {
                var tWidget = $(this)
                    .parents(self.o.widgets);
                var removeId = tWidget.attr('id');

                /**
                 * Delete the widgets with a confirm popup.
                 **/
                swal({
                    type: 'warning',
                    title: self.o.deleteMessage,
                    showCancelButton: true
                }, 
                function(isConfirmed) {
                    if (isConfirmed) {
                        //console.log(ButtonPressed);
                        /**
                         * Run function for the indicator image.
                         **/
                        self._runLoaderWidget($(this));

                        /**
                         * Delete the right widget.
                         **/
                        $('#' + removeId)
                            .fadeOut(self.o.deleteSpeed, function () {

                            self._saveSettingsWidget();

                            if (self.o.togglerContainer === false) {
                                $(this)
                                    .remove();
                            }

                                /**
                                 * Run the callback function.
                                 **/
                                self.obj.trigger('dashwiz:delete', tWidget);
//                                if (typeof self.o.onDelete == 'function') {
//                                    self.o.onDelete.call(this, tWidget);
//                                }
                            });
                    }
                });
                e.preventDefault();
            });
        },

        /**
         * Destroy.
         *
         * @param:
         **/
        destroy: function () {
            var self = this;
            self.widget.off('click', self._clickEvents());
            self.obj.removeData(pluginName);
        },
    };

    $.fn[pluginName] = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data(pluginName);
            var options = $.extend({}, pluginName, $this.data(), typeof option == 'object' && option)
            if (!data) {
                $this.data(pluginName, (data = new Plugin(this, options)))
            }
            if (typeof option == 'string') {
                data[option]();
            }
        });
    };

    /**
     * Default settings(dont change).
     * You can globally override these options
     * by using $.fn.pluginName.key = 'value';
     **/

    $.fn[pluginName].defaults = {
        grid: 'article', // grid container
        widgets: '.dashwiz', // widget class
        defaultSettings: false,
        defaultPositions: false,
        dragHandle : '.dashwiz-header',
        placeholderClass: 'dashwiz-placeholder',
        collapseSpeed: 200,
        indicator: true,  // refresh icon
        sortable: true,
        collapseIcons: 'glyphicon glyphicon-minus | glyphicon glyphicon-plus',
        refreshIcon: 'glyphicon glyphicon-refresh',
        deleteMessage: 'Eliminare il widget?',
        deleteSpeed: 200,
        fullscreenIcons : 'glyphicon glyphicon-resize-full | glyphicon glyphicon-resize-small',
        controlsContainer: '.dashwiz-controls',
        controlsType: 'a, button',
        iconTag: 'span',  // usually span or i
        titleContainer: '.dashwiz-title',
        buttonsHidden: false,
        togglerContainer: false, 
        togglerElement: 'button',
        togglerHideOnHidden: true,
//        togglerTemplate: '<ul class="list-inline">{{#portlets}}<li><a class="btn btn-link" data-dashwiz-widget-id="{{widgetId}}">{{label}}</a></li>{{/portlets}}</ul>'
        togglerTemplate: '<div class="btn-group"><button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Widgets <span class="caret"></span></button><ul class="dropdown-menu">{{#portlets}}<li class="{{disabled}}"><a href="#" data-dashwiz-widget-id="{{widgetId}}">{{label}}</a></li>{{/portlets}}</ul></div></div>'
    };

    $.fn.removeClassPrefix = function (prefix) {

        this.each(function (i, it) {
            var classes = it.className.split(" ")
                .map(function (item) {
                    return item.indexOf(prefix) === 0 ? "" : item;
                });
            it.className = $.trim(classes.join(" "));

        });

        return this;
    }
})(jQuery, window, document);